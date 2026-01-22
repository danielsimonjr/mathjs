/**
 * WASM-optimized sparse matrix factorizations
 *
 * Implements sparse LU, Cholesky, and QR factorizations using
 * CSC (Compressed Sparse Column) format.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 *
 * CSC Format:
 * - values: Pointer to f64 array of non-zero values
 * - index: Pointer to i32 array of row indices for each value
 * - ptr: Pointer to i32 array of column pointers (size n+1)
 */

import {
  csFlip,
  csUnflip,
  csMarked,
  csMark,
  csCumsum,
  csEtree,
  csDfs
} from './utilities'

// ============================================
// SPARSE MATRIX-VECTOR OPERATIONS
// ============================================

/**
 * Sparse matrix-vector multiply: y = A * x
 * @param valuesPtr Non-zero values pointer (f64)
 * @param indexPtr Row indices pointer (i32)
 * @param ptrPtr Column pointers pointer (i32)
 * @param m Number of rows
 * @param n Number of columns
 * @param xPtr Input vector pointer (f64, length n)
 * @param yPtr Output vector pointer (f64, length m)
 */
export function sparseMatVec(
  valuesPtr: usize,
  indexPtr: usize,
  ptrPtr: usize,
  m: i32,
  n: i32,
  xPtr: usize,
  yPtr: usize
): void {
  // Initialize y to zero
  for (let i: i32 = 0; i < m; i++) {
    store<f64>(yPtr + (<usize>i << 3), 0.0)
  }

  // Multiply column by column
  for (let j: i32 = 0; j < n; j++) {
    const xj: f64 = load<f64>(xPtr + (<usize>j << 3))
    if (xj !== 0.0) {
      const ptrJ = load<i32>(ptrPtr + (<usize>j << 2))
      const ptrJ1 = load<i32>(ptrPtr + (<usize>(j + 1) << 2))
      for (let p: i32 = ptrJ; p < ptrJ1; p++) {
        const i = load<i32>(indexPtr + (<usize>p << 2))
        const val = load<f64>(valuesPtr + (<usize>p << 3))
        const yi = load<f64>(yPtr + (<usize>i << 3))
        store<f64>(yPtr + (<usize>i << 3), yi + val * xj)
      }
    }
  }
}

/**
 * Sparse matrix transpose: C = A^T
 * @param valuesPtr Input values pointer (f64)
 * @param indexPtr Input row indices pointer (i32)
 * @param ptrPtr Input column pointers pointer (i32)
 * @param m Number of rows
 * @param n Number of columns
 * @param nnz Number of non-zeros
 * @param cValuesPtr Output values pointer (f64, size nnz)
 * @param cIndexPtr Output column indices pointer (i32, size nnz)
 * @param cPtrPtr Output row pointers pointer (i32, size m+1)
 * @param workPtr Working memory (i32, size 2*m for rowCount and work)
 */
export function sparseTranspose(
  valuesPtr: usize,
  indexPtr: usize,
  ptrPtr: usize,
  m: i32,
  n: i32,
  nnz: i32,
  cValuesPtr: usize,
  cIndexPtr: usize,
  cPtrPtr: usize,
  workPtr: usize
): void {
  // workPtr layout: rowCount (m i32s), work (m i32s)
  const rowCountPtr: usize = workPtr
  const tempWorkPtr: usize = workPtr + (<usize>m << 2)

  // Initialize row counts to 0
  for (let i: i32 = 0; i < m; i++) {
    store<i32>(rowCountPtr + (<usize>i << 2), 0)
  }

  // Count entries in each row of A (will become columns of A^T)
  for (let p: i32 = 0; p < nnz; p++) {
    const row = load<i32>(indexPtr + (<usize>p << 2))
    const count = load<i32>(rowCountPtr + (<usize>row << 2))
    store<i32>(rowCountPtr + (<usize>row << 2), count + 1)
  }

  // Compute column pointers for A^T
  csCumsum(cPtrPtr, rowCountPtr, m)

  // Initialize work array with column positions
  for (let i: i32 = 0; i < m; i++) {
    store<i32>(tempWorkPtr + (<usize>i << 2), load<i32>(cPtrPtr + (<usize>i << 2)))
  }

  // Fill in the transpose
  for (let j: i32 = 0; j < n; j++) {
    const ptrJ = load<i32>(ptrPtr + (<usize>j << 2))
    const ptrJ1 = load<i32>(ptrPtr + (<usize>(j + 1) << 2))
    for (let p: i32 = ptrJ; p < ptrJ1; p++) {
      const i: i32 = load<i32>(indexPtr + (<usize>p << 2))
      const q: i32 = load<i32>(tempWorkPtr + (<usize>i << 2))
      store<i32>(tempWorkPtr + (<usize>i << 2), q + 1)
      store<i32>(cIndexPtr + (<usize>q << 2), j)
      store<f64>(cValuesPtr + (<usize>q << 3), load<f64>(valuesPtr + (<usize>p << 3)))
    }
  }
}

// ============================================
// SPARSE CHOLESKY FACTORIZATION
// ============================================

/**
 * Symbolic Cholesky analysis
 * Computes elimination tree and column counts for Cholesky factorization
 * @param indexPtr Row indices pointer (i32)
 * @param ptrPtr Column pointers pointer (i32)
 * @param n Matrix size
 * @param parentPtr Output parent array pointer (i32, size n)
 * @param postPtr Output postorder array pointer (i32, size n)
 * @param colCountPtr Output column count array pointer (i32, size n)
 * @param workPtr Working memory (i32, size 7*n)
 */
export function symbolicCholesky(
  indexPtr: usize,
  ptrPtr: usize,
  n: i32,
  parentPtr: usize,
  postPtr: usize,
  colCountPtr: usize,
  workPtr: usize
): void {
  // workPtr layout: ancestor (n), stack (n), first (n), maxfirst (n), prevleaf (n), delta (n), etreeWork (n)
  const ancestorPtr: usize = workPtr
  const stackPtr: usize = workPtr + (<usize>n << 2)
  const firstPtr: usize = workPtr + (<usize>(2 * n) << 2)
  const maxfirstPtr: usize = workPtr + (<usize>(3 * n) << 2)
  const prevleafPtr: usize = workPtr + (<usize>(4 * n) << 2)
  const deltaPtr: usize = workPtr + (<usize>(5 * n) << 2)
  const etreeWorkPtr: usize = workPtr + (<usize>(6 * n) << 2)

  // Compute elimination tree
  csEtree(indexPtr, ptrPtr, n, n, parentPtr, etreeWorkPtr)

  // Post-order the elimination tree
  let top: i32 = 0

  // Initialize first to -1
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(firstPtr + (<usize>i << 2), -1)
  }

  // Link children using first child/next sibling
  for (let i: i32 = n - 1; i >= 0; i--) {
    const p: i32 = load<i32>(parentPtr + (<usize>i << 2))
    if (p !== -1) {
      store<i32>(stackPtr + (<usize>i << 2), load<i32>(firstPtr + (<usize>p << 2)))
      store<i32>(firstPtr + (<usize>p << 2), i)
    }
  }

  // DFS postorder
  let k: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    const parentI = load<i32>(parentPtr + (<usize>i << 2))
    if (parentI === -1) {
      // Root node
      let j: i32 = i
      while (j !== -1) {
        const firstJ = load<i32>(firstPtr + (<usize>j << 2))
        if (firstJ !== -1) {
          // Push first child
          store<i32>(stackPtr + (<usize>top << 2), j)
          top++
          const nextSibling = load<i32>(stackPtr + (<usize>firstJ << 2))
          store<i32>(firstPtr + (<usize>j << 2), nextSibling)
          j = firstJ
        } else {
          // No more children, record postorder
          store<i32>(postPtr + (<usize>k << 2), j)
          k++
          j = top > 0 ? load<i32>(stackPtr + (<usize>(--top) << 2)) : -1
        }
      }
    }
  }

  // Compute column counts using postorder
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 2
    store<i32>(ancestorPtr + offset, i)
    store<i32>(maxfirstPtr + offset, -1)
    store<i32>(prevleafPtr + offset, -1)
    store<i32>(deltaPtr + offset, 0)
  }

  for (let k2: i32 = 0; k2 < n; k2++) {
    const j: i32 = load<i32>(postPtr + (<usize>k2 << 2))

    const parentJ = load<i32>(parentPtr + (<usize>j << 2))
    if (parentJ !== -1) {
      store<i32>(deltaPtr + (<usize>j << 2), 1)
    }

    const ptrJ = load<i32>(ptrPtr + (<usize>j << 2))
    const ptrJ1 = load<i32>(ptrPtr + (<usize>(j + 1) << 2))

    for (let p: i32 = ptrJ; p < ptrJ1; p++) {
      let i: i32 = load<i32>(indexPtr + (<usize>p << 2))

      // Find root of i
      while (load<i32>(ancestorPtr + (<usize>i << 2)) !== i) {
        const next: i32 = load<i32>(ancestorPtr + (<usize>i << 2))
        store<i32>(ancestorPtr + (<usize>i << 2), j)
        i = next
      }
      store<i32>(ancestorPtr + (<usize>i << 2), j)

      if (i < j) {
        const deltaJ = load<i32>(deltaPtr + (<usize>j << 2))
        store<i32>(deltaPtr + (<usize>j << 2), deltaJ + 1)
        const maxfirstI = load<i32>(maxfirstPtr + (<usize>i << 2))
        if (maxfirstI < k2) {
          store<i32>(maxfirstPtr + (<usize>i << 2), k2)
        }
      }
    }

    if (parentJ !== -1) {
      const deltaParent = load<i32>(deltaPtr + (<usize>parentJ << 2))
      const deltaJ = load<i32>(deltaPtr + (<usize>j << 2))
      store<i32>(deltaPtr + (<usize>parentJ << 2), deltaParent + deltaJ - 1)
    }
  }

  // Column counts
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(colCountPtr + (<usize>i << 2), load<i32>(deltaPtr + (<usize>i << 2)))
  }
}

/**
 * Numeric Cholesky factorization: A = L * L^T
 * Only works for symmetric positive definite matrices
 *
 * @param valuesPtr Non-zero values of A pointer (f64, lower triangle only)
 * @param indexPtr Row indices pointer (i32)
 * @param ptrPtr Column pointers pointer (i32)
 * @param n Size of matrix
 * @param lValuesPtr Output L values pointer (f64, size maxNnz)
 * @param lIndexPtr Output L row indices pointer (i32, size maxNnz)
 * @param lPtrPtr Output L column pointers pointer (i32, size n+1)
 * @param workPtr Working memory (f64: n, i32: 2*n)
 * @returns Number of non-zeros in L, or -1 if not SPD
 */
export function sparseCholesky(
  valuesPtr: usize,
  indexPtr: usize,
  ptrPtr: usize,
  n: i32,
  lValuesPtr: usize,
  lIndexPtr: usize,
  lPtrPtr: usize,
  workPtr: usize
): i32 {
  // workPtr layout: x (n f64s = 8*n bytes), c (n i32s), parent (n i32s)
  const xPtr: usize = workPtr
  const cPtr: usize = workPtr + (<usize>n << 3)
  const parentPtr: usize = cPtr + (<usize>n << 2)
  const etreeWorkPtr: usize = parentPtr + (<usize>n << 2)

  // Get elimination tree
  csEtree(indexPtr, ptrPtr, n, n, parentPtr, etreeWorkPtr)

  let nnzL: i32 = 0
  store<i32>(lPtrPtr, 0)

  for (let k: i32 = 0; k < n; k++) {
    // Initialize column k
    store<f64>(xPtr + (<usize>k << 3), 0.0)
    store<i32>(cPtr + (<usize>k << 2), k)

    // Scatter A(:,k) into x
    const ptrK = load<i32>(ptrPtr + (<usize>k << 2))
    const ptrK1 = load<i32>(ptrPtr + (<usize>(k + 1) << 2))
    for (let p: i32 = ptrK; p < ptrK1; p++) {
      const i: i32 = load<i32>(indexPtr + (<usize>p << 2))
      if (i >= k) {
        store<f64>(xPtr + (<usize>i << 3), load<f64>(valuesPtr + (<usize>p << 3)))
      }
    }

    // Numeric Cholesky
    let d: f64 = load<f64>(xPtr + (<usize>k << 3))
    store<f64>(xPtr + (<usize>k << 3), 0.0)

    // Solve L(0:k-1, 0:k-1) * x(0:k-1) = A(0:k-1, k)
    for (let j: i32 = 0; j < k; j++) {
      // Check if L(k, j) is nonzero
      let found: bool = false
      const lPtrJ = load<i32>(lPtrPtr + (<usize>j << 2))
      for (let p: i32 = lPtrJ; p < nnzL; p++) {
        const lIdxP = load<i32>(lIndexPtr + (<usize>p << 2))
        if (lIdxP >= k) break
        if (lIdxP === k) {
          found = true
          break
        }
      }
      const xj = load<f64>(xPtr + (<usize>j << 3))
      if (!found && xj === 0.0) continue

      const lPtrJ_val = load<i32>(lPtrPtr + (<usize>j << 2))
      const ljj = load<f64>(lValuesPtr + (<usize>lPtrJ_val << 3))
      const lkj: f64 = xj / ljj
      store<f64>(xPtr + (<usize>j << 3), lkj)

      // Update x
      const lPtrJ1 = load<i32>(lPtrPtr + (<usize>(j + 1) << 2))
      for (let p: i32 = lPtrJ_val + 1; p < lPtrJ1; p++) {
        const i: i32 = load<i32>(lIndexPtr + (<usize>p << 2))
        if (i >= k) {
          const xi = load<f64>(xPtr + (<usize>i << 3))
          const lVal = load<f64>(lValuesPtr + (<usize>p << 3))
          store<f64>(xPtr + (<usize>i << 3), xi - lVal * lkj)
        }
      }

      // Update diagonal
      d -= lkj * lkj
    }

    // Check positive definiteness
    if (d <= 0.0) {
      return -1 // Not positive definite
    }

    // Store L(:, k)
    store<f64>(lValuesPtr + (<usize>nnzL << 3), Math.sqrt(d))
    store<i32>(lIndexPtr + (<usize>nnzL << 2), k)
    nnzL++

    // Store off-diagonal entries
    const lkkIdx = nnzL - 1
    for (let i: i32 = k + 1; i < n; i++) {
      const xi = load<f64>(xPtr + (<usize>i << 3))
      if (xi !== 0.0) {
        const lkk = load<f64>(lValuesPtr + (<usize>lkkIdx << 3))
        store<f64>(lValuesPtr + (<usize>nnzL << 3), xi / lkk)
        store<i32>(lIndexPtr + (<usize>nnzL << 2), i)
        nnzL++
        store<f64>(xPtr + (<usize>i << 3), 0.0)
      }
    }

    store<i32>(lPtrPtr + (<usize>(k + 1) << 2), nnzL)
  }

  return nnzL
}

// ============================================
// SPARSE LU FACTORIZATION
// ============================================

/**
 * Sparse LU factorization with partial pivoting: PA = LU
 *
 * @param valuesPtr Non-zero values of A pointer (f64)
 * @param indexPtr Row indices pointer (i32)
 * @param ptrPtr Column pointers pointer (i32)
 * @param n Size of matrix
 * @param tol Pivot tolerance (0 = partial pivoting, 1 = no pivoting)
 * @param lValuesPtr Output L values pointer (f64)
 * @param lIndexPtr Output L row indices pointer (i32)
 * @param lPtrPtr Output L column pointers pointer (i32, size n+1)
 * @param uValuesPtr Output U values pointer (f64)
 * @param uIndexPtr Output U row indices pointer (i32)
 * @param uPtrPtr Output U column pointers pointer (i32, size n+1)
 * @param permPtr Output permutation pointer (i32, size n)
 * @param workPtr Working memory
 * @returns [nnzL, nnzU] packed as i32, or -1 if singular
 */
export function sparseLU(
  valuesPtr: usize,
  indexPtr: usize,
  ptrPtr: usize,
  n: i32,
  tol: f64,
  lValuesPtr: usize,
  lIndexPtr: usize,
  lPtrPtr: usize,
  uValuesPtr: usize,
  uIndexPtr: usize,
  uPtrPtr: usize,
  permPtr: usize,
  workPtr: usize
): i64 {
  // workPtr layout: x (n f64s), pinv (n i32s), xi (2n i32s)
  const xPtr: usize = workPtr
  const pinvPtr: usize = workPtr + (<usize>n << 3)
  const xiPtr: usize = pinvPtr + (<usize>n << 2)

  // Initialize permutations
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(permPtr + (<usize>i << 2), i)
    store<i32>(pinvPtr + (<usize>i << 2), i)
  }

  let nnzL: i32 = 0
  let nnzU: i32 = 0

  store<i32>(lPtrPtr, 0)
  store<i32>(uPtrPtr, 0)

  for (let k: i32 = 0; k < n; k++) {
    // Scatter A(:, k) into x
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(xPtr + (<usize>i << 3), 0.0)
    }

    const ptrK = load<i32>(ptrPtr + (<usize>k << 2))
    const ptrK1 = load<i32>(ptrPtr + (<usize>(k + 1) << 2))
    for (let p: i32 = ptrK; p < ptrK1; p++) {
      const origIdx = load<i32>(indexPtr + (<usize>p << 2))
      const i: i32 = load<i32>(pinvPtr + (<usize>origIdx << 2))
      store<f64>(xPtr + (<usize>i << 3), load<f64>(valuesPtr + (<usize>p << 3)))
    }

    // Solve L(:, 0:k-1) \ A(:, k) for the k-th column
    for (let j: i32 = 0; j < k; j++) {
      const xj = load<f64>(xPtr + (<usize>j << 3))
      if (xj === 0.0) continue

      const lPtrJ = load<i32>(lPtrPtr + (<usize>j << 2))
      const ljj = load<f64>(lValuesPtr + (<usize>lPtrJ << 3))
      const xjDiv: f64 = xj / ljj
      store<f64>(xPtr + (<usize>j << 3), xjDiv)

      const lPtrJ1 = load<i32>(lPtrPtr + (<usize>(j + 1) << 2))
      for (let p: i32 = lPtrJ + 1; p < lPtrJ1; p++) {
        const i = load<i32>(lIndexPtr + (<usize>p << 2))
        const xi = load<f64>(xPtr + (<usize>i << 3))
        const lVal = load<f64>(lValuesPtr + (<usize>p << 3))
        store<f64>(xPtr + (<usize>i << 3), xi - lVal * xjDiv)
      }
    }

    // Find pivot
    let pivotRow: i32 = k
    let pivotVal: f64 = Math.abs(load<f64>(xPtr + (<usize>k << 3)))

    if (tol < 1.0) {
      for (let i: i32 = k + 1; i < n; i++) {
        const absXi: f64 = Math.abs(load<f64>(xPtr + (<usize>i << 3)))
        if (absXi > pivotVal) {
          pivotVal = absXi
          pivotRow = i
        }
      }
    }

    // Swap if needed
    if (pivotRow !== k) {
      // Swap in permutation
      const pk: i32 = load<i32>(permPtr + (<usize>k << 2))
      const pp: i32 = load<i32>(permPtr + (<usize>pivotRow << 2))
      store<i32>(permPtr + (<usize>k << 2), pp)
      store<i32>(permPtr + (<usize>pivotRow << 2), pk)
      store<i32>(pinvPtr + (<usize>pk << 2), pivotRow)
      store<i32>(pinvPtr + (<usize>pp << 2), k)

      // Swap in x
      const tempX: f64 = load<f64>(xPtr + (<usize>k << 3))
      store<f64>(xPtr + (<usize>k << 3), load<f64>(xPtr + (<usize>pivotRow << 3)))
      store<f64>(xPtr + (<usize>pivotRow << 3), tempX)

      // Swap rows in L
      for (let j: i32 = 0; j < k; j++) {
        const lPtrJ = load<i32>(lPtrPtr + (<usize>j << 2))
        const lPtrJ1 = load<i32>(lPtrPtr + (<usize>(j + 1) << 2))
        for (let p: i32 = lPtrJ; p < lPtrJ1; p++) {
          const lIdx = load<i32>(lIndexPtr + (<usize>p << 2))
          if (lIdx === k) {
            store<i32>(lIndexPtr + (<usize>p << 2), pivotRow)
          } else if (lIdx === pivotRow) {
            store<i32>(lIndexPtr + (<usize>p << 2), k)
          }
        }
      }
    }

    // Store U(:, k)
    for (let i: i32 = 0; i <= k; i++) {
      const xi = load<f64>(xPtr + (<usize>i << 3))
      if (xi !== 0.0) {
        store<f64>(uValuesPtr + (<usize>nnzU << 3), xi)
        store<i32>(uIndexPtr + (<usize>nnzU << 2), i)
        nnzU++
      }
    }
    store<i32>(uPtrPtr + (<usize>(k + 1) << 2), nnzU)

    // Check for singularity
    const xk = load<f64>(xPtr + (<usize>k << 3))
    if (xk === 0.0) {
      return -1 // Singular matrix
    }

    // Store L(:, k)
    store<f64>(lValuesPtr + (<usize>nnzL << 3), 1.0) // Diagonal of L is 1
    store<i32>(lIndexPtr + (<usize>nnzL << 2), k)
    nnzL++

    const ukk: f64 = xk
    for (let i: i32 = k + 1; i < n; i++) {
      const xi = load<f64>(xPtr + (<usize>i << 3))
      if (xi !== 0.0) {
        store<f64>(lValuesPtr + (<usize>nnzL << 3), xi / ukk)
        store<i32>(lIndexPtr + (<usize>nnzL << 2), i)
        nnzL++
      }
    }
    store<i32>(lPtrPtr + (<usize>(k + 1) << 2), nnzL)
  }

  // Pack nnzL and nnzU into i64
  return (<i64>nnzL) | ((<i64>nnzU) << 32)
}

// ============================================
// SPARSE TRIANGULAR SOLVE
// ============================================

/**
 * Solve sparse lower triangular system: L * x = b
 * L is in CSC format with unit or non-unit diagonal
 * @param lValuesPtr L values pointer (f64)
 * @param lIndexPtr L row indices pointer (i32)
 * @param lPtrPtr L column pointers pointer (i32)
 * @param bPtr Right-hand side pointer (f64)
 * @param xPtr Solution output pointer (f64)
 * @param n Size
 */
export function sparseLsolve(
  lValuesPtr: usize,
  lIndexPtr: usize,
  lPtrPtr: usize,
  bPtr: usize,
  xPtr: usize,
  n: i32
): void {
  // Copy b to x
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(xPtr + (<usize>i << 3), load<f64>(bPtr + (<usize>i << 3)))
  }

  // Forward substitution
  for (let j: i32 = 0; j < n; j++) {
    const xj = load<f64>(xPtr + (<usize>j << 3))
    if (xj === 0.0) continue

    const p1: i32 = load<i32>(lPtrPtr + (<usize>j << 2))
    const p2: i32 = load<i32>(lPtrPtr + (<usize>(j + 1) << 2))

    // Divide by diagonal (first entry in column)
    const ljj = load<f64>(lValuesPtr + (<usize>p1 << 3))
    store<f64>(xPtr + (<usize>j << 3), xj / ljj)
    const xjNew = load<f64>(xPtr + (<usize>j << 3))

    // Update remaining entries
    for (let p: i32 = p1 + 1; p < p2; p++) {
      const i = load<i32>(lIndexPtr + (<usize>p << 2))
      const xi = load<f64>(xPtr + (<usize>i << 3))
      const lVal = load<f64>(lValuesPtr + (<usize>p << 3))
      store<f64>(xPtr + (<usize>i << 3), xi - lVal * xjNew)
    }
  }
}

/**
 * Solve sparse upper triangular system: U * x = b
 * U is in CSC format
 * @param uValuesPtr U values pointer (f64)
 * @param uIndexPtr U row indices pointer (i32)
 * @param uPtrPtr U column pointers pointer (i32)
 * @param bPtr Right-hand side pointer (f64)
 * @param xPtr Solution output pointer (f64)
 * @param n Size
 */
export function sparseUsolve(
  uValuesPtr: usize,
  uIndexPtr: usize,
  uPtrPtr: usize,
  bPtr: usize,
  xPtr: usize,
  n: i32
): void {
  // Copy b to x
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(xPtr + (<usize>i << 3), load<f64>(bPtr + (<usize>i << 3)))
  }

  // Backward substitution
  for (let j: i32 = n - 1; j >= 0; j--) {
    const p1: i32 = load<i32>(uPtrPtr + (<usize>j << 2))
    const p2: i32 = load<i32>(uPtrPtr + (<usize>(j + 1) << 2))

    if (p2 === p1) continue // Empty column

    // Find diagonal entry (last in column for upper triangular)
    let diagIdx: i32 = -1
    for (let p: i32 = p2 - 1; p >= p1; p--) {
      if (load<i32>(uIndexPtr + (<usize>p << 2)) === j) {
        diagIdx = p
        break
      }
    }

    if (diagIdx < 0) continue
    const ujj = load<f64>(uValuesPtr + (<usize>diagIdx << 3))
    if (ujj === 0.0) continue

    const xj = load<f64>(xPtr + (<usize>j << 3))
    store<f64>(xPtr + (<usize>j << 3), xj / ujj)
    const xjNew = load<f64>(xPtr + (<usize>j << 3))

    // Update entries above diagonal
    for (let p: i32 = p1; p < diagIdx; p++) {
      const i = load<i32>(uIndexPtr + (<usize>p << 2))
      const xi = load<f64>(xPtr + (<usize>i << 3))
      const uVal = load<f64>(uValuesPtr + (<usize>p << 3))
      store<f64>(xPtr + (<usize>i << 3), xi - uVal * xjNew)
    }
  }
}

// ============================================
// SPARSE QR FACTORIZATION (Householder)
// ============================================

/**
 * Sparse QR factorization using Householder reflections
 * A = Q * R where Q is orthogonal and R is upper triangular
 *
 * For simplicity, this returns R factor only (Q can be applied implicitly)
 *
 * @param valuesPtr Input values pointer (f64)
 * @param indexPtr Input row indices pointer (i32)
 * @param ptrPtr Input column pointers pointer (i32)
 * @param m Number of rows
 * @param n Number of columns
 * @param rValuesPtr Output R values pointer (f64)
 * @param rIndexPtr Output R row indices pointer (i32)
 * @param rPtrPtr Output R column pointers pointer (i32, size n+1)
 * @param workPtr Working memory (f64, size m*n + n for dense A and tau)
 * @returns Number of non-zeros in R, or -1 if underdetermined
 */
export function sparseQR(
  valuesPtr: usize,
  indexPtr: usize,
  ptrPtr: usize,
  m: i32,
  n: i32,
  rValuesPtr: usize,
  rIndexPtr: usize,
  rPtrPtr: usize,
  workPtr: usize
): i32 {
  // Simplified QR for square or overdetermined systems
  // Uses column-by-column Householder reflections

  if (m < n) {
    return -1 // Underdetermined not supported
  }

  // workPtr layout: A (m*n f64s), tau (n f64s)
  const APtr: usize = workPtr
  const tauPtr: usize = workPtr + (<usize>(m * n) << 3)

  // Initialize dense A to zero
  for (let i: i32 = 0; i < m * n; i++) {
    store<f64>(APtr + (<usize>i << 3), 0.0)
  }

  // Scatter sparse A into dense
  for (let j: i32 = 0; j < n; j++) {
    const ptrJ = load<i32>(ptrPtr + (<usize>j << 2))
    const ptrJ1 = load<i32>(ptrPtr + (<usize>(j + 1) << 2))
    for (let p: i32 = ptrJ; p < ptrJ1; p++) {
      const i = load<i32>(indexPtr + (<usize>p << 2))
      const val = load<f64>(valuesPtr + (<usize>p << 3))
      store<f64>(APtr + (<usize>(i * n + j) << 3), val)
    }
  }

  // Householder QR on dense matrix
  for (let k: i32 = 0; k < n; k++) {
    // Compute Householder vector for column k
    let normx: f64 = 0.0
    for (let i: i32 = k; i < m; i++) {
      const aik = load<f64>(APtr + (<usize>(i * n + k) << 3))
      normx += aik * aik
    }
    normx = Math.sqrt(normx)

    if (normx === 0.0) continue

    const akk = load<f64>(APtr + (<usize>(k * n + k) << 3))
    const alpha: f64 = akk >= 0 ? -normx : normx
    const u0: f64 = akk - alpha
    store<f64>(APtr + (<usize>(k * n + k) << 3), alpha)

    // Normalize Householder vector
    let normU: f64 = u0 * u0
    for (let i: i32 = k + 1; i < m; i++) {
      const aik = load<f64>(APtr + (<usize>(i * n + k) << 3))
      normU += aik * aik
    }
    normU = Math.sqrt(normU)

    if (normU === 0.0) continue

    store<f64>(tauPtr + (<usize>k << 3), 2.0 / normU / normU)
    const tauK = load<f64>(tauPtr + (<usize>k << 3))

    // Apply Householder to remaining columns
    for (let j: i32 = k + 1; j < n; j++) {
      // Compute v^T * A(:,j)
      let dot: f64 = u0 * load<f64>(APtr + (<usize>(k * n + j) << 3))
      for (let i: i32 = k + 1; i < m; i++) {
        dot += load<f64>(APtr + (<usize>(i * n + k) << 3)) * load<f64>(APtr + (<usize>(i * n + j) << 3))
      }

      // A(:,j) = A(:,j) - tau * dot * v
      dot *= tauK
      const akj = load<f64>(APtr + (<usize>(k * n + j) << 3))
      store<f64>(APtr + (<usize>(k * n + j) << 3), akj - dot * u0)
      for (let i: i32 = k + 1; i < m; i++) {
        const aij = load<f64>(APtr + (<usize>(i * n + j) << 3))
        const aik = load<f64>(APtr + (<usize>(i * n + k) << 3))
        store<f64>(APtr + (<usize>(i * n + j) << 3), aij - dot * aik)
      }
    }

    // Store Householder vector below diagonal
    store<f64>(APtr + (<usize>(k * n + k) << 3), alpha)
    for (let i: i32 = k + 1; i < m; i++) {
      store<f64>(APtr + (<usize>(i * n + k) << 3), 0.0) // Zero out below diagonal in R
    }
  }

  // Extract R as sparse (upper triangular)
  let nnzR: i32 = 0
  for (let j: i32 = 0; j < n; j++) {
    store<i32>(rPtrPtr + (<usize>j << 2), nnzR)
    for (let i: i32 = 0; i <= j && i < m; i++) {
      const val = load<f64>(APtr + (<usize>(i * n + j) << 3))
      if (Math.abs(val) > 1e-14) {
        store<f64>(rValuesPtr + (<usize>nnzR << 3), val)
        store<i32>(rIndexPtr + (<usize>nnzR << 2), i)
        nnzR++
      }
    }
  }
  store<i32>(rPtrPtr + (<usize>n << 2), nnzR)

  return nnzR
}

// ============================================
// SPARSE SOLVE (using LU)
// ============================================

/**
 * Solve sparse linear system Ax = b using LU factorization
 *
 * @param valuesPtr A values pointer (f64)
 * @param indexPtr A row indices pointer (i32)
 * @param ptrPtr A column pointers pointer (i32)
 * @param bPtr Right-hand side pointer (f64)
 * @param n Matrix size
 * @param xPtr Solution output pointer (f64, size n)
 * @param workPtr Working memory - needs significant space for LU factors
 * @param maxNnz Maximum expected non-zeros for L and U each
 * @returns 0 on success, -1 if singular
 */
export function sparseSolve(
  valuesPtr: usize,
  indexPtr: usize,
  ptrPtr: usize,
  bPtr: usize,
  n: i32,
  xPtr: usize,
  workPtr: usize,
  maxNnz: i32
): i32 {
  // workPtr layout:
  // lValues (maxNnz f64s), lIndex (maxNnz i32s), lPtr ((n+1) i32s)
  // uValues (maxNnz f64s), uIndex (maxNnz i32s), uPtr ((n+1) i32s)
  // perm (n i32s), pb (n f64s), y (n f64s), luWork (enough for LU)
  const lValuesPtr: usize = workPtr
  const lIndexPtr: usize = lValuesPtr + (<usize>maxNnz << 3)
  const lPtrPtr: usize = lIndexPtr + (<usize>maxNnz << 2)
  const uValuesPtr: usize = lPtrPtr + (<usize>(n + 1) << 2)
  const uIndexPtr: usize = uValuesPtr + (<usize>maxNnz << 3)
  const uPtrPtr: usize = uIndexPtr + (<usize>maxNnz << 2)
  const permPtr: usize = uPtrPtr + (<usize>(n + 1) << 2)
  const pbPtr: usize = permPtr + (<usize>n << 2)
  const yPtr: usize = pbPtr + (<usize>n << 3)
  const luWorkPtr: usize = yPtr + (<usize>n << 3)

  // LU factorization
  const luResult = sparseLU(
    valuesPtr, indexPtr, ptrPtr, n, 1.0,
    lValuesPtr, lIndexPtr, lPtrPtr,
    uValuesPtr, uIndexPtr, uPtrPtr,
    permPtr, luWorkPtr
  )

  if (luResult < 0) {
    return -1 // Singular
  }

  // Apply permutation to b
  for (let i: i32 = 0; i < n; i++) {
    const permI = load<i32>(permPtr + (<usize>i << 2))
    store<f64>(pbPtr + (<usize>i << 3), load<f64>(bPtr + (<usize>permI << 3)))
  }

  // Solve L * y = pb
  sparseLsolve(lValuesPtr, lIndexPtr, lPtrPtr, pbPtr, yPtr, n)

  // Solve U * x = y
  sparseUsolve(uValuesPtr, uIndexPtr, uPtrPtr, yPtr, xPtr, n)

  return 0
}
