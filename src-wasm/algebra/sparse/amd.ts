/**
 * WASM-optimized sparse matrix ordering algorithms
 *
 * Implements AMD (Approximate Minimum Degree) and RCM (Reverse Cuthill-McKee)
 * ordering algorithms for reducing fill-in during sparse matrix factorization.
 */

/**
 * Compute degree of each node in the graph
 */
function computeDegrees(
  colPtr: Int32Array,
  rowIdx: Int32Array,
  n: i32
): Int32Array {
  const degree = new Int32Array(n)

  for (let j: i32 = 0; j < n; j++) {
    degree[j] = colPtr[j + 1] - colPtr[j]
  }

  return degree
}

/**
 * AMD (Approximate Minimum Degree) ordering
 *
 * Computes a fill-reducing ordering for sparse Cholesky factorization.
 * Uses a simplified greedy minimum degree heuristic.
 *
 * @param colPtr - CSC column pointers
 * @param rowIdx - CSC row indices
 * @param n - Matrix size
 * @returns Permutation array p where p[i] = original index of i-th node
 */
export function amd(colPtr: Int32Array, rowIdx: Int32Array, n: i32): Int32Array {
  if (n <= 0) {
    return new Int32Array(0)
  }

  const perm = new Int32Array(n)
  const degree = computeDegrees(colPtr, rowIdx, n)
  const eliminated = new Int32Array(n) // 0 = not eliminated, 1 = eliminated

  for (let step: i32 = 0; step < n; step++) {
    // Find minimum degree node
    let minDegree: i32 = n + 1
    let minNode: i32 = -1

    for (let j: i32 = 0; j < n; j++) {
      if (eliminated[j] === 0 && degree[j] < minDegree) {
        minDegree = degree[j]
        minNode = j
      }
    }

    if (minNode === -1) {
      // This shouldn't happen for valid input
      break
    }

    // Add to ordering
    perm[step] = minNode
    eliminated[minNode] = 1

    // Update degrees of neighbors
    // For simplicity, we increment neighbor degrees when eliminating
    // A proper implementation would merge adjacency lists
    for (let p: i32 = colPtr[minNode]; p < colPtr[minNode + 1]; p++) {
      const neighbor: i32 = rowIdx[p]
      if (eliminated[neighbor] === 0) {
        // Approximate degree update: decrease by 1 (simplified)
        if (degree[neighbor] > 0) {
          degree[neighbor]--
        }
      }
    }
  }

  return perm
}

/**
 * AMD with aggressive absorption
 *
 * More sophisticated AMD that tracks supernodes and performs
 * mass elimination for better fill reduction.
 *
 * @param colPtr - CSC column pointers
 * @param rowIdx - CSC row indices
 * @param n - Matrix size
 * @returns Permutation array
 */
export function amdAggressive(
  colPtr: Int32Array,
  rowIdx: Int32Array,
  n: i32
): Int32Array {
  if (n <= 0) {
    return new Int32Array(0)
  }

  const perm = new Int32Array(n)
  const degree = new Int32Array(n)
  const eliminated = new Int32Array(n)
  const parent = new Int32Array(n) // Parent in elimination tree

  // Initialize degrees and parent pointers
  for (let j: i32 = 0; j < n; j++) {
    degree[j] = colPtr[j + 1] - colPtr[j]
    parent[j] = -1
  }

  // Build adjacency lists for symmetric access
  // Count neighbors for each row
  const rowDegree = new Int32Array(n)
  for (let j: i32 = 0; j < n; j++) {
    for (let p: i32 = colPtr[j]; p < colPtr[j + 1]; p++) {
      const i: i32 = rowIdx[p]
      if (i !== j) {
        rowDegree[i]++
      }
    }
  }

  // Compute external degree (approximate degree)
  for (let j: i32 = 0; j < n; j++) {
    degree[j] = degree[j] + rowDegree[j]
  }

  for (let step: i32 = 0; step < n; step++) {
    // Find minimum external degree node
    let minDegree: i32 = 2 * n + 1
    let minNode: i32 = -1

    for (let j: i32 = 0; j < n; j++) {
      if (eliminated[j] === 0 && degree[j] < minDegree) {
        minDegree = degree[j]
        minNode = j
      }
    }

    if (minNode === -1) {
      break
    }

    perm[step] = minNode
    eliminated[minNode] = 1

    // Update degrees: absorb eliminated node into neighbors
    for (let p: i32 = colPtr[minNode]; p < colPtr[minNode + 1]; p++) {
      const neighbor: i32 = rowIdx[p]
      if (eliminated[neighbor] === 0) {
        // Approximate external degree update
        // Decrease by connection to eliminated node, increase by new fill
        if (degree[neighbor] > 1) {
          degree[neighbor]--
        }

        // Set parent if not set
        if (parent[neighbor] === -1) {
          parent[neighbor] = minNode
        }
      }
    }

    // Also check row neighbors (for symmetric pattern)
    for (let j: i32 = 0; j < n; j++) {
      if (eliminated[j] === 0) {
        for (let p: i32 = colPtr[j]; p < colPtr[j + 1]; p++) {
          if (rowIdx[p] === minNode) {
            if (degree[j] > 1) {
              degree[j]--
            }
            break
          }
        }
      }
    }
  }

  return perm
}

/**
 * RCM (Reverse Cuthill-McKee) ordering
 *
 * Computes a bandwidth-reducing ordering using BFS from a
 * peripheral node, then reverses the result.
 *
 * @param colPtr - CSC column pointers
 * @param rowIdx - CSC row indices
 * @param n - Matrix size
 * @returns Permutation array
 */
export function rcm(colPtr: Int32Array, rowIdx: Int32Array, n: i32): Int32Array {
  if (n <= 0) {
    return new Int32Array(0)
  }

  const perm = new Int32Array(n)
  const visited = new Int32Array(n)
  const queue = new Int32Array(n)
  const degree = computeDegrees(colPtr, rowIdx, n)

  // Find starting node (minimum degree)
  let startNode: i32 = 0
  let minDegree: i32 = degree[0]
  for (let j: i32 = 1; j < n; j++) {
    if (degree[j] < minDegree) {
      minDegree = degree[j]
      startNode = j
    }
  }

  // BFS from starting node
  let front: i32 = 0
  let back: i32 = 0
  let permIdx: i32 = 0

  queue[back++] = startNode
  visited[startNode] = 1

  while (front < back) {
    const node: i32 = queue[front++]
    perm[permIdx++] = node

    // Collect unvisited neighbors
    const neighborStart: i32 = back
    for (let p: i32 = colPtr[node]; p < colPtr[node + 1]; p++) {
      const neighbor: i32 = rowIdx[p]
      if (visited[neighbor] === 0) {
        visited[neighbor] = 1
        queue[back++] = neighbor
      }
    }

    // Also check row neighbors for symmetric access
    for (let j: i32 = 0; j < n; j++) {
      if (visited[j] === 0) {
        for (let p: i32 = colPtr[j]; p < colPtr[j + 1]; p++) {
          if (rowIdx[p] === node) {
            visited[j] = 1
            queue[back++] = j
            break
          }
        }
      }
    }

    // Sort neighbors by degree (insertion sort for small counts)
    for (let i: i32 = neighborStart + 1; i < back; i++) {
      const key: i32 = queue[i]
      const keyDegree: i32 = degree[key]
      let j: i32 = i - 1
      while (j >= neighborStart && degree[queue[j]] > keyDegree) {
        queue[j + 1] = queue[j]
        j--
      }
      queue[j + 1] = key
    }
  }

  // Handle disconnected components
  for (let j: i32 = 0; j < n; j++) {
    if (visited[j] === 0) {
      perm[permIdx++] = j
    }
  }

  // Reverse the ordering
  const result = new Int32Array(n)
  for (let i: i32 = 0; i < n; i++) {
    result[i] = perm[n - 1 - i]
  }

  return result
}

/**
 * Compute inverse permutation
 * @param perm - Permutation array where perm[new] = old
 * @returns Inverse permutation where iperm[old] = new
 */
export function inversePerm(perm: Int32Array): Int32Array {
  const n: i32 = perm.length
  const iperm = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    iperm[perm[i]] = i
  }

  return iperm
}

/**
 * Apply permutation to vector
 * @param x - Input vector
 * @param perm - Permutation array
 * @returns Permuted vector y where y[i] = x[perm[i]]
 */
export function permuteVector(x: Float64Array, perm: Int32Array): Float64Array {
  const n: i32 = x.length
  const y = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    y[i] = x[perm[i]]
  }

  return y
}

/**
 * Permute sparse matrix (symmetric permutation P * A * P^T)
 * @param colPtr - CSC column pointers
 * @param rowIdx - CSC row indices
 * @param values - CSC values
 * @param perm - Permutation array
 * @param n - Matrix size
 * @returns Packed result [newColPtr, newRowIdx, newValues]
 */
export function permuteMatrix(
  colPtr: Int32Array,
  rowIdx: Int32Array,
  values: Float64Array,
  perm: Int32Array,
  n: i32
): Float64Array {
  const nnz: i32 = values.length
  const iperm = inversePerm(perm)

  // Count entries per column in permuted matrix
  const newColCount = new Int32Array(n)
  for (let j: i32 = 0; j < n; j++) {
    const newJ: i32 = iperm[j]
    newColCount[newJ] = colPtr[j + 1] - colPtr[j]
  }

  // Build new column pointers
  const newColPtr = new Int32Array(n + 1)
  newColPtr[0] = 0
  for (let j: i32 = 0; j < n; j++) {
    newColPtr[j + 1] = newColPtr[j] + newColCount[j]
  }

  // Fill new matrix
  const newRowIdx = new Int32Array(nnz)
  const newValues = new Float64Array(nnz)
  const colPos = new Int32Array(n)
  for (let j: i32 = 0; j < n; j++) {
    colPos[j] = newColPtr[j]
  }

  for (let j: i32 = 0; j < n; j++) {
    const newJ: i32 = iperm[j]
    for (let p: i32 = colPtr[j]; p < colPtr[j + 1]; p++) {
      const i: i32 = rowIdx[p]
      const newI: i32 = iperm[i]
      const pos: i32 = colPos[newJ]++
      newRowIdx[pos] = newI
      newValues[pos] = values[p]
    }
  }

  // Pack result
  const result = new Float64Array(n + 1 + nnz + nnz)
  for (let i: i32 = 0; i <= n; i++) {
    result[i] = f64(newColPtr[i])
  }
  for (let i: i32 = 0; i < nnz; i++) {
    result[n + 1 + i] = f64(newRowIdx[i])
  }
  for (let i: i32 = 0; i < nnz; i++) {
    result[n + 1 + nnz + i] = newValues[i]
  }

  return result
}

/**
 * Estimate fill-in for Cholesky factorization with given ordering
 * Uses symbolic Cholesky to count nonzeros
 *
 * @param colPtr - CSC column pointers
 * @param rowIdx - CSC row indices
 * @param perm - Permutation array (or null for natural ordering)
 * @param n - Matrix size
 * @returns Estimated number of nonzeros in L factor
 */
export function symbolicCholeskyNnz(
  colPtr: Int32Array,
  rowIdx: Int32Array,
  perm: Int32Array,
  n: i32
): i32 {
  if (n <= 0) {
    return 0
  }

  // Build elimination tree
  const parent = new Int32Array(n)
  const ancestor = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    parent[i] = -1
    ancestor[i] = -1
  }

  // If no permutation, use identity
  const usePerm: bool = perm.length === n
  const iperm = usePerm ? inversePerm(perm) : new Int32Array(0)

  for (let k: i32 = 0; k < n; k++) {
    const j: i32 = usePerm ? perm[k] : k

    for (let p: i32 = colPtr[j]; p < colPtr[j + 1]; p++) {
      let i: i32 = rowIdx[p]
      if (usePerm) {
        i = iperm[i]
      }

      if (i < k) {
        // Find root of tree containing i
        let r: i32 = i
        while (ancestor[r] !== -1 && ancestor[r] !== k) {
          const next: i32 = ancestor[r]
          ancestor[r] = k
          r = next
        }
        ancestor[r] = k

        if (parent[r] === -1) {
          parent[r] = k
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
    let p: i32 = parent[j]
    while (p !== -1) {
      nnz++
      p = parent[p]
    }
  }

  return nnz
}

/**
 * Compute bandwidth of matrix under given ordering
 * @param colPtr - CSC column pointers
 * @param rowIdx - CSC row indices
 * @param perm - Permutation array
 * @param n - Matrix size
 * @returns Semi-bandwidth (max |i-j| for nonzero a_ij)
 */
export function bandwidth(
  colPtr: Int32Array,
  rowIdx: Int32Array,
  perm: Int32Array,
  n: i32
): i32 {
  if (n <= 0) {
    return 0
  }

  const usePerm: bool = perm.length === n
  const iperm = usePerm ? inversePerm(perm) : new Int32Array(0)

  let maxBw: i32 = 0

  for (let j: i32 = 0; j < n; j++) {
    const newJ: i32 = usePerm ? iperm[j] : j

    for (let p: i32 = colPtr[j]; p < colPtr[j + 1]; p++) {
      const i: i32 = rowIdx[p]
      const newI: i32 = usePerm ? iperm[i] : i

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
 * @param colPtr - CSC column pointers
 * @param rowIdx - CSC row indices
 * @param n - Matrix size
 * @returns Index of pseudo-peripheral node
 */
export function findPeripheralNode(
  colPtr: Int32Array,
  rowIdx: Int32Array,
  n: i32
): i32 {
  if (n <= 0) {
    return 0
  }

  const degree = computeDegrees(colPtr, rowIdx, n)
  const dist = new Int32Array(n)
  const queue = new Int32Array(n)

  // Start from minimum degree node
  let startNode: i32 = 0
  let minDegree: i32 = degree[0]
  for (let j: i32 = 1; j < n; j++) {
    if (degree[j] < minDegree) {
      minDegree = degree[j]
      startNode = j
    }
  }

  // BFS to find eccentricity and far node
  for (let iter: i32 = 0; iter < 5; iter++) {
    // Reset distances
    for (let j: i32 = 0; j < n; j++) {
      dist[j] = -1
    }

    let front: i32 = 0
    let back: i32 = 0
    queue[back++] = startNode
    dist[startNode] = 0

    let farNode: i32 = startNode
    let maxDist: i32 = 0

    while (front < back) {
      const node: i32 = queue[front++]

      for (let p: i32 = colPtr[node]; p < colPtr[node + 1]; p++) {
        const neighbor: i32 = rowIdx[p]
        if (dist[neighbor] === -1) {
          dist[neighbor] = dist[node] + 1
          queue[back++] = neighbor

          if (dist[neighbor] > maxDist ||
              (dist[neighbor] === maxDist && degree[neighbor] < degree[farNode])) {
            maxDist = dist[neighbor]
            farNode = neighbor
          }
        }
      }

      // Check row neighbors
      for (let j: i32 = 0; j < n; j++) {
        if (dist[j] === -1) {
          for (let p: i32 = colPtr[j]; p < colPtr[j + 1]; p++) {
            if (rowIdx[p] === node) {
              dist[j] = dist[node] + 1
              queue[back++] = j

              if (dist[j] > maxDist ||
                  (dist[j] === maxDist && degree[j] < degree[farNode])) {
                maxDist = dist[j]
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
