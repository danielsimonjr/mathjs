/**
 * WASM-optimized linear algebra decompositions
 * LU, QR, and Cholesky decompositions for high-performance computing
 *
 * All functions return new arrays for proper WASM/JS interop
 */

/**
 * Result of LU decomposition
 */
class LUResult {
  lu: Float64Array
  perm: Int32Array
  singular: bool

  constructor(lu: Float64Array, perm: Int32Array, singular: bool) {
    this.lu = lu
    this.perm = perm
    this.singular = singular
  }
}

/**
 * Result of QR decomposition
 */
class QRResult {
  q: Float64Array
  r: Float64Array

  constructor(q: Float64Array, r: Float64Array) {
    this.q = q
    this.r = r
  }
}

/**
 * Result of Cholesky decomposition
 */
class CholeskyResult {
  l: Float64Array
  success: bool

  constructor(l: Float64Array, success: bool) {
    this.l = l
    this.success = success
  }
}

/**
 * LU Decomposition with partial pivoting: PA = LU
 * @param a - Input matrix (n x n, row-major)
 * @param n - Size of the square matrix
 * @returns LU matrix, permutation vector, and singular flag
 */
export function luDecomposition(
  a: Float64Array,
  n: i32
): LUResult {
  // Copy input to output
  const lu = new Float64Array(n * n)
  for (let i: i32 = 0; i < n * n; i++) {
    lu[i] = a[i]
  }

  const perm = new Int32Array(n)

  // Initialize permutation vector
  for (let i: i32 = 0; i < n; i++) {
    perm[i] = i
  }

  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxVal: f64 = abs(lu[k * n + k])
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = abs(lu[i * n + k])
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    // Check for singularity
    if (maxVal < 1e-14) {
      return new LUResult(lu, perm, true) // Singular matrix
    }

    // Swap rows if necessary
    if (pivotRow !== k) {
      swapRows(lu, n, k, pivotRow)
      const temp: i32 = perm[k]
      perm[k] = perm[pivotRow]
      perm[pivotRow] = temp
    }

    // Eliminate column
    const pivot: f64 = lu[k * n + k]
    for (let i: i32 = k + 1; i < n; i++) {
      const factor: f64 = lu[i * n + k] / pivot
      lu[i * n + k] = factor // Store L factor

      for (let j: i32 = k + 1; j < n; j++) {
        lu[i * n + j] -= factor * lu[k * n + j]
      }
    }
  }

  return new LUResult(lu, perm, false) // Success
}

/**
 * Get LU matrix from decomposition result
 */
export function getLUMatrix(result: LUResult): Float64Array {
  return result.lu
}

/**
 * Get permutation from decomposition result
 */
export function getLUPerm(result: LUResult): Int32Array {
  return result.perm
}

/**
 * Check if LU decomposition found singular matrix
 */
export function isLUSingular(result: LUResult): bool {
  return result.singular
}

/**
 * QR Decomposition using Householder reflections
 * @param a - Input matrix (m x n)
 * @param m - Number of rows
 * @param n - Number of columns
 * @returns Q matrix (m x m, orthogonal) and R matrix (m x n, upper triangular)
 */
export function qrDecomposition(
  a: Float64Array,
  m: i32,
  n: i32
): QRResult {
  // Copy a to r
  const r = new Float64Array(m * n)
  for (let i: i32 = 0; i < m * n; i++) {
    r[i] = a[i]
  }

  // Initialize Q as identity matrix
  const q = new Float64Array(m * m)
  for (let i: i32 = 0; i < m; i++) {
    for (let j: i32 = 0; j < m; j++) {
      q[i * m + j] = i === j ? 1.0 : 0.0
    }
  }

  const minDim: i32 = m < n ? m : n

  for (let k: i32 = 0; k < minDim; k++) {
    // Compute Householder vector
    let norm: f64 = 0.0
    for (let i: i32 = k; i < m; i++) {
      const val: f64 = r[i * n + k]
      norm += val * val
    }
    norm = sqrt(norm)

    if (norm < 1e-14) continue

    const sign: f64 = r[k * n + k] >= 0.0 ? 1.0 : -1.0
    const u1: f64 = r[k * n + k] + sign * norm

    // Store Householder vector in v (temporary)
    const vSize: i32 = m - k
    const v: Float64Array = new Float64Array(vSize)
    v[0] = 1.0
    for (let i: i32 = 1; i < vSize; i++) {
      v[i] = r[(k + i) * n + k] / u1
    }

    // Compute 2 / (v^T * v)
    let vDotV: f64 = 0.0
    for (let i: i32 = 0; i < vSize; i++) {
      vDotV += v[i] * v[i]
    }
    const tau: f64 = 2.0 / vDotV

    // Apply Householder reflection to R
    for (let j: i32 = k; j < n; j++) {
      let vDotCol: f64 = 0.0
      for (let i: i32 = 0; i < vSize; i++) {
        vDotCol += v[i] * r[(k + i) * n + j]
      }

      const factor: f64 = tau * vDotCol
      for (let i: i32 = 0; i < vSize; i++) {
        r[(k + i) * n + j] -= factor * v[i]
      }
    }

    // Apply Householder reflection to Q
    for (let j: i32 = 0; j < m; j++) {
      let vDotCol: f64 = 0.0
      for (let i: i32 = 0; i < vSize; i++) {
        vDotCol += v[i] * q[(k + i) * m + j]
      }

      const factor: f64 = tau * vDotCol
      for (let i: i32 = 0; i < vSize; i++) {
        q[(k + i) * m + j] -= factor * v[i]
      }
    }
  }

  return new QRResult(q, r)
}

/**
 * Get Q matrix from QR result
 */
export function getQMatrix(result: QRResult): Float64Array {
  return result.q
}

/**
 * Get R matrix from QR result
 */
export function getRMatrix(result: QRResult): Float64Array {
  return result.r
}

/**
 * Cholesky Decomposition: A = L * L^T
 * For symmetric positive-definite matrices
 * @param a - Input matrix (symmetric, positive-definite, n x n)
 * @param n - Size of the matrix
 * @returns Lower triangular matrix L and success flag
 */
export function choleskyDecomposition(
  a: Float64Array,
  n: i32
): CholeskyResult {
  // Initialize L to zero
  const l = new Float64Array(n * n)
  for (let i: i32 = 0; i < n * n; i++) {
    l[i] = 0.0
  }

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j <= i; j++) {
      let sum: f64 = a[i * n + j]

      for (let k: i32 = 0; k < j; k++) {
        sum -= l[i * n + k] * l[j * n + k]
      }

      if (i === j) {
        if (sum <= 0.0) {
          return new CholeskyResult(l, false) // Not positive-definite
        }
        l[i * n + j] = sqrt(sum)
      } else {
        l[i * n + j] = sum / l[j * n + j]
      }
    }
  }

  return new CholeskyResult(l, true) // Success
}

/**
 * Get L matrix from Cholesky result
 */
export function getCholeskyL(result: CholeskyResult): Float64Array {
  return result.l
}

/**
 * Check if Cholesky succeeded
 */
export function isCholeskySuccess(result: CholeskyResult): bool {
  return result.success
}

/**
 * Solve linear system using LU decomposition: Ax = b
 * @param lu - LU decomposition of A
 * @param n - Size of the system
 * @param perm - Permutation vector from LU decomposition
 * @param b - Right-hand side vector
 * @returns Solution vector x
 */
export function luSolve(
  lu: Float64Array,
  n: i32,
  perm: Int32Array,
  b: Float64Array
): Float64Array {
  const x = new Float64Array(n)

  // Forward substitution: Ly = Pb
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

/**
 * Compute determinant from LU decomposition
 */
export function luDeterminant(
  lu: Float64Array,
  n: i32,
  perm: Int32Array
): f64 {
  let det: f64 = 1.0

  // Product of diagonal elements
  for (let i: i32 = 0; i < n; i++) {
    det *= lu[i * n + i]
  }

  // Account for row swaps
  let swaps: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (perm[i] !== i) swaps++
  }

  return swaps % 2 === 0 ? det : -det
}

// Helper functions

@inline
function abs(x: f64): f64 {
  return x >= 0.0 ? x : -x
}

@inline
function sqrt(x: f64): f64 {
  return Math.sqrt(x)
}

function swapRows(a: Float64Array, n: i32, row1: i32, row2: i32): void {
  for (let j: i32 = 0; j < n; j++) {
    const temp: f64 = a[row1 * n + j]
    a[row1 * n + j] = a[row2 * n + j]
    a[row2 * n + j] = temp
  }
}
