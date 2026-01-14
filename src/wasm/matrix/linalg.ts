/**
 * WASM-optimized linear algebra operations using AssemblyScript
 *
 * Includes: determinant, inverse, norms, Kronecker product, cross product
 * All matrices are flat Float64Array in row-major order
 */

// ============================================
// DETERMINANT
// ============================================

/**
 * Compute the determinant of a square matrix using LU decomposition
 * @param a - Input matrix (n x n, row-major)
 * @param n - Size of the matrix
 * @returns Determinant value
 */
export function det(a: Float64Array, n: i32): f64 {
  if (n === 1) {
    return a[0]
  }

  if (n === 2) {
    return a[0] * a[3] - a[1] * a[2]
  }

  if (n === 3) {
    // Sarrus' rule for 3x3
    return (
      a[0] * a[4] * a[8] +
      a[1] * a[5] * a[6] +
      a[2] * a[3] * a[7] -
      a[2] * a[4] * a[6] -
      a[1] * a[3] * a[8] -
      a[0] * a[5] * a[7]
    )
  }

  // LU decomposition for larger matrices
  const lu = new Float64Array(n * n)
  for (let i: i32 = 0; i < n * n; i++) {
    lu[i] = a[i]
  }

  let sign: f64 = 1.0

  // Gaussian elimination with partial pivoting
  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxVal: f64 = Math.abs(lu[k * n + k])
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(lu[i * n + k])
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
        const temp: f64 = lu[k * n + j]
        lu[k * n + j] = lu[pivotRow * n + j]
        lu[pivotRow * n + j] = temp
      }
      sign = -sign
    }

    // Eliminate column
    const pivot: f64 = lu[k * n + k]
    for (let i: i32 = k + 1; i < n; i++) {
      const factor: f64 = lu[i * n + k] / pivot

      for (let j: i32 = k + 1; j < n; j++) {
        lu[i * n + j] -= factor * lu[k * n + j]
      }
    }
  }

  // Product of diagonal
  let result: f64 = sign
  for (let i: i32 = 0; i < n; i++) {
    result *= lu[i * n + i]
  }

  return result
}

// ============================================
// MATRIX INVERSE
// ============================================

/**
 * Compute the inverse of a square matrix using Gauss-Jordan elimination
 * @param a - Input matrix (n x n, row-major)
 * @param n - Size of the matrix
 * @returns Inverse matrix, or empty array if singular
 */
export function inv(a: Float64Array, n: i32): Float64Array {
  // Create augmented matrix [A | I]
  const aug = new Float64Array(n * n * 2)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      aug[i * (2 * n) + j] = a[i * n + j]
      aug[i * (2 * n) + n + j] = i === j ? 1.0 : 0.0
    }
  }

  const width: i32 = 2 * n

  // Forward elimination with partial pivoting
  for (let k: i32 = 0; k < n; k++) {
    // Find pivot
    let maxVal: f64 = Math.abs(aug[k * width + k])
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(aug[i * width + k])
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    // Check for singularity
    if (maxVal < 1e-14) {
      return new Float64Array(0) // Singular matrix
    }

    // Swap rows if necessary
    if (pivotRow !== k) {
      for (let j: i32 = 0; j < width; j++) {
        const temp: f64 = aug[k * width + j]
        aug[k * width + j] = aug[pivotRow * width + j]
        aug[pivotRow * width + j] = temp
      }
    }

    // Scale pivot row
    const pivot: f64 = aug[k * width + k]
    for (let j: i32 = 0; j < width; j++) {
      aug[k * width + j] /= pivot
    }

    // Eliminate column
    for (let i: i32 = 0; i < n; i++) {
      if (i !== k) {
        const factor: f64 = aug[i * width + k]
        for (let j: i32 = 0; j < width; j++) {
          aug[i * width + j] -= factor * aug[k * width + j]
        }
      }
    }
  }

  // Extract inverse from right half
  const result = new Float64Array(n * n)
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      result[i * n + j] = aug[i * width + n + j]
    }
  }

  return result
}

/**
 * Compute inverse of a 2x2 matrix (optimized)
 * @param a - Input 2x2 matrix
 * @returns Inverse matrix
 */
export function inv2x2(a: Float64Array): Float64Array {
  const det: f64 = a[0] * a[3] - a[1] * a[2]

  if (Math.abs(det) < 1e-14) {
    return new Float64Array(0) // Singular
  }

  const invDet: f64 = 1.0 / det
  const result = new Float64Array(4)

  result[0] = a[3] * invDet
  result[1] = -a[1] * invDet
  result[2] = -a[2] * invDet
  result[3] = a[0] * invDet

  return result
}

/**
 * Compute inverse of a 3x3 matrix (optimized)
 * @param a - Input 3x3 matrix
 * @returns Inverse matrix
 */
export function inv3x3(a: Float64Array): Float64Array {
  const det: f64 =
    a[0] * (a[4] * a[8] - a[5] * a[7]) -
    a[1] * (a[3] * a[8] - a[5] * a[6]) +
    a[2] * (a[3] * a[7] - a[4] * a[6])

  if (Math.abs(det) < 1e-14) {
    return new Float64Array(0) // Singular
  }

  const invDet: f64 = 1.0 / det
  const result = new Float64Array(9)

  result[0] = (a[4] * a[8] - a[5] * a[7]) * invDet
  result[1] = (a[2] * a[7] - a[1] * a[8]) * invDet
  result[2] = (a[1] * a[5] - a[2] * a[4]) * invDet
  result[3] = (a[5] * a[6] - a[3] * a[8]) * invDet
  result[4] = (a[0] * a[8] - a[2] * a[6]) * invDet
  result[5] = (a[2] * a[3] - a[0] * a[5]) * invDet
  result[6] = (a[3] * a[7] - a[4] * a[6]) * invDet
  result[7] = (a[1] * a[6] - a[0] * a[7]) * invDet
  result[8] = (a[0] * a[4] - a[1] * a[3]) * invDet

  return result
}

// ============================================
// VECTOR AND MATRIX NORMS
// ============================================

/**
 * Compute the L1 norm (sum of absolute values) of a vector
 * @param x - Input vector
 * @param n - Length
 * @returns L1 norm
 */
export function norm1(x: Float64Array, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += Math.abs(x[i])
  }

  return sum
}

/**
 * Compute the L2 norm (Euclidean norm) of a vector
 * @param x - Input vector
 * @param n - Length
 * @returns L2 norm
 */
export function norm2(x: Float64Array, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += x[i] * x[i]
  }

  return Math.sqrt(sum)
}

/**
 * Compute the Lp norm of a vector
 * @param x - Input vector
 * @param n - Length
 * @param p - Norm order (p >= 1)
 * @returns Lp norm
 */
export function normP(x: Float64Array, n: i32, p: f64): f64 {
  if (p === 1.0) {
    return norm1(x, n)
  }

  if (p === 2.0) {
    return norm2(x, n)
  }

  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += Math.pow(Math.abs(x[i]), p)
  }

  return Math.pow(sum, 1.0 / p)
}

/**
 * Compute the infinity norm (max absolute value) of a vector
 * @param x - Input vector
 * @param n - Length
 * @returns Infinity norm
 */
export function normInf(x: Float64Array, n: i32): f64 {
  let maxVal: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const absVal: f64 = Math.abs(x[i])
    if (absVal > maxVal) {
      maxVal = absVal
    }
  }

  return maxVal
}

/**
 * Compute the Frobenius norm of a matrix
 * @param a - Input matrix
 * @param size - Total number of elements
 * @returns Frobenius norm
 */
export function normFro(a: Float64Array, size: i32): f64 {
  return norm2(a, size)
}

/**
 * Compute the 1-norm (max column sum) of a matrix
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Matrix 1-norm
 */
export function matrixNorm1(a: Float64Array, rows: i32, cols: i32): f64 {
  let maxColSum: f64 = 0.0

  for (let j: i32 = 0; j < cols; j++) {
    let colSum: f64 = 0.0

    for (let i: i32 = 0; i < rows; i++) {
      colSum += Math.abs(a[i * cols + j])
    }

    if (colSum > maxColSum) {
      maxColSum = colSum
    }
  }

  return maxColSum
}

/**
 * Compute the infinity-norm (max row sum) of a matrix
 * @param a - Input matrix (row-major)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Matrix infinity-norm
 */
export function matrixNormInf(a: Float64Array, rows: i32, cols: i32): f64 {
  let maxRowSum: f64 = 0.0

  for (let i: i32 = 0; i < rows; i++) {
    let rowSum: f64 = 0.0

    for (let j: i32 = 0; j < cols; j++) {
      rowSum += Math.abs(a[i * cols + j])
    }

    if (rowSum > maxRowSum) {
      maxRowSum = rowSum
    }
  }

  return maxRowSum
}

/**
 * Normalize a vector to unit length
 * @param x - Input vector
 * @param n - Length
 * @returns Normalized vector
 */
export function normalize(x: Float64Array, n: i32): Float64Array {
  const norm: f64 = norm2(x, n)

  if (norm < 1e-14) {
    return new Float64Array(n) // Return zeros if norm is too small
  }

  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = x[i] / norm
  }

  return result
}

// ============================================
// KRONECKER PRODUCT
// ============================================

/**
 * Compute the Kronecker product of two matrices: C = A ⊗ B
 * @param a - First matrix (m x n, row-major)
 * @param aRows - Rows in A
 * @param aCols - Columns in A
 * @param b - Second matrix (p x q, row-major)
 * @param bRows - Rows in B
 * @param bCols - Columns in B
 * @returns Kronecker product (m*p x n*q)
 */
export function kron(
  a: Float64Array,
  aRows: i32,
  aCols: i32,
  b: Float64Array,
  bRows: i32,
  bCols: i32
): Float64Array {
  const resultRows: i32 = aRows * bRows
  const resultCols: i32 = aCols * bCols
  const result = new Float64Array(resultRows * resultCols)

  for (let i: i32 = 0; i < aRows; i++) {
    for (let j: i32 = 0; j < aCols; j++) {
      const aVal: f64 = a[i * aCols + j]

      for (let k: i32 = 0; k < bRows; k++) {
        for (let l: i32 = 0; l < bCols; l++) {
          const row: i32 = i * bRows + k
          const col: i32 = j * bCols + l
          result[row * resultCols + col] = aVal * b[k * bCols + l]
        }
      }
    }
  }

  return result
}

// ============================================
// CROSS PRODUCT
// ============================================

/**
 * Compute the cross product of two 3D vectors
 * @param a - First vector (length 3)
 * @param b - Second vector (length 3)
 * @returns Cross product (length 3)
 */
export function cross(a: Float64Array, b: Float64Array): Float64Array {
  const result = new Float64Array(3)

  result[0] = a[1] * b[2] - a[2] * b[1]
  result[1] = a[2] * b[0] - a[0] * b[2]
  result[2] = a[0] * b[1] - a[1] * b[0]

  return result
}

/**
 * Compute the dot product of two vectors
 * @param a - First vector
 * @param b - Second vector
 * @param n - Length
 * @returns Dot product
 */
export function dot(a: Float64Array, b: Float64Array, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += a[i] * b[i]
  }

  return sum
}

// ============================================
// OUTER PRODUCT
// ============================================

/**
 * Compute the outer product of two vectors: C = a * b^T
 * @param a - First vector (length m)
 * @param m - Length of a
 * @param b - Second vector (length n)
 * @param n - Length of b
 * @returns Outer product (m x n matrix)
 */
export function outer(
  a: Float64Array,
  m: i32,
  b: Float64Array,
  n: i32
): Float64Array {
  const result = new Float64Array(m * n)

  for (let i: i32 = 0; i < m; i++) {
    for (let j: i32 = 0; j < n; j++) {
      result[i * n + j] = a[i] * b[j]
    }
  }

  return result
}

// ============================================
// CONDITION NUMBER
// ============================================

/**
 * Estimate the condition number using 1-norm
 * cond(A) = ||A||_1 * ||A^-1||_1
 * @param a - Input matrix (n x n)
 * @param n - Size
 * @returns Condition number estimate, or Infinity if singular
 */
export function cond1(a: Float64Array, n: i32): f64 {
  const aInv = inv(a, n)

  if (aInv.length === 0) {
    return Infinity // Singular
  }

  const normA: f64 = matrixNorm1(a, n, n)
  const normAInv: f64 = matrixNorm1(aInv, n, n)

  return normA * normAInv
}

/**
 * Estimate the condition number using infinity-norm
 * @param a - Input matrix (n x n)
 * @param n - Size
 * @returns Condition number estimate, or Infinity if singular
 */
export function condInf(a: Float64Array, n: i32): f64 {
  const aInv = inv(a, n)

  if (aInv.length === 0) {
    return Infinity // Singular
  }

  const normA: f64 = matrixNormInf(a, n, n)
  const normAInv: f64 = matrixNormInf(aInv, n, n)

  return normA * normAInv
}

// ============================================
// RANK
// ============================================

/**
 * Estimate the rank of a matrix using Gaussian elimination
 * @param a - Input matrix (rows x cols)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param tol - Tolerance for zero detection
 * @returns Estimated rank
 */
export function rank(
  a: Float64Array,
  rows: i32,
  cols: i32,
  tol: f64
): i32 {
  // Copy matrix
  const work = new Float64Array(rows * cols)
  for (let i: i32 = 0; i < rows * cols; i++) {
    work[i] = a[i]
  }

  let r: i32 = 0
  const minDim: i32 = rows < cols ? rows : cols

  for (let k: i32 = 0; k < minDim; k++) {
    // Find pivot
    let maxVal: f64 = 0.0
    let pivotRow: i32 = -1

    for (let i: i32 = r; i < rows; i++) {
      const val: f64 = Math.abs(work[i * cols + k])
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
        const temp: f64 = work[r * cols + j]
        work[r * cols + j] = work[pivotRow * cols + j]
        work[pivotRow * cols + j] = temp
      }
    }

    // Eliminate
    const pivot: f64 = work[r * cols + k]
    for (let i: i32 = r + 1; i < rows; i++) {
      const factor: f64 = work[i * cols + k] / pivot
      for (let j: i32 = k; j < cols; j++) {
        work[i * cols + j] -= factor * work[r * cols + j]
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
 * @param a - Coefficient matrix (n x n)
 * @param b - Right-hand side (n)
 * @param n - Size
 * @returns Solution vector x, or empty if singular
 */
export function solve(a: Float64Array, b: Float64Array, n: i32): Float64Array {
  // LU decomposition with partial pivoting
  const lu = new Float64Array(n * n)
  const perm = new Int32Array(n)

  for (let i: i32 = 0; i < n * n; i++) {
    lu[i] = a[i]
  }

  for (let i: i32 = 0; i < n; i++) {
    perm[i] = i
  }

  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxVal: f64 = Math.abs(lu[k * n + k])
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(lu[i * n + k])
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    if (maxVal < 1e-14) {
      return new Float64Array(0) // Singular
    }

    if (pivotRow !== k) {
      // Swap rows in LU
      for (let j: i32 = 0; j < n; j++) {
        const temp: f64 = lu[k * n + j]
        lu[k * n + j] = lu[pivotRow * n + j]
        lu[pivotRow * n + j] = temp
      }

      // Swap in permutation
      const tempP: i32 = perm[k]
      perm[k] = perm[pivotRow]
      perm[pivotRow] = tempP
    }

    // Eliminate
    const pivot: f64 = lu[k * n + k]
    for (let i: i32 = k + 1; i < n; i++) {
      const factor: f64 = lu[i * n + k] / pivot
      lu[i * n + k] = factor

      for (let j: i32 = k + 1; j < n; j++) {
        lu[i * n + j] -= factor * lu[k * n + j]
      }
    }
  }

  // Check last pivot for singularity
  if (Math.abs(lu[(n - 1) * n + (n - 1)]) < 1e-14) {
    return new Float64Array(0) // Singular
  }

  // Forward substitution: Ly = Pb
  const x = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = b[perm[i]]

    for (let j: i32 = 0; j < i; j++) {
      sum -= lu[i * n + j] * x[j]
    }

    x[i] = sum
  }

  // Backward substitution: Ux = y
  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = x[i]

    for (let j: i32 = i + 1; j < n; j++) {
      sum -= lu[i * n + j] * x[j]
    }

    x[i] = sum / lu[i * n + i]
  }

  return x
}
