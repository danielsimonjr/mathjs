/**
 * WASM-optimized triangular system solvers
 * using AssemblyScript
 *
 * Solves lower and upper triangular systems efficiently
 */

/**
 * Solve a lower triangular system Lx = b
 * L is assumed to be lower triangular with non-zero diagonal
 *
 * @param L - Lower triangular matrix (n x n, row-major)
 * @param b - Right-hand side vector (n)
 * @param n - Size of the system
 * @returns Solution vector x
 */
export function lsolve(L: Float64Array, b: Float64Array, n: i32): Float64Array {
  const x = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = b[i]

    for (let j: i32 = 0; j < i; j++) {
      sum -= L[i * n + j] * x[j]
    }

    const diag: f64 = L[i * n + i]
    if (diag === 0.0) {
      // Singular matrix - return NaN in affected positions
      x[i] = f64.NaN
    } else {
      x[i] = sum / diag
    }
  }

  return x
}

/**
 * Solve a lower triangular system Lx = b with unit diagonal
 * L is assumed to be unit lower triangular (1s on diagonal)
 *
 * @param L - Unit lower triangular matrix (n x n, row-major)
 * @param b - Right-hand side vector (n)
 * @param n - Size of the system
 * @returns Solution vector x
 */
export function lsolveUnit(
  L: Float64Array,
  b: Float64Array,
  n: i32
): Float64Array {
  const x = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = b[i]

    for (let j: i32 = 0; j < i; j++) {
      sum -= L[i * n + j] * x[j]
    }

    x[i] = sum // Unit diagonal means no division
  }

  return x
}

/**
 * Solve an upper triangular system Ux = b
 * U is assumed to be upper triangular with non-zero diagonal
 *
 * @param U - Upper triangular matrix (n x n, row-major)
 * @param b - Right-hand side vector (n)
 * @param n - Size of the system
 * @returns Solution vector x
 */
export function usolve(U: Float64Array, b: Float64Array, n: i32): Float64Array {
  const x = new Float64Array(n)

  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = b[i]

    for (let j: i32 = i + 1; j < n; j++) {
      sum -= U[i * n + j] * x[j]
    }

    const diag: f64 = U[i * n + i]
    if (diag === 0.0) {
      // Singular matrix - return NaN in affected positions
      x[i] = f64.NaN
    } else {
      x[i] = sum / diag
    }
  }

  return x
}

/**
 * Solve an upper triangular system Ux = b with unit diagonal
 * U is assumed to be unit upper triangular (1s on diagonal)
 *
 * @param U - Unit upper triangular matrix (n x n, row-major)
 * @param b - Right-hand side vector (n)
 * @param n - Size of the system
 * @returns Solution vector x
 */
export function usolveUnit(
  U: Float64Array,
  b: Float64Array,
  n: i32
): Float64Array {
  const x = new Float64Array(n)

  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = b[i]

    for (let j: i32 = i + 1; j < n; j++) {
      sum -= U[i * n + j] * x[j]
    }

    x[i] = sum // Unit diagonal means no division
  }

  return x
}

/**
 * Solve a lower triangular system Lx = b for multiple right-hand sides
 *
 * @param L - Lower triangular matrix (n x n, row-major)
 * @param B - Right-hand side matrix (n x m, row-major, each column is a vector)
 * @param n - Number of rows/columns in L
 * @param m - Number of right-hand sides (columns in B)
 * @returns Solution matrix X (n x m)
 */
export function lsolveMultiple(
  L: Float64Array,
  B: Float64Array,
  n: i32,
  m: i32
): Float64Array {
  const X = new Float64Array(n * m)

  for (let k: i32 = 0; k < m; k++) {
    // Solve for column k
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = B[i * m + k]

      for (let j: i32 = 0; j < i; j++) {
        sum -= L[i * n + j] * X[j * m + k]
      }

      const diag: f64 = L[i * n + i]
      if (diag === 0.0) {
        X[i * m + k] = f64.NaN
      } else {
        X[i * m + k] = sum / diag
      }
    }
  }

  return X
}

/**
 * Solve an upper triangular system Ux = b for multiple right-hand sides
 *
 * @param U - Upper triangular matrix (n x n, row-major)
 * @param B - Right-hand side matrix (n x m, row-major, each column is a vector)
 * @param n - Number of rows/columns in U
 * @param m - Number of right-hand sides (columns in B)
 * @returns Solution matrix X (n x m)
 */
export function usolveMultiple(
  U: Float64Array,
  B: Float64Array,
  n: i32,
  m: i32
): Float64Array {
  const X = new Float64Array(n * m)

  for (let k: i32 = 0; k < m; k++) {
    // Solve for column k
    for (let i: i32 = n - 1; i >= 0; i--) {
      let sum: f64 = B[i * m + k]

      for (let j: i32 = i + 1; j < n; j++) {
        sum -= U[i * n + j] * X[j * m + k]
      }

      const diag: f64 = U[i * n + i]
      if (diag === 0.0) {
        X[i * m + k] = f64.NaN
      } else {
        X[i * m + k] = sum / diag
      }
    }
  }

  return X
}

/**
 * Check if a lower triangular system has a unique solution
 * Returns 1 if all diagonal elements are non-zero
 *
 * @param L - Lower triangular matrix (n x n)
 * @param n - Size of the matrix
 * @returns 1 if system has unique solution, 0 otherwise
 */
export function lsolveHasSolution(L: Float64Array, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (L[i * n + i] === 0.0) {
      return 0
    }
  }
  return 1
}

/**
 * Check if an upper triangular system has a unique solution
 * Returns 1 if all diagonal elements are non-zero
 *
 * @param U - Upper triangular matrix (n x n)
 * @param n - Size of the matrix
 * @returns 1 if system has unique solution, 0 otherwise
 */
export function usolveHasSolution(U: Float64Array, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (U[i * n + i] === 0.0) {
      return 0
    }
  }
  return 1
}

/**
 * Forward substitution for banded lower triangular matrix
 * Only accesses elements within the band for efficiency
 *
 * @param L - Banded lower triangular matrix (n x n, row-major)
 * @param b - Right-hand side vector (n)
 * @param n - Size of the system
 * @param bandwidth - Number of non-zero sub-diagonals
 * @returns Solution vector x
 */
export function lsolveBanded(
  L: Float64Array,
  b: Float64Array,
  n: i32,
  bandwidth: i32
): Float64Array {
  const x = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = b[i]
    const jStart: i32 = i - bandwidth > 0 ? i - bandwidth : 0

    for (let j: i32 = jStart; j < i; j++) {
      sum -= L[i * n + j] * x[j]
    }

    const diag: f64 = L[i * n + i]
    if (diag === 0.0) {
      x[i] = f64.NaN
    } else {
      x[i] = sum / diag
    }
  }

  return x
}

/**
 * Backward substitution for banded upper triangular matrix
 * Only accesses elements within the band for efficiency
 *
 * @param U - Banded upper triangular matrix (n x n, row-major)
 * @param b - Right-hand side vector (n)
 * @param n - Size of the system
 * @param bandwidth - Number of non-zero super-diagonals
 * @returns Solution vector x
 */
export function usolveBanded(
  U: Float64Array,
  b: Float64Array,
  n: i32,
  bandwidth: i32
): Float64Array {
  const x = new Float64Array(n)

  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = b[i]
    const jEnd: i32 = i + bandwidth + 1 < n ? i + bandwidth + 1 : n

    for (let j: i32 = i + 1; j < jEnd; j++) {
      sum -= U[i * n + j] * x[j]
    }

    const diag: f64 = U[i * n + i]
    if (diag === 0.0) {
      x[i] = f64.NaN
    } else {
      x[i] = sum / diag
    }
  }

  return x
}

/**
 * Solve tridiagonal system using Thomas algorithm
 * Ax = d where A is tridiagonal with diagonals a (sub), b (main), c (super)
 *
 * @param a - Sub-diagonal (n-1 elements, a[0] unused can be 0)
 * @param b - Main diagonal (n elements)
 * @param c - Super-diagonal (n-1 elements, c[n-1] unused can be 0)
 * @param d - Right-hand side (n elements)
 * @param n - Size of the system
 * @returns Solution vector x
 */
export function solveTridiagonal(
  a: Float64Array,
  b: Float64Array,
  c: Float64Array,
  d: Float64Array,
  n: i32
): Float64Array {
  // Modified coefficients
  const cPrime = new Float64Array(n)
  const dPrime = new Float64Array(n)
  const x = new Float64Array(n)

  // Forward sweep
  cPrime[0] = c[0] / b[0]
  dPrime[0] = d[0] / b[0]

  for (let i: i32 = 1; i < n; i++) {
    const denom: f64 = b[i] - a[i] * cPrime[i - 1]

    if (i < n - 1) {
      cPrime[i] = c[i] / denom
    }
    dPrime[i] = (d[i] - a[i] * dPrime[i - 1]) / denom
  }

  // Back substitution
  x[n - 1] = dPrime[n - 1]

  for (let i: i32 = n - 2; i >= 0; i--) {
    x[i] = dPrime[i] - cPrime[i] * x[i + 1]
  }

  return x
}

/**
 * Matrix-vector multiplication for triangular matrices
 * Computes y = Lx for lower triangular L
 *
 * @param L - Lower triangular matrix (n x n)
 * @param x - Input vector (n)
 * @param n - Size
 * @returns Result vector y
 */
export function lowerTriangularMV(
  L: Float64Array,
  x: Float64Array,
  n: i32
): Float64Array {
  const y = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = 0.0
    for (let j: i32 = 0; j <= i; j++) {
      sum += L[i * n + j] * x[j]
    }
    y[i] = sum
  }

  return y
}

/**
 * Matrix-vector multiplication for triangular matrices
 * Computes y = Ux for upper triangular U
 *
 * @param U - Upper triangular matrix (n x n)
 * @param x - Input vector (n)
 * @param n - Size
 * @returns Result vector y
 */
export function upperTriangularMV(
  U: Float64Array,
  x: Float64Array,
  n: i32
): Float64Array {
  const y = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = 0.0
    for (let j: i32 = i; j < n; j++) {
      sum += U[i * n + j] * x[j]
    }
    y[i] = sum
  }

  return y
}

/**
 * Compute the inverse of a lower triangular matrix
 *
 * @param L - Lower triangular matrix (n x n)
 * @param n - Size of the matrix
 * @returns Inverse matrix L^(-1)
 */
export function lowerTriangularInverse(L: Float64Array, n: i32): Float64Array {
  const inv = new Float64Array(n * n)

  // Initialize to zero
  for (let i: i32 = 0; i < n * n; i++) {
    inv[i] = 0.0
  }

  // Solve L * X_j = e_j for each column j
  for (let j: i32 = 0; j < n; j++) {
    // Create e_j
    const e = new Float64Array(n)
    e[j] = 1.0

    // Forward substitution
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = e[i]

      for (let k: i32 = 0; k < i; k++) {
        sum -= L[i * n + k] * inv[k * n + j]
      }

      inv[i * n + j] = sum / L[i * n + i]
    }
  }

  return inv
}

/**
 * Compute the inverse of an upper triangular matrix
 *
 * @param U - Upper triangular matrix (n x n)
 * @param n - Size of the matrix
 * @returns Inverse matrix U^(-1)
 */
export function upperTriangularInverse(U: Float64Array, n: i32): Float64Array {
  const inv = new Float64Array(n * n)

  // Initialize to zero
  for (let i: i32 = 0; i < n * n; i++) {
    inv[i] = 0.0
  }

  // Solve U * X_j = e_j for each column j
  for (let j: i32 = 0; j < n; j++) {
    // Create e_j
    const e = new Float64Array(n)
    e[j] = 1.0

    // Backward substitution
    for (let i: i32 = n - 1; i >= 0; i--) {
      let sum: f64 = e[i]

      for (let k: i32 = i + 1; k < n; k++) {
        sum -= U[i * n + k] * inv[k * n + j]
      }

      inv[i * n + j] = sum / U[i * n + i]
    }
  }

  return inv
}

/**
 * Compute the determinant of a triangular matrix
 * (Product of diagonal elements)
 *
 * @param T - Triangular matrix (n x n)
 * @param n - Size of the matrix
 * @returns Determinant
 */
export function triangularDeterminant(T: Float64Array, n: i32): f64 {
  let det: f64 = 1.0

  for (let i: i32 = 0; i < n; i++) {
    det *= T[i * n + i]
  }

  return det
}
