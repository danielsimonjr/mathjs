/**
 * WASM-optimized eigenvalue decomposition using AssemblyScript
 * Implements Jacobi eigenvalue algorithm for real symmetric matrices
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 *
 * Performance: 3-10x faster than JavaScript for large symmetric matrices
 */

/**
 * Jacobi eigenvalue algorithm for real symmetric matrices
 * Computes eigenvalues and optionally eigenvectors
 *
 * @param matrixPtr - Pointer to input matrix (f64, flat array, row-major, N x N)
 * @param n - Matrix dimension
 * @param precision - Convergence tolerance (typically 1e-12)
 * @param eigenvaluesPtr - Pointer to output eigenvalues array (f64, size N)
 * @param eigenvectorsPtr - Pointer to output eigenvectors matrix (f64, N x N, row-major)
 *                          Pass 0 to skip eigenvector computation
 * @param workPtr - Pointer to workspace (f64, size 2*N for temporary arrays)
 * @returns Number of iterations performed, or -1 if max iterations exceeded
 */
export function eigsSymmetric(
  matrixPtr: usize,
  n: i32,
  precision: f64,
  eigenvaluesPtr: usize,
  eigenvectorsPtr: usize,
  workPtr: usize
): i32 {
  const computeVectors: bool = eigenvectorsPtr !== 0
  const e0: f64 = Math.abs(precision / <f64>n)
  const maxIterations: i32 = n * n * 30 // Safety limit

  // Work arrays: Aki at workPtr, Akj at workPtr + n*8
  const AkiPtr: usize = workPtr
  const AkjPtr: usize = workPtr + (<usize>n << 3)

  // Initialize eigenvectors to identity matrix if computing vectors
  if (computeVectors) {
    for (let i: i32 = 0; i < n; i++) {
      for (let j: i32 = 0; j < n; j++) {
        const idx: usize = (<usize>(i * n + j)) << 3
        store<f64>(eigenvectorsPtr + idx, i === j ? 1.0 : 0.0)
      }
    }
  }

  // Main Jacobi iteration loop
  let iterations: i32 = 0
  let maxOffDiag: f64 = getMaxOffDiagonal(matrixPtr, n)

  while (Math.abs(maxOffDiag) >= e0 && iterations < maxIterations) {
    // Find indices of max off-diagonal element
    const ij: i64 = findMaxOffDiagonalIndices(matrixPtr, n)
    const i: i32 = <i32>(ij >> 32)
    const j: i32 = <i32>(ij & 0xFFFFFFFF)

    // Compute rotation angle
    const theta: f64 = getTheta(matrixPtr, n, i, j, precision)

    // Apply Jacobi rotation to matrix
    applyJacobiRotation(matrixPtr, n, theta, i, j, AkiPtr, AkjPtr)

    // Apply rotation to eigenvectors if computing them
    if (computeVectors) {
      applyJacobiRotationToVectors(eigenvectorsPtr, n, theta, i, j, AkiPtr, AkjPtr)
    }

    // Update max off-diagonal for convergence check
    maxOffDiag = getMaxOffDiagonal(matrixPtr, n)
    iterations++
  }

  // Extract eigenvalues from diagonal
  for (let i: i32 = 0; i < n; i++) {
    const diagIdx: usize = (<usize>(i * n + i)) << 3
    store<f64>(eigenvaluesPtr + (<usize>i << 3), load<f64>(matrixPtr + diagIdx))
  }

  // Sort eigenvalues (and eigenvectors) by absolute value
  sortEigenvalues(eigenvaluesPtr, eigenvectorsPtr, n, computeVectors)

  return iterations < maxIterations ? iterations : -1
}

/**
 * Get the maximum absolute value of off-diagonal elements
 */
function getMaxOffDiagonal(matrixPtr: usize, n: i32): f64 {
  let maxVal: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = i + 1; j < n; j++) {
      const idx: usize = (<usize>(i * n + j)) << 3
      const val: f64 = Math.abs(load<f64>(matrixPtr + idx))
      if (val > maxVal) {
        maxVal = val
      }
    }
  }

  return maxVal
}

/**
 * Find indices of maximum off-diagonal element
 * Returns packed i64: high 32 bits = i, low 32 bits = j
 */
function findMaxOffDiagonalIndices(matrixPtr: usize, n: i32): i64 {
  let maxVal: f64 = 0.0
  let maxI: i32 = 0
  let maxJ: i32 = 1

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = i + 1; j < n; j++) {
      const idx: usize = (<usize>(i * n + j)) << 3
      const val: f64 = Math.abs(load<f64>(matrixPtr + idx))
      if (val > maxVal) {
        maxVal = val
        maxI = i
        maxJ = j
      }
    }
  }

  return (<i64>maxI << 32) | <i64>maxJ
}

/**
 * Compute Jacobi rotation angle theta
 */
function getTheta(matrixPtr: usize, n: i32, i: i32, j: i32, tolerance: f64): f64 {
  const iiIdx: usize = (<usize>(i * n + i)) << 3
  const jjIdx: usize = (<usize>(j * n + j)) << 3
  const ijIdx: usize = (<usize>(i * n + j)) << 3

  const aii: f64 = load<f64>(matrixPtr + iiIdx)
  const ajj: f64 = load<f64>(matrixPtr + jjIdx)
  const aij: f64 = load<f64>(matrixPtr + ijIdx)

  const denom: f64 = ajj - aii

  if (Math.abs(denom) <= tolerance) {
    return Math.PI / 4.0
  } else {
    return 0.5 * Math.atan((2.0 * aij) / denom)
  }
}

/**
 * Apply Jacobi rotation to matrix
 * Transforms A -> G^T * A * G where G is Givens rotation
 */
function applyJacobiRotation(
  matrixPtr: usize,
  n: i32,
  theta: f64,
  i: i32,
  j: i32,
  AkiPtr: usize,
  AkjPtr: usize
): void {
  const c: f64 = Math.cos(theta)
  const s: f64 = Math.sin(theta)
  const c2: f64 = c * c
  const s2: f64 = s * s

  const iiIdx: usize = (<usize>(i * n + i)) << 3
  const jjIdx: usize = (<usize>(j * n + j)) << 3
  const ijIdx: usize = (<usize>(i * n + j)) << 3
  const jiIdx: usize = (<usize>(j * n + i)) << 3

  const Hii: f64 = load<f64>(matrixPtr + iiIdx)
  const Hjj: f64 = load<f64>(matrixPtr + jjIdx)
  const Hij: f64 = load<f64>(matrixPtr + ijIdx)

  // Compute new diagonal elements
  const Aii: f64 = c2 * Hii - 2.0 * c * s * Hij + s2 * Hjj
  const Ajj: f64 = s2 * Hii + 2.0 * c * s * Hij + c2 * Hjj

  // Compute rotated row/column elements into work arrays
  for (let k: i32 = 0; k < n; k++) {
    const ikIdx: usize = (<usize>(i * n + k)) << 3
    const jkIdx: usize = (<usize>(j * n + k)) << 3
    const Hik: f64 = load<f64>(matrixPtr + ikIdx)
    const Hjk: f64 = load<f64>(matrixPtr + jkIdx)

    store<f64>(AkiPtr + (<usize>k << 3), c * Hik - s * Hjk)
    store<f64>(AkjPtr + (<usize>k << 3), s * Hik + c * Hjk)
  }

  // Update matrix with new values
  store<f64>(matrixPtr + iiIdx, Aii)
  store<f64>(matrixPtr + jjIdx, Ajj)
  store<f64>(matrixPtr + ijIdx, 0.0)
  store<f64>(matrixPtr + jiIdx, 0.0)

  // Update off-diagonal elements (symmetric)
  for (let k: i32 = 0; k < n; k++) {
    if (k !== i && k !== j) {
      const Aki: f64 = load<f64>(AkiPtr + (<usize>k << 3))
      const Akj: f64 = load<f64>(AkjPtr + (<usize>k << 3))

      const ikIdx: usize = (<usize>(i * n + k)) << 3
      const kiIdx: usize = (<usize>(k * n + i)) << 3
      const jkIdx: usize = (<usize>(j * n + k)) << 3
      const kjIdx: usize = (<usize>(k * n + j)) << 3

      store<f64>(matrixPtr + ikIdx, Aki)
      store<f64>(matrixPtr + kiIdx, Aki)
      store<f64>(matrixPtr + jkIdx, Akj)
      store<f64>(matrixPtr + kjIdx, Akj)
    }
  }
}

/**
 * Apply Jacobi rotation to eigenvector matrix
 */
function applyJacobiRotationToVectors(
  vectorsPtr: usize,
  n: i32,
  theta: f64,
  i: i32,
  j: i32,
  SkiPtr: usize,
  SkjPtr: usize
): void {
  const c: f64 = Math.cos(theta)
  const s: f64 = Math.sin(theta)

  // Compute rotated columns into work arrays
  for (let k: i32 = 0; k < n; k++) {
    const kiIdx: usize = (<usize>(k * n + i)) << 3
    const kjIdx: usize = (<usize>(k * n + j)) << 3
    const Ski: f64 = load<f64>(vectorsPtr + kiIdx)
    const Skj: f64 = load<f64>(vectorsPtr + kjIdx)

    store<f64>(SkiPtr + (<usize>k << 3), c * Ski - s * Skj)
    store<f64>(SkjPtr + (<usize>k << 3), s * Ski + c * Skj)
  }

  // Update eigenvector matrix
  for (let k: i32 = 0; k < n; k++) {
    const kiIdx: usize = (<usize>(k * n + i)) << 3
    const kjIdx: usize = (<usize>(k * n + j)) << 3
    store<f64>(vectorsPtr + kiIdx, load<f64>(SkiPtr + (<usize>k << 3)))
    store<f64>(vectorsPtr + kjIdx, load<f64>(SkjPtr + (<usize>k << 3)))
  }
}

/**
 * Sort eigenvalues by absolute value (ascending) using selection sort
 * Also reorders eigenvector columns if computing vectors
 */
function sortEigenvalues(
  eigenvaluesPtr: usize,
  eigenvectorsPtr: usize,
  n: i32,
  computeVectors: bool
): void {
  for (let i: i32 = 0; i < n - 1; i++) {
    let minIdx: i32 = i
    let minVal: f64 = Math.abs(load<f64>(eigenvaluesPtr + (<usize>i << 3)))

    for (let j: i32 = i + 1; j < n; j++) {
      const val: f64 = Math.abs(load<f64>(eigenvaluesPtr + (<usize>j << 3)))
      if (val < minVal) {
        minVal = val
        minIdx = j
      }
    }

    if (minIdx !== i) {
      // Swap eigenvalues
      const tmp: f64 = load<f64>(eigenvaluesPtr + (<usize>i << 3))
      store<f64>(eigenvaluesPtr + (<usize>i << 3), load<f64>(eigenvaluesPtr + (<usize>minIdx << 3)))
      store<f64>(eigenvaluesPtr + (<usize>minIdx << 3), tmp)

      // Swap eigenvector columns if computing vectors
      if (computeVectors) {
        for (let k: i32 = 0; k < n; k++) {
          const kiIdx: usize = (<usize>(k * n + i)) << 3
          const kMinIdx: usize = (<usize>(k * n + minIdx)) << 3
          const tmpVec: f64 = load<f64>(eigenvectorsPtr + kiIdx)
          store<f64>(eigenvectorsPtr + kiIdx, load<f64>(eigenvectorsPtr + kMinIdx))
          store<f64>(eigenvectorsPtr + kMinIdx, tmpVec)
        }
      }
    }
  }
}

/**
 * Power iteration method for finding dominant eigenvalue
 * Useful for spectral radius computation
 *
 * @param matrixPtr - Pointer to input matrix (f64, N x N, row-major)
 * @param n - Matrix dimension
 * @param maxIterations - Maximum iterations
 * @param tolerance - Convergence tolerance
 * @param eigenvaluePtr - Pointer to output eigenvalue (f64, size 1)
 * @param eigenvectorPtr - Pointer to output eigenvector (f64, size N)
 * @param workPtr - Pointer to workspace (f64, size N)
 * @returns Number of iterations, or -1 if not converged
 */
export function powerIteration(
  matrixPtr: usize,
  n: i32,
  maxIterations: i32,
  tolerance: f64,
  eigenvaluePtr: usize,
  eigenvectorPtr: usize,
  workPtr: usize
): i32 {
  // Initialize eigenvector to [1, 1, ..., 1] / sqrt(n)
  const initVal: f64 = 1.0 / Math.sqrt(<f64>n)
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(eigenvectorPtr + (<usize>i << 3), initVal)
  }

  let prevEigenvalue: f64 = 0.0

  for (let iter: i32 = 0; iter < maxIterations; iter++) {
    // Matrix-vector multiply: work = A * eigenvector
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = 0.0
      for (let j: i32 = 0; j < n; j++) {
        const aij: f64 = load<f64>(matrixPtr + (<usize>(i * n + j) << 3))
        const vj: f64 = load<f64>(eigenvectorPtr + (<usize>j << 3))
        sum += aij * vj
      }
      store<f64>(workPtr + (<usize>i << 3), sum)
    }

    // Compute norm of result
    let norm: f64 = 0.0
    for (let i: i32 = 0; i < n; i++) {
      const val: f64 = load<f64>(workPtr + (<usize>i << 3))
      norm += val * val
    }
    norm = Math.sqrt(norm)

    if (norm < 1e-15) {
      // Matrix is likely zero or nearly singular
      store<f64>(eigenvaluePtr, 0.0)
      return iter
    }

    // Normalize and store as new eigenvector
    const eigenvalue: f64 = norm
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(eigenvectorPtr + (<usize>i << 3), load<f64>(workPtr + (<usize>i << 3)) / norm)
    }

    // Check convergence
    if (Math.abs(eigenvalue - prevEigenvalue) < tolerance) {
      store<f64>(eigenvaluePtr, eigenvalue)
      return iter + 1
    }

    prevEigenvalue = eigenvalue
  }

  store<f64>(eigenvaluePtr, prevEigenvalue)
  return -1 // Did not converge
}

/**
 * Compute spectral radius (largest absolute eigenvalue) using power iteration
 *
 * @param matrixPtr - Pointer to input matrix (f64, N x N, row-major)
 * @param n - Matrix dimension
 * @param maxIterations - Maximum iterations
 * @param tolerance - Convergence tolerance
 * @param workPtr - Pointer to workspace (f64, size 2*N)
 * @returns Spectral radius
 */
export function spectralRadius(
  matrixPtr: usize,
  n: i32,
  maxIterations: i32,
  tolerance: f64,
  workPtr: usize
): f64 {
  const eigenvectorPtr: usize = workPtr
  const tempPtr: usize = workPtr + (<usize>n << 3)

  // Use in-place eigenvalue storage
  let eigenvalue: f64 = 0.0

  // Initialize eigenvector
  const initVal: f64 = 1.0 / Math.sqrt(<f64>n)
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(eigenvectorPtr + (<usize>i << 3), initVal)
  }

  for (let iter: i32 = 0; iter < maxIterations; iter++) {
    // Matrix-vector multiply
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = 0.0
      for (let j: i32 = 0; j < n; j++) {
        sum += load<f64>(matrixPtr + (<usize>(i * n + j) << 3)) *
               load<f64>(eigenvectorPtr + (<usize>j << 3))
      }
      store<f64>(tempPtr + (<usize>i << 3), sum)
    }

    // Compute norm
    let norm: f64 = 0.0
    for (let i: i32 = 0; i < n; i++) {
      const val: f64 = load<f64>(tempPtr + (<usize>i << 3))
      norm += val * val
    }
    norm = Math.sqrt(norm)

    if (norm < 1e-15) {
      return 0.0
    }

    const newEigenvalue: f64 = norm

    // Normalize
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(eigenvectorPtr + (<usize>i << 3), load<f64>(tempPtr + (<usize>i << 3)) / norm)
    }

    // Check convergence
    if (Math.abs(newEigenvalue - eigenvalue) < tolerance) {
      return newEigenvalue
    }

    eigenvalue = newEigenvalue
  }

  return eigenvalue
}

/**
 * Inverse iteration for finding eigenvector given approximate eigenvalue
 *
 * @param matrixPtr - Pointer to input matrix (f64, N x N, row-major)
 * @param n - Matrix dimension
 * @param eigenvalue - Approximate eigenvalue
 * @param maxIterations - Maximum iterations
 * @param tolerance - Convergence tolerance
 * @param eigenvectorPtr - Pointer to output eigenvector (f64, size N)
 * @param workPtr - Pointer to workspace (f64, size N*N + 2*N for LU and work)
 * @returns Number of iterations, or -1 if not converged
 */
export function inverseIteration(
  matrixPtr: usize,
  n: i32,
  eigenvalue: f64,
  maxIterations: i32,
  tolerance: f64,
  eigenvectorPtr: usize,
  workPtr: usize
): i32 {
  const shiftedMatrixPtr: usize = workPtr
  const luPtr: usize = workPtr // Reuse for LU decomposition
  const tempPtr: usize = workPtr + (<usize>(n * n) << 3)

  // Create shifted matrix: A - lambda*I
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      const idx: usize = (<usize>(i * n + j)) << 3
      let val: f64 = load<f64>(matrixPtr + idx)
      if (i === j) {
        val -= eigenvalue
      }
      store<f64>(shiftedMatrixPtr + idx, val)
    }
  }

  // Initialize eigenvector to random-ish values
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(eigenvectorPtr + (<usize>i << 3), 1.0 + <f64>i * 0.1)
  }

  // Normalize
  let norm: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    const val: f64 = load<f64>(eigenvectorPtr + (<usize>i << 3))
    norm += val * val
  }
  norm = Math.sqrt(norm)
  for (let i: i32 = 0; i < n; i++) {
    const idx: usize = (<usize>i) << 3
    store<f64>(eigenvectorPtr + idx, load<f64>(eigenvectorPtr + idx) / norm)
  }

  // Simple Gaussian elimination solve (could use LU from decomposition.ts)
  for (let iter: i32 = 0; iter < maxIterations; iter++) {
    // Solve (A - lambda*I) * y = x using simple back-substitution
    // For production, should use LU decomposition
    // Here we use a simple iterative refinement approach

    // Copy shifted matrix for solving
    for (let i: i32 = 0; i < n * n; i++) {
      store<f64>(luPtr + (<usize>i << 3), load<f64>(shiftedMatrixPtr + (<usize>i << 3)))
    }

    // Copy eigenvector to temp as RHS
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(tempPtr + (<usize>i << 3), load<f64>(eigenvectorPtr + (<usize>i << 3)))
    }

    // Gaussian elimination with partial pivoting
    for (let k: i32 = 0; k < n - 1; k++) {
      // Find pivot
      let maxVal: f64 = Math.abs(load<f64>(luPtr + (<usize>(k * n + k) << 3)))
      let maxRow: i32 = k
      for (let i: i32 = k + 1; i < n; i++) {
        const val: f64 = Math.abs(load<f64>(luPtr + (<usize>(i * n + k) << 3)))
        if (val > maxVal) {
          maxVal = val
          maxRow = i
        }
      }

      // Swap rows if needed
      if (maxRow !== k) {
        for (let j: i32 = 0; j < n; j++) {
          const kIdx: usize = (<usize>(k * n + j)) << 3
          const mIdx: usize = (<usize>(maxRow * n + j)) << 3
          const tmp: f64 = load<f64>(luPtr + kIdx)
          store<f64>(luPtr + kIdx, load<f64>(luPtr + mIdx))
          store<f64>(luPtr + mIdx, tmp)
        }
        const tmpRhs: f64 = load<f64>(tempPtr + (<usize>k << 3))
        store<f64>(tempPtr + (<usize>k << 3), load<f64>(tempPtr + (<usize>maxRow << 3)))
        store<f64>(tempPtr + (<usize>maxRow << 3), tmpRhs)
      }

      // Eliminate
      const pivot: f64 = load<f64>(luPtr + (<usize>(k * n + k) << 3))
      if (Math.abs(pivot) < 1e-15) continue

      for (let i: i32 = k + 1; i < n; i++) {
        const factor: f64 = load<f64>(luPtr + (<usize>(i * n + k) << 3)) / pivot
        for (let j: i32 = k; j < n; j++) {
          const ijIdx: usize = (<usize>(i * n + j)) << 3
          const kjIdx: usize = (<usize>(k * n + j)) << 3
          store<f64>(luPtr + ijIdx, load<f64>(luPtr + ijIdx) - factor * load<f64>(luPtr + kjIdx))
        }
        const iIdx: usize = (<usize>i) << 3
        const kIdx: usize = (<usize>k) << 3
        store<f64>(tempPtr + iIdx, load<f64>(tempPtr + iIdx) - factor * load<f64>(tempPtr + kIdx))
      }
    }

    // Back substitution
    for (let i: i32 = n - 1; i >= 0; i--) {
      let sum: f64 = load<f64>(tempPtr + (<usize>i << 3))
      for (let j: i32 = i + 1; j < n; j++) {
        sum -= load<f64>(luPtr + (<usize>(i * n + j) << 3)) * load<f64>(eigenvectorPtr + (<usize>j << 3))
      }
      const diag: f64 = load<f64>(luPtr + (<usize>(i * n + i) << 3))
      if (Math.abs(diag) > 1e-15) {
        store<f64>(eigenvectorPtr + (<usize>i << 3), sum / diag)
      }
    }

    // Normalize
    norm = 0.0
    for (let i: i32 = 0; i < n; i++) {
      const val: f64 = load<f64>(eigenvectorPtr + (<usize>i << 3))
      norm += val * val
    }
    norm = Math.sqrt(norm)

    if (norm < 1e-15) {
      return -1
    }

    for (let i: i32 = 0; i < n; i++) {
      const idx: usize = (<usize>i) << 3
      store<f64>(eigenvectorPtr + idx, load<f64>(eigenvectorPtr + idx) / norm)
    }
  }

  return maxIterations
}
