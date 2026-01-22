/**
 * WASM-optimized sparse matrix graph algorithms and decompositions
 *
 * AssemblyScript implementations for high-performance sparse matrix operations.
 * Implements CSparse-style algorithms for graph traversal and matrix factorizations.
 *
 * All matrices use CSC (Compressed Sparse Column) format:
 * - values: Pointer to non-zero values (f64)
 * - index: Pointer to row indices (i32)
 * - ptr: Pointer to column pointers (i32)
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 *
 * Performance: 2-10x faster than JavaScript for large sparse matrices (>1000 elements)
 */

// ============================================================================
// Graph Algorithms (Foundational for sparse decompositions)
// ============================================================================

/**
 * Depth-first search on graph of matrix G starting from node j
 *
 * @param gIndexPtr - Pointer to row indices of G (adjacency list) (i32)
 * @param gPtrPtr - Pointer to column pointers of G (i32)
 * @param j - Starting node
 * @param top - Stack top (modified in place)
 * @param xiPtr - Pointer to stack of nodes discovered (i32, modified)
 * @param pinvPtr - Pointer to inverse permutation (i32, 0 for identity)
 * @param n - Matrix dimension
 * @param workPtr - Working memory (i32, size 3*n for stackNode, stackAdj, done)
 * @returns New stack top position
 */
export function csDfs(
  gIndexPtr: usize,
  gPtrPtr: usize,
  j: i32,
  top: i32,
  xiPtr: usize,
  pinvPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  // Workspace layout in workPtr:
  // [0, n): stackNode
  // [n, 2n): stackAdj
  // [2n, 3n): done
  const stackNodePtr: usize = workPtr
  const stackAdjPtr: usize = workPtr + (<usize>n << 2)
  const donePtr: usize = workPtr + (<usize>(n * 2) << 2)

  let tail: i32 = 0

  // Initialize starting node
  let node: i32 = j

  // If pinv is not null (pinvPtr != 0), map through it
  if (pinvPtr !== 0) {
    node = load<i32>(pinvPtr + (<usize>j << 2))
    if (node < 0) return top // Node not in pattern
  }

  store<i32>(stackNodePtr, j)
  store<i32>(stackAdjPtr, load<i32>(gPtrPtr + (<usize>j << 2)))
  tail++

  while (tail > 0) {
    // Peek at top of stack
    const p: i32 = tail - 1
    const i: i32 = load<i32>(stackNodePtr + (<usize>p << 2))
    let k: i32 = load<i32>(stackAdjPtr + (<usize>p << 2))
    const pEnd: i32 = load<i32>(gPtrPtr + (<usize>(i + 1) << 2))

    // Find next unvisited neighbor
    let found: bool = false
    while (k < pEnd) {
      const neighbor: i32 = load<i32>(gIndexPtr + (<usize>k << 2))
      k++

      // Check if neighbor is visited
      if (load<i32>(donePtr + (<usize>neighbor << 2)) === 0) {
        // Push neighbor onto stack
        store<i32>(stackAdjPtr + (<usize>p << 2), k) // Save position for backtracking
        store<i32>(stackNodePtr + (<usize>tail << 2), neighbor)
        store<i32>(stackAdjPtr + (<usize>tail << 2), load<i32>(gPtrPtr + (<usize>neighbor << 2)))
        tail++
        found = true
        break
      }
    }

    if (!found) {
      // Node is finished - add to output
      store<i32>(donePtr + (<usize>i << 2), 1)
      store<i32>(xiPtr + (<usize>top << 2), i)
      top++
      tail-- // Pop from stack
    }
  }

  return top
}

/**
 * Compute reachability of nodes in B[:,k] in the graph of L
 * Used for sparse triangular solve to find which entries of x are nonzero
 *
 * @param gIndexPtr - Pointer to row indices of G (i32)
 * @param gPtrPtr - Pointer to column pointers of G (i32)
 * @param bIndexPtr - Pointer to row indices of B column (i32)
 * @param bPtrPtr - Pointer to column pointers of B (i32)
 * @param k - Column of B to process
 * @param xiPtr - Pointer to output stack of reachable nodes (i32, in topological order)
 * @param pinvPtr - Pointer to inverse permutation (i32, 0 for identity)
 * @param n - Matrix dimension
 * @param workPtr - Working memory (i32, size n for mark)
 * @returns Number of reachable nodes
 */
export function csReach(
  gIndexPtr: usize,
  gPtrPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  k: i32,
  xiPtr: usize,
  pinvPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  // Mark array for visited nodes
  const markPtr: usize = workPtr
  let top: i32 = n // Output grows downward from n

  // Process each nonzero in B[:,k]
  const bStart: i32 = load<i32>(bPtrPtr + (<usize>k << 2))
  const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(k + 1) << 2))

  for (let p: i32 = bStart; p < bEnd; p++) {
    const i: i32 = load<i32>(bIndexPtr + (<usize>p << 2))

    // If node not yet visited, start DFS from it
    if (load<i32>(markPtr + (<usize>i << 2)) === 0) {
      top = csDfsReach(gIndexPtr, gPtrPtr, i, top, xiPtr, markPtr, pinvPtr, n, workPtr + (<usize>n << 2))
    }
  }

  return top
}

/**
 * DFS helper for csReach - finds all nodes reachable from j
 */
function csDfsReach(
  gIndexPtr: usize,
  gPtrPtr: usize,
  j: i32,
  top: i32,
  xiPtr: usize,
  markPtr: usize,
  pinvPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  // Stack for iterative DFS
  // workPtr layout: [0, n): stack, [n, 2n): stackPos
  const stackPtr: usize = workPtr
  const stackPosPtr: usize = workPtr + (<usize>n << 2)
  let depth: i32 = 0

  // Push starting node
  store<i32>(stackPtr, j)
  let pj: i32 = j
  if (pinvPtr !== 0) {
    pj = load<i32>(pinvPtr + (<usize>j << 2))
  }
  store<i32>(stackPosPtr, pj >= 0 ? load<i32>(gPtrPtr + (<usize>pj << 2)) : 0)

  while (depth >= 0) {
    const i: i32 = load<i32>(stackPtr + (<usize>depth << 2))
    let pi: i32 = i
    if (pinvPtr !== 0) {
      pi = load<i32>(pinvPtr + (<usize>i << 2))
    }

    // If node marked, skip
    if (load<i32>(markPtr + (<usize>i << 2)) !== 0) {
      depth--
      continue
    }

    // First time visiting - mark as in progress (partial)
    if (pi < 0) {
      // Node not in L, finish immediately
      store<i32>(markPtr + (<usize>i << 2), 1)
      top--
      store<i32>(xiPtr + (<usize>top << 2), i)
      depth--
      continue
    }

    const pos: i32 = load<i32>(stackPosPtr + (<usize>depth << 2))
    const pEnd: i32 = load<i32>(gPtrPtr + (<usize>(pi + 1) << 2))

    // Find next unvisited child
    let foundChild: bool = false
    for (let kk: i32 = pos; kk < pEnd; kk++) {
      const child: i32 = load<i32>(gIndexPtr + (<usize>kk << 2))
      if (load<i32>(markPtr + (<usize>child << 2)) === 0) {
        store<i32>(stackPosPtr + (<usize>depth << 2), kk + 1) // Save position
        depth++
        store<i32>(stackPtr + (<usize>depth << 2), child)
        let pc: i32 = child
        if (pinvPtr !== 0) {
          pc = load<i32>(pinvPtr + (<usize>child << 2))
        }
        store<i32>(stackPosPtr + (<usize>depth << 2), pc >= 0 ? load<i32>(gPtrPtr + (<usize>pc << 2)) : 0)
        foundChild = true
        break
      }
    }

    if (!foundChild) {
      // All children visited - finish this node
      store<i32>(markPtr + (<usize>i << 2), 1)
      top--
      store<i32>(xiPtr + (<usize>top << 2), i)
      depth--
    }
  }

  return top
}

/**
 * Compute the elimination tree of a symmetric positive definite matrix A
 * The elimination tree is fundamental for sparse Cholesky factorization
 *
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param n - Matrix dimension
 * @param parentPtr - Output: parent[i] = parent of node i in etree (-1 for root) (i32)
 * @param workPtr - Working memory (i32, size n for ancestor)
 */
export function csEtree(
  aIndexPtr: usize,
  aPtrPtr: usize,
  n: i32,
  parentPtr: usize,
  workPtr: usize
): void {
  // Workspace for path compression (ancestor array)
  const ancestorPtr: usize = workPtr

  // Initialize
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(parentPtr + (<usize>i << 2), -1)
    store<i32>(ancestorPtr + (<usize>i << 2), -1)
  }

  // Process columns from left to right
  for (let k: i32 = 0; k < n; k++) {
    const pStart: i32 = load<i32>(aPtrPtr + (<usize>k << 2))
    const pEnd: i32 = load<i32>(aPtrPtr + (<usize>(k + 1) << 2))

    // Process each non-zero A(i,k) where i < k
    for (let p: i32 = pStart; p < pEnd; p++) {
      let i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))

      // Only process upper triangle (i < k)
      if (i >= k) continue

      // Path from i to root of subtree, updating parent and ancestor
      while (i !== -1 && i < k) {
        const inext: i32 = load<i32>(ancestorPtr + (<usize>i << 2))
        store<i32>(ancestorPtr + (<usize>i << 2), k) // Path compression

        if (inext === -1) {
          // i is a root of its subtree - k becomes its parent
          store<i32>(parentPtr + (<usize>i << 2), k)
          break
        }
        i = inext
      }
    }
  }
}

/**
 * Post-order traversal of elimination tree
 * Returns nodes in post-order (children before parents)
 *
 * @param parentPtr - Pointer to elimination tree parent array (i32)
 * @param n - Number of nodes
 * @param postPtr - Output: post-order permutation (i32)
 * @param workPtr - Working memory (i32, size 5*n for childCount, firstChild, nextSibling, stack, stackState)
 */
export function csPost(
  parentPtr: usize,
  n: i32,
  postPtr: usize,
  workPtr: usize
): void {
  // Work area layout:
  // [0, n): firstChild
  // [n, 2n): nextSibling
  // [2n, 3n): stack
  // [3n, 4n): stackState
  const firstChildPtr: usize = workPtr
  const nextSiblingPtr: usize = workPtr + (<usize>n << 2)
  const stackPtr: usize = workPtr + (<usize>(2 * n) << 2)
  const stackStatePtr: usize = workPtr + (<usize>(3 * n) << 2)

  // Initialize
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(firstChildPtr + (<usize>i << 2), -1)
    store<i32>(nextSiblingPtr + (<usize>i << 2), -1)
  }

  // Build child list for each node (in reverse order for efficiency)
  for (let i: i32 = n - 1; i >= 0; i--) {
    const p: i32 = load<i32>(parentPtr + (<usize>i << 2))
    if (p >= 0 && p < n) {
      store<i32>(nextSiblingPtr + (<usize>i << 2), load<i32>(firstChildPtr + (<usize>p << 2)))
      store<i32>(firstChildPtr + (<usize>p << 2), i)
    }
  }

  // Iterative post-order traversal
  let postIdx: i32 = 0

  // Find roots (nodes with parent = -1) and process each tree
  for (let root: i32 = 0; root < n; root++) {
    if (load<i32>(parentPtr + (<usize>root << 2)) !== -1) continue // Not a root

    // DFS from root
    let depth: i32 = 0
    store<i32>(stackPtr + (<usize>depth << 2), root)
    store<i32>(stackStatePtr + (<usize>depth << 2), 0)

    while (depth >= 0) {
      const node: i32 = load<i32>(stackPtr + (<usize>depth << 2))
      const state: i32 = load<i32>(stackStatePtr + (<usize>depth << 2))

      if (state === 0) {
        // First visit - push all children
        store<i32>(stackStatePtr + (<usize>depth << 2), 1)
        let child: i32 = load<i32>(firstChildPtr + (<usize>node << 2))
        while (child >= 0) {
          depth++
          store<i32>(stackPtr + (<usize>depth << 2), child)
          store<i32>(stackStatePtr + (<usize>depth << 2), 0)
          child = load<i32>(nextSiblingPtr + (<usize>child << 2))
        }
      } else {
        // All children processed - output this node
        store<i32>(postPtr + (<usize>postIdx << 2), node)
        postIdx++
        depth--
      }
    }
  }
}

// ============================================================================
// Sparse Matrix Utilities
// ============================================================================

/**
 * Permute a sparse matrix: C = P * A * Q^T
 * Where P is row permutation and Q is column permutation
 *
 * @param aValuesPtr - Pointer to values of A (f64)
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param pinvPtr - Pointer to inverse row permutation (i32, 0 for identity)
 * @param qPtr - Pointer to column permutation (i32, 0 for identity)
 * @param m - Number of rows
 * @param n - Number of columns
 * @param cValuesPtr - Output values of C (f64)
 * @param cIndexPtr - Output row indices of C (i32)
 * @param cPtrPtr - Output column pointers of C (i32)
 * @returns Number of non-zeros in C
 */
export function csPermute(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  pinvPtr: usize,
  qPtr: usize,
  m: i32,
  n: i32,
  cValuesPtr: usize,
  cIndexPtr: usize,
  cPtrPtr: usize
): i32 {
  let nnz: i32 = 0

  // Process each column of C
  for (let j: i32 = 0; j < n; j++) {
    store<i32>(cPtrPtr + (<usize>j << 2), nnz)

    // Column j of C comes from column q[j] of A (or j if q is null)
    const jOld: i32 = qPtr !== 0 ? load<i32>(qPtr + (<usize>j << 2)) : j

    const pStart: i32 = load<i32>(aPtrPtr + (<usize>jOld << 2))
    const pEnd: i32 = load<i32>(aPtrPtr + (<usize>(jOld + 1) << 2))

    for (let p: i32 = pStart; p < pEnd; p++) {
      const iOld: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
      // Row iOld of A becomes row pinv[iOld] of C (or iOld if pinv is null)
      const iNew: i32 = pinvPtr !== 0 ? load<i32>(pinvPtr + (<usize>iOld << 2)) : iOld

      store<f64>(cValuesPtr + (<usize>nnz << 3), load<f64>(aValuesPtr + (<usize>p << 3)))
      store<i32>(cIndexPtr + (<usize>nnz << 2), iNew)
      nnz++
    }
  }

  store<i32>(cPtrPtr + (<usize>n << 2), nnz)
  return nnz
}

/**
 * Sparse triangular solve: solve L*x = b or U*x = b
 * Uses the reach to compute only the nonzero entries of x
 *
 * @param gValuesPtr - Pointer to values of L or U (f64)
 * @param gIndexPtr - Pointer to row indices of G (i32)
 * @param gPtrPtr - Pointer to column pointers of G (i32)
 * @param n - Matrix dimension
 * @param xiPtr - Pointer to reachability pattern (i32)
 * @param top - Start position in xi
 * @param xPtr - Pointer to input b / output x (f64, dense vector)
 * @param pinvPtr - Pointer to inverse permutation (i32, 0 for null)
 * @param isLower - true for L*x=b, false for U*x=b
 */
export function csSpsolve(
  gValuesPtr: usize,
  gIndexPtr: usize,
  gPtrPtr: usize,
  n: i32,
  xiPtr: usize,
  top: i32,
  xPtr: usize,
  pinvPtr: usize,
  isLower: bool
): void {
  if (isLower) {
    // Forward substitution (process from top to n-1)
    for (let p: i32 = top; p < n; p++) {
      const j: i32 = load<i32>(xiPtr + (<usize>p << 2)) // Column to process
      let pj: i32 = j
      if (pinvPtr !== 0) {
        pj = load<i32>(pinvPtr + (<usize>j << 2))
      }

      if (pj < 0 || pj >= n) continue

      // x[j] = x[j] / L[j,j]
      const diagStart: i32 = load<i32>(gPtrPtr + (<usize>pj << 2))
      const diagEnd: i32 = load<i32>(gPtrPtr + (<usize>(pj + 1) << 2))

      // Find diagonal (first entry in column for lower triangular)
      let diagVal: f64 = 1.0
      for (let k: i32 = diagStart; k < diagEnd; k++) {
        if (load<i32>(gIndexPtr + (<usize>k << 2)) === pj) {
          diagVal = load<f64>(gValuesPtr + (<usize>k << 3))
          break
        }
      }

      const xj: f64 = load<f64>(xPtr + (<usize>j << 3)) / diagVal
      store<f64>(xPtr + (<usize>j << 3), xj)

      // x[i] -= L[i,j] * x[j] for i > j
      for (let k: i32 = diagStart; k < diagEnd; k++) {
        const i: i32 = load<i32>(gIndexPtr + (<usize>k << 2))
        if (i !== pj) {
          store<f64>(
            xPtr + (<usize>i << 3),
            load<f64>(xPtr + (<usize>i << 3)) - load<f64>(gValuesPtr + (<usize>k << 3)) * xj
          )
        }
      }
    }
  } else {
    // Back substitution (process from n-1 to top)
    for (let p: i32 = n - 1; p >= top; p--) {
      const j: i32 = load<i32>(xiPtr + (<usize>p << 2)) // Column to process
      let pj: i32 = j
      if (pinvPtr !== 0) {
        pj = load<i32>(pinvPtr + (<usize>j << 2))
      }

      if (pj < 0 || pj >= n) continue

      // Find diagonal and process
      const pStart: i32 = load<i32>(gPtrPtr + (<usize>pj << 2))
      const pEnd: i32 = load<i32>(gPtrPtr + (<usize>(pj + 1) << 2))

      const xj: f64 = load<f64>(xPtr + (<usize>j << 3))

      // x[i] -= U[i,j] * x[j] for i < j (before we update x[j])
      for (let k: i32 = pStart; k < pEnd; k++) {
        const i: i32 = load<i32>(gIndexPtr + (<usize>k << 2))
        if (i !== pj) {
          store<f64>(
            xPtr + (<usize>i << 3),
            load<f64>(xPtr + (<usize>i << 3)) - load<f64>(gValuesPtr + (<usize>k << 3)) * xj
          )
        }
      }

      // x[j] = x[j] / U[j,j]
      let diagVal: f64 = 1.0
      for (let k: i32 = pStart; k < pEnd; k++) {
        if (load<i32>(gIndexPtr + (<usize>k << 2)) === pj) {
          diagVal = load<f64>(gValuesPtr + (<usize>k << 3))
          break
        }
      }
      store<f64>(xPtr + (<usize>j << 3), xj / diagVal)
    }
  }
}

// ============================================================================
// Sparse Matrix Decompositions
// ============================================================================

/**
 * Symbolic analysis for Cholesky factorization
 * Computes the nonzero pattern of L without numerical values
 *
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param n - Matrix dimension
 * @param parentPtr - Output: elimination tree parent array (i32)
 * @param lnzPtr - Output: count of nonzeros per column of L (i32)
 * @param workPtr - Working memory (i32, size 4*n for ancestor, first, level, colCount)
 * @returns Total number of nonzeros in L
 */
export function csCholSymbolic(
  aIndexPtr: usize,
  aPtrPtr: usize,
  n: i32,
  parentPtr: usize,
  lnzPtr: usize,
  workPtr: usize
): i32 {
  // Work layout:
  // [0, n): colCount
  // [n, 2n): first
  // [2n, 3n): level
  // [3n, 4n): ancestor
  // [4n, 5n): post
  const colCountPtr: usize = workPtr
  const firstPtr: usize = workPtr + (<usize>n << 2)
  const levelPtr: usize = workPtr + (<usize>(2 * n) << 2)
  const ancestorPtr: usize = workPtr + (<usize>(3 * n) << 2)
  const postPtr: usize = workPtr + (<usize>(4 * n) << 2)

  // Compute elimination tree
  csEtree(aIndexPtr, aPtrPtr, n, parentPtr, ancestorPtr)

  // Initialize
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(firstPtr + (<usize>i << 2), -1)
    store<i32>(colCountPtr + (<usize>i << 2), 0)
  }

  // Post-order traversal to compute first descendant and levels
  // Use postPtr + remaining space for csPost work
  csPost(parentPtr, n, postPtr, workPtr + (<usize>(5 * n) << 2))

  // Compute levels (distance from root)
  for (let i: i32 = 0; i < n; i++) {
    const p: i32 = load<i32>(parentPtr + (<usize>i << 2))
    if (p >= 0) {
      store<i32>(levelPtr + (<usize>i << 2), load<i32>(levelPtr + (<usize>p << 2)) + 1)
    } else {
      store<i32>(levelPtr + (<usize>i << 2), 0)
    }
  }

  // Column count using row subtree method
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(ancestorPtr + (<usize>i << 2), i)
  }

  let totalNnz: i32 = 0

  for (let k: i32 = 0; k < n; k++) {
    const i: i32 = load<i32>(postPtr + (<usize>k << 2)) // Process in post-order

    // Count diagonal
    store<i32>(colCountPtr + (<usize>i << 2), 1)

    // Process each row with nonzero in column i
    const pStart: i32 = load<i32>(aPtrPtr + (<usize>i << 2))
    const pEnd: i32 = load<i32>(aPtrPtr + (<usize>(i + 1) << 2))

    for (let p: i32 = pStart; p < pEnd; p++) {
      let j: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
      if (j >= i) continue // Only lower triangle

      // Path from j to current subtree root
      while (j !== -1 && j < i) {
        const jnext: i32 = load<i32>(ancestorPtr + (<usize>j << 2))
        store<i32>(ancestorPtr + (<usize>j << 2), i) // Path compression

        if (jnext === j) {
          // j is root of its subtree
          store<i32>(
            colCountPtr + (<usize>i << 2),
            load<i32>(colCountPtr + (<usize>i << 2)) +
              load<i32>(levelPtr + (<usize>i << 2)) -
              load<i32>(levelPtr + (<usize>j << 2))
          )
          break
        }
        j = jnext
      }
    }

    store<i32>(lnzPtr + (<usize>i << 2), load<i32>(colCountPtr + (<usize>i << 2)))
    totalNnz += load<i32>(colCountPtr + (<usize>i << 2))
  }

  return totalNnz
}

/**
 * Sparse Cholesky factorization: A = L * L^T
 * A must be symmetric positive definite
 *
 * @param aValuesPtr - Pointer to values of A (f64, lower triangle only)
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param n - Matrix dimension
 * @param parentPtr - Pointer to elimination tree (i32, from csCholSymbolic)
 * @param lValuesPtr - Output: values of L (f64)
 * @param lIndexPtr - Output: row indices of L (i32)
 * @param lPtrPtr - Output: column pointers of L (i32)
 * @param workPtr - Working memory: [0, n*8): x (f64), [n*8, n*8+n*4): c (i32), [n*8+n*4, n*8+n*8): s (i32)
 * @returns 0 on success, -1 if not positive definite
 */
export function csChol(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  n: i32,
  parentPtr: usize,
  lValuesPtr: usize,
  lIndexPtr: usize,
  lPtrPtr: usize,
  workPtr: usize
): i32 {
  // Workspace layout:
  // [0, n*8): x (f64)
  // [n*8, n*8+n*4): c (i32)
  // [n*8+n*4, n*8+n*8): s (i32)
  const xPtr: usize = workPtr
  const cPtr: usize = workPtr + (<usize>n << 3)
  const sPtr: usize = cPtr + (<usize>n << 2)

  // Initialize column pointers in L
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(cPtr + (<usize>i << 2), load<i32>(lPtrPtr + (<usize>i << 2)))
  }

  // Process each column k
  for (let k: i32 = 0; k < n; k++) {
    // Clear x
    const top: i32 = csEreach(aIndexPtr, aPtrPtr, k, parentPtr, sPtr, cPtr, n, workPtr + (<usize>n << 3) + (<usize>(2 * n) << 2))

    // Initialize x with A[:,k]
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>k << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(k + 1) << 2))
    for (let p: i32 = aStart; p < aEnd; p++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
      if (i >= k) {
        // Lower triangle only
        store<f64>(xPtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>p << 3)))
      }
    }

    // Compute L[:,k]
    let d: f64 = load<f64>(xPtr + (<usize>k << 3)) // Diagonal
    store<f64>(xPtr + (<usize>k << 3), 0.0)

    // Process nonzeros in L[:,k] in order
    for (let p: i32 = top; p < n; p++) {
      const i: i32 = load<i32>(sPtr + (<usize>p << 2)) // L[i,k] is nonzero

      // Get L[i,k] = x[i] / L[k,k] (but we need L[k,k] first)
      const lki: f64 = load<f64>(xPtr + (<usize>i << 3)) / load<f64>(lValuesPtr + load<i32>(lPtrPtr + (<usize>i << 2)) * 8)
      store<f64>(xPtr + (<usize>i << 3), 0.0)

      // Subtract L[i,k] * L[j,k] from x[j] for j > i
      const lStart: i32 = load<i32>(lPtrPtr + (<usize>i << 2)) + 1 // Skip diagonal
      const lEnd: i32 = load<i32>(cPtr + (<usize>i << 2))
      for (let q: i32 = lStart; q < lEnd; q++) {
        const j: i32 = load<i32>(lIndexPtr + (<usize>q << 2))
        store<f64>(
          xPtr + (<usize>j << 3),
          load<f64>(xPtr + (<usize>j << 3)) - load<f64>(lValuesPtr + (<usize>q << 3)) * lki
        )
      }

      // Update diagonal
      d -= lki * lki

      // Store L[k,i]
      const cp: i32 = load<i32>(cPtr + (<usize>i << 2))
      store<i32>(lIndexPtr + (<usize>cp << 2), k)
      store<f64>(lValuesPtr + (<usize>cp << 3), lki)
      store<i32>(cPtr + (<usize>i << 2), cp + 1)
    }

    // Check positive definite
    if (d <= 0.0) {
      return -1 // Not positive definite
    }

    // Store diagonal L[k,k] = sqrt(d)
    const ck: i32 = load<i32>(cPtr + (<usize>k << 2))
    store<i32>(lIndexPtr + (<usize>ck << 2), k)
    store<f64>(lValuesPtr + (<usize>ck << 3), Math.sqrt(d))
    store<i32>(cPtr + (<usize>k << 2), ck + 1)
  }

  return 0
}

/**
 * Reach of column k of A in elimination tree
 * Helper for sparse Cholesky
 */
function csEreach(
  aIndexPtr: usize,
  aPtrPtr: usize,
  k: i32,
  parentPtr: usize,
  sPtr: usize,
  cPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  let top: i32 = n

  // Mark k as visited
  const mark: i32 = -(k + 2) // Use negative values as marks

  const pStart: i32 = load<i32>(aPtrPtr + (<usize>k << 2))
  const pEnd: i32 = load<i32>(aPtrPtr + (<usize>(k + 1) << 2))

  // Process each nonzero in A[:,k]
  for (let p: i32 = pStart; p < pEnd; p++) {
    let i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
    if (i > k) continue // Only upper triangle

    // Path from i to k
    let len: i32 = 0
    while (i !== -1 && i < k) {
      if (load<i32>(sPtr + (<usize>i << 2)) === mark) break // Already visited
      store<i32>(sPtr + (<usize>(n - 1 - len) << 2), i) // Push to temp stack
      len++
      store<i32>(sPtr + (<usize>i << 2), mark) // Mark visited
      i = load<i32>(parentPtr + (<usize>i << 2))
    }

    // Pop temp stack to output
    while (len > 0) {
      len--
      top--
      store<i32>(sPtr + (<usize>top << 2), load<i32>(sPtr + (<usize>(n - 1 - len) << 2)))
    }
  }

  return top
}

/**
 * Sparse LU factorization with partial pivoting: P*A = L*U
 *
 * @param aValuesPtr - Pointer to values of A (f64)
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param n - Matrix dimension
 * @param tol - Pivot tolerance (0 to 1)
 * @param lValuesPtr - Output: values of L (f64)
 * @param lIndexPtr - Output: row indices of L (i32)
 * @param lPtrPtr - Output: column pointers of L (i32)
 * @param uValuesPtr - Output: values of U (f64)
 * @param uIndexPtr - Output: row indices of U (i32)
 * @param uPtrPtr - Output: column pointers of U (i32)
 * @param pinvPtr - Output: row permutation inverse (i32)
 * @param workPtr - Working memory: [0, n*8): x (f64), [n*8, n*8+2n*4): xi (i32)
 * @returns 0 on success, -k-1 if structurally singular at column k
 */
export function csLu(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  n: i32,
  tol: f64,
  lValuesPtr: usize,
  lIndexPtr: usize,
  lPtrPtr: usize,
  uValuesPtr: usize,
  uIndexPtr: usize,
  uPtrPtr: usize,
  pinvPtr: usize,
  workPtr: usize
): i32 {
  // Workspace layout:
  // [0, n*8): x (f64)
  // [n*8, n*8+2n*4): xi (i32)
  const xPtr: usize = workPtr
  const xiPtr: usize = workPtr + (<usize>n << 3)

  // Initialize pinv
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(pinvPtr + (<usize>i << 2), -1)
  }

  let lnz: i32 = 0
  let unz: i32 = 0

  // Process each column k
  for (let k: i32 = 0; k < n; k++) {
    // Set column pointers
    store<i32>(lPtrPtr + (<usize>k << 2), lnz)
    store<i32>(uPtrPtr + (<usize>k << 2), unz)

    // Compute x = L\A(:,k) using symbolic pattern
    let top: i32 = csSpsolvePattern(aIndexPtr, aPtrPtr, lIndexPtr, lPtrPtr, k, xiPtr, pinvPtr, n, workPtr + (<usize>n << 3) + (<usize>(2 * n) << 2))

    // Initialize x with A[:,k]
    for (let p: i32 = top; p < n; p++) {
      store<f64>(xPtr + (<usize>load<i32>(xiPtr + (<usize>p << 2)) << 3), 0.0)
    }
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>k << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(k + 1) << 2))
    for (let p: i32 = aStart; p < aEnd; p++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
      store<f64>(xPtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>p << 3)))
    }

    // Sparse triangular solve L\A[:,k]
    for (let p: i32 = top; p < n; p++) {
      const j: i32 = load<i32>(xiPtr + (<usize>p << 2))
      const jnew: i32 = load<i32>(pinvPtr + (<usize>j << 2))

      if (jnew < 0) continue // Column j of L not yet computed

      // x[j] = x[j] / L[j,j]
      const ljj: f64 = load<f64>(lValuesPtr + (<usize>load<i32>(lPtrPtr + (<usize>jnew << 2)) << 3))
      if (ljj === 0.0) continue

      const xj: f64 = load<f64>(xPtr + (<usize>j << 3)) / ljj
      store<f64>(xPtr + (<usize>j << 3), xj)

      // Subtract L[i,j] * x[j] from x[i]
      const lStart: i32 = load<i32>(lPtrPtr + (<usize>jnew << 2)) + 1
      const lEnd: i32 = load<i32>(lPtrPtr + (<usize>(jnew + 1) << 2))
      for (let q: i32 = lStart; q < lEnd; q++) {
        const i: i32 = load<i32>(lIndexPtr + (<usize>q << 2))
        store<f64>(
          xPtr + (<usize>i << 3),
          load<f64>(xPtr + (<usize>i << 3)) - load<f64>(lValuesPtr + (<usize>q << 3)) * xj
        )
      }
    }

    // Find pivot
    let pivot: i32 = -1
    let pivotVal: f64 = 0.0

    for (let p: i32 = top; p < n; p++) {
      const i: i32 = load<i32>(xiPtr + (<usize>p << 2))
      if (load<i32>(pinvPtr + (<usize>i << 2)) < 0) {
        // Row not yet used as pivot
        const t: f64 = Math.abs(load<f64>(xPtr + (<usize>i << 3)))
        if (t > pivotVal) {
          pivotVal = t
          pivot = i
        }
      }
    }

    // Check for structural singularity
    if (pivot < 0 || pivotVal <= 0.0) {
      return -k - 1
    }

    // Apply tolerance for numerical pivoting
    let ipiv: i32 = pivot
    const thresh: f64 = tol * pivotVal

    for (let p: i32 = top; p < n; p++) {
      const i: i32 = load<i32>(xiPtr + (<usize>p << 2))
      if (load<i32>(pinvPtr + (<usize>i << 2)) < 0) {
        if (Math.abs(load<f64>(xPtr + (<usize>i << 3))) >= thresh && i < ipiv) {
          ipiv = i // Prefer smaller row index
        }
      }
    }

    // Record pivot
    store<i32>(pinvPtr + (<usize>ipiv << 2), k)

    // Store U[:,k] (rows with pinv[i] >= 0 or i == pivot)
    for (let p: i32 = top; p < n; p++) {
      const i: i32 = load<i32>(xiPtr + (<usize>p << 2))
      if (load<i32>(pinvPtr + (<usize>i << 2)) < k || i === ipiv) {
        // This is in U
        store<i32>(uIndexPtr + (<usize>unz << 2), i)
        store<f64>(uValuesPtr + (<usize>unz << 3), load<f64>(xPtr + (<usize>i << 3)))
        unz++
        store<f64>(xPtr + (<usize>i << 3), 0.0)
      }
    }

    // Store L[:,k] (rows with pinv[i] < 0)
    const ukk: f64 = load<f64>(xPtr + (<usize>ipiv << 3)) // Diagonal of U
    store<f64>(xPtr + (<usize>ipiv << 3), 0.0)

    // Store diagonal of L as 1
    store<i32>(lIndexPtr + (<usize>lnz << 2), ipiv)
    store<f64>(lValuesPtr + (<usize>lnz << 3), 1.0)
    lnz++

    // Store off-diagonal of L
    for (let p: i32 = top; p < n; p++) {
      const i: i32 = load<i32>(xiPtr + (<usize>p << 2))
      if (load<i32>(pinvPtr + (<usize>i << 2)) < 0 && i !== ipiv) {
        store<i32>(lIndexPtr + (<usize>lnz << 2), i)
        store<f64>(lValuesPtr + (<usize>lnz << 3), load<f64>(xPtr + (<usize>i << 3)) / ukk)
        lnz++
        store<f64>(xPtr + (<usize>i << 3), 0.0)
      }
    }
  }

  // Finalize
  store<i32>(lPtrPtr + (<usize>n << 2), lnz)
  store<i32>(uPtrPtr + (<usize>n << 2), unz)

  return 0
}

/**
 * Helper: compute symbolic pattern for sparse solve
 */
function csSpsolvePattern(
  aIndexPtr: usize,
  aPtrPtr: usize,
  lIndexPtr: usize,
  lPtrPtr: usize,
  k: i32,
  xiPtr: usize,
  pinvPtr: usize,
  n: i32,
  workPtr: usize
): i32 {
  let top: i32 = n
  // Use workPtr for mark array and stack
  const markPtr: usize = workPtr
  const stackPtr: usize = workPtr + (<usize>n << 2)
  const stackPosPtr: usize = workPtr + (<usize>(2 * n) << 2)
  const currentMark: i32 = k + 1

  // Start with pattern of A[:,k]
  const aStart: i32 = load<i32>(aPtrPtr + (<usize>k << 2))
  const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(k + 1) << 2))

  for (let p: i32 = aStart; p < aEnd; p++) {
    const i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))

    if (load<i32>(markPtr + (<usize>i << 2)) === currentMark) continue

    // DFS from i
    let depth: i32 = 0

    store<i32>(stackPtr, i)
    let pi: i32 = load<i32>(pinvPtr + (<usize>i << 2))
    store<i32>(stackPosPtr, pi >= 0 ? load<i32>(lPtrPtr + (<usize>pi << 2)) : 0)

    while (depth >= 0) {
      const j: i32 = load<i32>(stackPtr + (<usize>depth << 2))
      const pj: i32 = load<i32>(pinvPtr + (<usize>j << 2))

      if (load<i32>(markPtr + (<usize>j << 2)) === currentMark) {
        depth--
        continue
      }

      if (pj < 0) {
        store<i32>(markPtr + (<usize>j << 2), currentMark)
        top--
        store<i32>(xiPtr + (<usize>top << 2), j)
        depth--
        continue
      }

      const pos: i32 = load<i32>(stackPosPtr + (<usize>depth << 2))
      const pEnd: i32 = load<i32>(lPtrPtr + (<usize>(pj + 1) << 2))

      let foundChild: bool = false
      for (let q: i32 = pos; q < pEnd; q++) {
        const child: i32 = load<i32>(lIndexPtr + (<usize>q << 2))
        if (load<i32>(markPtr + (<usize>child << 2)) !== currentMark) {
          store<i32>(stackPosPtr + (<usize>depth << 2), q + 1)
          depth++
          store<i32>(stackPtr + (<usize>depth << 2), child)
          const pc: i32 = load<i32>(pinvPtr + (<usize>child << 2))
          store<i32>(stackPosPtr + (<usize>depth << 2), pc >= 0 ? load<i32>(lPtrPtr + (<usize>pc << 2)) : 0)
          foundChild = true
          break
        }
      }

      if (!foundChild) {
        store<i32>(markPtr + (<usize>j << 2), currentMark)
        top--
        store<i32>(xiPtr + (<usize>top << 2), j)
        depth--
      }
    }
  }

  return top
}

/**
 * Sparse QR factorization using Householder reflections: A = Q*R
 *
 * @param aValuesPtr - Pointer to values of A (f64)
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param m - Number of rows
 * @param n - Number of columns (must be <= m)
 * @param rValuesPtr - Output: values of R (f64)
 * @param rIndexPtr - Output: row indices of R (i32)
 * @param rPtrPtr - Output: column pointers of R (i32)
 * @param betaPtr - Output: Householder scalars (f64, size n)
 * @param vValuesPtr - Output: Householder vectors V values (f64)
 * @param vIndexPtr - Output: V row indices (i32)
 * @param vPtrPtr - Output: V column pointers (i32)
 * @param workPtr - Working memory (f64, size m for x)
 * @returns 0 on success, negative on error
 */
export function csQr(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  m: i32,
  n: i32,
  rValuesPtr: usize,
  rIndexPtr: usize,
  rPtrPtr: usize,
  betaPtr: usize,
  vValuesPtr: usize,
  vIndexPtr: usize,
  vPtrPtr: usize,
  workPtr: usize
): i32 {
  // Dense working column
  const xPtr: usize = workPtr

  let rnz: i32 = 0
  let vnz: i32 = 0

  for (let k: i32 = 0; k < n; k++) {
    store<i32>(rPtrPtr + (<usize>k << 2), rnz)
    store<i32>(vPtrPtr + (<usize>k << 2), vnz)

    // Clear x
    for (let i: i32 = 0; i < m; i++) {
      store<f64>(xPtr + (<usize>i << 3), 0.0)
    }

    // Load A[:,k] into x
    const aStart: i32 = load<i32>(aPtrPtr + (<usize>k << 2))
    const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(k + 1) << 2))
    for (let p: i32 = aStart; p < aEnd; p++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
      store<f64>(xPtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>p << 3)))
    }

    // Apply previous Householder transformations
    for (let j: i32 = 0; j < k; j++) {
      const betaJ: f64 = load<f64>(betaPtr + (<usize>j << 3))
      if (betaJ === 0.0) continue

      // Compute v^T * x
      let vTx: f64 = 0.0
      const vStart: i32 = load<i32>(vPtrPtr + (<usize>j << 2))
      const vEnd: i32 = load<i32>(vPtrPtr + (<usize>(j + 1) << 2))
      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = load<i32>(vIndexPtr + (<usize>p << 2))
        vTx += load<f64>(vValuesPtr + (<usize>p << 3)) * load<f64>(xPtr + (<usize>i << 3))
      }

      // x = x - beta * v * (v^T * x)
      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = load<i32>(vIndexPtr + (<usize>p << 2))
        store<f64>(
          xPtr + (<usize>i << 3),
          load<f64>(xPtr + (<usize>i << 3)) - betaJ * load<f64>(vValuesPtr + (<usize>p << 3)) * vTx
        )
      }
    }

    // Compute Householder transformation for x[k:m]
    // Compute norm of x[k:m]
    let sigma: f64 = 0.0
    for (let i: i32 = k; i < m; i++) {
      sigma += load<f64>(xPtr + (<usize>i << 3)) * load<f64>(xPtr + (<usize>i << 3))
    }
    sigma = Math.sqrt(sigma)

    if (sigma === 0.0) {
      // Zero column
      store<f64>(betaPtr + (<usize>k << 3), 0.0)
    } else {
      // v = x[k:m], v[0] = x[k] + sign(x[k])*sigma
      const xk: f64 = load<f64>(xPtr + (<usize>k << 3))
      const s: f64 = xk >= 0.0 ? 1.0 : -1.0
      const v0: f64 = xk + s * sigma

      // Store R[0:k, k] (above diagonal)
      for (let i: i32 = 0; i < k; i++) {
        if (load<f64>(xPtr + (<usize>i << 3)) !== 0.0) {
          store<i32>(rIndexPtr + (<usize>rnz << 2), i)
          store<f64>(rValuesPtr + (<usize>rnz << 3), load<f64>(xPtr + (<usize>i << 3)))
          rnz++
        }
      }

      // Store R[k,k] = -sign(x[k]) * sigma
      store<i32>(rIndexPtr + (<usize>rnz << 2), k)
      store<f64>(rValuesPtr + (<usize>rnz << 3), -s * sigma)
      rnz++

      // Store Householder vector (normalized so first element is 1)
      store<i32>(vIndexPtr + (<usize>vnz << 2), k)
      store<f64>(vValuesPtr + (<usize>vnz << 3), 1.0)
      vnz++

      for (let i: i32 = k + 1; i < m; i++) {
        if (load<f64>(xPtr + (<usize>i << 3)) !== 0.0) {
          store<i32>(vIndexPtr + (<usize>vnz << 2), i)
          store<f64>(vValuesPtr + (<usize>vnz << 3), load<f64>(xPtr + (<usize>i << 3)) / v0)
          vnz++
        }
      }

      // beta = 2 / (v^T * v) = 2 * v0^2 / (v0^2 + x[k+1:m]^2)
      let vTv: f64 = v0 * v0
      for (let i: i32 = k + 1; i < m; i++) {
        const vi: f64 = load<f64>(xPtr + (<usize>i << 3))
        vTv += vi * vi
      }
      store<f64>(betaPtr + (<usize>k << 3), (2.0 * v0 * v0) / vTv)
    }
  }

  // Finalize
  store<i32>(rPtrPtr + (<usize>n << 2), rnz)
  store<i32>(vPtrPtr + (<usize>n << 2), vnz)

  return 0
}

/**
 * Apply Q (from QR factorization) to a vector: y = Q * x or y = Q^T * x
 * Q is represented implicitly by Householder vectors V and scalars beta
 *
 * @param vValuesPtr - Pointer to Householder vectors V values (f64)
 * @param vIndexPtr - Pointer to V row indices (i32)
 * @param vPtrPtr - Pointer to V column pointers (i32)
 * @param betaPtr - Pointer to Householder scalars (f64)
 * @param n - Number of Householder transformations
 * @param xPtr - Pointer to input vector (f64, length m)
 * @param yPtr - Pointer to output vector (f64, length m)
 * @param m - Vector length
 * @param transpose - If true, compute Q^T * x, else Q * x
 */
export function csQmult(
  vValuesPtr: usize,
  vIndexPtr: usize,
  vPtrPtr: usize,
  betaPtr: usize,
  n: i32,
  xPtr: usize,
  yPtr: usize,
  m: i32,
  transpose: bool
): void {
  // Copy x to y
  for (let i: i32 = 0; i < m; i++) {
    store<f64>(yPtr + (<usize>i << 3), load<f64>(xPtr + (<usize>i << 3)))
  }

  // Apply Householder transformations
  // Q = H_0 * H_1 * ... * H_{n-1}
  // Q^T = H_{n-1} * ... * H_1 * H_0

  if (transpose) {
    // Apply H_{n-1}, H_{n-2}, ..., H_0
    for (let k: i32 = n - 1; k >= 0; k--) {
      const betaK: f64 = load<f64>(betaPtr + (<usize>k << 3))
      if (betaK === 0.0) continue

      // y = y - beta * v * (v^T * y)
      let vTy: f64 = 0.0
      const vStart: i32 = load<i32>(vPtrPtr + (<usize>k << 2))
      const vEnd: i32 = load<i32>(vPtrPtr + (<usize>(k + 1) << 2))

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = load<i32>(vIndexPtr + (<usize>p << 2))
        vTy += load<f64>(vValuesPtr + (<usize>p << 3)) * load<f64>(yPtr + (<usize>i << 3))
      }

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = load<i32>(vIndexPtr + (<usize>p << 2))
        store<f64>(
          yPtr + (<usize>i << 3),
          load<f64>(yPtr + (<usize>i << 3)) - betaK * load<f64>(vValuesPtr + (<usize>p << 3)) * vTy
        )
      }
    }
  } else {
    // Apply H_0, H_1, ..., H_{n-1}
    for (let k: i32 = 0; k < n; k++) {
      const betaK: f64 = load<f64>(betaPtr + (<usize>k << 3))
      if (betaK === 0.0) continue

      let vTy: f64 = 0.0
      const vStart: i32 = load<i32>(vPtrPtr + (<usize>k << 2))
      const vEnd: i32 = load<i32>(vPtrPtr + (<usize>(k + 1) << 2))

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = load<i32>(vIndexPtr + (<usize>p << 2))
        vTy += load<f64>(vValuesPtr + (<usize>p << 3)) * load<f64>(yPtr + (<usize>i << 3))
      }

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = load<i32>(vIndexPtr + (<usize>p << 2))
        store<f64>(
          yPtr + (<usize>i << 3),
          load<f64>(yPtr + (<usize>i << 3)) - betaK * load<f64>(vValuesPtr + (<usize>p << 3)) * vTy
        )
      }
    }
  }
}

// ============================================================================
// Ordering Algorithms
// ============================================================================

/**
 * Approximate Minimum Degree (AMD) ordering
 * Computes a fill-reducing permutation for sparse Cholesky/LU
 *
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param n - Matrix dimension
 * @param permPtr - Output: permutation array (i32)
 * @param workPtr - Working memory (i32, size 2*n for degree, eliminated)
 */
export function csAmd(
  aIndexPtr: usize,
  aPtrPtr: usize,
  n: i32,
  permPtr: usize,
  workPtr: usize
): void {
  // Work layout: [0, n): degree, [n, 2n): eliminated
  const degreePtr: usize = workPtr
  const eliminatedPtr: usize = workPtr + (<usize>n << 2)

  // Initial degrees (number of neighbors)
  for (let j: i32 = 0; j < n; j++) {
    const count: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2)) - load<i32>(aPtrPtr + (<usize>j << 2))
    store<i32>(degreePtr + (<usize>j << 2), count)
    store<i32>(eliminatedPtr + (<usize>j << 2), 0)
  }

  // Minimum degree ordering
  for (let k: i32 = 0; k < n; k++) {
    // Find node with minimum degree
    let minDeg: i32 = n + 1
    let minNode: i32 = -1

    for (let j: i32 = 0; j < n; j++) {
      if (load<i32>(eliminatedPtr + (<usize>j << 2)) === 0 && load<i32>(degreePtr + (<usize>j << 2)) < minDeg) {
        minDeg = load<i32>(degreePtr + (<usize>j << 2))
        minNode = j
      }
    }

    if (minNode < 0) {
      // All nodes eliminated - this shouldn't happen
      break
    }

    // Eliminate minNode
    store<i32>(permPtr + (<usize>k << 2), minNode)
    store<i32>(eliminatedPtr + (<usize>minNode << 2), 1)

    // Update degrees of neighbors
    const pStart: i32 = load<i32>(aPtrPtr + (<usize>minNode << 2))
    const pEnd: i32 = load<i32>(aPtrPtr + (<usize>(minNode + 1) << 2))

    for (let p: i32 = pStart; p < pEnd; p++) {
      const neighbor: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
      if (load<i32>(eliminatedPtr + (<usize>neighbor << 2)) === 0) {
        const newDeg: i32 = load<i32>(degreePtr + (<usize>neighbor << 2)) - 1
        store<i32>(degreePtr + (<usize>neighbor << 2), newDeg < 0 ? 0 : newDeg)
      }
    }
  }
}

/**
 * Reverse Cuthill-McKee (RCM) ordering
 * Reduces matrix bandwidth by BFS-based reordering
 *
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param n - Matrix dimension
 * @param permPtr - Output: permutation array (i32)
 * @param workPtr - Working memory (i32, size 4*n for visited, queue, degree, neighbors)
 */
export function csRcm(
  aIndexPtr: usize,
  aPtrPtr: usize,
  n: i32,
  permPtr: usize,
  workPtr: usize
): void {
  // Work layout: [0, n): visited, [n, 2n): queue, [2n, 3n): degree, [3n, 4n): neighbors
  const visitedPtr: usize = workPtr
  const queuePtr: usize = workPtr + (<usize>n << 2)
  const degreePtr: usize = workPtr + (<usize>(2 * n) << 2)
  const neighborsPtr: usize = workPtr + (<usize>(3 * n) << 2)

  // Compute degrees and find starting node with minimum degree
  let start: i32 = 0
  let minDeg: i32 = n + 1

  for (let j: i32 = 0; j < n; j++) {
    const deg: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2)) - load<i32>(aPtrPtr + (<usize>j << 2))
    store<i32>(degreePtr + (<usize>j << 2), deg)
    store<i32>(visitedPtr + (<usize>j << 2), 0)
    if (deg < minDeg) {
      minDeg = deg
      start = j
    }
  }

  let head: i32 = 0
  let tail: i32 = 0
  let permIdx: i32 = 0

  // Process each connected component
  for (let s: i32 = 0; s < n; s++) {
    if (load<i32>(visitedPtr + (<usize>s << 2)) !== 0) continue

    // Find minimum degree unvisited node to start new component
    let cStart: i32 = s
    minDeg = n + 1
    for (let j: i32 = s; j < n; j++) {
      if (load<i32>(visitedPtr + (<usize>j << 2)) === 0 && load<i32>(degreePtr + (<usize>j << 2)) < minDeg) {
        minDeg = load<i32>(degreePtr + (<usize>j << 2))
        cStart = j
      }
    }

    // BFS from cStart
    store<i32>(queuePtr + (<usize>tail << 2), cStart)
    tail++
    store<i32>(visitedPtr + (<usize>cStart << 2), 1)

    while (head < tail) {
      const node: i32 = load<i32>(queuePtr + (<usize>head << 2))
      head++
      store<i32>(permPtr + (<usize>permIdx << 2), node)
      permIdx++

      // Get neighbors and sort by degree
      let numNeighbors: i32 = 0

      const pStart: i32 = load<i32>(aPtrPtr + (<usize>node << 2))
      const pEnd: i32 = load<i32>(aPtrPtr + (<usize>(node + 1) << 2))

      for (let p: i32 = pStart; p < pEnd; p++) {
        const neighbor: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
        if (load<i32>(visitedPtr + (<usize>neighbor << 2)) === 0) {
          store<i32>(neighborsPtr + (<usize>numNeighbors << 2), neighbor)
          numNeighbors++
          store<i32>(visitedPtr + (<usize>neighbor << 2), 1)
        }
      }

      // Sort neighbors by degree (insertion sort for small arrays)
      for (let i: i32 = 1; i < numNeighbors; i++) {
        const key: i32 = load<i32>(neighborsPtr + (<usize>i << 2))
        const keyDeg: i32 = load<i32>(degreePtr + (<usize>key << 2))
        let j: i32 = i - 1

        while (j >= 0 && load<i32>(degreePtr + load<i32>(neighborsPtr + (<usize>j << 2)) * 4) > keyDeg) {
          store<i32>(neighborsPtr + (<usize>(j + 1) << 2), load<i32>(neighborsPtr + (<usize>j << 2)))
          j--
        }
        store<i32>(neighborsPtr + (<usize>(j + 1) << 2), key)
      }

      // Add sorted neighbors to queue
      for (let i: i32 = 0; i < numNeighbors; i++) {
        store<i32>(queuePtr + (<usize>tail << 2), load<i32>(neighborsPtr + (<usize>i << 2)))
        tail++
      }
    }
  }

  // Reverse the permutation (Cuthill-McKee -> Reverse Cuthill-McKee)
  for (let i: i32 = 0; i < n / 2; i++) {
    const temp: i32 = load<i32>(permPtr + (<usize>i << 2))
    store<i32>(permPtr + (<usize>i << 2), load<i32>(permPtr + (<usize>(n - 1 - i) << 2)))
    store<i32>(permPtr + (<usize>(n - 1 - i) << 2), temp)
  }
}

/**
 * Compute inverse permutation
 *
 * @param permPtr - Pointer to input permutation (i32)
 * @param n - Length
 * @param pinvPtr - Pointer to output inverse permutation (i32)
 */
export function csInvPerm(permPtr: usize, n: i32, pinvPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(pinvPtr + (<usize>load<i32>(permPtr + (<usize>i << 2)) << 2), i)
  }
}

// ============================================================================
// Sparse Matrix Utilities
// ============================================================================

/**
 * Transpose a sparse matrix: B = A^T
 *
 * @param aValuesPtr - Pointer to values of A (f64)
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param m - Number of rows of A
 * @param n - Number of columns of A
 * @param bValuesPtr - Output values of B (f64)
 * @param bIndexPtr - Output row indices of B (i32)
 * @param bPtrPtr - Output column pointers of B (i32)
 * @param workPtr - Working memory (i32, size m for count)
 * @returns Number of nonzeros
 */
export function csTranspose(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  m: i32,
  n: i32,
  bValuesPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  workPtr: usize
): i32 {
  // Count entries per row of A (= column of B)
  const countPtr: usize = workPtr

  const nnz: i32 = load<i32>(aPtrPtr + (<usize>n << 2))

  // Initialize count to 0
  for (let i: i32 = 0; i < m; i++) {
    store<i32>(countPtr + (<usize>i << 2), 0)
  }

  for (let p: i32 = 0; p < nnz; p++) {
    const i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
    store<i32>(countPtr + (<usize>i << 2), load<i32>(countPtr + (<usize>i << 2)) + 1)
  }

  // Compute column pointers of B
  let sum: i32 = 0
  for (let i: i32 = 0; i < m; i++) {
    store<i32>(bPtrPtr + (<usize>i << 2), sum)
    sum += load<i32>(countPtr + (<usize>i << 2))
    store<i32>(countPtr + (<usize>i << 2), load<i32>(bPtrPtr + (<usize>i << 2))) // Reset to use as cursor
  }
  store<i32>(bPtrPtr + (<usize>m << 2), sum)

  // Fill B
  for (let j: i32 = 0; j < n; j++) {
    const pStart: i32 = load<i32>(aPtrPtr + (<usize>j << 2))
    const pEnd: i32 = load<i32>(aPtrPtr + (<usize>(j + 1) << 2))

    for (let p: i32 = pStart; p < pEnd; p++) {
      const i: i32 = load<i32>(aIndexPtr + (<usize>p << 2))
      const q: i32 = load<i32>(countPtr + (<usize>i << 2))
      store<i32>(bIndexPtr + (<usize>q << 2), j)
      store<f64>(bValuesPtr + (<usize>q << 3), load<f64>(aValuesPtr + (<usize>p << 3)))
      store<i32>(countPtr + (<usize>i << 2), q + 1)
    }
  }

  return nnz
}

/**
 * Multiply two sparse matrices: C = A * B
 *
 * @param aValuesPtr - Pointer to values of A (f64)
 * @param aIndexPtr - Pointer to row indices of A (i32)
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param aRows - Number of rows of A
 * @param aCols - Number of columns of A (= rows of B)
 * @param bValuesPtr - Pointer to values of B (f64)
 * @param bIndexPtr - Pointer to row indices of B (i32)
 * @param bPtrPtr - Pointer to column pointers of B (i32)
 * @param bCols - Number of columns of B
 * @param cValuesPtr - Output values of C (f64)
 * @param cIndexPtr - Output row indices of C (i32)
 * @param cPtrPtr - Output column pointers of C (i32)
 * @param workPtr - Working memory: [0, aRows*8): x (f64), [aRows*8, aRows*8+aRows*4): w (i32)
 * @returns Number of nonzeros in C
 */
export function csMult(
  aValuesPtr: usize,
  aIndexPtr: usize,
  aPtrPtr: usize,
  aRows: i32,
  aCols: i32,
  bValuesPtr: usize,
  bIndexPtr: usize,
  bPtrPtr: usize,
  bCols: i32,
  cValuesPtr: usize,
  cIndexPtr: usize,
  cPtrPtr: usize,
  workPtr: usize
): i32 {
  // Dense accumulator and mark array
  const xPtr: usize = workPtr
  const wPtr: usize = workPtr + (<usize>aRows << 3)

  let cnz: i32 = 0

  // Process each column of B
  for (let j: i32 = 0; j < bCols; j++) {
    store<i32>(cPtrPtr + (<usize>j << 2), cnz)
    const mark: i32 = j + 1

    // C[:,j] = A * B[:,j]
    const bStart: i32 = load<i32>(bPtrPtr + (<usize>j << 2))
    const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(j + 1) << 2))

    // Scatter B[:,j] into x, multiplied by A columns
    for (let p: i32 = bStart; p < bEnd; p++) {
      const k: i32 = load<i32>(bIndexPtr + (<usize>p << 2)) // B[k,j]
      const bkj: f64 = load<f64>(bValuesPtr + (<usize>p << 3))

      // Add bkj * A[:,k] to x
      const aStart: i32 = load<i32>(aPtrPtr + (<usize>k << 2))
      const aEnd: i32 = load<i32>(aPtrPtr + (<usize>(k + 1) << 2))

      for (let q: i32 = aStart; q < aEnd; q++) {
        const i: i32 = load<i32>(aIndexPtr + (<usize>q << 2))
        if (load<i32>(wPtr + (<usize>i << 2)) < mark) {
          // First contribution to x[i]
          store<i32>(wPtr + (<usize>i << 2), mark)
          store<i32>(cIndexPtr + (<usize>cnz << 2), i)
          cnz++
          store<f64>(xPtr + (<usize>i << 3), load<f64>(aValuesPtr + (<usize>q << 3)) * bkj)
        } else {
          // Add to existing
          store<f64>(xPtr + (<usize>i << 3), load<f64>(xPtr + (<usize>i << 3)) + load<f64>(aValuesPtr + (<usize>q << 3)) * bkj)
        }
      }
    }

    // Gather x into C[:,j]
    for (let p: i32 = load<i32>(cPtrPtr + (<usize>j << 2)); p < cnz; p++) {
      const i: i32 = load<i32>(cIndexPtr + (<usize>p << 2))
      store<f64>(cValuesPtr + (<usize>p << 3), load<f64>(xPtr + (<usize>i << 3)))
    }
  }

  store<i32>(cPtrPtr + (<usize>bCols << 2), cnz)
  return cnz
}

/**
 * Estimate number of nonzeros in sparse matrix multiply result
 *
 * @param aPtrPtr - Pointer to column pointers of A (i32)
 * @param aCols - Number of columns of A
 * @param bIndexPtr - Pointer to row indices of B (i32)
 * @param bPtrPtr - Pointer to column pointers of B (i32)
 * @param bCols - Number of columns of B
 * @param aRows - Number of rows of A
 * @returns Estimated number of nonzeros in C = A * B
 */
export function csMultNnzEstimate(
  aPtrPtr: usize,
  aCols: i32,
  bIndexPtr: usize,
  bPtrPtr: usize,
  bCols: i32,
  aRows: i32
): i32 {
  // Upper bound: sum of products of column nnz counts
  let estimate: i32 = 0

  for (let j: i32 = 0; j < bCols; j++) {
    const bStart: i32 = load<i32>(bPtrPtr + (<usize>j << 2))
    const bEnd: i32 = load<i32>(bPtrPtr + (<usize>(j + 1) << 2))

    let colNnz: i32 = 0
    for (let p: i32 = bStart; p < bEnd; p++) {
      const k: i32 = load<i32>(bIndexPtr + (<usize>p << 2))
      if (k < aCols) {
        colNnz += load<i32>(aPtrPtr + (<usize>(k + 1) << 2)) - load<i32>(aPtrPtr + (<usize>k << 2))
      }
    }

    // Cap at aRows (maximum possible per column)
    if (colNnz > aRows) {
      colNnz = aRows
    }
    estimate += colNnz
  }

  return estimate
}
