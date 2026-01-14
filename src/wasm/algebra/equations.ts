/**
 * WASM-optimized matrix equation solvers
 *
 * Includes Lyapunov and Sylvester equation solvers using
 * the vectorization (Kronecker product) approach.
 *
 * All matrices are flat Float64Array in row-major order
 */

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Matrix transpose
 * @param a - Input matrix (rows x cols)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Transposed matrix (cols x rows)
 */
function transpose(a: Float64Array, rows: i32, cols: i32): Float64Array {
  const result = new Float64Array(rows * cols)

  for (let i: i32 = 0; i < rows; i++) {
    for (let j: i32 = 0; j < cols; j++) {
      result[j * rows + i] = a[i * cols + j]
    }
  }

  return result
}

/**
 * Create identity matrix
 * @param n - Size of identity matrix
 * @returns Identity matrix (n x n)
 */
function eye(n: i32): Float64Array {
  const result = new Float64Array(n * n)

  for (let i: i32 = 0; i < n; i++) {
    result[i * n + i] = 1.0
  }

  return result
}

/**
 * Kronecker product: C = A ⊗ B
 * @param a - First matrix (aRows x aCols)
 * @param aRows - Rows in A
 * @param aCols - Columns in A
 * @param b - Second matrix (bRows x bCols)
 * @param bRows - Rows in B
 * @param bCols - Columns in B
 * @returns Kronecker product
 */
function kron(
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

/**
 * Solve linear system Ax = b using LU decomposition with partial pivoting
 * @param a - Coefficient matrix (n x n)
 * @param b - Right-hand side (n)
 * @param n - Size
 * @returns Solution vector x, or empty if singular
 */
function solveLinear(a: Float64Array, b: Float64Array, n: i32): Float64Array {
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

// ============================================
// SYLVESTER EQUATION SOLVER
// ============================================

/**
 * Solve the Sylvester equation: AX + XB = C
 *
 * Uses vectorization: (I ⊗ A + B^T ⊗ I) * vec(X) = vec(C)
 * where vec(X) stacks columns of X into a vector
 *
 * @param a - Matrix A (n x n)
 * @param n - Size of A
 * @param b - Matrix B (m x m)
 * @param m - Size of B
 * @param c - Matrix C (n x m)
 * @returns Solution X (n x m), or empty array if no unique solution
 */
export function sylvester(
  a: Float64Array,
  n: i32,
  b: Float64Array,
  m: i32,
  c: Float64Array
): Float64Array {
  // Vectorize: (I_m ⊗ A + B^T ⊗ I_n) * vec(X) = vec(C)
  const I_n = eye(n)
  const I_m = eye(m)
  const BT = transpose(b, m, m)

  // First term: I_m ⊗ A (size: nm x nm)
  const term1 = kron(I_m, m, m, a, n, n)

  // Second term: B^T ⊗ I_n (size: nm x nm)
  const term2 = kron(BT, m, m, I_n, n, n)

  // Coefficient matrix: term1 + term2
  const nm: i32 = n * m
  const coeff = new Float64Array(nm * nm)

  for (let i: i32 = 0; i < nm * nm; i++) {
    coeff[i] = term1[i] + term2[i]
  }

  // vec(C): stack columns of C
  const vecC = new Float64Array(nm)

  for (let j: i32 = 0; j < m; j++) {
    for (let i: i32 = 0; i < n; i++) {
      vecC[j * n + i] = c[i * m + j]
    }
  }

  // Solve the linear system
  const vecX = solveLinear(coeff, vecC, nm)

  if (vecX.length === 0) {
    return new Float64Array(0) // No unique solution
  }

  // Unvectorize: reshape vec(X) to X
  const result = new Float64Array(n * m)

  for (let j: i32 = 0; j < m; j++) {
    for (let i: i32 = 0; i < n; i++) {
      result[i * m + j] = vecX[j * n + i]
    }
  }

  return result
}

// ============================================
// LYAPUNOV EQUATION SOLVER
// ============================================

/**
 * Solve the continuous-time Lyapunov equation: AX + XA^T = Q
 *
 * Uses vectorization: (I ⊗ A + A ⊗ I) * vec(X) = vec(Q)
 *
 * @param a - Matrix A (n x n)
 * @param n - Size of A
 * @param q - Matrix Q (n x n, should be symmetric for meaningful solutions)
 * @returns Solution X (n x n), or empty array if no unique solution
 */
export function lyap(a: Float64Array, n: i32, q: Float64Array): Float64Array {
  // The continuous Lyapunov equation AX + XA^T = Q
  // Vectorized: (I ⊗ A + A ⊗ I) * vec(X) = vec(Q)

  const I_n = eye(n)

  // First term: I ⊗ A
  const term1 = kron(I_n, n, n, a, n, n)

  // Second term: A ⊗ I
  const term2 = kron(a, n, n, I_n, n, n)

  // Coefficient matrix
  const n2: i32 = n * n
  const coeff = new Float64Array(n2 * n2)

  for (let i: i32 = 0; i < n2 * n2; i++) {
    coeff[i] = term1[i] + term2[i]
  }

  // vec(Q): stack columns
  const vecQ = new Float64Array(n2)

  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      vecQ[j * n + i] = q[i * n + j]
    }
  }

  // Solve
  const vecX = solveLinear(coeff, vecQ, n2)

  if (vecX.length === 0) {
    return new Float64Array(0) // No unique solution
  }

  // Unvectorize
  const result = new Float64Array(n2)

  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      result[i * n + j] = vecX[j * n + i]
    }
  }

  return result
}

/**
 * Solve the discrete-time Lyapunov equation: AXA^T - X = Q
 *
 * Rearranged: AXA^T - X = Q => (A ⊗ A - I) * vec(X) = vec(Q)
 *
 * @param a - Matrix A (n x n)
 * @param n - Size of A
 * @param q - Matrix Q (n x n)
 * @returns Solution X (n x n), or empty array if no unique solution
 */
export function dlyap(a: Float64Array, n: i32, q: Float64Array): Float64Array {
  // Discrete Lyapunov: AXA^T - X = Q
  // Vectorized: (A ⊗ A) * vec(X) - vec(X) = vec(Q)
  //           : (A ⊗ A - I) * vec(X) = vec(Q)

  const n2: i32 = n * n

  // A ⊗ A
  const AkronA = kron(a, n, n, a, n, n)

  // Coefficient matrix: A ⊗ A - I
  const coeff = new Float64Array(n2 * n2)

  for (let i: i32 = 0; i < n2 * n2; i++) {
    coeff[i] = AkronA[i]
  }

  // Subtract identity
  for (let i: i32 = 0; i < n2; i++) {
    coeff[i * n2 + i] -= 1.0
  }

  // vec(Q)
  const vecQ = new Float64Array(n2)

  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      vecQ[j * n + i] = q[i * n + j]
    }
  }

  // Solve
  const vecX = solveLinear(coeff, vecQ, n2)

  if (vecX.length === 0) {
    return new Float64Array(0)
  }

  // Unvectorize
  const result = new Float64Array(n2)

  for (let j: i32 = 0; j < n; j++) {
    for (let i: i32 = 0; i < n; i++) {
      result[i * n + j] = vecX[j * n + i]
    }
  }

  return result
}

// ============================================
// MATRIX EQUATION RESIDUAL
// ============================================

/**
 * Compute the residual of Sylvester equation: ||AX + XB - C||_F
 * @param a - Matrix A (n x n)
 * @param n - Size of A
 * @param x - Solution X (n x m)
 * @param b - Matrix B (m x m)
 * @param m - Size of B
 * @param c - Matrix C (n x m)
 * @returns Frobenius norm of residual
 */
export function sylvesterResidual(
  a: Float64Array,
  n: i32,
  x: Float64Array,
  b: Float64Array,
  m: i32,
  c: Float64Array
): f64 {
  // Compute AX
  const ax = new Float64Array(n * m)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < m; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum += a[i * n + k] * x[k * m + j]
      }
      ax[i * m + j] = sum
    }
  }

  // Compute XB
  const xb = new Float64Array(n * m)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < m; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < m; k++) {
        sum += x[i * m + k] * b[k * m + j]
      }
      xb[i * m + j] = sum
    }
  }

  // Compute Frobenius norm of AX + XB - C
  let normSq: f64 = 0.0

  for (let i: i32 = 0; i < n * m; i++) {
    const diff: f64 = ax[i] + xb[i] - c[i]
    normSq += diff * diff
  }

  return Math.sqrt(normSq)
}

/**
 * Compute the residual of Lyapunov equation: ||AX + XA^T - Q||_F
 * @param a - Matrix A (n x n)
 * @param n - Size of A
 * @param x - Solution X (n x n)
 * @param q - Matrix Q (n x n)
 * @returns Frobenius norm of residual
 */
export function lyapResidual(
  a: Float64Array,
  n: i32,
  x: Float64Array,
  q: Float64Array
): f64 {
  // Compute AX
  const ax = new Float64Array(n * n)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum += a[i * n + k] * x[k * n + j]
      }
      ax[i * n + j] = sum
    }
  }

  // Compute XA^T
  const xat = new Float64Array(n * n)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum += x[i * n + k] * a[j * n + k] // A^T[k,j] = A[j,k]
      }
      xat[i * n + j] = sum
    }
  }

  // Compute Frobenius norm of AX + XA^T - Q
  let normSq: f64 = 0.0

  for (let i: i32 = 0; i < n * n; i++) {
    const diff: f64 = ax[i] + xat[i] - q[i]
    normSq += diff * diff
  }

  return Math.sqrt(normSq)
}

/**
 * Compute the residual of discrete Lyapunov: ||AXA^T - X - Q||_F
 * @param a - Matrix A (n x n)
 * @param n - Size of A
 * @param x - Solution X (n x n)
 * @param q - Matrix Q (n x n)
 * @returns Frobenius norm of residual
 */
export function dlyapResidual(
  a: Float64Array,
  n: i32,
  x: Float64Array,
  q: Float64Array
): f64 {
  // Compute AX
  const ax = new Float64Array(n * n)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum += a[i * n + k] * x[k * n + j]
      }
      ax[i * n + j] = sum
    }
  }

  // Compute (AX)A^T
  const axat = new Float64Array(n * n)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < n; k++) {
        sum += ax[i * n + k] * a[j * n + k]
      }
      axat[i * n + j] = sum
    }
  }

  // Compute Frobenius norm of AXA^T - X - Q
  let normSq: f64 = 0.0

  for (let i: i32 = 0; i < n * n; i++) {
    const diff: f64 = axat[i] - x[i] - q[i]
    normSq += diff * diff
  }

  return Math.sqrt(normSq)
}
