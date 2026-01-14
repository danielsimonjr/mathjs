/**
 * WASM-optimized sparse matrix factorizations
 *
 * Implements sparse LU, Cholesky, and QR factorizations using
 * CSC (Compressed Sparse Column) format.
 *
 * CSC Format:
 * - values: Float64Array of non-zero values
 * - index: Int32Array of row indices for each value
 * - ptr: Int32Array of column pointers (size n+1)
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
 * @param values Non-zero values
 * @param index Row indices
 * @param ptr Column pointers
 * @param m Number of rows
 * @param n Number of columns
 * @param x Input vector (length n)
 * @param y Output vector (length m)
 */
export function sparseMatVec(
  values: Float64Array,
  index: Int32Array,
  ptr: Int32Array,
  m: i32,
  n: i32,
  x: Float64Array,
  y: Float64Array
): void {
  // Initialize y to zero
  for (let i: i32 = 0; i < m; i++) {
    y[i] = 0.0
  }

  // Multiply column by column
  for (let j: i32 = 0; j < n; j++) {
    const xj: f64 = x[j]
    if (xj !== 0.0) {
      for (let p: i32 = ptr[j]; p < ptr[j + 1]; p++) {
        y[index[p]] += values[p] * xj
      }
    }
  }
}

/**
 * Sparse matrix transpose: C = A^T
 * @returns [cValues, cIndex, cPtr]
 */
export function sparseTranspose(
  values: Float64Array,
  index: Int32Array,
  ptr: Int32Array,
  m: i32,
  n: i32
): Float64Array {
  const nnz: i32 = ptr[n]

  // Count entries in each row of A (will become columns of A^T)
  const rowCount = new Int32Array(m)
  for (let p: i32 = 0; p < nnz; p++) {
    rowCount[index[p]]++
  }

  // Compute column pointers for A^T
  const cPtr = new Int32Array(m + 1)
  csCumsum(cPtr, rowCount, m)

  // Fill in the transpose
  const cValues = new Float64Array(nnz)
  const cIndex = new Int32Array(nnz)
  const work = new Int32Array(m)

  for (let i: i32 = 0; i < m; i++) {
    work[i] = cPtr[i]
  }

  for (let j: i32 = 0; j < n; j++) {
    for (let p: i32 = ptr[j]; p < ptr[j + 1]; p++) {
      const i: i32 = index[p]
      const q: i32 = work[i]++
      cIndex[q] = j
      cValues[q] = values[p]
    }
  }

  // Pack results into single array for return
  const resultSize: i32 = nnz + nnz + m + 1
  const result = new Float64Array(resultSize)

  for (let i: i32 = 0; i < nnz; i++) {
    result[i] = cValues[i]
  }
  for (let i: i32 = 0; i < nnz; i++) {
    result[nnz + i] = f64(cIndex[i])
  }
  for (let i: i32 = 0; i <= m; i++) {
    result[2 * nnz + i] = f64(cPtr[i])
  }

  return result
}

// ============================================
// SPARSE CHOLESKY FACTORIZATION
// ============================================

/**
 * Symbolic Cholesky analysis
 * Computes elimination tree and column counts for Cholesky factorization
 * @returns [parent, postorder, colCount] packed into single array
 */
export function symbolicCholesky(
  index: Int32Array,
  ptr: Int32Array,
  n: i32
): Int32Array {
  const parent = new Int32Array(n)
  const post = new Int32Array(n)
  const colCount = new Int32Array(n)

  // Compute elimination tree
  csEtree(index, ptr, n, n, parent)

  // Post-order the elimination tree
  const stack = new Int32Array(n)
  const first = new Int32Array(n)
  let top: i32 = 0

  // Initialize
  for (let i: i32 = 0; i < n; i++) {
    first[i] = -1
  }

  // Link children using first child/next sibling
  for (let i: i32 = n - 1; i >= 0; i--) {
    const p: i32 = parent[i]
    if (p !== -1) {
      // i is not a root
      stack[i] = first[p]
      first[p] = i
    }
  }

  // DFS postorder
  let k: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (parent[i] === -1) {
      // Root node
      let j: i32 = i
      while (j !== -1) {
        if (first[j] !== -1) {
          // Push first child
          stack[top++] = j
          j = first[j]
          first[stack[top - 1]] = stack[j] // Move to next sibling
        } else {
          // No more children, record postorder
          post[k++] = j
          j = top > 0 ? stack[--top] : -1
        }
      }
    }
  }

  // Compute column counts using postorder
  const ancestor = new Int32Array(n)
  const maxfirst = new Int32Array(n)
  const prevleaf = new Int32Array(n)
  const delta = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    ancestor[i] = i
    maxfirst[i] = -1
    prevleaf[i] = -1
    delta[i] = 0
  }

  for (let k2: i32 = 0; k2 < n; k2++) {
    const j: i32 = post[k2]

    if (parent[j] !== -1) {
      delta[j] = 1
    }

    for (let p: i32 = ptr[j]; p < ptr[j + 1]; p++) {
      let i: i32 = index[p]

      // Find root of i
      while (ancestor[i] !== i) {
        const next: i32 = ancestor[i]
        ancestor[i] = j
        i = next
      }
      ancestor[i] = j

      if (i < j) {
        delta[j]++
        if (maxfirst[i] < k2) {
          maxfirst[i] = k2
        }
      }
    }

    if (parent[j] !== -1) {
      delta[parent[j]] += delta[j] - 1
    }
  }

  // Column counts
  for (let i: i32 = 0; i < n; i++) {
    colCount[i] = delta[i]
  }

  // Pack results
  const result = new Int32Array(3 * n)
  for (let i: i32 = 0; i < n; i++) {
    result[i] = parent[i]
    result[n + i] = post[i]
    result[2 * n + i] = colCount[i]
  }

  return result
}

/**
 * Numeric Cholesky factorization: A = L * L^T
 * Only works for symmetric positive definite matrices
 *
 * @param values Non-zero values of A (lower triangle only)
 * @param index Row indices
 * @param ptr Column pointers
 * @param n Size of matrix
 * @returns Packed result [lValues, lIndex, lPtr] or empty if not SPD
 */
export function sparseCholesky(
  values: Float64Array,
  index: Int32Array,
  ptr: Int32Array,
  n: i32
): Float64Array {
  // Estimate nnz in L (typically 5-10x nnz in A for sparse problems)
  const nnzA: i32 = ptr[n]
  const maxNnz: i32 = nnzA * 10 + n

  const lValues = new Float64Array(maxNnz)
  const lIndex = new Int32Array(maxNnz)
  const lPtr = new Int32Array(n + 1)

  // Working arrays
  const x = new Float64Array(n)
  const c = new Int32Array(n)

  // Get elimination tree
  const parent = new Int32Array(n)
  csEtree(index, ptr, n, n, parent)

  let nnzL: i32 = 0
  lPtr[0] = 0

  for (let k: i32 = 0; k < n; k++) {
    // Initialize column k
    x[k] = 0.0
    c[k] = k

    // Scatter A(:,k) into x
    for (let p: i32 = ptr[k]; p < ptr[k + 1]; p++) {
      const i: i32 = index[p]
      if (i >= k) {
        x[i] = values[p]
      }
    }

    // Numeric Cholesky
    let d: f64 = x[k]
    x[k] = 0.0

    // Solve L(0:k-1, 0:k-1) * x(0:k-1) = A(0:k-1, k)
    for (let j: i32 = 0; j < k; j++) {
      // Check if L(k, j) is nonzero
      let found: bool = false
      for (let p: i32 = lPtr[j]; p < nnzL && lIndex[p] < k; p++) {
        if (lIndex[p] === k) {
          found = true
          break
        }
      }
      if (!found && x[j] === 0.0) continue

      const lkj: f64 = x[j] / lValues[lPtr[j]]
      x[j] = lkj

      // Update x
      for (let p: i32 = lPtr[j] + 1; p < lPtr[j + 1]; p++) {
        const i: i32 = lIndex[p]
        if (i >= k) {
          x[i] -= lValues[p] * lkj
        }
      }

      // Update diagonal
      d -= lkj * lkj
    }

    // Check positive definiteness
    if (d <= 0.0) {
      return new Float64Array(0) // Not positive definite
    }

    // Store L(:, k)
    lValues[nnzL] = Math.sqrt(d)
    lIndex[nnzL] = k
    nnzL++

    // Store off-diagonal entries
    for (let i: i32 = k + 1; i < n; i++) {
      if (x[i] !== 0.0) {
        lValues[nnzL] = x[i] / lValues[lPtr[k]]
        lIndex[nnzL] = i
        nnzL++
        x[i] = 0.0
      }
    }

    lPtr[k + 1] = nnzL
  }

  // Pack results
  const resultSize: i32 = nnzL + nnzL + n + 1
  const result = new Float64Array(resultSize)

  for (let i: i32 = 0; i < nnzL; i++) {
    result[i] = lValues[i]
  }
  for (let i: i32 = 0; i < nnzL; i++) {
    result[nnzL + i] = f64(lIndex[i])
  }
  for (let i: i32 = 0; i <= n; i++) {
    result[2 * nnzL + i] = f64(lPtr[i])
  }

  return result
}

// ============================================
// SPARSE LU FACTORIZATION
// ============================================

/**
 * Sparse LU factorization with partial pivoting: PA = LU
 *
 * @param values Non-zero values of A
 * @param index Row indices
 * @param ptr Column pointers
 * @param n Size of matrix
 * @param tol Pivot tolerance (0 = partial pivoting, 1 = no pivoting)
 * @returns Packed [lValues, lIndex, lPtr, uValues, uIndex, uPtr, perm]
 */
export function sparseLU(
  values: Float64Array,
  index: Int32Array,
  ptr: Int32Array,
  n: i32,
  tol: f64 = 1.0
): Float64Array {
  const nnzA: i32 = ptr[n]
  const maxNnz: i32 = nnzA * 10 + n

  // L and U factors
  const lValues = new Float64Array(maxNnz)
  const lIndex = new Int32Array(maxNnz)
  const lPtr = new Int32Array(n + 1)

  const uValues = new Float64Array(maxNnz)
  const uIndex = new Int32Array(maxNnz)
  const uPtr = new Int32Array(n + 1)

  // Permutation
  const perm = new Int32Array(n)
  const pinv = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    perm[i] = i
    pinv[i] = i
  }

  // Working arrays
  const x = new Float64Array(n)
  const xi = new Int32Array(2 * n)

  let nnzL: i32 = 0
  let nnzU: i32 = 0

  lPtr[0] = 0
  uPtr[0] = 0

  for (let k: i32 = 0; k < n; k++) {
    // Scatter A(:, k) into x
    for (let i: i32 = 0; i < n; i++) {
      x[i] = 0.0
    }

    for (let p: i32 = ptr[k]; p < ptr[k + 1]; p++) {
      const i: i32 = pinv[index[p]]
      x[i] = values[p]
    }

    // Solve L(:, 0:k-1) \ A(:, k) for the k-th column
    for (let j: i32 = 0; j < k; j++) {
      if (x[j] === 0.0) continue

      const xj: f64 = x[j] / lValues[lPtr[j]]
      x[j] = xj

      for (let p: i32 = lPtr[j] + 1; p < lPtr[j + 1]; p++) {
        x[lIndex[p]] -= lValues[p] * xj
      }
    }

    // Find pivot
    let pivotRow: i32 = k
    let pivotVal: f64 = Math.abs(x[k])

    if (tol < 1.0) {
      for (let i: i32 = k + 1; i < n; i++) {
        const absXi: f64 = Math.abs(x[i])
        if (absXi > pivotVal) {
          pivotVal = absXi
          pivotRow = i
        }
      }
    }

    // Swap if needed
    if (pivotRow !== k) {
      // Swap in permutation
      const pk: i32 = perm[k]
      const pp: i32 = perm[pivotRow]
      perm[k] = pp
      perm[pivotRow] = pk
      pinv[pk] = pivotRow
      pinv[pp] = k

      // Swap in x
      const tempX: f64 = x[k]
      x[k] = x[pivotRow]
      x[pivotRow] = tempX

      // Swap rows in L
      for (let j: i32 = 0; j < k; j++) {
        for (let p: i32 = lPtr[j]; p < lPtr[j + 1]; p++) {
          if (lIndex[p] === k) {
            lIndex[p] = pivotRow
          } else if (lIndex[p] === pivotRow) {
            lIndex[p] = k
          }
        }
      }
    }

    // Store U(:, k)
    for (let i: i32 = 0; i <= k; i++) {
      if (x[i] !== 0.0) {
        uValues[nnzU] = x[i]
        uIndex[nnzU] = i
        nnzU++
      }
    }
    uPtr[k + 1] = nnzU

    // Check for singularity
    if (x[k] === 0.0) {
      return new Float64Array(0) // Singular matrix
    }

    // Store L(:, k)
    lValues[nnzL] = 1.0 // Diagonal of L is 1
    lIndex[nnzL] = k
    nnzL++

    const ukk: f64 = x[k]
    for (let i: i32 = k + 1; i < n; i++) {
      if (x[i] !== 0.0) {
        lValues[nnzL] = x[i] / ukk
        lIndex[nnzL] = i
        nnzL++
      }
    }
    lPtr[k + 1] = nnzL
  }

  // Pack results: [nnzL, nnzU, n, lValues..., lIndex..., lPtr..., uValues..., uIndex..., uPtr..., perm...]
  const headerSize: i32 = 3
  const resultSize: i32 = headerSize + nnzL + nnzL + (n + 1) + nnzU + nnzU + (n + 1) + n
  const result = new Float64Array(resultSize)

  let offset: i32 = 0
  result[offset++] = f64(nnzL)
  result[offset++] = f64(nnzU)
  result[offset++] = f64(n)

  // L values
  for (let i: i32 = 0; i < nnzL; i++) {
    result[offset++] = lValues[i]
  }
  // L index
  for (let i: i32 = 0; i < nnzL; i++) {
    result[offset++] = f64(lIndex[i])
  }
  // L ptr
  for (let i: i32 = 0; i <= n; i++) {
    result[offset++] = f64(lPtr[i])
  }

  // U values
  for (let i: i32 = 0; i < nnzU; i++) {
    result[offset++] = uValues[i]
  }
  // U index
  for (let i: i32 = 0; i < nnzU; i++) {
    result[offset++] = f64(uIndex[i])
  }
  // U ptr
  for (let i: i32 = 0; i <= n; i++) {
    result[offset++] = f64(uPtr[i])
  }

  // Permutation
  for (let i: i32 = 0; i < n; i++) {
    result[offset++] = f64(perm[i])
  }

  return result
}

// ============================================
// SPARSE TRIANGULAR SOLVE
// ============================================

/**
 * Solve sparse lower triangular system: L * x = b
 * L is in CSC format with unit or non-unit diagonal
 */
export function sparseLsolve(
  lValues: Float64Array,
  lIndex: Int32Array,
  lPtr: Int32Array,
  b: Float64Array,
  x: Float64Array,
  n: i32
): void {
  // Copy b to x
  for (let i: i32 = 0; i < n; i++) {
    x[i] = b[i]
  }

  // Forward substitution
  for (let j: i32 = 0; j < n; j++) {
    if (x[j] === 0.0) continue

    const p1: i32 = lPtr[j]
    const p2: i32 = lPtr[j + 1]

    // Divide by diagonal (first entry in column)
    x[j] /= lValues[p1]

    // Update remaining entries
    for (let p: i32 = p1 + 1; p < p2; p++) {
      x[lIndex[p]] -= lValues[p] * x[j]
    }
  }
}

/**
 * Solve sparse upper triangular system: U * x = b
 * U is in CSC format
 */
export function sparseUsolve(
  uValues: Float64Array,
  uIndex: Int32Array,
  uPtr: Int32Array,
  b: Float64Array,
  x: Float64Array,
  n: i32
): void {
  // Copy b to x
  for (let i: i32 = 0; i < n; i++) {
    x[i] = b[i]
  }

  // Backward substitution
  for (let j: i32 = n - 1; j >= 0; j--) {
    const p1: i32 = uPtr[j]
    const p2: i32 = uPtr[j + 1]

    if (p2 === p1) continue // Empty column

    // Find diagonal entry (last in column for upper triangular)
    let diagIdx: i32 = -1
    for (let p: i32 = p2 - 1; p >= p1; p--) {
      if (uIndex[p] === j) {
        diagIdx = p
        break
      }
    }

    if (diagIdx < 0 || uValues[diagIdx] === 0.0) continue

    x[j] /= uValues[diagIdx]

    // Update entries above diagonal
    for (let p: i32 = p1; p < diagIdx; p++) {
      x[uIndex[p]] -= uValues[p] * x[j]
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
 * @returns Packed [rValues, rIndex, rPtr] or empty if failed
 */
export function sparseQR(
  values: Float64Array,
  index: Int32Array,
  ptr: Int32Array,
  m: i32,
  n: i32
): Float64Array {
  // Simplified QR for square or overdetermined systems
  // Uses column-by-column Householder reflections

  if (m < n) {
    return new Float64Array(0) // Underdetermined not supported
  }

  const nnzA: i32 = ptr[n]
  const maxNnz: i32 = nnzA * 5 + n * n

  // Work with dense representation for simplicity
  // (Full sparse QR is much more complex)
  const A = new Float64Array(m * n)

  // Scatter sparse A into dense
  for (let j: i32 = 0; j < n; j++) {
    for (let p: i32 = ptr[j]; p < ptr[j + 1]; p++) {
      A[index[p] * n + j] = values[p]
    }
  }

  // Householder QR on dense matrix
  const tau = new Float64Array(n)

  for (let k: i32 = 0; k < n; k++) {
    // Compute Householder vector for column k
    let normx: f64 = 0.0
    for (let i: i32 = k; i < m; i++) {
      normx += A[i * n + k] * A[i * n + k]
    }
    normx = Math.sqrt(normx)

    if (normx === 0.0) continue

    const alpha: f64 = A[k * n + k] >= 0 ? -normx : normx
    const u0: f64 = A[k * n + k] - alpha
    A[k * n + k] = alpha

    // Normalize Householder vector
    let normU: f64 = u0 * u0
    for (let i: i32 = k + 1; i < m; i++) {
      normU += A[i * n + k] * A[i * n + k]
    }
    normU = Math.sqrt(normU)

    if (normU === 0.0) continue

    tau[k] = 2.0 / normU / normU

    // Apply Householder to remaining columns
    for (let j: i32 = k + 1; j < n; j++) {
      // Compute v^T * A(:,j)
      let dot: f64 = u0 * A[k * n + j]
      for (let i: i32 = k + 1; i < m; i++) {
        dot += A[i * n + k] * A[i * n + j]
      }

      // A(:,j) = A(:,j) - tau * dot * v
      dot *= tau[k]
      A[k * n + j] -= dot * u0
      for (let i: i32 = k + 1; i < m; i++) {
        A[i * n + j] -= dot * A[i * n + k]
      }
    }

    // Store Householder vector below diagonal
    A[k * n + k] = alpha
    for (let i: i32 = k + 1; i < m; i++) {
      A[i * n + k] = 0.0 // Zero out below diagonal in R
    }
  }

  // Extract R as sparse (upper triangular)
  let nnzR: i32 = 0
  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i <= j && i < m; i++) {
      if (Math.abs(A[i * n + j]) > 1e-14) {
        nnzR++
      }
    }
  }

  const rValues = new Float64Array(nnzR)
  const rIndex = new Int32Array(nnzR)
  const rPtr = new Int32Array(n + 1)

  let rNnz: i32 = 0
  for (let j: i32 = 0; j < n; j++) {
    rPtr[j] = rNnz
    for (let i: i32 = 0; i <= j && i < m; i++) {
      const val: f64 = A[i * n + j]
      if (Math.abs(val) > 1e-14) {
        rValues[rNnz] = val
        rIndex[rNnz] = i
        rNnz++
      }
    }
  }
  rPtr[n] = rNnz

  // Pack results
  const resultSize: i32 = nnzR + nnzR + n + 1
  const result = new Float64Array(resultSize)

  for (let i: i32 = 0; i < nnzR; i++) {
    result[i] = rValues[i]
  }
  for (let i: i32 = 0; i < nnzR; i++) {
    result[nnzR + i] = f64(rIndex[i])
  }
  for (let i: i32 = 0; i <= n; i++) {
    result[2 * nnzR + i] = f64(rPtr[i])
  }

  return result
}

// ============================================
// SPARSE SOLVE (using LU)
// ============================================

/**
 * Solve sparse linear system Ax = b using LU factorization
 *
 * @returns Solution vector x, or empty if singular
 */
export function sparseSolve(
  values: Float64Array,
  index: Int32Array,
  ptr: Int32Array,
  b: Float64Array,
  n: i32
): Float64Array {
  // LU factorization
  const lu = sparseLU(values, index, ptr, n, 1.0)

  if (lu.length === 0) {
    return new Float64Array(0) // Singular
  }

  // Unpack LU result
  const nnzL: i32 = i32(lu[0])
  const nnzU: i32 = i32(lu[1])
  const size: i32 = i32(lu[2])

  let offset: i32 = 3

  const lValues = new Float64Array(nnzL)
  const lIndex = new Int32Array(nnzL)
  const lPtr = new Int32Array(size + 1)

  for (let i: i32 = 0; i < nnzL; i++) {
    lValues[i] = lu[offset++]
  }
  for (let i: i32 = 0; i < nnzL; i++) {
    lIndex[i] = i32(lu[offset++])
  }
  for (let i: i32 = 0; i <= size; i++) {
    lPtr[i] = i32(lu[offset++])
  }

  const uValues = new Float64Array(nnzU)
  const uIndex = new Int32Array(nnzU)
  const uPtr = new Int32Array(size + 1)

  for (let i: i32 = 0; i < nnzU; i++) {
    uValues[i] = lu[offset++]
  }
  for (let i: i32 = 0; i < nnzU; i++) {
    uIndex[i] = i32(lu[offset++])
  }
  for (let i: i32 = 0; i <= size; i++) {
    uPtr[i] = i32(lu[offset++])
  }

  const perm = new Int32Array(size)
  for (let i: i32 = 0; i < size; i++) {
    perm[i] = i32(lu[offset++])
  }

  // Apply permutation to b
  const pb = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    pb[i] = b[perm[i]]
  }

  // Solve L * y = pb
  const y = new Float64Array(n)
  sparseLsolve(lValues, lIndex, lPtr, pb, y, n)

  // Solve U * x = y
  const x = new Float64Array(n)
  sparseUsolve(uValues, uIndex, uPtr, y, x, n)

  return x
}
