/**
 * WASM-optimized matrix equation solvers
 *
 * Includes Lyapunov and Sylvester equation solvers using
 * the vectorization (Kronecker product) approach.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Matrix transpose (internal helper)
 * @param aPtr - Input matrix pointer (rows x cols, f64)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Output transposed matrix (cols x rows, f64)
 */
function transpose(aPtr: usize, rows: i32, cols: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < rows; i++) {
    for (let j: i32 = 0; j < cols; j++) {
      store<f64>(
        resultPtr + (<usize>(j * rows + i) << 3),
        load<f64>(aPtr + (<usize>(i * cols + j) << 3))
      )
    }
  }
}

/**
 * Create identity matrix (internal helper)
 * @param n - Size of identity matrix
 * @param resultPtr - Output identity matrix (n x n, f64)
 */
function eye(n: i32, resultPtr: usize): void {
  const n2: i32 = n * n
  for (let i: i32 = 0; i < n2; i++) {
    store<f64>(resultPtr + (<usize>i << 3), 0.0)
  }
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(resultPtr + (<usize>(i * n + i) << 3), 1.0)
  }
}

/**
 * Kronecker product: C = A ⊗ B (internal helper)
 * @param aPtr - First matrix (aRows x aCols, f64)
 * @param aRows - Rows in A
 * @param aCols - Columns in A
 * @param bPtr - Second matrix (bRows x bCols, f64)
 * @param bRows - Rows in B
 * @param bCols - Columns in B
 * @param resultPtr - Output Kronecker product (aRows*bRows x aCols*bCols, f64)
 */
function kron(
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
          store<f64>(
            resultPtr + (<usize>(row * resultCols + col) << 3),
            aVal * load<f64>(bPtr + (<usize>(k * bCols + l) << 3))
          )
        }
      }
    }
  }
}

/**
 * Solve linear system Ax = b using LU decomposition with partial pivoting
 * @param aPtr - Coefficient matrix (n x n, f64)
 * @param bPtr - Right-hand side (n, f64)
 * @param n - Size
 * @param xPtr - Solution vector output (n, f64)
 * @param workPtr - Work buffer (at least n*n f64 + n i32)
 * @returns 1 if successful, 0 if singular
 */
function solveLinear(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  xPtr: usize,
  workPtr: usize
): i32 {
  const luPtr = workPtr
  const permPtr = workPtr + (<usize>(n * n) << 3)

  // Copy a to lu
  for (let i: i32 = 0; i < n * n; i++) {
    store<f64>(luPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>i << 3)))
  }

  for (let i: i32 = 0; i < n; i++) {
    store<i32>(permPtr + (<usize>i << 2), i)
  }

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
        const temp: f64 = load<f64>(luPtr + (<usize>(k * n + j) << 3))
        store<f64>(
          luPtr + (<usize>(k * n + j) << 3),
          load<f64>(luPtr + (<usize>(pivotRow * n + j) << 3))
        )
        store<f64>(luPtr + (<usize>(pivotRow * n + j) << 3), temp)
      }

      // Swap in permutation
      const tempP: i32 = load<i32>(permPtr + (<usize>k << 2))
      store<i32>(permPtr + (<usize>k << 2), load<i32>(permPtr + (<usize>pivotRow << 2)))
      store<i32>(permPtr + (<usize>pivotRow << 2), tempP)
    }

    // Eliminate
    const pivot: f64 = load<f64>(luPtr + (<usize>(k * n + k) << 3))
    for (let i: i32 = k + 1; i < n; i++) {
      const factor: f64 = load<f64>(luPtr + (<usize>(i * n + k) << 3)) / pivot
      store<f64>(luPtr + (<usize>(i * n + k) << 3), factor)

      for (let j: i32 = k + 1; j < n; j++) {
        store<f64>(
          luPtr + (<usize>(i * n + j) << 3),
          load<f64>(luPtr + (<usize>(i * n + j) << 3)) -
            factor * load<f64>(luPtr + (<usize>(k * n + j) << 3))
        )
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

  return 1
}

// ============================================
// SYLVESTER EQUATION SOLVER
// ============================================

/**
 * Solve the Sylvester equation: AX + XB = C
 *
 * Uses vectorization: (I ⊗ A + B^T ⊗ I) * vec(X) = vec(C)
 *
 * @param aPtr - Pointer to matrix A (n x n, f64)
 * @param n - Size of A
 * @param bPtr - Pointer to matrix B (m x m, f64)
 * @param m - Size of B
 * @param cPtr - Pointer to matrix C (n x m, f64)
 * @param xPtr - Pointer to solution X output (n x m, f64)
 * @param workPtr - Pointer to work buffer (needs (nm)^2 + 4*max(n,m)^2 + nm + n*m + nm f64 values)
 * @returns 1 if successful, 0 if no unique solution
 */
export function sylvester(
  aPtr: usize,
  n: i32,
  bPtr: usize,
  m: i32,
  cPtr: usize,
  xPtr: usize,
  workPtr: usize
): i32 {
  const nm: i32 = n * m
  const nm2: i32 = nm * nm

  // Work buffer layout:
  // - I_n: n*n f64
  // - I_m: m*m f64
  // - BT: m*m f64
  // - term1: nm*nm f64
  // - term2: nm*nm f64
  // - coeff: nm*nm f64
  // - vecC: nm f64
  // - vecX: nm f64
  // - solveWork: nm*nm f64 + nm i32
  const I_nPtr = workPtr
  const I_mPtr = I_nPtr + (<usize>(n * n) << 3)
  const BTPtr = I_mPtr + (<usize>(m * m) << 3)
  const term1Ptr = BTPtr + (<usize>(m * m) << 3)
  const term2Ptr = term1Ptr + (<usize>nm2 << 3)
  const coeffPtr = term2Ptr + (<usize>nm2 << 3)
  const vecCPtr = coeffPtr + (<usize>nm2 << 3)
  const vecXPtr = vecCPtr + (<usize>nm << 3)
  const solveWorkPtr = vecXPtr + (<usize>nm << 3)

  // Create identity matrices
  eye(n, I_nPtr)
  eye(m, I_mPtr)

  // Transpose B
  transpose(bPtr, m, m, BTPtr)

  // First term: I_m ⊗ A (size: nm x nm)
  kron(I_mPtr, m, m, aPtr, n, n, term1Ptr)

  // Second term: B^T ⊗ I_n (size: nm x nm)
  kron(BTPtr, m, m, I_nPtr, n, n, term2Ptr)

  // Coefficient matrix: term1 + term2
  for (let i: i32 = 0; i < nm2; i++) {
    store<f64>(
      coeffPtr + (<usize>i << 3),
      load<f64>(term1Ptr + (<usize>i << 3)) + load<f64>(term2Ptr + (<usize>i << 3))
    )
  }

  // vec(C): stack columns of C
  for (let j: i32 = 0; j < m; j++) {
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(
        vecCPtr + (<usize>(j * n + i) << 3),
        load<f64>(cPtr + (<usize>(i * m + j) << 3))
      )
    }
  }

  // Solve the linear system
  const success = solveLinear(coeffPtr, vecCPtr, nm, vecXPtr, solveWorkPtr)

  if (success === 0) {
    return 0 // No unique solution
  }

  // Unvectorize: reshape vec(X) to X
  for (let j: i32 = 0; j < m; j++) {
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(
        xPtr + (<usize>(i * m + j) << 3),
        load<f64>(vecXPtr + (<usize>(j * n + i) << 3))
      )
    }
  }

  return 1
}

// ============================================
// LYAPUNOV EQUATION SOLVER
// ============================================

/**
 * Solve the continuous-time Lyapunov equation: AX + XA^T = Q
 *
 * @param aPtr - Pointer to matrix A (n x n, f64)
 * @param n - Size of A
 * @param qPtr - Pointer to matrix Q (n x n, f64)
 * @param xPtr - Pointer to solution X output (n x n, f64)
 * @param workPtr - Pointer to work buffer
 * @returns 1 if successful, 0 if no unique solution
 */
export function lyap(
  aPtr: usize,
  n: i32,
  qPtr: usize,
  xPtr: usize,
  workPtr: usize
): i32 {
  const n2: i32 = n * n
  const n4: i32 = n2 * n2

  // Work buffer layout
  const I_nPtr = workPtr
  const term1Ptr = I_nPtr + (<usize>n2 << 3)
  const term2Ptr = term1Ptr + (<usize>n4 << 3)
  const coeffPtr = term2Ptr + (<usize>n4 << 3)
  const vecQPtr = coeffPtr + (<usize>n4 << 3)
  const vecXPtr = vecQPtr + (<usize>n2 << 3)
  const solveWorkPtr = vecXPtr + (<usize>n2 << 3)

  // Create identity matrix
  eye(n, I_nPtr)

  // First term: I ⊗ A
  kron(I_nPtr, n, n, aPtr, n, n, term1Ptr)

  // Second term: A ⊗ I
  kron(aPtr, n, n, I_nPtr, n, n, term2Ptr)

  // Coefficient matrix
  for (let i: i32 = 0; i < n4; i++) {
    store<f64>(
      coeffPtr + (<usize>i << 3),
      load<f64>(term1Ptr + (<usize>i << 3)) + load<f64>(term2Ptr + (<usize>i << 3))
    )
  }

  // vec(Q): stack columns
  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(
        vecQPtr + (<usize>(j * n + i) << 3),
        load<f64>(qPtr + (<usize>(i * n + j) << 3))
      )
    }
  }

  // Solve
  const success = solveLinear(coeffPtr, vecQPtr, n2, vecXPtr, solveWorkPtr)

  if (success === 0) {
    return 0 // No unique solution
  }

  // Unvectorize
  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(
        xPtr + (<usize>(i * n + j) << 3),
        load<f64>(vecXPtr + (<usize>(j * n + i) << 3))
      )
    }
  }

  return 1
}

/**
 * Solve the discrete-time Lyapunov equation: AXA^T - X = Q
 *
 * @param aPtr - Pointer to matrix A (n x n, f64)
 * @param n - Size of A
 * @param qPtr - Pointer to matrix Q (n x n, f64)
 * @param xPtr - Pointer to solution X output (n x n, f64)
 * @param workPtr - Pointer to work buffer
 * @returns 1 if successful, 0 if no unique solution
 */
export function dlyap(
  aPtr: usize,
  n: i32,
  qPtr: usize,
  xPtr: usize,
  workPtr: usize
): i32 {
  const n2: i32 = n * n
  const n4: i32 = n2 * n2

  // Work buffer layout
  const AkronAPtr = workPtr
  const coeffPtr = AkronAPtr + (<usize>n4 << 3)
  const vecQPtr = coeffPtr + (<usize>n4 << 3)
  const vecXPtr = vecQPtr + (<usize>n2 << 3)
  const solveWorkPtr = vecXPtr + (<usize>n2 << 3)

  // A ⊗ A
  kron(aPtr, n, n, aPtr, n, n, AkronAPtr)

  // Coefficient matrix: A ⊗ A - I
  for (let i: i32 = 0; i < n4; i++) {
    store<f64>(coeffPtr + (<usize>i << 3), load<f64>(AkronAPtr + (<usize>i << 3)))
  }

  // Subtract identity
  for (let i: i32 = 0; i < n2; i++) {
    store<f64>(
      coeffPtr + (<usize>(i * n2 + i) << 3),
      load<f64>(coeffPtr + (<usize>(i * n2 + i) << 3)) - 1.0
    )
  }

  // vec(Q)
  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(
        vecQPtr + (<usize>(j * n + i) << 3),
        load<f64>(qPtr + (<usize>(i * n + j) << 3))
      )
    }
  }

  // Solve
  const success = solveLinear(coeffPtr, vecQPtr, n2, vecXPtr, solveWorkPtr)

  if (success === 0) {
    return 0
  }

  // Unvectorize
  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(
        xPtr + (<usize>(i * n + j) << 3),
        load<f64>(vecXPtr + (<usize>(j * n + i) << 3))
      )
    }
  }

  return 1
}

// ============================================
// MATRIX EQUATION RESIDUAL
// ============================================

/**
 * Compute the residual of Sylvester equation: ||AX + XB - C||_F
 * @param aPtr - Matrix A (n x n, f64)
 * @param n - Size of A
 * @param xPtr - Solution X (n x m, f64)
 * @param bPtr - Matrix B (m x m, f64)
 * @param m - Size of B
 * @param cPtr - Matrix C (n x m, f64)
 * @param workPtr - Work buffer (at least 2*n*m f64)
 * @returns Frobenius norm of residual
 */
export function sylvesterResidual(
  aPtr: usize,
  n: i32,
  xPtr: usize,
  bPtr: usize,
  m: i32,
  cPtr: usize,
  workPtr: usize
): f64 {
  const axPtr = workPtr
  const xbPtr = axPtr + (<usize>(n * m) << 3)

  // Compute AX
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < m; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum +=
          load<f64>(aPtr + (<usize>(i * n + k) << 3)) *
          load<f64>(xPtr + (<usize>(k * m + j) << 3))
      }
      store<f64>(axPtr + (<usize>(i * m + j) << 3), sum)
    }
  }

  // Compute XB
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < m; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < m; k++) {
        sum +=
          load<f64>(xPtr + (<usize>(i * m + k) << 3)) *
          load<f64>(bPtr + (<usize>(k * m + j) << 3))
      }
      store<f64>(xbPtr + (<usize>(i * m + j) << 3), sum)
    }
  }

  // Compute Frobenius norm of AX + XB - C
  let normSq: f64 = 0.0

  for (let i: i32 = 0; i < n * m; i++) {
    const diff: f64 =
      load<f64>(axPtr + (<usize>i << 3)) +
      load<f64>(xbPtr + (<usize>i << 3)) -
      load<f64>(cPtr + (<usize>i << 3))
    normSq += diff * diff
  }

  return Math.sqrt(normSq)
}

/**
 * Compute the residual of Lyapunov equation: ||AX + XA^T - Q||_F
 * @param aPtr - Matrix A (n x n, f64)
 * @param n - Size of A
 * @param xPtr - Solution X (n x n, f64)
 * @param qPtr - Matrix Q (n x n, f64)
 * @param workPtr - Work buffer (at least 2*n*n f64)
 * @returns Frobenius norm of residual
 */
export function lyapResidual(
  aPtr: usize,
  n: i32,
  xPtr: usize,
  qPtr: usize,
  workPtr: usize
): f64 {
  const n2: i32 = n * n
  const axPtr = workPtr
  const xatPtr = axPtr + (<usize>n2 << 3)

  // Compute AX
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum +=
          load<f64>(aPtr + (<usize>(i * n + k) << 3)) *
          load<f64>(xPtr + (<usize>(k * n + j) << 3))
      }
      store<f64>(axPtr + (<usize>(i * n + j) << 3), sum)
    }
  }

  // Compute XA^T
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum +=
          load<f64>(xPtr + (<usize>(i * n + k) << 3)) *
          load<f64>(aPtr + (<usize>(j * n + k) << 3)) // A^T[k,j] = A[j,k]
      }
      store<f64>(xatPtr + (<usize>(i * n + j) << 3), sum)
    }
  }

  // Compute Frobenius norm of AX + XA^T - Q
  let normSq: f64 = 0.0

  for (let i: i32 = 0; i < n2; i++) {
    const diff: f64 =
      load<f64>(axPtr + (<usize>i << 3)) +
      load<f64>(xatPtr + (<usize>i << 3)) -
      load<f64>(qPtr + (<usize>i << 3))
    normSq += diff * diff
  }

  return Math.sqrt(normSq)
}

/**
 * Compute the residual of discrete Lyapunov: ||AXA^T - X - Q||_F
 * @param aPtr - Matrix A (n x n, f64)
 * @param n - Size of A
 * @param xPtr - Solution X (n x n, f64)
 * @param qPtr - Matrix Q (n x n, f64)
 * @param workPtr - Work buffer (at least 2*n*n f64)
 * @returns Frobenius norm of residual
 */
export function dlyapResidual(
  aPtr: usize,
  n: i32,
  xPtr: usize,
  qPtr: usize,
  workPtr: usize
): f64 {
  const n2: i32 = n * n
  const axPtr = workPtr
  const axatPtr = axPtr + (<usize>n2 << 3)

  // Compute AX
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum +=
          load<f64>(aPtr + (<usize>(i * n + k) << 3)) *
          load<f64>(xPtr + (<usize>(k * n + j) << 3))
      }
      store<f64>(axPtr + (<usize>(i * n + j) << 3), sum)
    }
  }

  // Compute (AX)A^T
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum +=
          load<f64>(axPtr + (<usize>(i * n + k) << 3)) *
          load<f64>(aPtr + (<usize>(j * n + k) << 3))
      }
      store<f64>(axatPtr + (<usize>(i * n + j) << 3), sum)
    }
  }

  // Compute Frobenius norm of AXA^T - X - Q
  let normSq: f64 = 0.0

  for (let i: i32 = 0; i < n2; i++) {
    const diff: f64 =
      load<f64>(axatPtr + (<usize>i << 3)) -
      load<f64>(xPtr + (<usize>i << 3)) -
      load<f64>(qPtr + (<usize>i << 3))
    normSq += diff * diff
  }

  return Math.sqrt(normSq)
}
