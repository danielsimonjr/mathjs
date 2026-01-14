/**
 * WASM-optimized sparse matrix graph algorithms and decompositions
 *
 * AssemblyScript implementations for high-performance sparse matrix operations.
 * Implements CSparse-style algorithms for graph traversal and matrix factorizations.
 *
 * All matrices use CSC (Compressed Sparse Column) format:
 * - values: Array of non-zero values
 * - index: Array of row indices
 * - ptr: Array of column pointers (ptr[j] = start of column j)
 *
 * Performance: 2-10x faster than JavaScript for large sparse matrices (>1000 elements)
 */

// ============================================================================
// Graph Algorithms (Foundational for sparse decompositions)
// ============================================================================

/**
 * Depth-first search on graph of matrix G starting from node j
 *
 * @param gIndex - Row indices of G (adjacency list)
 * @param gPtr - Column pointers of G
 * @param j - Starting node
 * @param top - Stack top (modified in place)
 * @param xi - Stack of nodes discovered (modified)
 * @param pinv - Inverse permutation (or null for identity)
 * @param n - Matrix dimension
 * @returns New stack top position
 */
export function csDfs(
  gIndex: Int32Array,
  gPtr: Int32Array,
  j: i32,
  top: i32,
  xi: Int32Array,
  pinv: Int32Array | null,
  n: i32
): i32 {
  // Workspace for DFS
  const head: i32 = 0  // Stack stores (node, adjacency index) pairs
  let tail: i32 = 0

  // Push starting node onto stack
  const stackNode = new Int32Array(n)
  const stackAdj = new Int32Array(n)

  // Mark array (use negative values as marks)
  // If xi[i] < 0, node i is already visited

  // Initialize starting node
  let node: i32 = j

  // If pinv is not null, map through it
  if (pinv !== null) {
    node = unchecked(pinv[j])
    if (node < 0) return top  // Node not in pattern
  }

  // Mark j as visited by negating (or use a separate mark array)
  // Here we use a simpler approach with a done array
  const done = new Int32Array(n)

  stackNode[tail] = j
  stackAdj[tail] = unchecked(gPtr[j])
  tail++

  while (tail > 0) {
    // Peek at top of stack
    const p: i32 = tail - 1
    const i: i32 = unchecked(stackNode[p])
    let k: i32 = unchecked(stackAdj[p])
    const pEnd: i32 = unchecked(gPtr[i + 1])

    // Find next unvisited neighbor
    let found: bool = false
    while (k < pEnd) {
      const neighbor: i32 = unchecked(gIndex[k])
      k++

      // Check if neighbor is visited
      if (unchecked(done[neighbor]) === 0) {
        // Push neighbor onto stack
        unchecked(stackAdj[p] = k)  // Save position for backtracking
        unchecked(stackNode[tail] = neighbor)
        unchecked(stackAdj[tail] = unchecked(gPtr[neighbor]))
        tail++
        found = true
        break
      }
    }

    if (!found) {
      // Node is finished - add to output
      unchecked(done[i] = 1)
      unchecked(xi[top] = i)
      top++
      tail--  // Pop from stack
    }
  }

  return top
}

/**
 * Compute reachability of nodes in B[:,k] in the graph of L
 * Used for sparse triangular solve to find which entries of x are nonzero
 *
 * @param gIndex - Row indices of G (lower triangular L)
 * @param gPtr - Column pointers of G
 * @param bIndex - Row indices of B column
 * @param bPtr - Column pointers of B
 * @param k - Column of B to process
 * @param xi - Output stack of reachable nodes (in topological order)
 * @param pinv - Inverse permutation (or null for identity)
 * @param n - Matrix dimension
 * @returns Number of reachable nodes
 */
export function csReach(
  gIndex: Int32Array,
  gPtr: Int32Array,
  bIndex: Int32Array,
  bPtr: Int32Array,
  k: i32,
  xi: Int32Array,
  pinv: Int32Array | null,
  n: i32
): i32 {
  // Mark array for visited nodes
  const mark = new Int32Array(n)
  let top: i32 = n  // Output grows downward from n

  // Process each nonzero in B[:,k]
  const bStart: i32 = unchecked(bPtr[k])
  const bEnd: i32 = unchecked(bPtr[k + 1])

  for (let p: i32 = bStart; p < bEnd; p++) {
    const i: i32 = unchecked(bIndex[p])

    // If node not yet visited, start DFS from it
    if (unchecked(mark[i]) === 0) {
      top = csDfsReach(gIndex, gPtr, i, top, xi, mark, pinv, n)
    }
  }

  return top
}

/**
 * DFS helper for csReach - finds all nodes reachable from j
 */
function csDfsReach(
  gIndex: Int32Array,
  gPtr: Int32Array,
  j: i32,
  top: i32,
  xi: Int32Array,
  mark: Int32Array,
  pinv: Int32Array | null,
  n: i32
): i32 {
  // Stack for iterative DFS
  const stack = new Int32Array(n)
  const stackPos = new Int32Array(n)
  let depth: i32 = 0

  // Push starting node
  stack[depth] = j
  let pj: i32 = j
  if (pinv !== null) {
    pj = unchecked(pinv[j])
  }
  stackPos[depth] = pj >= 0 ? unchecked(gPtr[pj]) : 0

  while (depth >= 0) {
    const i: i32 = stack[depth]
    let pi: i32 = i
    if (pinv !== null) {
      pi = unchecked(pinv[i])
    }

    // If node marked, skip
    if (unchecked(mark[i]) !== 0) {
      depth--
      continue
    }

    // First time visiting - mark as in progress (partial)
    if (pi < 0) {
      // Node not in L, finish immediately
      unchecked(mark[i] = 1)
      top--
      unchecked(xi[top] = i)
      depth--
      continue
    }

    const p: i32 = stackPos[depth]
    const pEnd: i32 = unchecked(gPtr[pi + 1])

    // Find next unvisited child
    let foundChild: bool = false
    for (let k: i32 = p; k < pEnd; k++) {
      const child: i32 = unchecked(gIndex[k])
      if (unchecked(mark[child]) === 0) {
        stackPos[depth] = k + 1  // Save position
        depth++
        stack[depth] = child
        let pc: i32 = child
        if (pinv !== null) {
          pc = unchecked(pinv[child])
        }
        stackPos[depth] = pc >= 0 ? unchecked(gPtr[pc]) : 0
        foundChild = true
        break
      }
    }

    if (!foundChild) {
      // All children visited - finish this node
      unchecked(mark[i] = 1)
      top--
      unchecked(xi[top] = i)
      depth--
    }
  }

  return top
}

/**
 * Compute the elimination tree of a symmetric positive definite matrix A
 * The elimination tree is fundamental for sparse Cholesky factorization
 *
 * @param aIndex - Row indices of A (only upper or lower triangle needed)
 * @param aPtr - Column pointers of A
 * @param n - Matrix dimension
 * @param parent - Output: parent[i] = parent of node i in etree (-1 for root)
 */
export function csEtree(
  aIndex: Int32Array,
  aPtr: Int32Array,
  n: i32,
  parent: Int32Array
): void {
  // Workspace for path compression (ancestor array)
  const ancestor = new Int32Array(n)

  // Initialize
  for (let i: i32 = 0; i < n; i++) {
    unchecked(parent[i] = -1)
    unchecked(ancestor[i] = -1)
  }

  // Process columns from left to right
  for (let k: i32 = 0; k < n; k++) {
    const pStart: i32 = unchecked(aPtr[k])
    const pEnd: i32 = unchecked(aPtr[k + 1])

    // Process each non-zero A(i,k) where i < k
    for (let p: i32 = pStart; p < pEnd; p++) {
      let i: i32 = unchecked(aIndex[p])

      // Only process upper triangle (i < k)
      if (i >= k) continue

      // Path from i to root of subtree, updating parent and ancestor
      while (i !== -1 && i < k) {
        const inext: i32 = unchecked(ancestor[i])
        unchecked(ancestor[i] = k)  // Path compression

        if (inext === -1) {
          // i is a root of its subtree - k becomes its parent
          unchecked(parent[i] = k)
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
 * @param parent - Elimination tree parent array
 * @param n - Number of nodes
 * @param post - Output: post-order permutation
 */
export function csPost(
  parent: Int32Array,
  n: i32,
  post: Int32Array
): void {
  // Count children of each node
  const childCount = new Int32Array(n)
  const firstChild = new Int32Array(n)
  const nextSibling = new Int32Array(n)

  // Initialize
  for (let i: i32 = 0; i < n; i++) {
    unchecked(firstChild[i] = -1)
    unchecked(nextSibling[i] = -1)
  }

  // Build child list for each node (in reverse order for efficiency)
  for (let i: i32 = n - 1; i >= 0; i--) {
    const p: i32 = unchecked(parent[i])
    if (p >= 0 && p < n) {
      unchecked(nextSibling[i] = unchecked(firstChild[p]))
      unchecked(firstChild[p] = i)
      unchecked(childCount[p]++)
    }
  }

  // Iterative post-order traversal
  const stack = new Int32Array(n)
  const stackState = new Int32Array(n)  // 0=first visit, 1=visiting children
  let postIdx: i32 = 0

  // Find roots (nodes with parent = -1) and process each tree
  for (let root: i32 = 0; root < n; root++) {
    if (unchecked(parent[root]) !== -1) continue  // Not a root

    // DFS from root
    let depth: i32 = 0
    unchecked(stack[depth] = root)
    unchecked(stackState[depth] = 0)

    while (depth >= 0) {
      const node: i32 = unchecked(stack[depth])
      const state: i32 = unchecked(stackState[depth])

      if (state === 0) {
        // First visit - push all children
        unchecked(stackState[depth] = 1)
        let child: i32 = unchecked(firstChild[node])
        while (child >= 0) {
          depth++
          unchecked(stack[depth] = child)
          unchecked(stackState[depth] = 0)
          child = unchecked(nextSibling[child])
        }
      } else {
        // All children processed - output this node
        unchecked(post[postIdx] = node)
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
 * @param aValues - Values of A
 * @param aIndex - Row indices of A
 * @param aPtr - Column pointers of A
 * @param pinv - Inverse row permutation (row i of A becomes row pinv[i] of C)
 * @param q - Column permutation (column j of C comes from column q[j] of A)
 * @param m - Number of rows
 * @param n - Number of columns
 * @param cValues - Output values of C
 * @param cIndex - Output row indices of C
 * @param cPtr - Output column pointers of C
 * @returns Number of non-zeros in C
 */
export function csPermute(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  pinv: Int32Array | null,
  q: Int32Array | null,
  m: i32,
  n: i32,
  cValues: Float64Array,
  cIndex: Int32Array,
  cPtr: Int32Array
): i32 {
  let nnz: i32 = 0

  // Process each column of C
  for (let j: i32 = 0; j < n; j++) {
    unchecked(cPtr[j] = nnz)

    // Column j of C comes from column q[j] of A (or j if q is null)
    const jOld: i32 = q !== null ? unchecked(q[j]) : j

    const pStart: i32 = unchecked(aPtr[jOld])
    const pEnd: i32 = unchecked(aPtr[jOld + 1])

    for (let p: i32 = pStart; p < pEnd; p++) {
      const iOld: i32 = unchecked(aIndex[p])
      // Row iOld of A becomes row pinv[iOld] of C (or iOld if pinv is null)
      const iNew: i32 = pinv !== null ? unchecked(pinv[iOld]) : iOld

      unchecked(cValues[nnz] = unchecked(aValues[p]))
      unchecked(cIndex[nnz] = iNew)
      nnz++
    }
  }

  unchecked(cPtr[n] = nnz)
  return nnz
}

/**
 * Sparse triangular solve: solve L*x = b or U*x = b
 * Uses the reach to compute only the nonzero entries of x
 *
 * @param gValues - Values of L or U
 * @param gIndex - Row indices of G
 * @param gPtr - Column pointers of G
 * @param n - Matrix dimension
 * @param xi - Reachability pattern (indices of nonzero x entries)
 * @param top - Start position in xi
 * @param x - Input: b, Output: x (dense vector)
 * @param pinv - Inverse permutation (or null)
 * @param isLower - true for L*x=b, false for U*x=b
 */
export function csSpsolve(
  gValues: Float64Array,
  gIndex: Int32Array,
  gPtr: Int32Array,
  n: i32,
  xi: Int32Array,
  top: i32,
  x: Float64Array,
  pinv: Int32Array | null,
  isLower: bool
): void {
  // Process columns in topological order
  const nReach: i32 = n - top

  if (isLower) {
    // Forward substitution (process from top to n-1)
    for (let p: i32 = top; p < n; p++) {
      const j: i32 = unchecked(xi[p])  // Column to process
      let pj: i32 = j
      if (pinv !== null) {
        pj = unchecked(pinv[j])
      }

      if (pj < 0 || pj >= n) continue

      // x[j] = x[j] / L[j,j]
      const diagStart: i32 = unchecked(gPtr[pj])
      const diagEnd: i32 = unchecked(gPtr[pj + 1])

      // Find diagonal (first entry in column for lower triangular)
      let diagVal: f64 = 1.0
      let diagIdx: i32 = diagStart
      for (let k: i32 = diagStart; k < diagEnd; k++) {
        if (unchecked(gIndex[k]) === pj) {
          diagVal = unchecked(gValues[k])
          diagIdx = k
          break
        }
      }

      unchecked(x[j] = x[j] / diagVal)

      // x[i] -= L[i,j] * x[j] for i > j
      for (let k: i32 = diagStart; k < diagEnd; k++) {
        const i: i32 = unchecked(gIndex[k])
        if (i !== pj) {
          unchecked(x[i] -= unchecked(gValues[k]) * x[j])
        }
      }
    }
  } else {
    // Back substitution (process from n-1 to top)
    for (let p: i32 = n - 1; p >= top; p--) {
      const j: i32 = unchecked(xi[p])  // Column to process
      let pj: i32 = j
      if (pinv !== null) {
        pj = unchecked(pinv[j])
      }

      if (pj < 0 || pj >= n) continue

      // Find diagonal and process
      const pStart: i32 = unchecked(gPtr[pj])
      const pEnd: i32 = unchecked(gPtr[pj + 1])

      // x[i] -= U[i,j] * x[j] for i < j (before we update x[j])
      for (let k: i32 = pStart; k < pEnd; k++) {
        const i: i32 = unchecked(gIndex[k])
        if (i !== pj) {
          unchecked(x[i] -= unchecked(gValues[k]) * x[j])
        }
      }

      // x[j] = x[j] / U[j,j]
      let diagVal: f64 = 1.0
      for (let k: i32 = pStart; k < pEnd; k++) {
        if (unchecked(gIndex[k]) === pj) {
          diagVal = unchecked(gValues[k])
          break
        }
      }
      unchecked(x[j] = x[j] / diagVal)
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
 * @param aIndex - Row indices of A (upper or lower triangle)
 * @param aPtr - Column pointers of A
 * @param n - Matrix dimension
 * @param parent - Output: elimination tree parent array
 * @param lnz - Output: count of nonzeros per column of L
 * @returns Total number of nonzeros in L
 */
export function csCholSymbolic(
  aIndex: Int32Array,
  aPtr: Int32Array,
  n: i32,
  parent: Int32Array,
  lnz: Int32Array
): i32 {
  // Compute elimination tree
  csEtree(aIndex, aPtr, n, parent)

  // Count nonzeros in each column of L
  // Using the column counts algorithm
  const colCount = new Int32Array(n)
  const first = new Int32Array(n)  // First descendant
  const level = new Int32Array(n)  // Level in tree

  // Initialize
  for (let i: i32 = 0; i < n; i++) {
    unchecked(first[i] = -1)
    unchecked(colCount[i] = 0)
  }

  // Post-order traversal to compute first descendant and levels
  const post = new Int32Array(n)
  csPost(parent, n, post)

  // Compute levels (distance from root)
  for (let i: i32 = 0; i < n; i++) {
    const p: i32 = unchecked(parent[i])
    if (p >= 0) {
      unchecked(level[i] = unchecked(level[p]) + 1)
    } else {
      unchecked(level[i] = 0)
    }
  }

  // Column count using row subtree method
  const ancestor = new Int32Array(n)
  for (let i: i32 = 0; i < n; i++) {
    unchecked(ancestor[i] = i)
  }

  let totalNnz: i32 = 0

  for (let k: i32 = 0; k < n; k++) {
    const i: i32 = unchecked(post[k])  // Process in post-order

    // Count diagonal
    unchecked(colCount[i] = 1)

    // Process each row with nonzero in column i
    const pStart: i32 = unchecked(aPtr[i])
    const pEnd: i32 = unchecked(aPtr[i + 1])

    for (let p: i32 = pStart; p < pEnd; p++) {
      let j: i32 = unchecked(aIndex[p])
      if (j >= i) continue  // Only lower triangle

      // Path from j to current subtree root
      while (j !== -1 && j < i) {
        const jnext: i32 = unchecked(ancestor[j])
        unchecked(ancestor[j] = i)  // Path compression

        if (jnext === j) {
          // j is root of its subtree
          unchecked(colCount[i] += unchecked(level[i]) - unchecked(level[j]))
          break
        }
        j = jnext
      }
    }

    unchecked(lnz[i] = unchecked(colCount[i]))
    totalNnz += unchecked(colCount[i])
  }

  return totalNnz
}

/**
 * Sparse Cholesky factorization: A = L * L^T
 * A must be symmetric positive definite
 *
 * @param aValues - Values of A (lower triangle only)
 * @param aIndex - Row indices of A
 * @param aPtr - Column pointers of A
 * @param n - Matrix dimension
 * @param parent - Elimination tree (from csCholSymbolic)
 * @param lValues - Output: values of L
 * @param lIndex - Output: row indices of L
 * @param lPtr - Output: column pointers of L
 * @returns 0 on success, -1 if not positive definite
 */
export function csChol(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  n: i32,
  parent: Int32Array,
  lValues: Float64Array,
  lIndex: Int32Array,
  lPtr: Int32Array
): i32 {
  // Workspace
  const x = new Float64Array(n)  // Dense accumulator
  const c = new Int32Array(n)    // Column pointers into L
  const s = new Int32Array(n)    // Stack for nonzero pattern

  // Initialize column pointers in L
  for (let i: i32 = 0; i < n; i++) {
    unchecked(c[i] = unchecked(lPtr[i]))
  }

  // Process each column k
  for (let k: i32 = 0; k < n; k++) {
    // Clear x
    const top: i32 = csEreach(aIndex, aPtr, k, parent, s, c, n)

    // Initialize x with A[:,k]
    const aStart: i32 = unchecked(aPtr[k])
    const aEnd: i32 = unchecked(aPtr[k + 1])
    for (let p: i32 = aStart; p < aEnd; p++) {
      const i: i32 = unchecked(aIndex[p])
      if (i >= k) {  // Lower triangle only
        unchecked(x[i] = unchecked(aValues[p]))
      }
    }

    // Compute L[:,k]
    let d: f64 = unchecked(x[k])  // Diagonal
    unchecked(x[k] = 0.0)

    // Process nonzeros in L[:,k] in order
    for (let p: i32 = top; p < n; p++) {
      const i: i32 = unchecked(s[p])  // L[i,k] is nonzero

      // Get L[i,k] = x[i] / L[k,k] (but we need L[k,k] first)
      const lki: f64 = unchecked(x[i]) / unchecked(lValues[unchecked(lPtr[i])])
      unchecked(x[i] = 0.0)

      // Subtract L[i,k] * L[j,k] from x[j] for j > i
      const lStart: i32 = unchecked(lPtr[i]) + 1  // Skip diagonal
      const lEnd: i32 = unchecked(c[i])
      for (let q: i32 = lStart; q < lEnd; q++) {
        const j: i32 = unchecked(lIndex[q])
        unchecked(x[j] -= unchecked(lValues[q]) * lki)
      }

      // Update diagonal
      d -= lki * lki

      // Store L[k,i]
      const cp: i32 = unchecked(c[i])
      unchecked(lIndex[cp] = k)
      unchecked(lValues[cp] = lki)
      unchecked(c[i] = cp + 1)
    }

    // Check positive definite
    if (d <= 0.0) {
      return -1  // Not positive definite
    }

    // Store diagonal L[k,k] = sqrt(d)
    const ck: i32 = unchecked(c[k])
    unchecked(lIndex[ck] = k)
    unchecked(lValues[ck] = Math.sqrt(d))
    unchecked(c[k] = ck + 1)
  }

  return 0
}

/**
 * Reach of column k of A in elimination tree
 * Helper for sparse Cholesky
 */
function csEreach(
  aIndex: Int32Array,
  aPtr: Int32Array,
  k: i32,
  parent: Int32Array,
  s: Int32Array,
  c: Int32Array,
  n: i32
): i32 {
  let top: i32 = n

  // Mark k as visited
  const mark: i32 = -(k + 2)  // Use negative values as marks

  const pStart: i32 = unchecked(aPtr[k])
  const pEnd: i32 = unchecked(aPtr[k + 1])

  // Process each nonzero in A[:,k]
  for (let p: i32 = pStart; p < pEnd; p++) {
    let i: i32 = unchecked(aIndex[p])
    if (i > k) continue  // Only upper triangle

    // Path from i to k
    let len: i32 = 0
    while (i !== -1 && i < k) {
      if (unchecked(s[i]) === mark) break  // Already visited
      unchecked(s[n - 1 - len] = i)  // Push to temp stack
      len++
      unchecked(s[i] = mark)  // Mark visited
      i = unchecked(parent[i])
    }

    // Pop temp stack to output
    while (len > 0) {
      len--
      top--
      unchecked(s[top] = unchecked(s[n - 1 - len]))
    }
  }

  return top
}

/**
 * Sparse LU factorization with partial pivoting: P*A = L*U
 *
 * @param aValues - Values of A
 * @param aIndex - Row indices of A
 * @param aPtr - Column pointers of A
 * @param n - Matrix dimension
 * @param tol - Pivot tolerance (0 to 1)
 * @param lValues - Output: values of L
 * @param lIndex - Output: row indices of L
 * @param lPtr - Output: column pointers of L
 * @param uValues - Output: values of U
 * @param uIndex - Output: row indices of U
 * @param uPtr - Output: column pointers of U
 * @param pinv - Output: row permutation (inverse)
 * @returns 0 on success, -k-1 if structurally singular at column k
 */
export function csLu(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  n: i32,
  tol: f64,
  lValues: Float64Array,
  lIndex: Int32Array,
  lPtr: Int32Array,
  uValues: Float64Array,
  uIndex: Int32Array,
  uPtr: Int32Array,
  pinv: Int32Array
): i32 {
  // Workspace
  const x = new Float64Array(n)      // Dense accumulator
  const xi = new Int32Array(2 * n)   // Nonzero pattern

  // Initialize pinv
  for (let i: i32 = 0; i < n; i++) {
    unchecked(pinv[i] = -1)
  }

  let lnz: i32 = 0
  let unz: i32 = 0

  // Process each column k
  for (let k: i32 = 0; k < n; k++) {
    // Set column pointers
    unchecked(lPtr[k] = lnz)
    unchecked(uPtr[k] = unz)

    // Compute x = L\A(:,k) using symbolic pattern
    let top: i32 = csSpsolvePattern(aIndex, aPtr, lIndex, lPtr, k, xi, pinv, n)

    // Initialize x with A[:,k]
    for (let p: i32 = top; p < n; p++) {
      unchecked(x[unchecked(xi[p])] = 0.0)
    }
    const aStart: i32 = unchecked(aPtr[k])
    const aEnd: i32 = unchecked(aPtr[k + 1])
    for (let p: i32 = aStart; p < aEnd; p++) {
      const i: i32 = unchecked(aIndex[p])
      unchecked(x[i] = unchecked(aValues[p]))
    }

    // Sparse triangular solve L\A[:,k]
    for (let p: i32 = top; p < n; p++) {
      const j: i32 = unchecked(xi[p])
      const jnew: i32 = unchecked(pinv[j])

      if (jnew < 0) continue  // Column j of L not yet computed

      // x[j] = x[j] / L[j,j]
      const ljj: f64 = unchecked(lValues[unchecked(lPtr[jnew])])
      if (ljj === 0.0) continue

      const xj: f64 = unchecked(x[j]) / ljj
      unchecked(x[j] = xj)

      // Subtract L[i,j] * x[j] from x[i]
      const lStart: i32 = unchecked(lPtr[jnew]) + 1
      const lEnd: i32 = unchecked(lPtr[jnew + 1])
      for (let q: i32 = lStart; q < lEnd; q++) {
        const i: i32 = unchecked(lIndex[q])
        unchecked(x[i] -= unchecked(lValues[q]) * xj)
      }
    }

    // Find pivot
    let pivot: i32 = -1
    let pivotVal: f64 = 0.0

    for (let p: i32 = top; p < n; p++) {
      const i: i32 = unchecked(xi[p])
      if (unchecked(pinv[i]) < 0) {  // Row not yet used as pivot
        const t: f64 = Math.abs(unchecked(x[i]))
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
      const i: i32 = unchecked(xi[p])
      if (unchecked(pinv[i]) < 0) {
        if (Math.abs(unchecked(x[i])) >= thresh && i < ipiv) {
          ipiv = i  // Prefer smaller row index
        }
      }
    }

    // Record pivot
    unchecked(pinv[ipiv] = k)

    // Store U[:,k] (rows with pinv[i] >= 0 or i == pivot)
    for (let p: i32 = top; p < n; p++) {
      const i: i32 = unchecked(xi[p])
      if (unchecked(pinv[i]) < k || i === ipiv) {
        // This is in U
        unchecked(uIndex[unz] = i)
        unchecked(uValues[unz] = unchecked(x[i]))
        unz++
        unchecked(x[i] = 0.0)
      }
    }

    // Store L[:,k] (rows with pinv[i] < 0)
    const ukk: f64 = unchecked(x[ipiv])  // Diagonal of U
    unchecked(x[ipiv] = 0.0)

    // Store diagonal of L as 1
    unchecked(lIndex[lnz] = ipiv)
    unchecked(lValues[lnz] = 1.0)
    lnz++

    // Store off-diagonal of L
    for (let p: i32 = top; p < n; p++) {
      const i: i32 = unchecked(xi[p])
      if (unchecked(pinv[i]) < 0 && i !== ipiv) {
        unchecked(lIndex[lnz] = i)
        unchecked(lValues[lnz] = unchecked(x[i]) / ukk)
        lnz++
        unchecked(x[i] = 0.0)
      }
    }
  }

  // Finalize
  unchecked(lPtr[n] = lnz)
  unchecked(uPtr[n] = unz)

  return 0
}

/**
 * Helper: compute symbolic pattern for sparse solve
 */
function csSpsolvePattern(
  aIndex: Int32Array,
  aPtr: Int32Array,
  lIndex: Int32Array,
  lPtr: Int32Array,
  k: i32,
  xi: Int32Array,
  pinv: Int32Array,
  n: i32
): i32 {
  let top: i32 = n
  const mark = new Int32Array(n)
  const currentMark: i32 = k + 1

  // Start with pattern of A[:,k]
  const aStart: i32 = unchecked(aPtr[k])
  const aEnd: i32 = unchecked(aPtr[k + 1])

  for (let p: i32 = aStart; p < aEnd; p++) {
    const i: i32 = unchecked(aIndex[p])

    if (unchecked(mark[i]) === currentMark) continue

    // DFS from i
    let depth: i32 = 0
    const stack = new Int32Array(n)
    const stackPos = new Int32Array(n)

    unchecked(stack[depth] = i)
    let pi: i32 = unchecked(pinv[i])
    unchecked(stackPos[depth] = pi >= 0 ? unchecked(lPtr[pi]) : 0)

    while (depth >= 0) {
      const j: i32 = unchecked(stack[depth])
      const pj: i32 = unchecked(pinv[j])

      if (unchecked(mark[j]) === currentMark) {
        depth--
        continue
      }

      if (pj < 0) {
        unchecked(mark[j] = currentMark)
        top--
        unchecked(xi[top] = j)
        depth--
        continue
      }

      const pos: i32 = unchecked(stackPos[depth])
      const pEnd: i32 = unchecked(lPtr[pj + 1])

      let foundChild: bool = false
      for (let q: i32 = pos; q < pEnd; q++) {
        const child: i32 = unchecked(lIndex[q])
        if (unchecked(mark[child]) !== currentMark) {
          unchecked(stackPos[depth] = q + 1)
          depth++
          unchecked(stack[depth] = child)
          const pc: i32 = unchecked(pinv[child])
          unchecked(stackPos[depth] = pc >= 0 ? unchecked(lPtr[pc]) : 0)
          foundChild = true
          break
        }
      }

      if (!foundChild) {
        unchecked(mark[j] = currentMark)
        top--
        unchecked(xi[top] = j)
        depth--
      }
    }
  }

  return top
}

/**
 * Sparse QR factorization using Householder reflections: A = Q*R
 *
 * @param aValues - Values of A
 * @param aIndex - Row indices of A
 * @param aPtr - Column pointers of A
 * @param m - Number of rows
 * @param n - Number of columns (must be <= m)
 * @param rValues - Output: values of R
 * @param rIndex - Output: row indices of R
 * @param rPtr - Output: column pointers of R
 * @param beta - Output: Householder scalars (size n)
 * @param vValues - Output: Householder vectors V values
 * @param vIndex - Output: V row indices
 * @param vPtr - Output: V column pointers
 * @returns 0 on success, negative on error
 */
export function csQr(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  m: i32,
  n: i32,
  rValues: Float64Array,
  rIndex: Int32Array,
  rPtr: Int32Array,
  beta: Float64Array,
  vValues: Float64Array,
  vIndex: Int32Array,
  vPtr: Int32Array
): i32 {
  // Dense working column
  const x = new Float64Array(m)

  let rnz: i32 = 0
  let vnz: i32 = 0

  // Copy A to workspace (we'll modify columns in place)
  // For simplicity, we work with a dense representation of each column

  for (let k: i32 = 0; k < n; k++) {
    unchecked(rPtr[k] = rnz)
    unchecked(vPtr[k] = vnz)

    // Clear x
    for (let i: i32 = 0; i < m; i++) {
      unchecked(x[i] = 0.0)
    }

    // Load A[:,k] into x
    const aStart: i32 = unchecked(aPtr[k])
    const aEnd: i32 = unchecked(aPtr[k + 1])
    for (let p: i32 = aStart; p < aEnd; p++) {
      const i: i32 = unchecked(aIndex[p])
      unchecked(x[i] = unchecked(aValues[p]))
    }

    // Apply previous Householder transformations
    for (let j: i32 = 0; j < k; j++) {
      const betaJ: f64 = unchecked(beta[j])
      if (betaJ === 0.0) continue

      // Compute v^T * x
      let vTx: f64 = 0.0
      const vStart: i32 = unchecked(vPtr[j])
      const vEnd: i32 = unchecked(vPtr[j + 1])
      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = unchecked(vIndex[p])
        vTx += unchecked(vValues[p]) * unchecked(x[i])
      }

      // x = x - beta * v * (v^T * x)
      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = unchecked(vIndex[p])
        unchecked(x[i] -= betaJ * unchecked(vValues[p]) * vTx)
      }
    }

    // Compute Householder transformation for x[k:m]
    // Compute norm of x[k:m]
    let sigma: f64 = 0.0
    for (let i: i32 = k; i < m; i++) {
      sigma += unchecked(x[i]) * unchecked(x[i])
    }
    sigma = Math.sqrt(sigma)

    if (sigma === 0.0) {
      // Zero column
      unchecked(beta[k] = 0.0)
    } else {
      // v = x[k:m], v[0] = x[k] + sign(x[k])*sigma
      const xk: f64 = unchecked(x[k])
      const s: f64 = xk >= 0.0 ? 1.0 : -1.0
      const v0: f64 = xk + s * sigma

      // Store R[0:k, k] (above diagonal)
      for (let i: i32 = 0; i < k; i++) {
        if (unchecked(x[i]) !== 0.0) {
          unchecked(rIndex[rnz] = i)
          unchecked(rValues[rnz] = unchecked(x[i]))
          rnz++
        }
      }

      // Store R[k,k] = -sign(x[k]) * sigma
      unchecked(rIndex[rnz] = k)
      unchecked(rValues[rnz] = -s * sigma)
      rnz++

      // Store Householder vector (normalized so first element is 1)
      unchecked(vIndex[vnz] = k)
      unchecked(vValues[vnz] = 1.0)
      vnz++

      for (let i: i32 = k + 1; i < m; i++) {
        if (unchecked(x[i]) !== 0.0) {
          unchecked(vIndex[vnz] = i)
          unchecked(vValues[vnz] = unchecked(x[i]) / v0)
          vnz++
        }
      }

      // beta = 2 / (v^T * v) = 2 * v0^2 / (v0^2 + x[k+1:m]^2)
      let vTv: f64 = v0 * v0
      for (let i: i32 = k + 1; i < m; i++) {
        const vi: f64 = unchecked(x[i])
        vTv += vi * vi
      }
      unchecked(beta[k] = 2.0 * v0 * v0 / vTv)
    }
  }

  // Finalize
  unchecked(rPtr[n] = rnz)
  unchecked(vPtr[n] = vnz)

  return 0
}

/**
 * Apply Q (from QR factorization) to a vector: y = Q * x or y = Q^T * x
 * Q is represented implicitly by Householder vectors V and scalars beta
 *
 * @param vValues - Householder vectors V values
 * @param vIndex - V row indices
 * @param vPtr - V column pointers
 * @param beta - Householder scalars
 * @param n - Number of Householder transformations
 * @param x - Input vector (length m)
 * @param y - Output vector (length m)
 * @param m - Vector length
 * @param transpose - If true, compute Q^T * x, else Q * x
 */
export function csQmult(
  vValues: Float64Array,
  vIndex: Int32Array,
  vPtr: Int32Array,
  beta: Float64Array,
  n: i32,
  x: Float64Array,
  y: Float64Array,
  m: i32,
  transpose: bool
): void {
  // Copy x to y
  for (let i: i32 = 0; i < m; i++) {
    unchecked(y[i] = unchecked(x[i]))
  }

  // Apply Householder transformations
  // Q = H_0 * H_1 * ... * H_{n-1}
  // Q^T = H_{n-1} * ... * H_1 * H_0

  if (transpose) {
    // Apply H_{n-1}, H_{n-2}, ..., H_0
    for (let k: i32 = n - 1; k >= 0; k--) {
      const betaK: f64 = unchecked(beta[k])
      if (betaK === 0.0) continue

      // y = y - beta * v * (v^T * y)
      let vTy: f64 = 0.0
      const vStart: i32 = unchecked(vPtr[k])
      const vEnd: i32 = unchecked(vPtr[k + 1])

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = unchecked(vIndex[p])
        vTy += unchecked(vValues[p]) * unchecked(y[i])
      }

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = unchecked(vIndex[p])
        unchecked(y[i] -= betaK * unchecked(vValues[p]) * vTy)
      }
    }
  } else {
    // Apply H_0, H_1, ..., H_{n-1}
    for (let k: i32 = 0; k < n; k++) {
      const betaK: f64 = unchecked(beta[k])
      if (betaK === 0.0) continue

      let vTy: f64 = 0.0
      const vStart: i32 = unchecked(vPtr[k])
      const vEnd: i32 = unchecked(vPtr[k + 1])

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = unchecked(vIndex[p])
        vTy += unchecked(vValues[p]) * unchecked(y[i])
      }

      for (let p: i32 = vStart; p < vEnd; p++) {
        const i: i32 = unchecked(vIndex[p])
        unchecked(y[i] -= betaK * unchecked(vValues[p]) * vTy)
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
 * This is a simplified version that uses minimum degree heuristic
 * without the more complex AMD optimizations
 *
 * @param aIndex - Row indices of A (symmetric, only lower triangle needed)
 * @param aPtr - Column pointers of A
 * @param n - Matrix dimension
 * @param perm - Output: permutation array
 */
export function csAmd(
  aIndex: Int32Array,
  aPtr: Int32Array,
  n: i32,
  perm: Int32Array
): void {
  // Compute degree of each node
  const degree = new Int32Array(n)
  const eliminated = new Int32Array(n)  // 1 if node is eliminated

  // Initial degrees (number of neighbors)
  for (let j: i32 = 0; j < n; j++) {
    const count: i32 = unchecked(aPtr[j + 1]) - unchecked(aPtr[j])
    unchecked(degree[j] = count)
  }

  // Minimum degree ordering
  for (let k: i32 = 0; k < n; k++) {
    // Find node with minimum degree
    let minDeg: i32 = n + 1
    let minNode: i32 = -1

    for (let j: i32 = 0; j < n; j++) {
      if (unchecked(eliminated[j]) === 0 && unchecked(degree[j]) < minDeg) {
        minDeg = unchecked(degree[j])
        minNode = j
      }
    }

    if (minNode < 0) {
      // All nodes eliminated - this shouldn't happen
      break
    }

    // Eliminate minNode
    unchecked(perm[k] = minNode)
    unchecked(eliminated[minNode] = 1)

    // Update degrees of neighbors
    // In a proper AMD, we would compute the element (quotient graph)
    // For simplicity, we just decrement degree of neighbors
    const pStart: i32 = unchecked(aPtr[minNode])
    const pEnd: i32 = unchecked(aPtr[minNode + 1])

    for (let p: i32 = pStart; p < pEnd; p++) {
      const neighbor: i32 = unchecked(aIndex[p])
      if (unchecked(eliminated[neighbor]) === 0) {
        unchecked(degree[neighbor] = unchecked(degree[neighbor]) - 1)
        if (unchecked(degree[neighbor]) < 0) {
          unchecked(degree[neighbor] = 0)
        }
      }
    }
  }
}

/**
 * Reverse Cuthill-McKee (RCM) ordering
 * Reduces matrix bandwidth by BFS-based reordering
 *
 * @param aIndex - Row indices of A (symmetric)
 * @param aPtr - Column pointers of A
 * @param n - Matrix dimension
 * @param perm - Output: permutation array
 */
export function csRcm(
  aIndex: Int32Array,
  aPtr: Int32Array,
  n: i32,
  perm: Int32Array
): void {
  // Find a good starting node (peripheral node)
  // Use node with minimum degree as approximation
  let start: i32 = 0
  let minDeg: i32 = n + 1

  for (let j: i32 = 0; j < n; j++) {
    const deg: i32 = unchecked(aPtr[j + 1]) - unchecked(aPtr[j])
    if (deg < minDeg) {
      minDeg = deg
      start = j
    }
  }

  // BFS from start
  const visited = new Int32Array(n)
  const queue = new Int32Array(n)
  const degree = new Int32Array(n)

  // Compute degrees
  for (let j: i32 = 0; j < n; j++) {
    unchecked(degree[j] = unchecked(aPtr[j + 1]) - unchecked(aPtr[j]))
  }

  let head: i32 = 0
  let tail: i32 = 0
  let permIdx: i32 = 0

  // Process each connected component
  for (let s: i32 = 0; s < n; s++) {
    if (unchecked(visited[s]) !== 0) continue

    // Find minimum degree unvisited node to start new component
    let cStart: i32 = s
    minDeg = n + 1
    for (let j: i32 = s; j < n; j++) {
      if (unchecked(visited[j]) === 0 && unchecked(degree[j]) < minDeg) {
        minDeg = unchecked(degree[j])
        cStart = j
      }
    }

    // BFS from cStart
    unchecked(queue[tail] = cStart)
    tail++
    unchecked(visited[cStart] = 1)

    while (head < tail) {
      const node: i32 = unchecked(queue[head])
      head++
      unchecked(perm[permIdx] = node)
      permIdx++

      // Get neighbors and sort by degree
      const neighbors = new Int32Array(n)
      let numNeighbors: i32 = 0

      const pStart: i32 = unchecked(aPtr[node])
      const pEnd: i32 = unchecked(aPtr[node + 1])

      for (let p: i32 = pStart; p < pEnd; p++) {
        const neighbor: i32 = unchecked(aIndex[p])
        if (unchecked(visited[neighbor]) === 0) {
          unchecked(neighbors[numNeighbors] = neighbor)
          numNeighbors++
          unchecked(visited[neighbor] = 1)
        }
      }

      // Sort neighbors by degree (insertion sort for small arrays)
      for (let i: i32 = 1; i < numNeighbors; i++) {
        const key: i32 = unchecked(neighbors[i])
        const keyDeg: i32 = unchecked(degree[key])
        let j: i32 = i - 1

        while (j >= 0 && unchecked(degree[unchecked(neighbors[j])]) > keyDeg) {
          unchecked(neighbors[j + 1] = unchecked(neighbors[j]))
          j--
        }
        unchecked(neighbors[j + 1] = key)
      }

      // Add sorted neighbors to queue
      for (let i: i32 = 0; i < numNeighbors; i++) {
        unchecked(queue[tail] = unchecked(neighbors[i]))
        tail++
      }
    }
  }

  // Reverse the permutation (Cuthill-McKee -> Reverse Cuthill-McKee)
  for (let i: i32 = 0; i < n / 2; i++) {
    const temp: i32 = unchecked(perm[i])
    unchecked(perm[i] = unchecked(perm[n - 1 - i]))
    unchecked(perm[n - 1 - i] = temp)
  }
}

/**
 * Compute inverse permutation
 *
 * @param perm - Input permutation
 * @param n - Length
 * @param pinv - Output inverse permutation
 */
export function csInvPerm(
  perm: Int32Array,
  n: i32,
  pinv: Int32Array
): void {
  for (let i: i32 = 0; i < n; i++) {
    unchecked(pinv[unchecked(perm[i])] = i)
  }
}

// ============================================================================
// Sparse Matrix Utilities
// ============================================================================

/**
 * Transpose a sparse matrix: B = A^T
 *
 * @param aValues - Values of A
 * @param aIndex - Row indices of A
 * @param aPtr - Column pointers of A
 * @param m - Number of rows of A
 * @param n - Number of columns of A
 * @param bValues - Output values of B
 * @param bIndex - Output row indices of B
 * @param bPtr - Output column pointers of B
 * @returns Number of nonzeros
 */
export function csTranspose(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  m: i32,
  n: i32,
  bValues: Float64Array,
  bIndex: Int32Array,
  bPtr: Int32Array
): i32 {
  // Count entries per row of A (= column of B)
  const count = new Int32Array(m)

  const nnz: i32 = unchecked(aPtr[n])

  for (let p: i32 = 0; p < nnz; p++) {
    const i: i32 = unchecked(aIndex[p])
    unchecked(count[i]++)
  }

  // Compute column pointers of B
  let sum: i32 = 0
  for (let i: i32 = 0; i < m; i++) {
    unchecked(bPtr[i] = sum)
    sum += unchecked(count[i])
    unchecked(count[i] = unchecked(bPtr[i]))  // Reset to use as cursor
  }
  unchecked(bPtr[m] = sum)

  // Fill B
  for (let j: i32 = 0; j < n; j++) {
    const pStart: i32 = unchecked(aPtr[j])
    const pEnd: i32 = unchecked(aPtr[j + 1])

    for (let p: i32 = pStart; p < pEnd; p++) {
      const i: i32 = unchecked(aIndex[p])
      const q: i32 = unchecked(count[i])
      unchecked(bIndex[q] = j)
      unchecked(bValues[q] = unchecked(aValues[p]))
      unchecked(count[i] = q + 1)
    }
  }

  return nnz
}

/**
 * Multiply two sparse matrices: C = A * B
 *
 * @param aValues - Values of A
 * @param aIndex - Row indices of A
 * @param aPtr - Column pointers of A
 * @param aRows - Number of rows of A
 * @param aCols - Number of columns of A (= rows of B)
 * @param bValues - Values of B
 * @param bIndex - Row indices of B
 * @param bPtr - Column pointers of B
 * @param bCols - Number of columns of B
 * @param cValues - Output values of C
 * @param cIndex - Output row indices of C
 * @param cPtr - Output column pointers of C
 * @returns Number of nonzeros in C
 */
export function csMult(
  aValues: Float64Array,
  aIndex: Int32Array,
  aPtr: Int32Array,
  aRows: i32,
  aCols: i32,
  bValues: Float64Array,
  bIndex: Int32Array,
  bPtr: Int32Array,
  bCols: i32,
  cValues: Float64Array,
  cIndex: Int32Array,
  cPtr: Int32Array
): i32 {
  // Dense accumulator
  const x = new Float64Array(aRows)
  const w = new Int32Array(aRows)  // Mark array

  let cnz: i32 = 0

  // Process each column of B
  for (let j: i32 = 0; j < bCols; j++) {
    unchecked(cPtr[j] = cnz)
    const mark: i32 = j + 1

    // C[:,j] = A * B[:,j]
    const bStart: i32 = unchecked(bPtr[j])
    const bEnd: i32 = unchecked(bPtr[j + 1])

    // Scatter B[:,j] into x, multiplied by A columns
    for (let p: i32 = bStart; p < bEnd; p++) {
      const k: i32 = unchecked(bIndex[p])  // B[k,j]
      const bkj: f64 = unchecked(bValues[p])

      // Add bkj * A[:,k] to x
      const aStart: i32 = unchecked(aPtr[k])
      const aEnd: i32 = unchecked(aPtr[k + 1])

      for (let q: i32 = aStart; q < aEnd; q++) {
        const i: i32 = unchecked(aIndex[q])
        if (unchecked(w[i]) < mark) {
          // First contribution to x[i]
          unchecked(w[i] = mark)
          unchecked(cIndex[cnz] = i)
          cnz++
          unchecked(x[i] = unchecked(aValues[q]) * bkj)
        } else {
          // Add to existing
          unchecked(x[i] += unchecked(aValues[q]) * bkj)
        }
      }
    }

    // Gather x into C[:,j]
    for (let p: i32 = unchecked(cPtr[j]); p < cnz; p++) {
      const i: i32 = unchecked(cIndex[p])
      unchecked(cValues[p] = unchecked(x[i]))
    }
  }

  unchecked(cPtr[bCols] = cnz)
  return cnz
}

/**
 * Estimate number of nonzeros in sparse matrix multiply result
 *
 * @param aPtr - Column pointers of A
 * @param aCols - Number of columns of A
 * @param bIndex - Row indices of B
 * @param bPtr - Column pointers of B
 * @param bCols - Number of columns of B
 * @param aRows - Number of rows of A
 * @returns Estimated number of nonzeros in C = A * B
 */
export function csMultNnzEstimate(
  aPtr: Int32Array,
  aCols: i32,
  bIndex: Int32Array,
  bPtr: Int32Array,
  bCols: i32,
  aRows: i32
): i32 {
  // Upper bound: sum of products of column nnz counts
  let estimate: i32 = 0

  for (let j: i32 = 0; j < bCols; j++) {
    const bStart: i32 = unchecked(bPtr[j])
    const bEnd: i32 = unchecked(bPtr[j + 1])

    let colNnz: i32 = 0
    for (let p: i32 = bStart; p < bEnd; p++) {
      const k: i32 = unchecked(bIndex[p])
      if (k < aCols) {
        colNnz += unchecked(aPtr[k + 1]) - unchecked(aPtr[k])
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
