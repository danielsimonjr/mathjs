/**
 * WASM-optimized sparse matrix ordering algorithms
 *
 * Implements AMD (Approximate Minimum Degree) and RCM (Reverse Cuthill-McKee)
 * ordering algorithms for reducing fill-in during sparse matrix factorization.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

/**
 * Compute degree of each node in the graph
 * @param colPtrPtr Column pointers (i32)
 * @param rowIdxPtr Row indices (i32)
 * @param n Matrix size
 * @param degreePtr Output degree array (i32)
 */
function computeDegrees(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  n: i32,
  degreePtr: usize
): void {
  for (let j: i32 = 0; j < n; j++) {
    const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
    const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))
    store<i32>(degreePtr + (<usize>j << 2), colJ1 - colJ)
  }
}

/**
 * AMD (Approximate Minimum Degree) ordering
 *
 * Computes a fill-reducing ordering for sparse Cholesky factorization.
 * Uses a simplified greedy minimum degree heuristic.
 *
 * @param colPtrPtr CSC column pointers (i32)
 * @param rowIdxPtr CSC row indices (i32)
 * @param n Matrix size
 * @param permPtr Output permutation array (i32, size n)
 * @param workPtr Working memory (i32, size 2*n for degree and eliminated)
 */
export function amd(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  n: i32,
  permPtr: usize,
  workPtr: usize
): void {
  if (n <= 0) {
    return
  }

  // workPtr layout: degree (n i32s), eliminated (n i32s)
  const degreePtr: usize = workPtr
  const eliminatedPtr: usize = workPtr + (<usize>n << 2)

  computeDegrees(colPtrPtr, rowIdxPtr, n, degreePtr)

  // Initialize eliminated to 0
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(eliminatedPtr + (<usize>i << 2), 0)
  }

  for (let step: i32 = 0; step < n; step++) {
    // Find minimum degree node
    let minDegree: i32 = n + 1
    let minNode: i32 = -1

    for (let j: i32 = 0; j < n; j++) {
      const elim = load<i32>(eliminatedPtr + (<usize>j << 2))
      const deg = load<i32>(degreePtr + (<usize>j << 2))
      if (elim === 0 && deg < minDegree) {
        minDegree = deg
        minNode = j
      }
    }

    if (minNode === -1) {
      break
    }

    // Add to ordering
    store<i32>(permPtr + (<usize>step << 2), minNode)
    store<i32>(eliminatedPtr + (<usize>minNode << 2), 1)

    // Update degrees of neighbors
    const colMin = load<i32>(colPtrPtr + (<usize>minNode << 2))
    const colMin1 = load<i32>(colPtrPtr + (<usize>(minNode + 1) << 2))

    for (let p: i32 = colMin; p < colMin1; p++) {
      const neighbor: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
      const neighElim = load<i32>(eliminatedPtr + (<usize>neighbor << 2))
      if (neighElim === 0) {
        const neighDeg = load<i32>(degreePtr + (<usize>neighbor << 2))
        if (neighDeg > 0) {
          store<i32>(degreePtr + (<usize>neighbor << 2), neighDeg - 1)
        }
      }
    }
  }
}

/**
 * AMD with aggressive absorption
 *
 * More sophisticated AMD that tracks supernodes and performs
 * mass elimination for better fill reduction.
 *
 * @param colPtrPtr CSC column pointers (i32)
 * @param rowIdxPtr CSC row indices (i32)
 * @param n Matrix size
 * @param permPtr Output permutation array (i32, size n)
 * @param workPtr Working memory (i32, size 5*n for degree, eliminated, parent, rowDegree, temp)
 */
export function amdAggressive(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  n: i32,
  permPtr: usize,
  workPtr: usize
): void {
  if (n <= 0) {
    return
  }

  // workPtr layout: degree (n), eliminated (n), parent (n), rowDegree (n), temp (n)
  const degreePtr: usize = workPtr
  const eliminatedPtr: usize = workPtr + (<usize>n << 2)
  const parentPtr: usize = workPtr + (<usize>(2 * n) << 2)
  const rowDegreePtr: usize = workPtr + (<usize>(3 * n) << 2)

  // Initialize
  for (let j: i32 = 0; j < n; j++) {
    const offset: usize = <usize>j << 2
    const colJ = load<i32>(colPtrPtr + offset)
    const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))
    store<i32>(degreePtr + offset, colJ1 - colJ)
    store<i32>(parentPtr + offset, -1)
    store<i32>(eliminatedPtr + offset, 0)
    store<i32>(rowDegreePtr + offset, 0)
  }

  // Build adjacency lists for symmetric access
  // Count neighbors for each row
  for (let j: i32 = 0; j < n; j++) {
    const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
    const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))
    for (let p: i32 = colJ; p < colJ1; p++) {
      const i: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
      if (i !== j) {
        const rd = load<i32>(rowDegreePtr + (<usize>i << 2))
        store<i32>(rowDegreePtr + (<usize>i << 2), rd + 1)
      }
    }
  }

  // Compute external degree (approximate degree)
  for (let j: i32 = 0; j < n; j++) {
    const offset: usize = <usize>j << 2
    const deg = load<i32>(degreePtr + offset)
    const rowDeg = load<i32>(rowDegreePtr + offset)
    store<i32>(degreePtr + offset, deg + rowDeg)
  }

  for (let step: i32 = 0; step < n; step++) {
    // Find minimum external degree node
    let minDegree: i32 = 2 * n + 1
    let minNode: i32 = -1

    for (let j: i32 = 0; j < n; j++) {
      const offset: usize = <usize>j << 2
      const elim = load<i32>(eliminatedPtr + offset)
      const deg = load<i32>(degreePtr + offset)
      if (elim === 0 && deg < minDegree) {
        minDegree = deg
        minNode = j
      }
    }

    if (minNode === -1) {
      break
    }

    store<i32>(permPtr + (<usize>step << 2), minNode)
    store<i32>(eliminatedPtr + (<usize>minNode << 2), 1)

    // Update degrees: absorb eliminated node into neighbors
    const colMin = load<i32>(colPtrPtr + (<usize>minNode << 2))
    const colMin1 = load<i32>(colPtrPtr + (<usize>(minNode + 1) << 2))

    for (let p: i32 = colMin; p < colMin1; p++) {
      const neighbor: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
      const neighOffset: usize = <usize>neighbor << 2
      const neighElim = load<i32>(eliminatedPtr + neighOffset)
      if (neighElim === 0) {
        const neighDeg = load<i32>(degreePtr + neighOffset)
        if (neighDeg > 1) {
          store<i32>(degreePtr + neighOffset, neighDeg - 1)
        }

        // Set parent if not set
        const neighParent = load<i32>(parentPtr + neighOffset)
        if (neighParent === -1) {
          store<i32>(parentPtr + neighOffset, minNode)
        }
      }
    }

    // Also check row neighbors (for symmetric pattern)
    for (let j: i32 = 0; j < n; j++) {
      const jOffset: usize = <usize>j << 2
      const jElim = load<i32>(eliminatedPtr + jOffset)
      if (jElim === 0) {
        const colJ = load<i32>(colPtrPtr + jOffset)
        const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))
        for (let p: i32 = colJ; p < colJ1; p++) {
          if (load<i32>(rowIdxPtr + (<usize>p << 2)) === minNode) {
            const jDeg = load<i32>(degreePtr + jOffset)
            if (jDeg > 1) {
              store<i32>(degreePtr + jOffset, jDeg - 1)
            }
            break
          }
        }
      }
    }
  }
}

/**
 * RCM (Reverse Cuthill-McKee) ordering
 *
 * Computes a bandwidth-reducing ordering using BFS from a
 * peripheral node, then reverses the result.
 *
 * @param colPtrPtr CSC column pointers (i32)
 * @param rowIdxPtr CSC row indices (i32)
 * @param n Matrix size
 * @param resultPtr Output permutation array (i32, size n)
 * @param workPtr Working memory (i32, size 4*n for perm, visited, queue, degree)
 */
export function rcm(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize
): void {
  if (n <= 0) {
    return
  }

  // workPtr layout: perm (n), visited (n), queue (n), degree (n)
  const permPtr: usize = workPtr
  const visitedPtr: usize = workPtr + (<usize>n << 2)
  const queuePtr: usize = workPtr + (<usize>(2 * n) << 2)
  const degreePtr: usize = workPtr + (<usize>(3 * n) << 2)

  computeDegrees(colPtrPtr, rowIdxPtr, n, degreePtr)

  // Initialize visited to 0
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(visitedPtr + (<usize>i << 2), 0)
  }

  // Find starting node (minimum degree)
  let startNode: i32 = 0
  let minDegree: i32 = load<i32>(degreePtr)
  for (let j: i32 = 1; j < n; j++) {
    const deg = load<i32>(degreePtr + (<usize>j << 2))
    if (deg < minDegree) {
      minDegree = deg
      startNode = j
    }
  }

  // BFS from starting node
  let front: i32 = 0
  let back: i32 = 0
  let permIdx: i32 = 0

  store<i32>(queuePtr + (<usize>back << 2), startNode)
  back++
  store<i32>(visitedPtr + (<usize>startNode << 2), 1)

  while (front < back) {
    const node: i32 = load<i32>(queuePtr + (<usize>front << 2))
    front++
    store<i32>(permPtr + (<usize>permIdx << 2), node)
    permIdx++

    // Collect unvisited neighbors
    const neighborStart: i32 = back
    const colNode = load<i32>(colPtrPtr + (<usize>node << 2))
    const colNode1 = load<i32>(colPtrPtr + (<usize>(node + 1) << 2))

    for (let p: i32 = colNode; p < colNode1; p++) {
      const neighbor: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
      const visited = load<i32>(visitedPtr + (<usize>neighbor << 2))
      if (visited === 0) {
        store<i32>(visitedPtr + (<usize>neighbor << 2), 1)
        store<i32>(queuePtr + (<usize>back << 2), neighbor)
        back++
      }
    }

    // Also check row neighbors for symmetric access
    for (let j: i32 = 0; j < n; j++) {
      const jVisited = load<i32>(visitedPtr + (<usize>j << 2))
      if (jVisited === 0) {
        const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
        const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))
        for (let p: i32 = colJ; p < colJ1; p++) {
          if (load<i32>(rowIdxPtr + (<usize>p << 2)) === node) {
            store<i32>(visitedPtr + (<usize>j << 2), 1)
            store<i32>(queuePtr + (<usize>back << 2), j)
            back++
            break
          }
        }
      }
    }

    // Sort neighbors by degree (insertion sort for small counts)
    for (let i: i32 = neighborStart + 1; i < back; i++) {
      const key: i32 = load<i32>(queuePtr + (<usize>i << 2))
      const keyDegree: i32 = load<i32>(degreePtr + (<usize>key << 2))
      let j: i32 = i - 1
      while (j >= neighborStart && load<i32>(degreePtr + (<usize>load<i32>(queuePtr + (<usize>j << 2)) << 2)) > keyDegree) {
        store<i32>(queuePtr + (<usize>(j + 1) << 2), load<i32>(queuePtr + (<usize>j << 2)))
        j--
      }
      store<i32>(queuePtr + (<usize>(j + 1) << 2), key)
    }
  }

  // Handle disconnected components
  for (let j: i32 = 0; j < n; j++) {
    const visited = load<i32>(visitedPtr + (<usize>j << 2))
    if (visited === 0) {
      store<i32>(permPtr + (<usize>permIdx << 2), j)
      permIdx++
    }
  }

  // Reverse the ordering into result
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(resultPtr + (<usize>i << 2), load<i32>(permPtr + (<usize>(n - 1 - i) << 2)))
  }
}

/**
 * Compute inverse permutation
 * @param permPtr Permutation array pointer (i32)
 * @param n Size
 * @param ipermPtr Output inverse permutation pointer (i32)
 */
export function inversePerm(permPtr: usize, n: i32, ipermPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    const permI = load<i32>(permPtr + (<usize>i << 2))
    store<i32>(ipermPtr + (<usize>permI << 2), i)
  }
}

/**
 * Apply permutation to vector
 * @param xPtr Input vector pointer (f64)
 * @param permPtr Permutation array pointer (i32)
 * @param n Size
 * @param yPtr Output permuted vector pointer (f64)
 */
export function permuteVector(
  xPtr: usize,
  permPtr: usize,
  n: i32,
  yPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const permI = load<i32>(permPtr + (<usize>i << 2))
    store<f64>(yPtr + (<usize>i << 3), load<f64>(xPtr + (<usize>permI << 3)))
  }
}

/**
 * Permute sparse matrix (symmetric permutation P * A * P^T)
 * @param colPtrPtr CSC column pointers (i32)
 * @param rowIdxPtr CSC row indices (i32)
 * @param valuesPtr CSC values (f64)
 * @param permPtr Permutation array (i32)
 * @param n Matrix size
 * @param nnz Number of non-zeros
 * @param newColPtrPtr Output column pointers (i32, size n+1)
 * @param newRowIdxPtr Output row indices (i32, size nnz)
 * @param newValuesPtr Output values (f64, size nnz)
 * @param workPtr Working memory (i32, size 3*n for iperm, newColCount, colPos)
 */
export function permuteMatrix(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  valuesPtr: usize,
  permPtr: usize,
  n: i32,
  nnz: i32,
  newColPtrPtr: usize,
  newRowIdxPtr: usize,
  newValuesPtr: usize,
  workPtr: usize
): void {
  // workPtr layout: iperm (n), newColCount (n), colPos (n)
  const ipermPtr: usize = workPtr
  const newColCountPtr: usize = workPtr + (<usize>n << 2)
  const colPosPtr: usize = workPtr + (<usize>(2 * n) << 2)

  // Compute inverse permutation
  inversePerm(permPtr, n, ipermPtr)

  // Count entries per column in permuted matrix
  for (let j: i32 = 0; j < n; j++) {
    const newJ: i32 = load<i32>(ipermPtr + (<usize>j << 2))
    const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
    const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))
    store<i32>(newColCountPtr + (<usize>newJ << 2), colJ1 - colJ)
  }

  // Build new column pointers
  store<i32>(newColPtrPtr, 0)
  for (let j: i32 = 0; j < n; j++) {
    const prev = load<i32>(newColPtrPtr + (<usize>j << 2))
    const count = load<i32>(newColCountPtr + (<usize>j << 2))
    store<i32>(newColPtrPtr + (<usize>(j + 1) << 2), prev + count)
  }

  // Initialize colPos
  for (let j: i32 = 0; j < n; j++) {
    store<i32>(colPosPtr + (<usize>j << 2), load<i32>(newColPtrPtr + (<usize>j << 2)))
  }

  // Fill new matrix
  for (let j: i32 = 0; j < n; j++) {
    const newJ: i32 = load<i32>(ipermPtr + (<usize>j << 2))
    const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
    const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))

    for (let p: i32 = colJ; p < colJ1; p++) {
      const i: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
      const newI: i32 = load<i32>(ipermPtr + (<usize>i << 2))
      const pos: i32 = load<i32>(colPosPtr + (<usize>newJ << 2))
      store<i32>(colPosPtr + (<usize>newJ << 2), pos + 1)
      store<i32>(newRowIdxPtr + (<usize>pos << 2), newI)
      store<f64>(newValuesPtr + (<usize>pos << 3), load<f64>(valuesPtr + (<usize>p << 3)))
    }
  }
}

/**
 * Estimate fill-in for Cholesky factorization with given ordering
 * Uses symbolic Cholesky to count nonzeros
 *
 * @param colPtrPtr CSC column pointers (i32)
 * @param rowIdxPtr CSC row indices (i32)
 * @param permPtr Permutation array (i32), 0 for natural ordering
 * @param n Matrix size
 * @param workPtr Working memory (i32, size 3*n for parent, ancestor, iperm)
 * @returns Estimated number of nonzeros in L factor
 */
export function symbolicCholeskyNnz(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  permPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  if (n <= 0) {
    return 0
  }

  // workPtr layout: parent (n), ancestor (n), iperm (n)
  const parentPtr: usize = workPtr
  const ancestorPtr: usize = workPtr + (<usize>n << 2)
  const ipermPtr: usize = workPtr + (<usize>(2 * n) << 2)

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 2
    store<i32>(parentPtr + offset, -1)
    store<i32>(ancestorPtr + offset, -1)
  }

  // If using permutation, compute inverse
  const usePerm: bool = permPtr !== 0
  if (usePerm) {
    inversePerm(permPtr, n, ipermPtr)
  }

  for (let k: i32 = 0; k < n; k++) {
    const j: i32 = usePerm ? load<i32>(permPtr + (<usize>k << 2)) : k

    const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
    const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))

    for (let p: i32 = colJ; p < colJ1; p++) {
      let i: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
      if (usePerm) {
        i = load<i32>(ipermPtr + (<usize>i << 2))
      }

      if (i < k) {
        // Find root of tree containing i
        let r: i32 = i
        while (true) {
          const anc = load<i32>(ancestorPtr + (<usize>r << 2))
          if (anc === -1 || anc === k) break
          const next: i32 = anc
          store<i32>(ancestorPtr + (<usize>r << 2), k)
          r = next
        }
        store<i32>(ancestorPtr + (<usize>r << 2), k)

        const parentR = load<i32>(parentPtr + (<usize>r << 2))
        if (parentR === -1) {
          store<i32>(parentPtr + (<usize>r << 2), k)
        }
      }
    }
  }

  // Count nonzeros in L
  let nnz: i32 = 0
  for (let j: i32 = 0; j < n; j++) {
    // Count entries in column j of L
    nnz++ // diagonal

    // Count off-diagonal entries by walking up tree
    let p: i32 = load<i32>(parentPtr + (<usize>j << 2))
    while (p !== -1) {
      nnz++
      p = load<i32>(parentPtr + (<usize>p << 2))
    }
  }

  return nnz
}

/**
 * Compute bandwidth of matrix under given ordering
 * @param colPtrPtr CSC column pointers (i32)
 * @param rowIdxPtr CSC row indices (i32)
 * @param permPtr Permutation array (i32), 0 for natural ordering
 * @param n Matrix size
 * @param workPtr Working memory (i32, size n for iperm)
 * @returns Semi-bandwidth (max |i-j| for nonzero a_ij)
 */
export function bandwidth(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  permPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  if (n <= 0) {
    return 0
  }

  const usePerm: bool = permPtr !== 0
  const ipermPtr: usize = workPtr

  if (usePerm) {
    inversePerm(permPtr, n, ipermPtr)
  }

  let maxBw: i32 = 0

  for (let j: i32 = 0; j < n; j++) {
    const newJ: i32 = usePerm ? load<i32>(ipermPtr + (<usize>j << 2)) : j

    const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
    const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))

    for (let p: i32 = colJ; p < colJ1; p++) {
      const i: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
      const newI: i32 = usePerm ? load<i32>(ipermPtr + (<usize>i << 2)) : i

      let diff: i32 = newI - newJ
      if (diff < 0) {
        diff = -diff
      }
      if (diff > maxBw) {
        maxBw = diff
      }
    }
  }

  return maxBw
}

/**
 * Find pseudo-peripheral node using BFS
 * Used to improve RCM starting point
 *
 * @param colPtrPtr CSC column pointers (i32)
 * @param rowIdxPtr CSC row indices (i32)
 * @param n Matrix size
 * @param workPtr Working memory (i32, size 3*n for degree, dist, queue)
 * @returns Index of pseudo-peripheral node
 */
export function findPeripheralNode(
  colPtrPtr: usize,
  rowIdxPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  if (n <= 0) {
    return 0
  }

  // workPtr layout: degree (n), dist (n), queue (n)
  const degreePtr: usize = workPtr
  const distPtr: usize = workPtr + (<usize>n << 2)
  const queuePtr: usize = workPtr + (<usize>(2 * n) << 2)

  computeDegrees(colPtrPtr, rowIdxPtr, n, degreePtr)

  // Start from minimum degree node
  let startNode: i32 = 0
  let minDegree: i32 = load<i32>(degreePtr)
  for (let j: i32 = 1; j < n; j++) {
    const deg = load<i32>(degreePtr + (<usize>j << 2))
    if (deg < minDegree) {
      minDegree = deg
      startNode = j
    }
  }

  // BFS to find eccentricity and far node
  for (let iter: i32 = 0; iter < 5; iter++) {
    // Reset distances
    for (let j: i32 = 0; j < n; j++) {
      store<i32>(distPtr + (<usize>j << 2), -1)
    }

    let front: i32 = 0
    let back: i32 = 0
    store<i32>(queuePtr + (<usize>back << 2), startNode)
    back++
    store<i32>(distPtr + (<usize>startNode << 2), 0)

    let farNode: i32 = startNode
    let maxDist: i32 = 0

    while (front < back) {
      const node: i32 = load<i32>(queuePtr + (<usize>front << 2))
      front++

      const colNode = load<i32>(colPtrPtr + (<usize>node << 2))
      const colNode1 = load<i32>(colPtrPtr + (<usize>(node + 1) << 2))
      const distNode = load<i32>(distPtr + (<usize>node << 2))

      for (let p: i32 = colNode; p < colNode1; p++) {
        const neighbor: i32 = load<i32>(rowIdxPtr + (<usize>p << 2))
        const distNeigh = load<i32>(distPtr + (<usize>neighbor << 2))
        if (distNeigh === -1) {
          const newDist = distNode + 1
          store<i32>(distPtr + (<usize>neighbor << 2), newDist)
          store<i32>(queuePtr + (<usize>back << 2), neighbor)
          back++

          const degNeigh = load<i32>(degreePtr + (<usize>neighbor << 2))
          const degFar = load<i32>(degreePtr + (<usize>farNode << 2))
          if (newDist > maxDist || (newDist === maxDist && degNeigh < degFar)) {
            maxDist = newDist
            farNode = neighbor
          }
        }
      }

      // Check row neighbors
      for (let j: i32 = 0; j < n; j++) {
        const distJ = load<i32>(distPtr + (<usize>j << 2))
        if (distJ === -1) {
          const colJ = load<i32>(colPtrPtr + (<usize>j << 2))
          const colJ1 = load<i32>(colPtrPtr + (<usize>(j + 1) << 2))
          for (let p: i32 = colJ; p < colJ1; p++) {
            if (load<i32>(rowIdxPtr + (<usize>p << 2)) === node) {
              const newDist = distNode + 1
              store<i32>(distPtr + (<usize>j << 2), newDist)
              store<i32>(queuePtr + (<usize>back << 2), j)
              back++

              const degJ = load<i32>(degreePtr + (<usize>j << 2))
              const degFar = load<i32>(degreePtr + (<usize>farNode << 2))
              if (newDist > maxDist || (newDist === maxDist && degJ < degFar)) {
                maxDist = newDist
                farNode = j
              }
              break
            }
          }
        }
      }
    }

    if (farNode === startNode) {
      break
    }
    startNode = farNode
  }

  return startNode
}
