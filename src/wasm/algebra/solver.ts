/**
 * WASM-optimized triangular system solvers
 * using AssemblyScript
 *
 * Solves lower and upper triangular systems efficiently
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

/**
 * Solve a lower triangular system Lx = b
 * L is assumed to be lower triangular with non-zero diagonal
 *
 * @param LPtr - Pointer to lower triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param xPtr - Pointer to solution vector output (n, f64)
 */
export function lsolve(LPtr: usize, bPtr: usize, n: i32, xPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))

    for (let j: i32 = 0; j < i; j++) {
      sum -=
        load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }

    const diag: f64 = load<f64>(LPtr + (<usize>(i * n + i) << 3))
    if (diag === 0.0) {
      store<f64>(xPtr + (<usize>i << 3), f64.NaN)
    } else {
      store<f64>(xPtr + (<usize>i << 3), sum / diag)
    }
  }
}

/**
 * Solve a lower triangular system Lx = b with unit diagonal
 * L is assumed to be unit lower triangular (1s on diagonal)
 *
 * @param LPtr - Pointer to unit lower triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param xPtr - Pointer to solution vector output (n, f64)
 */
export function lsolveUnit(LPtr: usize, bPtr: usize, n: i32, xPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))

    for (let j: i32 = 0; j < i; j++) {
      sum -=
        load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }

    store<f64>(xPtr + (<usize>i << 3), sum) // Unit diagonal means no division
  }
}

/**
 * Solve an upper triangular system Ux = b
 * U is assumed to be upper triangular with non-zero diagonal
 *
 * @param UPtr - Pointer to upper triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param xPtr - Pointer to solution vector output (n, f64)
 */
export function usolve(UPtr: usize, bPtr: usize, n: i32, xPtr: usize): void {
  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))

    for (let j: i32 = i + 1; j < n; j++) {
      sum -=
        load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }

    const diag: f64 = load<f64>(UPtr + (<usize>(i * n + i) << 3))
    if (diag === 0.0) {
      store<f64>(xPtr + (<usize>i << 3), f64.NaN)
    } else {
      store<f64>(xPtr + (<usize>i << 3), sum / diag)
    }
  }
}

/**
 * Solve an upper triangular system Ux = b with unit diagonal
 * U is assumed to be unit upper triangular (1s on diagonal)
 *
 * @param UPtr - Pointer to unit upper triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param xPtr - Pointer to solution vector output (n, f64)
 */
export function usolveUnit(UPtr: usize, bPtr: usize, n: i32, xPtr: usize): void {
  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))

    for (let j: i32 = i + 1; j < n; j++) {
      sum -=
        load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }

    store<f64>(xPtr + (<usize>i << 3), sum) // Unit diagonal means no division
  }
}

/**
 * Solve a lower triangular system Lx = b for multiple right-hand sides
 *
 * @param LPtr - Pointer to lower triangular matrix (n x n, row-major, f64)
 * @param BPtr - Pointer to right-hand side matrix (n x m, row-major, f64)
 * @param n - Number of rows/columns in L
 * @param m - Number of right-hand sides (columns in B)
 * @param XPtr - Pointer to solution matrix output (n x m, f64)
 */
export function lsolveMultiple(
  LPtr: usize,
  BPtr: usize,
  n: i32,
  m: i32,
  XPtr: usize
): void {
  for (let k: i32 = 0; k < m; k++) {
    // Solve for column k
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = load<f64>(BPtr + (<usize>(i * m + k) << 3))

      for (let j: i32 = 0; j < i; j++) {
        sum -=
          load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
          load<f64>(XPtr + (<usize>(j * m + k) << 3))
      }

      const diag: f64 = load<f64>(LPtr + (<usize>(i * n + i) << 3))
      if (diag === 0.0) {
        store<f64>(XPtr + (<usize>(i * m + k) << 3), f64.NaN)
      } else {
        store<f64>(XPtr + (<usize>(i * m + k) << 3), sum / diag)
      }
    }
  }
}

/**
 * Solve an upper triangular system Ux = b for multiple right-hand sides
 *
 * @param UPtr - Pointer to upper triangular matrix (n x n, row-major, f64)
 * @param BPtr - Pointer to right-hand side matrix (n x m, row-major, f64)
 * @param n - Number of rows/columns in U
 * @param m - Number of right-hand sides (columns in B)
 * @param XPtr - Pointer to solution matrix output (n x m, f64)
 */
export function usolveMultiple(
  UPtr: usize,
  BPtr: usize,
  n: i32,
  m: i32,
  XPtr: usize
): void {
  for (let k: i32 = 0; k < m; k++) {
    // Solve for column k
    for (let i: i32 = n - 1; i >= 0; i--) {
      let sum: f64 = load<f64>(BPtr + (<usize>(i * m + k) << 3))

      for (let j: i32 = i + 1; j < n; j++) {
        sum -=
          load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
          load<f64>(XPtr + (<usize>(j * m + k) << 3))
      }

      const diag: f64 = load<f64>(UPtr + (<usize>(i * n + i) << 3))
      if (diag === 0.0) {
        store<f64>(XPtr + (<usize>(i * m + k) << 3), f64.NaN)
      } else {
        store<f64>(XPtr + (<usize>(i * m + k) << 3), sum / diag)
      }
    }
  }
}

/**
 * Check if a lower triangular system has a unique solution
 * Returns 1 if all diagonal elements are non-zero
 *
 * @param LPtr - Pointer to lower triangular matrix (n x n, f64)
 * @param n - Size of the matrix
 * @returns 1 if system has unique solution, 0 otherwise
 */
export function lsolveHasSolution(LPtr: usize, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (load<f64>(LPtr + (<usize>(i * n + i) << 3)) === 0.0) {
      return 0
    }
  }
  return 1
}

/**
 * Check if an upper triangular system has a unique solution
 * Returns 1 if all diagonal elements are non-zero
 *
 * @param UPtr - Pointer to upper triangular matrix (n x n, f64)
 * @param n - Size of the matrix
 * @returns 1 if system has unique solution, 0 otherwise
 */
export function usolveHasSolution(UPtr: usize, n: i32): i32 {
  for (let i: i32 = 0; i < n; i++) {
    if (load<f64>(UPtr + (<usize>(i * n + i) << 3)) === 0.0) {
      return 0
    }
  }
  return 1
}

/**
 * Forward substitution for banded lower triangular matrix
 * Only accesses elements within the band for efficiency
 *
 * @param LPtr - Pointer to banded lower triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param bandwidth - Number of non-zero sub-diagonals
 * @param xPtr - Pointer to solution vector output (n, f64)
 */
export function lsolveBanded(
  LPtr: usize,
  bPtr: usize,
  n: i32,
  bandwidth: i32,
  xPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))
    const jStart: i32 = i - bandwidth > 0 ? i - bandwidth : 0

    for (let j: i32 = jStart; j < i; j++) {
      sum -=
        load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }

    const diag: f64 = load<f64>(LPtr + (<usize>(i * n + i) << 3))
    if (diag === 0.0) {
      store<f64>(xPtr + (<usize>i << 3), f64.NaN)
    } else {
      store<f64>(xPtr + (<usize>i << 3), sum / diag)
    }
  }
}

/**
 * Backward substitution for banded upper triangular matrix
 * Only accesses elements within the band for efficiency
 *
 * @param UPtr - Pointer to banded upper triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param bandwidth - Number of non-zero super-diagonals
 * @param xPtr - Pointer to solution vector output (n, f64)
 */
export function usolveBanded(
  UPtr: usize,
  bPtr: usize,
  n: i32,
  bandwidth: i32,
  xPtr: usize
): void {
  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))
    const jEnd: i32 = i + bandwidth + 1 < n ? i + bandwidth + 1 : n

    for (let j: i32 = i + 1; j < jEnd; j++) {
      sum -=
        load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }

    const diag: f64 = load<f64>(UPtr + (<usize>(i * n + i) << 3))
    if (diag === 0.0) {
      store<f64>(xPtr + (<usize>i << 3), f64.NaN)
    } else {
      store<f64>(xPtr + (<usize>i << 3), sum / diag)
    }
  }
}

/**
 * Solve tridiagonal system using Thomas algorithm
 * Ax = d where A is tridiagonal with diagonals a (sub), b (main), c (super)
 *
 * @param aPtr - Pointer to sub-diagonal (n-1 elements, f64)
 * @param bPtr - Pointer to main diagonal (n elements, f64)
 * @param cPtr - Pointer to super-diagonal (n-1 elements, f64)
 * @param dPtr - Pointer to right-hand side (n elements, f64)
 * @param n - Size of the system
 * @param xPtr - Pointer to solution vector output (n, f64)
 * @param workPtr - Pointer to work buffer (at least 2*n f64 values)
 */
export function solveTridiagonal(
  aPtr: usize,
  bPtr: usize,
  cPtr: usize,
  dPtr: usize,
  n: i32,
  xPtr: usize,
  workPtr: usize
): void {
  const cPrimePtr = workPtr
  const dPrimePtr = workPtr + (<usize>n << 3)

  // Forward sweep
  store<f64>(
    cPrimePtr,
    load<f64>(cPtr) / load<f64>(bPtr)
  )
  store<f64>(
    dPrimePtr,
    load<f64>(dPtr) / load<f64>(bPtr)
  )

  for (let i: i32 = 1; i < n; i++) {
    const denom: f64 =
      load<f64>(bPtr + (<usize>i << 3)) -
      load<f64>(aPtr + (<usize>i << 3)) *
        load<f64>(cPrimePtr + (<usize>(i - 1) << 3))

    if (i < n - 1) {
      store<f64>(
        cPrimePtr + (<usize>i << 3),
        load<f64>(cPtr + (<usize>i << 3)) / denom
      )
    }
    store<f64>(
      dPrimePtr + (<usize>i << 3),
      (load<f64>(dPtr + (<usize>i << 3)) -
        load<f64>(aPtr + (<usize>i << 3)) *
          load<f64>(dPrimePtr + (<usize>(i - 1) << 3))) /
        denom
    )
  }

  // Back substitution
  store<f64>(xPtr + (<usize>(n - 1) << 3), load<f64>(dPrimePtr + (<usize>(n - 1) << 3)))

  for (let i: i32 = n - 2; i >= 0; i--) {
    store<f64>(
      xPtr + (<usize>i << 3),
      load<f64>(dPrimePtr + (<usize>i << 3)) -
        load<f64>(cPrimePtr + (<usize>i << 3)) *
          load<f64>(xPtr + (<usize>(i + 1) << 3))
    )
  }
}

/**
 * Matrix-vector multiplication for triangular matrices
 * Computes y = Lx for lower triangular L
 *
 * @param LPtr - Pointer to lower triangular matrix (n x n, f64)
 * @param xPtr - Pointer to input vector (n, f64)
 * @param n - Size
 * @param yPtr - Pointer to result vector output (n, f64)
 */
export function lowerTriangularMV(
  LPtr: usize,
  xPtr: usize,
  n: i32,
  yPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = 0.0
    for (let j: i32 = 0; j <= i; j++) {
      sum +=
        load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }
    store<f64>(yPtr + (<usize>i << 3), sum)
  }
}

/**
 * Matrix-vector multiplication for triangular matrices
 * Computes y = Ux for upper triangular U
 *
 * @param UPtr - Pointer to upper triangular matrix (n x n, f64)
 * @param xPtr - Pointer to input vector (n, f64)
 * @param n - Size
 * @param yPtr - Pointer to result vector output (n, f64)
 */
export function upperTriangularMV(
  UPtr: usize,
  xPtr: usize,
  n: i32,
  yPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = 0.0
    for (let j: i32 = i; j < n; j++) {
      sum +=
        load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(xPtr + (<usize>j << 3))
    }
    store<f64>(yPtr + (<usize>i << 3), sum)
  }
}

/**
 * Compute the inverse of a lower triangular matrix
 *
 * @param LPtr - Pointer to lower triangular matrix (n x n, f64)
 * @param n - Size of the matrix
 * @param invPtr - Pointer to inverse matrix output L^(-1) (n x n, f64)
 */
export function lowerTriangularInverse(LPtr: usize, n: i32, invPtr: usize): void {
  // Initialize to zero
  for (let i: i32 = 0; i < n * n; i++) {
    store<f64>(invPtr + (<usize>i << 3), 0.0)
  }

  // Solve L * X_j = e_j for each column j
  for (let j: i32 = 0; j < n; j++) {
    // Forward substitution
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = i === j ? 1.0 : 0.0

      for (let k: i32 = 0; k < i; k++) {
        sum -=
          load<f64>(LPtr + (<usize>(i * n + k) << 3)) *
          load<f64>(invPtr + (<usize>(k * n + j) << 3))
      }

      store<f64>(
        invPtr + (<usize>(i * n + j) << 3),
        sum / load<f64>(LPtr + (<usize>(i * n + i) << 3))
      )
    }
  }
}

/**
 * Compute the inverse of an upper triangular matrix
 *
 * @param UPtr - Pointer to upper triangular matrix (n x n, f64)
 * @param n - Size of the matrix
 * @param invPtr - Pointer to inverse matrix output U^(-1) (n x n, f64)
 */
export function upperTriangularInverse(UPtr: usize, n: i32, invPtr: usize): void {
  // Initialize to zero
  for (let i: i32 = 0; i < n * n; i++) {
    store<f64>(invPtr + (<usize>i << 3), 0.0)
  }

  // Solve U * X_j = e_j for each column j
  for (let j: i32 = 0; j < n; j++) {
    // Backward substitution
    for (let i: i32 = n - 1; i >= 0; i--) {
      let sum: f64 = i === j ? 1.0 : 0.0

      for (let k: i32 = i + 1; k < n; k++) {
        sum -=
          load<f64>(UPtr + (<usize>(i * n + k) << 3)) *
          load<f64>(invPtr + (<usize>(k * n + j) << 3))
      }

      store<f64>(
        invPtr + (<usize>(i * n + j) << 3),
        sum / load<f64>(UPtr + (<usize>(i * n + i) << 3))
      )
    }
  }
}

/**
 * Compute the determinant of a triangular matrix
 * (Product of diagonal elements)
 *
 * @param TPtr - Pointer to triangular matrix (n x n, f64)
 * @param n - Size of the matrix
 * @returns Determinant
 */
export function triangularDeterminant(TPtr: usize, n: i32): f64 {
  let det: f64 = 1.0

  for (let i: i32 = 0; i < n; i++) {
    det *= load<f64>(TPtr + (<usize>(i * n + i) << 3))
  }

  return det
}

// ============================================================================
// SINGULAR SYSTEM SOLVERS (All Solutions)
// ============================================================================

/**
 * Solve a lower triangular system Lx = b, finding ALL solutions for singular L
 *
 * @param LPtr - Pointer to lower triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param solutionsPtr - Pointer to output solutions stored column-wise (n x (numSolutions + numFree), f64)
 * @param infoPtr - Pointer to output info (3 i32): [numSolutions, numFreeVars, isConsistent]
 * @param workPtr - Pointer to work buffer (at least 2*n i32 + n f64)
 */
export function lsolveAll(
  LPtr: usize,
  bPtr: usize,
  n: i32,
  solutionsPtr: usize,
  infoPtr: usize,
  workPtr: usize
): void {
  const TOL: f64 = 1e-14
  const isFreePtr = workPtr
  const particularPtr = workPtr + (<usize>n << 2)

  // Find zero diagonals (free variables)
  let numFree: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    if (Math.abs(load<f64>(LPtr + (<usize>(i * n + i) << 3))) < TOL) {
      store<i32>(isFreePtr + (<usize>i << 2), 1)
      numFree++
    } else {
      store<i32>(isFreePtr + (<usize>i << 2), 0)
    }
  }

  // Compute particular solution (set free variables to 0)
  let isConsistent: i32 = 1

  for (let i: i32 = 0; i < n; i++) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))

    for (let j: i32 = 0; j < i; j++) {
      sum -=
        load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(particularPtr + (<usize>j << 3))
    }

    if (load<i32>(isFreePtr + (<usize>i << 2)) === 1) {
      // Free variable - check consistency
      if (Math.abs(sum) > TOL) {
        isConsistent = 0
        break
      }
      store<f64>(particularPtr + (<usize>i << 3), 0.0)
    } else {
      store<f64>(
        particularPtr + (<usize>i << 3),
        sum / load<f64>(LPtr + (<usize>(i * n + i) << 3))
      )
    }
  }

  // Set info
  store<i32>(infoPtr + 8, isConsistent)
  if (isConsistent === 0) {
    store<i32>(infoPtr, 0)
    store<i32>(infoPtr + 4, 0)
    return
  }

  if (numFree === 0) {
    // Unique solution
    store<i32>(infoPtr, 1)
    store<i32>(infoPtr + 4, 0)
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(solutionsPtr + (<usize>i << 3), load<f64>(particularPtr + (<usize>i << 3)))
    }
    return
  }

  // Infinitely many solutions
  const numCols: i32 = 1 + numFree
  store<i32>(infoPtr, numCols)
  store<i32>(infoPtr + 4, numFree)

  // Store particular solution in first column
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(
      solutionsPtr + (<usize>(i * numCols) << 3),
      load<f64>(particularPtr + (<usize>i << 3))
    )
  }

  // Compute null space basis vectors
  let freeIdx: i32 = 0
  for (let k: i32 = 0; k < n; k++) {
    if (load<i32>(isFreePtr + (<usize>k << 2)) === 1) {
      // Compute null space vector for this free variable
      for (let i: i32 = 0; i < n; i++) {
        if (i === k) {
          store<f64>(
            solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
            1.0
          )
        } else if (load<i32>(isFreePtr + (<usize>i << 2)) === 1) {
          store<f64>(
            solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
            0.0
          )
        } else if (i < k) {
          let sum: f64 = 0.0
          for (let j: i32 = 0; j < i; j++) {
            sum -=
              load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
              load<f64>(solutionsPtr + (<usize>(j * numCols + 1 + freeIdx) << 3))
          }
          store<f64>(
            solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
            sum / load<f64>(LPtr + (<usize>(i * n + i) << 3))
          )
        } else {
          let sum: f64 = 0.0
          for (let j: i32 = 0; j < i; j++) {
            sum -=
              load<f64>(LPtr + (<usize>(i * n + j) << 3)) *
              load<f64>(solutionsPtr + (<usize>(j * numCols + 1 + freeIdx) << 3))
          }
          if (Math.abs(load<f64>(LPtr + (<usize>(i * n + i) << 3))) > TOL) {
            store<f64>(
              solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
              sum / load<f64>(LPtr + (<usize>(i * n + i) << 3))
            )
          } else {
            store<f64>(
              solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
              0.0
            )
          }
        }
      }
      freeIdx++
    }
  }
}

/**
 * Solve an upper triangular system Ux = b, finding ALL solutions for singular U
 *
 * @param UPtr - Pointer to upper triangular matrix (n x n, row-major, f64)
 * @param bPtr - Pointer to right-hand side vector (n, f64)
 * @param n - Size of the system
 * @param solutionsPtr - Pointer to output solutions stored column-wise (n x (numSolutions + numFree), f64)
 * @param infoPtr - Pointer to output info (3 i32): [numSolutions, numFreeVars, isConsistent]
 * @param workPtr - Pointer to work buffer (at least n i32 + n f64)
 */
export function usolveAll(
  UPtr: usize,
  bPtr: usize,
  n: i32,
  solutionsPtr: usize,
  infoPtr: usize,
  workPtr: usize
): void {
  const TOL: f64 = 1e-14
  const isFreePtr = workPtr
  const particularPtr = workPtr + (<usize>n << 2)

  // Find zero diagonals (free variables)
  let numFree: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    if (Math.abs(load<f64>(UPtr + (<usize>(i * n + i) << 3))) < TOL) {
      store<i32>(isFreePtr + (<usize>i << 2), 1)
      numFree++
    } else {
      store<i32>(isFreePtr + (<usize>i << 2), 0)
    }
  }

  // Compute particular solution (set free variables to 0)
  let isConsistent: i32 = 1

  for (let i: i32 = n - 1; i >= 0; i--) {
    let sum: f64 = load<f64>(bPtr + (<usize>i << 3))

    for (let j: i32 = i + 1; j < n; j++) {
      sum -=
        load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
        load<f64>(particularPtr + (<usize>j << 3))
    }

    if (load<i32>(isFreePtr + (<usize>i << 2)) === 1) {
      if (Math.abs(sum) > TOL) {
        isConsistent = 0
        break
      }
      store<f64>(particularPtr + (<usize>i << 3), 0.0)
    } else {
      store<f64>(
        particularPtr + (<usize>i << 3),
        sum / load<f64>(UPtr + (<usize>(i * n + i) << 3))
      )
    }
  }

  // Set info
  store<i32>(infoPtr + 8, isConsistent)
  if (isConsistent === 0) {
    store<i32>(infoPtr, 0)
    store<i32>(infoPtr + 4, 0)
    return
  }

  if (numFree === 0) {
    // Unique solution
    store<i32>(infoPtr, 1)
    store<i32>(infoPtr + 4, 0)
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(solutionsPtr + (<usize>i << 3), load<f64>(particularPtr + (<usize>i << 3)))
    }
    return
  }

  // Infinitely many solutions
  const numCols: i32 = 1 + numFree
  store<i32>(infoPtr, numCols)
  store<i32>(infoPtr + 4, numFree)

  // Store particular solution in first column
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(
      solutionsPtr + (<usize>(i * numCols) << 3),
      load<f64>(particularPtr + (<usize>i << 3))
    )
  }

  // Compute null space basis vectors
  let freeIdx: i32 = 0
  for (let k: i32 = 0; k < n; k++) {
    if (load<i32>(isFreePtr + (<usize>k << 2)) === 1) {
      // Backward substitution for null space vector
      for (let i: i32 = n - 1; i >= 0; i--) {
        if (i === k) {
          store<f64>(
            solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
            1.0
          )
        } else if (load<i32>(isFreePtr + (<usize>i << 2)) === 1) {
          store<f64>(
            solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
            0.0
          )
        } else if (i > k) {
          let sum: f64 = 0.0
          for (let j: i32 = i + 1; j < n; j++) {
            sum -=
              load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
              load<f64>(solutionsPtr + (<usize>(j * numCols + 1 + freeIdx) << 3))
          }
          store<f64>(
            solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
            sum / load<f64>(UPtr + (<usize>(i * n + i) << 3))
          )
        } else {
          let sum: f64 = 0.0
          for (let j: i32 = i + 1; j < n; j++) {
            sum -=
              load<f64>(UPtr + (<usize>(i * n + j) << 3)) *
              load<f64>(solutionsPtr + (<usize>(j * numCols + 1 + freeIdx) << 3))
          }
          if (Math.abs(load<f64>(UPtr + (<usize>(i * n + i) << 3))) > TOL) {
            store<f64>(
              solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
              sum / load<f64>(UPtr + (<usize>(i * n + i) << 3))
            )
          } else {
            store<f64>(
              solutionsPtr + (<usize>(i * numCols + 1 + freeIdx) << 3),
              0.0
            )
          }
        }
      }
      freeIdx++
    }
  }
}

/**
 * Count the rank of a lower triangular matrix
 * @param LPtr - Pointer to lower triangular matrix (n x n, f64)
 * @param n - Size
 * @returns Number of non-zero diagonal elements
 */
export function lowerTriangularRank(LPtr: usize, n: i32): i32 {
  const TOL: f64 = 1e-14
  let rank: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    if (Math.abs(load<f64>(LPtr + (<usize>(i * n + i) << 3))) > TOL) {
      rank++
    }
  }

  return rank
}

/**
 * Count the rank of an upper triangular matrix
 * @param UPtr - Pointer to upper triangular matrix (n x n, f64)
 * @param n - Size
 * @returns Number of non-zero diagonal elements
 */
export function upperTriangularRank(UPtr: usize, n: i32): i32 {
  const TOL: f64 = 1e-14
  let rank: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    if (Math.abs(load<f64>(UPtr + (<usize>(i * n + i) << 3))) > TOL) {
      rank++
    }
  }

  return rank
}
