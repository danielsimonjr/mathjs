/**
 * WASM-optimized linear algebra decompositions
 * LU, QR, and Cholesky decompositions for high-performance computing
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * LU Decomposition with partial pivoting: PA = LU
 * @param aPtr - Pointer to input matrix (n x n, row-major), modified in place to contain LU
 * @param n - Size of the square matrix
 * @param permPtr - Pointer to permutation vector (Int32Array)
 * @returns 0 if successful, 1 if singular
 */
export function luDecomposition(
  aPtr: usize,
  n: i32,
  permPtr: usize
): i32 {
  // Initialize permutation vector
  for (let i: i32 = 0; i < n; i++) {
    store<i32>(permPtr + (<usize>i << 2), i)
  }

  for (let k: i32 = 0; k < n - 1; k++) {
    // Find pivot
    let maxVal: f64 = abs(load<f64>(aPtr + (<usize>(k * n + k) << 3)))
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = abs(load<f64>(aPtr + (<usize>(i * n + k) << 3)))
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    // Check for singularity
    if (maxVal < 1e-14) {
      return 1 // Singular matrix
    }

    // Swap rows if necessary
    if (pivotRow !== k) {
      swapRows(aPtr, n, k, pivotRow)
      const temp: i32 = load<i32>(permPtr + (<usize>k << 2))
      store<i32>(permPtr + (<usize>k << 2), load<i32>(permPtr + (<usize>pivotRow << 2)))
      store<i32>(permPtr + (<usize>pivotRow << 2), temp)
    }

    // Eliminate column
    const pivot: f64 = load<f64>(aPtr + (<usize>(k * n + k) << 3))
    for (let i: i32 = k + 1; i < n; i++) {
      const idx: usize = <usize>(i * n + k) << 3
      const factor: f64 = load<f64>(aPtr + idx) / pivot
      store<f64>(aPtr + idx, factor) // Store L factor

      for (let j: i32 = k + 1; j < n; j++) {
        const ijIdx: usize = <usize>(i * n + j) << 3
        const kjIdx: usize = <usize>(k * n + j) << 3
        store<f64>(aPtr + ijIdx, load<f64>(aPtr + ijIdx) - factor * load<f64>(aPtr + kjIdx))
      }
    }
  }

  return 0 // Success
}

/**
 * QR Decomposition using Householder reflections
 * @param aPtr - Pointer to input matrix (m x n), will contain R after decomposition
 * @param m - Number of rows
 * @param n - Number of columns
 * @param qPtr - Pointer to output Q matrix (m x m, orthogonal)
 */
export function qrDecomposition(
  aPtr: usize,
  m: i32,
  n: i32,
  qPtr: usize
): void {
  // Initialize Q as identity matrix
  for (let i: i32 = 0; i < m; i++) {
    for (let j: i32 = 0; j < m; j++) {
      store<f64>(qPtr + (<usize>(i * m + j) << 3), i === j ? 1.0 : 0.0)
    }
  }

  const minDim: i32 = m < n ? m : n

  for (let k: i32 = 0; k < minDim; k++) {
    // Compute Householder vector
    let norm: f64 = 0.0
    for (let i: i32 = k; i < m; i++) {
      const val: f64 = load<f64>(aPtr + (<usize>(i * n + k) << 3))
      norm += val * val
    }
    norm = sqrt(norm)

    if (norm < 1e-14) continue

    const akk: f64 = load<f64>(aPtr + (<usize>(k * n + k) << 3))
    const sign: f64 = akk >= 0.0 ? 1.0 : -1.0
    const u1: f64 = akk + sign * norm

    // Compute 2 / (v^T * v) and apply Householder reflection
    let vDotV: f64 = 1.0
    for (let i: i32 = k + 1; i < m; i++) {
      const vi: f64 = load<f64>(aPtr + (<usize>(i * n + k) << 3)) / u1
      vDotV += vi * vi
    }
    const tau: f64 = 2.0 / vDotV

    // Apply Householder reflection to R (a)
    for (let j: i32 = k; j < n; j++) {
      let vDotCol: f64 = load<f64>(aPtr + (<usize>(k * n + j) << 3))
      for (let i: i32 = k + 1; i < m; i++) {
        const vi: f64 = load<f64>(aPtr + (<usize>(i * n + k) << 3)) / u1
        vDotCol += vi * load<f64>(aPtr + (<usize>(i * n + j) << 3))
      }

      const factor: f64 = tau * vDotCol
      store<f64>(aPtr + (<usize>(k * n + j) << 3), load<f64>(aPtr + (<usize>(k * n + j) << 3)) - factor)
      for (let i: i32 = k + 1; i < m; i++) {
        const vi: f64 = load<f64>(aPtr + (<usize>(i * n + k) << 3)) / u1
        const idx: usize = <usize>(i * n + j) << 3
        store<f64>(aPtr + idx, load<f64>(aPtr + idx) - factor * vi)
      }
    }

    // Apply Householder reflection to Q
    for (let j: i32 = 0; j < m; j++) {
      let vDotCol: f64 = load<f64>(qPtr + (<usize>(k * m + j) << 3))
      for (let i: i32 = k + 1; i < m; i++) {
        const vi: f64 = load<f64>(aPtr + (<usize>(i * n + k) << 3)) / u1
        vDotCol += vi * load<f64>(qPtr + (<usize>(i * m + j) << 3))
      }

      const factor: f64 = tau * vDotCol
      store<f64>(qPtr + (<usize>(k * m + j) << 3), load<f64>(qPtr + (<usize>(k * m + j) << 3)) - factor)
      for (let i: i32 = k + 1; i < m; i++) {
        const vi: f64 = load<f64>(aPtr + (<usize>(i * n + k) << 3)) / u1
        const idx: usize = <usize>(i * m + j) << 3
        store<f64>(qPtr + idx, load<f64>(qPtr + idx) - factor * vi)
      }
    }

    // Zero out below diagonal for this column
    for (let i: i32 = k + 1; i < m; i++) {
      store<f64>(aPtr + (<usize>(i * n + k) << 3), 0.0)
    }
  }
}

/**
 * Cholesky Decomposition: A = L * L^T
 * For symmetric positive-definite matrices
 * @param aPtr - Pointer to input matrix (symmetric, positive-definite, n x n)
 * @param n - Size of the matrix
 * @param lPtr - Pointer to output lower triangular matrix L
 * @returns 0 if successful, 1 if not positive-definite
 */
export function choleskyDecomposition(
  aPtr: usize,
  n: i32,
  lPtr: usize
): i32 {
  // Initialize L to zero
  for (let i: i32 = 0; i < n * n; i++) {
    store<f64>(lPtr + (<usize>i << 3), 0.0)
  }

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j <= i; j++) {
      let sum: f64 = load<f64>(aPtr + (<usize>(i * n + j) << 3))

      for (let k: i32 = 0; k < j; k++) {
        const lik: f64 = load<f64>(lPtr + (<usize>(i * n + k) << 3))
        const ljk: f64 = load<f64>(lPtr + (<usize>(j * n + k) << 3))
        sum -= lik * ljk
      }

      if (i === j) {
        if (sum <= 0.0) {
          return 1 // Not positive-definite
        }
        store<f64>(lPtr + (<usize>(i * n + j) << 3), sqrt(sum))
      } else {
        const ljj: f64 = load<f64>(lPtr + (<usize>(j * n + j) << 3))
        store<f64>(lPtr + (<usize>(i * n + j) << 3), sum / ljj)
      }
    }
  }

  return 0 // Success
}

/**
 * Solve linear system using LU decomposition: Ax = b
 * @param luPtr - Pointer to LU decomposition of A
 * @param n - Size of the system
 * @param permPtr - Pointer to permutation vector from LU decomposition
 * @param bPtr - Pointer to right-hand side vector
 * @param xPtr - Pointer to solution vector x
 */
export function luSolve(
  luPtr: usize,
  n: i32,
  permPtr: usize,
  bPtr: usize,
  xPtr: usize
): void {
  // Forward substitution: Ly = Pb
  for (let i: i32 = 0; i < n; i++) {
    const pi: i32 = load<i32>(permPtr + (<usize>i << 2))
    let sum: f64 = load<f64>(bPtr + (<usize>pi << 3))
    for (let j: i32 = 0; j < i; j++) {
      sum -= load<f64>(luPtr + (<usize>(i * n + j) << 3)) * load<f64>(xPtr + (<usize>j << 3))
    }
    store<f64>(xPtr + (<usize>i << 3), sum)
  }

  // Backward substitution: Ux = y
  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = load<f64>(xPtr + (<usize>i << 3))
    for (let j: i32 = i + 1; j < n; j++) {
      sum -= load<f64>(luPtr + (<usize>(i * n + j) << 3)) * load<f64>(xPtr + (<usize>j << 3))
    }
    store<f64>(xPtr + (<usize>i << 3), sum / load<f64>(luPtr + (<usize>(i * n + i) << 3)))
  }
}

/**
 * Compute determinant from LU decomposition
 * @param luPtr - Pointer to LU matrix
 * @param n - Size of the matrix
 * @param permPtr - Pointer to permutation vector
 * @returns Determinant value
 */
export function luDeterminant(luPtr: usize, n: i32, permPtr: usize): f64 {
  let det: f64 = 1.0

  // Product of diagonal elements
  for (let i: i32 = 0; i < n; i++) {
    det *= load<f64>(luPtr + (<usize>(i * n + i) << 3))
  }

  // Account for row swaps
  let swaps: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    if (load<i32>(permPtr + (<usize>i << 2)) !== i) swaps++
  }

  return swaps % 2 === 0 ? det : -det
}

// Helper functions

function abs(x: f64): f64 {
  return x >= 0.0 ? x : -x
}

function sqrt(x: f64): f64 {
  return Math.sqrt(x)
}

function swapRows(aPtr: usize, n: i32, row1: i32, row2: i32): void {
  for (let j: i32 = 0; j < n; j++) {
    const idx1: usize = <usize>(row1 * n + j) << 3
    const idx2: usize = <usize>(row2 * n + j) << 3
    const temp: f64 = load<f64>(aPtr + idx1)
    store<f64>(aPtr + idx1, load<f64>(aPtr + idx2))
    store<f64>(aPtr + idx2, temp)
  }
}
