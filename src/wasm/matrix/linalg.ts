/**
 * WASM-optimized linear algebra operations using raw memory pointers
 *
 * All functions use raw memory pointers (usize) for array parameters to ensure
 * proper interop with JavaScript/TypeScript callers via WasmLoader.
 *
 * Includes: determinant, inverse, norms, Kronecker product, cross product
 * All matrices are flat arrays in row-major order
 */

// ============================================
// DETERMINANT
// ============================================

/**
 * Compute the determinant of a square matrix using LU decomposition
 * @param aPtr - Pointer to input matrix (n x n, row-major)
 * @param n - Size of the matrix
 * @param workPtr - Pointer to work buffer (n*n f64 values)
 * @returns Determinant value
 */
export function det(aPtr: usize, n: i32, workPtr: usize): f64 {
  if (n === 1) {
    return load<f64>(aPtr)
  }

  if (n === 2) {
    return load<f64>(aPtr) * load<f64>(aPtr + 24) - load<f64>(aPtr + 8) * load<f64>(aPtr + 16)
  }

  if (n === 3) {
    // Sarrus' rule for 3x3
    const a00 = load<f64>(aPtr)
    const a01 = load<f64>(aPtr + 8)
    const a02 = load<f64>(aPtr + 16)
    const a10 = load<f64>(aPtr + 24)
    const a11 = load<f64>(aPtr + 32)
    const a12 = load<f64>(aPtr + 40)
    const a20 = load<f64>(aPtr + 48)
    const a21 = load<f64>(aPtr + 56)
    const a22 = load<f64>(aPtr + 64)
    return (
      a00 * a11 * a22 +
      a01 * a12 * a20 +
      a02 * a10 * a21 -
      a02 * a11 * a20 -
      a01 * a10 * a22 -
      a00 * a12 * a21
    )
  }

  // Copy to work buffer for LU decomposition
  const nn = n * n
  for (let i: i32 = 0; i < nn; i++) {
    store<f64>(workPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>i << 3)))
  }

  let sign: f64 = 1.0

  // Gaussian elimination with partial pivoting
  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxVal: f64 = Math.abs(load<f64>(workPtr + (<usize>(k * n + k) << 3)))
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(load<f64>(workPtr + (<usize>(i * n + k) << 3)))
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    // Check for singularity
    if (maxVal < 1e-14) {
      return 0.0
    }

    // Swap rows if necessary
    if (pivotRow !== k) {
      for (let j: i32 = 0; j < n; j++) {
        const kIdx = <usize>(k * n + j) << 3
        const pIdx = <usize>(pivotRow * n + j) << 3
        const temp: f64 = load<f64>(workPtr + kIdx)
        store<f64>(workPtr + kIdx, load<f64>(workPtr + pIdx))
        store<f64>(workPtr + pIdx, temp)
      }
      sign = -sign
    }

    // Eliminate column
    const pivot: f64 = load<f64>(workPtr + (<usize>(k * n + k) << 3))
    for (let i: i32 = k + 1; i < n; i++) {
      const factor: f64 = load<f64>(workPtr + (<usize>(i * n + k) << 3)) / pivot

      for (let j: i32 = k + 1; j < n; j++) {
        const idx = <usize>(i * n + j) << 3
        store<f64>(workPtr + idx, load<f64>(workPtr + idx) - factor * load<f64>(workPtr + (<usize>(k * n + j) << 3)))
      }
    }
  }

  // Product of diagonal
  let result: f64 = sign
  for (let i: i32 = 0; i < n; i++) {
    result *= load<f64>(workPtr + (<usize>(i * n + i) << 3))
  }

  return result
}

// ============================================
// MATRIX INVERSE
// ============================================

/**
 * Compute the inverse of a square matrix using Gauss-Jordan elimination
 * @param aPtr - Pointer to input matrix (n x n, row-major)
 * @param n - Size of the matrix
 * @param resultPtr - Pointer to output matrix (n x n)
 * @param workPtr - Pointer to work buffer (n * 2n f64 values for augmented matrix)
 * @returns 1 if successful, 0 if singular
 */
export function inv(aPtr: usize, n: i32, resultPtr: usize, workPtr: usize): i32 {
  const width: i32 = 2 * n

  // Create augmented matrix [A | I] in work buffer
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      store<f64>(workPtr + (<usize>(i * width + j) << 3), load<f64>(aPtr + (<usize>(i * n + j) << 3)))
      store<f64>(workPtr + (<usize>(i * width + n + j) << 3), i === j ? 1.0 : 0.0)
    }
  }

  // Forward elimination with partial pivoting
  for (let k: i32 = 0; k < n; k++) {
    // Find pivot
    let maxVal: f64 = Math.abs(load<f64>(workPtr + (<usize>(k * width + k) << 3)))
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(load<f64>(workPtr + (<usize>(i * width + k) << 3)))
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    // Check for singularity
    if (maxVal < 1e-14) {
      return 0 // Singular matrix
    }

    // Swap rows if necessary
    if (pivotRow !== k) {
      for (let j: i32 = 0; j < width; j++) {
        const kIdx = <usize>(k * width + j) << 3
        const pIdx = <usize>(pivotRow * width + j) << 3
        const temp: f64 = load<f64>(workPtr + kIdx)
        store<f64>(workPtr + kIdx, load<f64>(workPtr + pIdx))
        store<f64>(workPtr + pIdx, temp)
      }
    }

    // Scale pivot row
    const pivot: f64 = load<f64>(workPtr + (<usize>(k * width + k) << 3))
    for (let j: i32 = 0; j < width; j++) {
      const idx = <usize>(k * width + j) << 3
      store<f64>(workPtr + idx, load<f64>(workPtr + idx) / pivot)
    }

    // Eliminate column
    for (let i: i32 = 0; i < n; i++) {
      if (i !== k) {
        const factor: f64 = load<f64>(workPtr + (<usize>(i * width + k) << 3))
        for (let j: i32 = 0; j < width; j++) {
          const idx = <usize>(i * width + j) << 3
          store<f64>(workPtr + idx, load<f64>(workPtr + idx) - factor * load<f64>(workPtr + (<usize>(k * width + j) << 3)))
        }
      }
    }
  }

  // Extract inverse from right half
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      store<f64>(resultPtr + (<usize>(i * n + j) << 3), load<f64>(workPtr + (<usize>(i * width + n + j) << 3)))
    }
  }

  return 1
}

// ============================================
// VECTOR AND MATRIX NORMS
// ============================================

/**
 * Compute the L1 norm (sum of absolute values) of a vector
 * @param xPtr - Pointer to input vector
 * @param n - Length
 * @returns L1 norm
 */
export function norm1(xPtr: usize, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += Math.abs(load<f64>(xPtr + (<usize>i << 3)))
  }

  return sum
}

/**
 * Compute the L2 norm (Euclidean norm) of a vector
 * @param xPtr - Pointer to input vector
 * @param n - Length
 * @returns L2 norm
 */
export function norm2(xPtr: usize, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const val = load<f64>(xPtr + (<usize>i << 3))
    sum += val * val
  }

  return Math.sqrt(sum)
}

/**
 * Compute the Lp norm of a vector
 * @param xPtr - Pointer to input vector
 * @param n - Length
 * @param p - Norm order (p >= 1)
 * @returns Lp norm
 */
export function normP(xPtr: usize, n: i32, p: f64): f64 {
  if (p === 1.0) {
    return norm1(xPtr, n)
  }

  if (p === 2.0) {
    return norm2(xPtr, n)
  }

  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += Math.pow(Math.abs(load<f64>(xPtr + (<usize>i << 3))), p)
  }

  return Math.pow(sum, 1.0 / p)
}

/**
 * Compute the infinity norm (max absolute value) of a vector
 * @param xPtr - Pointer to input vector
 * @param n - Length
 * @returns Infinity norm
 */
export function normInf(xPtr: usize, n: i32): f64 {
  let maxVal: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const absVal: f64 = Math.abs(load<f64>(xPtr + (<usize>i << 3)))
    if (absVal > maxVal) {
      maxVal = absVal
    }
  }

  return maxVal
}

/**
 * Compute the Frobenius norm of a matrix
 * @param aPtr - Pointer to input matrix
 * @param size - Total number of elements
 * @returns Frobenius norm
 */
export function normFro(aPtr: usize, size: i32): f64 {
  return norm2(aPtr, size)
}

/**
 * Compute the 1-norm (max column sum) of a matrix
 * @param aPtr - Pointer to input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Matrix 1-norm
 */
export function matrixNorm1(aPtr: usize, rows: i32, cols: i32): f64 {
  let maxColSum: f64 = 0.0

  for (let j: i32 = 0; j < cols; j++) {
    let colSum: f64 = 0.0

    for (let i: i32 = 0; i < rows; i++) {
      colSum += Math.abs(load<f64>(aPtr + (<usize>(i * cols + j) << 3)))
    }

    if (colSum > maxColSum) {
      maxColSum = colSum
    }
  }

  return maxColSum
}

/**
 * Compute the infinity-norm (max row sum) of a matrix
 * @param aPtr - Pointer to input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Matrix infinity-norm
 */
export function matrixNormInf(aPtr: usize, rows: i32, cols: i32): f64 {
  let maxRowSum: f64 = 0.0

  for (let i: i32 = 0; i < rows; i++) {
    let rowSum: f64 = 0.0

    for (let j: i32 = 0; j < cols; j++) {
      rowSum += Math.abs(load<f64>(aPtr + (<usize>(i * cols + j) << 3)))
    }

    if (rowSum > maxRowSum) {
      maxRowSum = rowSum
    }
  }

  return maxRowSum
}

/**
 * Normalize a vector to unit length (in-place)
 * @param xPtr - Pointer to input/output vector
 * @param n - Length
 * @returns The original norm (0 if vector was zero)
 */
export function normalize(xPtr: usize, n: i32): f64 {
  const norm: f64 = norm2(xPtr, n)

  if (norm < 1e-14) {
    return 0.0 // Vector is essentially zero
  }

  for (let i: i32 = 0; i < n; i++) {
    const idx = <usize>i << 3
    store<f64>(xPtr + idx, load<f64>(xPtr + idx) / norm)
  }

  return norm
}

// ============================================
// KRONECKER PRODUCT
// ============================================

/**
 * Compute the Kronecker product of two matrices: C = A ⊗ B
 * @param aPtr - Pointer to first matrix (m x n, row-major)
 * @param aRows - Rows in A
 * @param aCols - Columns in A
 * @param bPtr - Pointer to second matrix (p x q, row-major)
 * @param bRows - Rows in B
 * @param bCols - Columns in B
 * @param resultPtr - Pointer to result matrix (m*p x n*q)
 */
export function kron(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  bPtr: usize,
  bRows: i32,
  bCols: i32,
  resultPtr: usize
): void {
  const resultCols: i32 = aCols * bCols

  for (let i: i32 = 0; i < aRows; i++) {
    for (let j: i32 = 0; j < aCols; j++) {
      const aVal: f64 = load<f64>(aPtr + (<usize>(i * aCols + j) << 3))

      for (let k: i32 = 0; k < bRows; k++) {
        for (let l: i32 = 0; l < bCols; l++) {
          const row: i32 = i * bRows + k
          const col: i32 = j * bCols + l
          const bVal: f64 = load<f64>(bPtr + (<usize>(k * bCols + l) << 3))
          store<f64>(resultPtr + (<usize>(row * resultCols + col) << 3), aVal * bVal)
        }
      }
    }
  }
}

// ============================================
// CROSS PRODUCT
// ============================================

/**
 * Compute the cross product of two 3D vectors
 * @param aPtr - Pointer to first vector (length 3)
 * @param bPtr - Pointer to second vector (length 3)
 * @param resultPtr - Pointer to result vector (length 3)
 */
export function cross(aPtr: usize, bPtr: usize, resultPtr: usize): void {
  const a0 = load<f64>(aPtr)
  const a1 = load<f64>(aPtr + 8)
  const a2 = load<f64>(aPtr + 16)
  const b0 = load<f64>(bPtr)
  const b1 = load<f64>(bPtr + 8)
  const b2 = load<f64>(bPtr + 16)

  store<f64>(resultPtr, a1 * b2 - a2 * b1)
  store<f64>(resultPtr + 8, a2 * b0 - a0 * b2)
  store<f64>(resultPtr + 16, a0 * b1 - a1 * b0)
}

/**
 * Compute the dot product of two vectors
 * @param aPtr - Pointer to first vector
 * @param bPtr - Pointer to second vector
 * @param n - Length
 * @returns Dot product
 */
export function dot(aPtr: usize, bPtr: usize, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += load<f64>(aPtr + (<usize>i << 3)) * load<f64>(bPtr + (<usize>i << 3))
  }

  return sum
}

// ============================================
// OUTER PRODUCT
// ============================================

/**
 * Compute the outer product of two vectors: C = a * b^T
 * @param aPtr - Pointer to first vector (length m)
 * @param m - Length of a
 * @param bPtr - Pointer to second vector (length n)
 * @param n - Length of b
 * @param resultPtr - Pointer to result matrix (m x n)
 */
export function outer(
  aPtr: usize,
  m: i32,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < m; i++) {
    const aVal = load<f64>(aPtr + (<usize>i << 3))
    for (let j: i32 = 0; j < n; j++) {
      store<f64>(resultPtr + (<usize>(i * n + j) << 3), aVal * load<f64>(bPtr + (<usize>j << 3)))
    }
  }
}

// ============================================
// RANK
// ============================================

/**
 * Estimate the rank of a matrix using Gaussian elimination
 * @param aPtr - Pointer to input matrix (rows x cols)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param tol - Tolerance for zero detection
 * @param workPtr - Pointer to work buffer (rows * cols f64 values)
 * @returns Estimated rank
 */
export function rank(aPtr: usize, rows: i32, cols: i32, tol: f64, workPtr: usize): i32 {
  // Copy matrix to work buffer
  const size = rows * cols
  for (let i: i32 = 0; i < size; i++) {
    store<f64>(workPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>i << 3)))
  }

  let r: i32 = 0
  const minDim: i32 = rows < cols ? rows : cols

  for (let k: i32 = 0; k < minDim; k++) {
    // Find pivot
    let maxVal: f64 = 0.0
    let pivotRow: i32 = -1

    for (let i: i32 = r; i < rows; i++) {
      const val: f64 = Math.abs(load<f64>(workPtr + (<usize>(i * cols + k) << 3)))
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    if (maxVal <= tol) {
      continue // Skip this column
    }

    // Swap rows
    if (pivotRow !== r) {
      for (let j: i32 = 0; j < cols; j++) {
        const rIdx = <usize>(r * cols + j) << 3
        const pIdx = <usize>(pivotRow * cols + j) << 3
        const temp: f64 = load<f64>(workPtr + rIdx)
        store<f64>(workPtr + rIdx, load<f64>(workPtr + pIdx))
        store<f64>(workPtr + pIdx, temp)
      }
    }

    // Eliminate
    const pivot: f64 = load<f64>(workPtr + (<usize>(r * cols + k) << 3))
    for (let i: i32 = r + 1; i < rows; i++) {
      const factor: f64 = load<f64>(workPtr + (<usize>(i * cols + k) << 3)) / pivot
      for (let j: i32 = k; j < cols; j++) {
        const idx = <usize>(i * cols + j) << 3
        store<f64>(workPtr + idx, load<f64>(workPtr + idx) - factor * load<f64>(workPtr + (<usize>(r * cols + j) << 3)))
      }
    }

    r++
  }

  return r
}

// ============================================
// SOLVE LINEAR SYSTEM
// ============================================

/**
 * Solve a linear system Ax = b using LU decomposition
 * @param aPtr - Pointer to coefficient matrix (n x n)
 * @param bPtr - Pointer to right-hand side (n)
 * @param n - Size
 * @param resultPtr - Pointer to solution vector (n)
 * @param workPtr - Pointer to work buffer (n*n + n for LU and perm)
 * @returns 1 if successful, 0 if singular
 */
export function solve(aPtr: usize, bPtr: usize, n: i32, resultPtr: usize, workPtr: usize): i32 {
  const luPtr = workPtr
  const permPtr = workPtr + (<usize>(n * n) << 3)

  // Copy A to LU
  for (let i: i32 = 0; i < n * n; i++) {
    store<f64>(luPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>i << 3)))
  }

  // Initialize permutation
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(permPtr + (<usize>i << 2), i)
  }

  // LU decomposition with partial pivoting
  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxVal: f64 = Math.abs(load<f64>(luPtr + (<usize>(k * n + k) << 3)))
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(load<f64>(luPtr + (<usize>(i * n + k) << 3)))
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    if (maxVal < 1e-14) {
      return 0 // Singular
    }

    if (pivotRow !== k) {
      // Swap rows in LU
      for (let j: i32 = 0; j < n; j++) {
        const kIdx = <usize>(k * n + j) << 3
        const pIdx = <usize>(pivotRow * n + j) << 3
        const temp: f64 = load<f64>(luPtr + kIdx)
        store<f64>(luPtr + kIdx, load<f64>(luPtr + pIdx))
        store<f64>(luPtr + pIdx, temp)
      }

      // Swap in permutation
      const kPermIdx = <usize>k << 2
      const pPermIdx = <usize>pivotRow << 2
      const tempP: i32 = load<i32>(permPtr + kPermIdx)
      store<i32>(permPtr + kPermIdx, load<i32>(permPtr + pPermIdx))
      store<i32>(permPtr + pPermIdx, tempP)
    }

    // Eliminate
    const pivot: f64 = load<f64>(luPtr + (<usize>(k * n + k) << 3))
    for (let i: i32 = k + 1; i < n; i++) {
      const factorIdx = <usize>(i * n + k) << 3
      const factor: f64 = load<f64>(luPtr + factorIdx) / pivot
      store<f64>(luPtr + factorIdx, factor)

      for (let j: i32 = k + 1; j < n; j++) {
        const idx = <usize>(i * n + j) << 3
        store<f64>(luPtr + idx, load<f64>(luPtr + idx) - factor * load<f64>(luPtr + (<usize>(k * n + j) << 3)))
      }
    }
  }

  // Check last pivot for singularity
  if (Math.abs(load<f64>(luPtr + (<usize>((n - 1) * n + (n - 1)) << 3))) < 1e-14) {
    return 0 // Singular
  }

  // Forward substitution: Ly = Pb
  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = load<f64>(bPtr + (<usize>load<i32>(permPtr + (<usize>i << 2)) << 3))

    for (let j: i32 = 0; j < i; j++) {
      sum -= load<f64>(luPtr + (<usize>(i * n + j) << 3)) * load<f64>(resultPtr + (<usize>j << 3))
    }

    store<f64>(resultPtr + (<usize>i << 3), sum)
  }

  // Backward substitution: Ux = y
  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = load<f64>(resultPtr + (<usize>i << 3))

    for (let j: i32 = i + 1; j < n; j++) {
      sum -= load<f64>(luPtr + (<usize>(i * n + j) << 3)) * load<f64>(resultPtr + (<usize>j << 3))
    }

    store<f64>(resultPtr + (<usize>i << 3), sum / load<f64>(luPtr + (<usize>(i * n + i) << 3)))
  }

  return 1
}

// ============================================
// OPTIMIZED 2x2 INVERSE
// ============================================

/**
 * Compute the inverse of a 2x2 matrix using direct formula
 * @param aPtr - Pointer to input matrix (2x2, row-major)
 * @param resultPtr - Pointer to output matrix (2x2)
 * @returns 1 if successful, 0 if singular
 */
export function inv2x2(aPtr: usize, resultPtr: usize): i32 {
  const a = load<f64>(aPtr)
  const b = load<f64>(aPtr + 8)
  const c = load<f64>(aPtr + 16)
  const d = load<f64>(aPtr + 24)

  const det = a * d - b * c

  if (Math.abs(det) < 1e-14) {
    return 0 // Singular
  }

  const invDet = 1.0 / det

  store<f64>(resultPtr, d * invDet)
  store<f64>(resultPtr + 8, -b * invDet)
  store<f64>(resultPtr + 16, -c * invDet)
  store<f64>(resultPtr + 24, a * invDet)

  return 1
}

// ============================================
// OPTIMIZED 3x3 INVERSE
// ============================================

/**
 * Compute the inverse of a 3x3 matrix using direct formula (cofactors)
 * @param aPtr - Pointer to input matrix (3x3, row-major)
 * @param resultPtr - Pointer to output matrix (3x3)
 * @returns 1 if successful, 0 if singular
 */
export function inv3x3(aPtr: usize, resultPtr: usize): i32 {
  const a00 = load<f64>(aPtr)
  const a01 = load<f64>(aPtr + 8)
  const a02 = load<f64>(aPtr + 16)
  const a10 = load<f64>(aPtr + 24)
  const a11 = load<f64>(aPtr + 32)
  const a12 = load<f64>(aPtr + 40)
  const a20 = load<f64>(aPtr + 48)
  const a21 = load<f64>(aPtr + 56)
  const a22 = load<f64>(aPtr + 64)

  // Compute cofactors
  const c00 = a11 * a22 - a12 * a21
  const c01 = a12 * a20 - a10 * a22
  const c02 = a10 * a21 - a11 * a20
  const c10 = a02 * a21 - a01 * a22
  const c11 = a00 * a22 - a02 * a20
  const c12 = a01 * a20 - a00 * a21
  const c20 = a01 * a12 - a02 * a11
  const c21 = a02 * a10 - a00 * a12
  const c22 = a00 * a11 - a01 * a10

  // Determinant via first row expansion
  const det = a00 * c00 + a01 * c01 + a02 * c02

  if (Math.abs(det) < 1e-14) {
    return 0 // Singular
  }

  const invDet = 1.0 / det

  // Inverse is adjugate (transpose of cofactor) divided by determinant
  store<f64>(resultPtr, c00 * invDet)
  store<f64>(resultPtr + 8, c10 * invDet)
  store<f64>(resultPtr + 16, c20 * invDet)
  store<f64>(resultPtr + 24, c01 * invDet)
  store<f64>(resultPtr + 32, c11 * invDet)
  store<f64>(resultPtr + 40, c21 * invDet)
  store<f64>(resultPtr + 48, c02 * invDet)
  store<f64>(resultPtr + 56, c12 * invDet)
  store<f64>(resultPtr + 64, c22 * invDet)

  return 1
}

// ============================================
// CONDITION NUMBER
// ============================================

/**
 * Compute the condition number of a matrix using 1-norm
 * cond1(A) = ||A||_1 * ||A^(-1)||_1
 * @param aPtr - Pointer to input matrix (n x n)
 * @param n - Size of the matrix
 * @param workPtr - Work buffer: n*2n for inv + n*n for invA storage
 * @returns Condition number (Infinity if singular)
 */
export function cond1(aPtr: usize, n: i32, workPtr: usize): f64 {
  const invAPtr = workPtr
  const invWorkPtr = workPtr + (<usize>(n * n) << 3)

  // Compute ||A||_1
  const normA = matrixNorm1(aPtr, n, n)

  // Compute inverse
  const success = inv(aPtr, n, invAPtr, invWorkPtr)
  if (success === 0) {
    return f64.POSITIVE_INFINITY
  }

  // Compute ||A^(-1)||_1
  const normAinv = matrixNorm1(invAPtr, n, n)

  return normA * normAinv
}

/**
 * Compute the condition number of a matrix using infinity-norm
 * condInf(A) = ||A||_inf * ||A^(-1)||_inf
 * @param aPtr - Pointer to input matrix (n x n)
 * @param n - Size of the matrix
 * @param workPtr - Work buffer: n*2n for inv + n*n for invA storage
 * @returns Condition number (Infinity if singular)
 */
export function condInf(aPtr: usize, n: i32, workPtr: usize): f64 {
  const invAPtr = workPtr
  const invWorkPtr = workPtr + (<usize>(n * n) << 3)

  // Compute ||A||_inf
  const normA = matrixNormInf(aPtr, n, n)

  // Compute inverse
  const success = inv(aPtr, n, invAPtr, invWorkPtr)
  if (success === 0) {
    return f64.POSITIVE_INFINITY
  }

  // Compute ||A^(-1)||_inf
  const normAinv = matrixNormInf(invAPtr, n, n)

  return normA * normAinv
}
