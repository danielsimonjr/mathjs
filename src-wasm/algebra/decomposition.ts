/**
 * WASM-optimized linear algebra decompositions
 * LU, QR, and Cholesky decompositions for high-performance computing
 */

/**
 * LU Decomposition with partial pivoting: PA = LU
 * @param a - Input matrix (will be modified in-place)
 * @param n - Size of the square matrix
 * @param perm - Permutation vector (output)
 * @returns 1 if successful, 0 if matrix is singular
 */
export function luDecomposition(
  a: Float64Array,
  n: i32,
  perm: Int32Array
): i32 {
  // Initialize permutation vector
  for (let i: i32 = 0; i < n; i++) {
    perm[i] = i
  }

  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxVal: f64 = abs(a[k * n + k])
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = abs(a[i * n + k])
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
      swapRows(a, n, k, pivotRow)
      const temp: i32 = perm[k]
      perm[k] = perm[pivotRow]
      perm[pivotRow] = temp
    }

    // Eliminate column
    const pivot: f64 = a[k * n + k]
    for (let i: i32 = k + 1; i < n; i++) {
      const factor: f64 = a[i * n + k] / pivot
      a[i * n + k] = factor // Store L factor

      for (let j: i32 = k + 1; j < n; j++) {
        a[i * n + j] -= factor * a[k * n + j]
      }
    }
  }

  return 1 // Success
}

/**
 * QR Decomposition using Householder reflections
 * @param a - Input matrix (m x n)
 * @param m - Number of rows
 * @param n - Number of columns
 * @param q - Output Q matrix (m x m, orthogonal)
 * @param r - Output R matrix (m x n, upper triangular)
 */
export function qrDecomposition(
  a: Float64Array,
  m: i32,
  n: i32,
  q: Float64Array,
  r: Float64Array
): void {
  // Copy a to r
  for (let i: i32 = 0; i < m * n; i++) {
    r[i] = a[i]
  }

  // Initialize Q as identity matrix
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
}

/**
 * Cholesky Decomposition: A = L * L^T
 * For symmetric positive-definite matrices
 * @param a - Input matrix (symmetric, positive-definite, n x n)
 * @param n - Size of the matrix
 * @param l - Output lower triangular matrix L
 * @returns 1 if successful, 0 if matrix is not positive-definite
 */
export function choleskyDecomposition(
  a: Float64Array,
  n: i32,
  l: Float64Array
): i32 {
  // Initialize L to zero
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
          return 0 // Not positive-definite
        }
        l[i * n + j] = sqrt(sum)
      } else {
        l[i * n + j] = sum / l[j * n + j]
      }
    }
  }

  return 1 // Success
}

/**
 * Solve linear system using LU decomposition: Ax = b
 * @param lu - LU decomposition of A
 * @param n - Size of the system
 * @param perm - Permutation vector from LU decomposition
 * @param b - Right-hand side vector
 * @param x - Solution vector (output)
 */
export function luSolve(
  lu: Float64Array,
  n: i32,
  perm: Int32Array,
  b: Float64Array,
  x: Float64Array
): void {
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
