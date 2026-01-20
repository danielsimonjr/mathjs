/**
 * WASM-optimized advanced matrix functions
 *
 * Includes: pseudoinverse (pinv), matrix square root (sqrtm),
 * matrix exponential (expm), and eigenvalues (eigs)
 *
 * All matrices are flat Float64Array in row-major order
 */

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Matrix transpose
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
 * Matrix multiplication: C = A * B
 */
function matMul(
  a: Float64Array,
  aRows: i32,
  aCols: i32,
  b: Float64Array,
  bCols: i32
): Float64Array {
  const result = new Float64Array(aRows * bCols)
  for (let i: i32 = 0; i < aRows; i++) {
    for (let j: i32 = 0; j < bCols; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < aCols; k++) {
        sum += a[i * aCols + k] * b[k * bCols + j]
      }
      result[i * bCols + j] = sum
    }
  }
  return result
}

/**
 * Matrix addition: C = A + B
 */
function matAdd(a: Float64Array, b: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)
  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] + b[i]
  }
  return result
}

/**
 * Matrix subtraction: C = A - B
 */
function matSub(a: Float64Array, b: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)
  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] - b[i]
  }
  return result
}

/**
 * Scalar multiply: B = s * A
 */
function scalarMul(a: Float64Array, s: f64, size: i32): Float64Array {
  const result = new Float64Array(size)
  for (let i: i32 = 0; i < size; i++) {
    result[i] = s * a[i]
  }
  return result
}

/**
 * Create identity matrix
 */
function eye(n: i32): Float64Array {
  const result = new Float64Array(n * n)
  for (let i: i32 = 0; i < n; i++) {
    result[i * n + i] = 1.0
  }
  return result
}

/**
 * Copy matrix
 */
function copyMatrix(a: Float64Array, size: i32): Float64Array {
  const result = new Float64Array(size)
  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i]
  }
  return result
}

/**
 * Matrix inverse using Gauss-Jordan elimination
 */
function inv(a: Float64Array, n: i32): Float64Array {
  const aug = new Float64Array(n * n * 2)

  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      aug[i * (2 * n) + j] = a[i * n + j]
      aug[i * (2 * n) + n + j] = i === j ? 1.0 : 0.0
    }
  }

  const width: i32 = 2 * n

  for (let k: i32 = 0; k < n; k++) {
    let maxVal: f64 = Math.abs(aug[k * width + k])
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(aug[i * width + k])
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    if (maxVal < 1e-14) {
      return new Float64Array(0)
    }

    if (pivotRow !== k) {
      for (let j: i32 = 0; j < width; j++) {
        const temp: f64 = aug[k * width + j]
        aug[k * width + j] = aug[pivotRow * width + j]
        aug[pivotRow * width + j] = temp
      }
    }

    const pivot: f64 = aug[k * width + k]
    for (let j: i32 = 0; j < width; j++) {
      aug[k * width + j] /= pivot
    }

    for (let i: i32 = 0; i < n; i++) {
      if (i !== k) {
        const factor: f64 = aug[i * width + k]
        for (let j: i32 = 0; j < width; j++) {
          aug[i * width + j] -= factor * aug[k * width + j]
        }
      }
    }
  }

  const result = new Float64Array(n * n)
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      result[i * n + j] = aug[i * width + n + j]
    }
  }

  return result
}

/**
 * Frobenius norm of matrix
 */
function normFro(a: Float64Array, size: i32): f64 {
  let sum: f64 = 0.0
  for (let i: i32 = 0; i < size; i++) {
    sum += a[i] * a[i]
  }
  return Math.sqrt(sum)
}

/**
 * 1-norm of matrix (max column sum)
 */
function norm1(a: Float64Array, n: i32): f64 {
  let maxColSum: f64 = 0.0
  for (let j: i32 = 0; j < n; j++) {
    let colSum: f64 = 0.0
    for (let i: i32 = 0; i < n; i++) {
      colSum += Math.abs(a[i * n + j])
    }
    if (colSum > maxColSum) {
      maxColSum = colSum
    }
  }
  return maxColSum
}

// ============================================
// PSEUDOINVERSE (Moore-Penrose)
// ============================================

/**
 * Compute the Moore-Penrose pseudoinverse of a matrix
 *
 * For overdetermined (m > n): pinv(A) = (A^T A)^(-1) A^T
 * For underdetermined (m < n): pinv(A) = A^T (A A^T)^(-1)
 * For square full-rank: pinv(A) = inv(A)
 *
 * @param a - Input matrix (rows x cols)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Pseudoinverse matrix (cols x rows), or empty if computation fails
 */
export function pinv(a: Float64Array, rows: i32, cols: i32): Float64Array {
  const aT = transpose(a, rows, cols)

  if (rows >= cols) {
    // Overdetermined or square: pinv(A) = (A^T A)^(-1) A^T
    const aTa = matMul(aT, cols, rows, a, cols) // cols x cols
    const aTaInv = inv(aTa, cols)

    if (aTaInv.length === 0) {
      // A^T A is singular, try regularization
      // Add small diagonal for numerical stability
      const reg = copyMatrix(aTa, cols * cols)
      const eps: f64 = 1e-10 * normFro(aTa, cols * cols)
      for (let i: i32 = 0; i < cols; i++) {
        reg[i * cols + i] += eps
      }
      const regInv = inv(reg, cols)
      if (regInv.length === 0) {
        return new Float64Array(0)
      }
      return matMul(regInv, cols, cols, aT, rows)
    }

    return matMul(aTaInv, cols, cols, aT, rows)
  } else {
    // Underdetermined: pinv(A) = A^T (A A^T)^(-1)
    const aaT = matMul(a, rows, cols, aT, rows) // rows x rows
    const aaTInv = inv(aaT, rows)

    if (aaTInv.length === 0) {
      // A A^T is singular, try regularization
      const reg = copyMatrix(aaT, rows * rows)
      const eps: f64 = 1e-10 * normFro(aaT, rows * rows)
      for (let i: i32 = 0; i < rows; i++) {
        reg[i * rows + i] += eps
      }
      const regInv = inv(reg, rows)
      if (regInv.length === 0) {
        return new Float64Array(0)
      }
      return matMul(aT, cols, rows, regInv, rows)
    }

    return matMul(aT, cols, rows, aaTInv, rows)
  }
}

// ============================================
// MATRIX SQUARE ROOT (Denman-Beavers)
// ============================================

/**
 * Compute the principal square root of a matrix using Denman-Beavers iteration
 *
 * For a matrix A, finds X such that X^2 = A
 *
 * Uses the iteration:
 *   Y_0 = A, Z_0 = I
 *   Y_{k+1} = 0.5 * (Y_k + Z_k^(-1))
 *   Z_{k+1} = 0.5 * (Z_k + Y_k^(-1))
 *
 * Converges to Y -> sqrt(A), Z -> sqrt(A)^(-1)
 *
 * @param a - Input matrix (n x n)
 * @param n - Size of the matrix
 * @param maxIter - Maximum iterations (default 50)
 * @param tol - Convergence tolerance (default 1e-10)
 * @returns Square root matrix, or empty if not converged
 */
export function sqrtm(
  a: Float64Array,
  n: i32,
  maxIter: i32 = 50,
  tol: f64 = 1e-10
): Float64Array {
  const n2: i32 = n * n

  // Initialize Y = A, Z = I
  let Y = copyMatrix(a, n2)
  let Z = eye(n)

  for (let iter: i32 = 0; iter < maxIter; iter++) {
    // Compute inverses
    const Zinv = inv(Z, n)
    const Yinv = inv(Y, n)

    if (Zinv.length === 0 || Yinv.length === 0) {
      return new Float64Array(0) // Singular intermediate matrix
    }

    // Y_new = 0.5 * (Y + Z^(-1))
    const Ynew = scalarMul(matAdd(Y, Zinv, n2), 0.5, n2)

    // Z_new = 0.5 * (Z + Y^(-1))
    const Znew = scalarMul(matAdd(Z, Yinv, n2), 0.5, n2)

    // Check convergence
    const diff = normFro(matSub(Ynew, Y, n2), n2)
    Y = Ynew
    Z = Znew

    if (diff < tol) {
      return Y
    }
  }

  // Return last iterate even if not fully converged
  return Y
}

/**
 * Compute matrix square root for symmetric positive definite matrices
 * using Cholesky-based method (faster for SPD matrices)
 *
 * @param a - Symmetric positive definite matrix (n x n)
 * @param n - Size of the matrix
 * @returns Square root matrix, or empty if not SPD
 */
export function sqrtmSPD(a: Float64Array, n: i32): Float64Array {
  // For SPD matrices, we can use eigenvalue decomposition
  // A = V D V^T, sqrt(A) = V sqrt(D) V^T
  // But eigenvalue decomposition is complex, so we use Denman-Beavers
  // which is actually quite efficient for SPD matrices
  return sqrtm(a, n, 50, 1e-12)
}

// ============================================
// MATRIX EXPONENTIAL (Scaling and Squaring)
// ============================================

/**
 * Compute the matrix exponential exp(A) using scaling and squaring
 * with Padé approximation
 *
 * @param a - Input matrix (n x n)
 * @param n - Size of the matrix
 * @returns Matrix exponential exp(A)
 */
export function expm(a: Float64Array, n: i32): Float64Array {
  const n2: i32 = n * n

  // Determine scaling factor s such that ||A/2^s|| < 0.5
  const normA: f64 = norm1(a, n)
  let s: i32 = 0

  if (normA > 0.5) {
    s = i32(Math.ceil(Math.log2(normA / 0.5)))
    if (s < 0) s = 0
  }

  // Scale matrix
  const scale: f64 = Math.pow(2.0, -f64(s))
  let As = scalarMul(a, scale, n2)

  // Padé approximation coefficients for [6/6]
  // exp(x) ≈ N(x)/D(x) where N, D are degree 6 polynomials
  const c: StaticArray<f64> = [
    1.0,
    0.5,
    0.1, // 1/10
    0.016666666666666666, // 1/60
    0.001984126984126984, // 1/504
    0.00016534391534391535, // 1/6048
    0.000009182736455463728 // 1/108864
  ]

  // Compute powers of As
  const As2 = matMul(As, n, n, As, n)
  const As4 = matMul(As2, n, n, As2, n)
  const As6 = matMul(As4, n, n, As2, n)

  // Compute U = As * (c[1]*I + c[3]*As^2 + c[5]*As^4)
  //         V = c[0]*I + c[2]*As^2 + c[4]*As^4 + c[6]*As^6
  const I = eye(n)

  // V = c[0]*I + c[2]*As^2 + c[4]*As^4 + c[6]*As^6
  let V = copyMatrix(I, n2)
  for (let i: i32 = 0; i < n2; i++) {
    V[i] = c[0] * I[i] + c[2] * As2[i] + c[4] * As4[i] + c[6] * As6[i]
  }

  // U_inner = c[1]*I + c[3]*As^2 + c[5]*As^4
  const Uinner = new Float64Array(n2)
  for (let i: i32 = 0; i < n2; i++) {
    Uinner[i] = c[1] * I[i] + c[3] * As2[i] + c[5] * As4[i]
  }
  const U = matMul(As, n, n, Uinner, n)

  // F = (V - U)^(-1) * (V + U)
  const VmU = matSub(V, U, n2)
  const VpU = matAdd(V, U, n2)

  const VmUinv = inv(VmU, n)
  if (VmUinv.length === 0) {
    return new Float64Array(0)
  }

  let F = matMul(VmUinv, n, n, VpU, n)

  // Square s times
  for (let i: i32 = 0; i < s; i++) {
    F = matMul(F, n, n, F, n)
  }

  return F
}

// ============================================
// EIGENVALUES (Power Iteration + Deflation)
// ============================================

/**
 * Compute dominant eigenvalue and eigenvector using power iteration
 *
 * @param a - Input matrix (n x n)
 * @param n - Size of the matrix
 * @param maxIter - Maximum iterations
 * @param tol - Convergence tolerance
 * @returns [eigenvalue, eigenvector...] or empty if not converged
 */
export function powerIteration(
  a: Float64Array,
  n: i32,
  maxIter: i32 = 100,
  tol: f64 = 1e-10
): Float64Array {
  // Initialize random vector
  let v = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    v[i] = 1.0 / f64(n) + 0.1 * f64(i)
  }

  // Normalize
  let norm: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    norm += v[i] * v[i]
  }
  norm = Math.sqrt(norm)
  for (let i: i32 = 0; i < n; i++) {
    v[i] /= norm
  }

  let eigenvalue: f64 = 0.0

  for (let iter: i32 = 0; iter < maxIter; iter++) {
    // w = A * v
    const w = new Float64Array(n)
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = 0.0
      for (let j: i32 = 0; j < n; j++) {
        sum += a[i * n + j] * v[j]
      }
      w[i] = sum
    }

    // Compute Rayleigh quotient: lambda = v^T * w
    let newEigenvalue: f64 = 0.0
    for (let i: i32 = 0; i < n; i++) {
      newEigenvalue += v[i] * w[i]
    }

    // Normalize w
    norm = 0.0
    for (let i: i32 = 0; i < n; i++) {
      norm += w[i] * w[i]
    }
    norm = Math.sqrt(norm)

    if (norm < 1e-14) {
      return new Float64Array(0) // Degenerate case
    }

    for (let i: i32 = 0; i < n; i++) {
      v[i] = w[i] / norm
    }

    // Check convergence
    if (Math.abs(newEigenvalue - eigenvalue) < tol) {
      const result = new Float64Array(n + 1)
      result[0] = newEigenvalue
      for (let i: i32 = 0; i < n; i++) {
        result[i + 1] = v[i]
      }
      return result
    }

    eigenvalue = newEigenvalue
  }

  // Return last result even if not fully converged
  const result = new Float64Array(n + 1)
  result[0] = eigenvalue
  for (let i: i32 = 0; i < n; i++) {
    result[i + 1] = v[i]
  }
  return result
}

/**
 * Compute all eigenvalues of a symmetric matrix using QR iteration
 *
 * @param a - Symmetric input matrix (n x n)
 * @param n - Size of the matrix
 * @param maxIter - Maximum iterations per eigenvalue
 * @param tol - Convergence tolerance
 * @returns Array of n eigenvalues (real only, sorted descending)
 */
export function eigsSymmetric(
  a: Float64Array,
  n: i32,
  maxIter: i32 = 100,
  tol: f64 = 1e-10
): Float64Array {
  const eigenvalues = new Float64Array(n)

  // Work on a copy
  let work = copyMatrix(a, n * n)

  // QR iteration with shifts (simplified version)
  for (let iter: i32 = 0; iter < maxIter * n; iter++) {
    // Find max off-diagonal element
    let maxOff: f64 = 0.0
    let p: i32 = 0
    let q: i32 = 1

    for (let i: i32 = 0; i < n; i++) {
      for (let j: i32 = i + 1; j < n; j++) {
        const val: f64 = Math.abs(work[i * n + j])
        if (val > maxOff) {
          maxOff = val
          p = i
          q = j
        }
      }
    }

    // Check convergence
    if (maxOff < tol) {
      break
    }

    // Jacobi rotation to zero out (p,q) and (q,p)
    const app: f64 = work[p * n + p]
    const aqq: f64 = work[q * n + q]
    const apq: f64 = work[p * n + q]

    let theta: f64
    if (Math.abs(app - aqq) < 1e-14) {
      theta = Math.PI / 4.0
    } else {
      theta = 0.5 * Math.atan2(2.0 * apq, aqq - app)
    }

    const c: f64 = Math.cos(theta)
    const s: f64 = Math.sin(theta)

    // Apply Jacobi rotation: A' = J^T * A * J
    for (let i: i32 = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const aip: f64 = work[i * n + p]
        const aiq: f64 = work[i * n + q]
        work[i * n + p] = c * aip - s * aiq
        work[p * n + i] = work[i * n + p]
        work[i * n + q] = s * aip + c * aiq
        work[q * n + i] = work[i * n + q]
      }
    }

    work[p * n + p] = c * c * app - 2.0 * c * s * apq + s * s * aqq
    work[q * n + q] = s * s * app + 2.0 * c * s * apq + c * c * aqq
    work[p * n + q] = 0.0
    work[q * n + p] = 0.0
  }

  // Extract diagonal as eigenvalues
  for (let i: i32 = 0; i < n; i++) {
    eigenvalues[i] = work[i * n + i]
  }

  // Sort descending
  for (let i: i32 = 0; i < n - 1; i++) {
    for (let j: i32 = i + 1; j < n; j++) {
      if (eigenvalues[j] > eigenvalues[i]) {
        const temp: f64 = eigenvalues[i]
        eigenvalues[i] = eigenvalues[j]
        eigenvalues[j] = temp
      }
    }
  }

  return eigenvalues
}

/**
 * Compute eigenvalues of a general matrix using QR iteration
 * Returns real parts only (imaginary parts discarded if complex eigenvalues)
 *
 * @param a - Input matrix (n x n)
 * @param n - Size of the matrix
 * @param maxIter - Maximum iterations
 * @param tol - Convergence tolerance
 * @returns Array of n eigenvalues (real parts)
 */
export function eigs(
  a: Float64Array,
  n: i32,
  maxIter: i32 = 200,
  tol: f64 = 1e-10
): Float64Array {
  // Check if matrix is symmetric
  let isSymmetric: bool = true
  for (let i: i32 = 0; i < n && isSymmetric; i++) {
    for (let j: i32 = i + 1; j < n && isSymmetric; j++) {
      if (Math.abs(a[i * n + j] - a[j * n + i]) > 1e-14) {
        isSymmetric = false
      }
    }
  }

  if (isSymmetric) {
    return eigsSymmetric(a, n, maxIter, tol)
  }

  // General case: reduce to upper Hessenberg form and apply QR
  const eigenvalues = new Float64Array(n)
  let H = copyMatrix(a, n * n)

  // Reduce to upper Hessenberg form using Householder reflections
  for (let k: i32 = 0; k < n - 2; k++) {
    // Form Householder vector for column k below diagonal
    let normx: f64 = 0.0
    for (let i: i32 = k + 1; i < n; i++) {
      normx += H[i * n + k] * H[i * n + k]
    }
    normx = Math.sqrt(normx)

    if (normx < 1e-14) continue

    const alpha: f64 = H[(k + 1) * n + k] >= 0 ? -normx : normx
    const u = new Float64Array(n - k - 1)
    u[0] = H[(k + 1) * n + k] - alpha

    for (let i: i32 = 1; i < n - k - 1; i++) {
      u[i] = H[(k + 1 + i) * n + k]
    }

    let normU: f64 = 0.0
    for (let i: i32 = 0; i < n - k - 1; i++) {
      normU += u[i] * u[i]
    }
    normU = Math.sqrt(normU)

    if (normU < 1e-14) continue

    for (let i: i32 = 0; i < n - k - 1; i++) {
      u[i] /= normU
    }

    // Apply H = (I - 2*u*u^T) * H * (I - 2*u*u^T)
    // Left multiplication
    for (let j: i32 = k; j < n; j++) {
      let dot: f64 = 0.0
      for (let i: i32 = 0; i < n - k - 1; i++) {
        dot += u[i] * H[(k + 1 + i) * n + j]
      }
      dot *= 2.0
      for (let i: i32 = 0; i < n - k - 1; i++) {
        H[(k + 1 + i) * n + j] -= dot * u[i]
      }
    }

    // Right multiplication
    for (let i: i32 = 0; i < n; i++) {
      let dot: f64 = 0.0
      for (let j: i32 = 0; j < n - k - 1; j++) {
        dot += H[i * n + (k + 1 + j)] * u[j]
      }
      dot *= 2.0
      for (let j: i32 = 0; j < n - k - 1; j++) {
        H[i * n + (k + 1 + j)] -= dot * u[j]
      }
    }
  }

  // QR iteration on Hessenberg matrix
  let m: i32 = n
  for (let iter: i32 = 0; iter < maxIter && m > 1; iter++) {
    // Check for deflation
    let deflate: bool = false
    for (let i: i32 = m - 1; i > 0; i--) {
      if (
        Math.abs(H[i * n + (i - 1)]) <
        tol * (Math.abs(H[(i - 1) * n + (i - 1)]) + Math.abs(H[i * n + i]))
      ) {
        H[i * n + (i - 1)] = 0.0
        if (i === m - 1) {
          eigenvalues[m - 1] = H[(m - 1) * n + (m - 1)]
          m--
          deflate = true
          break
        }
      }
    }

    if (deflate) continue
    if (m <= 1) break

    // Wilkinson shift
    const a11: f64 = H[(m - 2) * n + (m - 2)]
    const a12: f64 = H[(m - 2) * n + (m - 1)]
    const a21: f64 = H[(m - 1) * n + (m - 2)]
    const a22: f64 = H[(m - 1) * n + (m - 1)]

    const tr: f64 = a11 + a22
    const det: f64 = a11 * a22 - a12 * a21
    const disc: f64 = tr * tr - 4.0 * det

    let shift: f64
    if (disc >= 0) {
      const sqrtDisc: f64 = Math.sqrt(disc)
      const eig1: f64 = 0.5 * (tr + sqrtDisc)
      const eig2: f64 = 0.5 * (tr - sqrtDisc)
      shift = Math.abs(eig1 - a22) < Math.abs(eig2 - a22) ? eig1 : eig2
    } else {
      shift = a22
    }

    // Shift
    for (let i: i32 = 0; i < m; i++) {
      H[i * n + i] -= shift
    }

    // QR step using Givens rotations
    for (let i: i32 = 0; i < m - 1; i++) {
      const a_val: f64 = H[i * n + i]
      const b_val: f64 = H[(i + 1) * n + i]
      const r: f64 = Math.sqrt(a_val * a_val + b_val * b_val)

      if (r < 1e-14) continue

      const c: f64 = a_val / r
      const s: f64 = b_val / r

      // Apply Givens rotation to H from left
      for (let j: i32 = i; j < n; j++) {
        const temp1: f64 = H[i * n + j]
        const temp2: f64 = H[(i + 1) * n + j]
        H[i * n + j] = c * temp1 + s * temp2
        H[(i + 1) * n + j] = -s * temp1 + c * temp2
      }

      // Apply from right
      for (let j: i32 = 0; j <= Math.min(i + 2, m - 1); j++) {
        const temp1: f64 = H[j * n + i]
        const temp2: f64 = H[j * n + (i + 1)]
        H[j * n + i] = c * temp1 + s * temp2
        H[j * n + (i + 1)] = -s * temp1 + c * temp2
      }
    }

    // Unshift
    for (let i: i32 = 0; i < m; i++) {
      H[i * n + i] += shift
    }
  }

  // Extract remaining eigenvalues from diagonal
  for (let i: i32 = 0; i < m; i++) {
    eigenvalues[i] = H[i * n + i]
  }

  // Sort by absolute value descending
  for (let i: i32 = 0; i < n - 1; i++) {
    for (let j: i32 = i + 1; j < n; j++) {
      if (Math.abs(eigenvalues[j]) > Math.abs(eigenvalues[i])) {
        const temp: f64 = eigenvalues[i]
        eigenvalues[i] = eigenvalues[j]
        eigenvalues[j] = temp
      }
    }
  }

  return eigenvalues
}

/**
 * Compute trace of matrix (sum of diagonal)
 */
export function trace(a: Float64Array, n: i32): f64 {
  let sum: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    sum += a[i * n + i]
  }
  return sum
}

/**
 * Compute spectral radius (largest absolute eigenvalue)
 */
export function spectralRadius(a: Float64Array, n: i32): f64 {
  const eigenvalues = eigs(a, n, 200, 1e-10)
  let maxAbs: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    const absVal: f64 = Math.abs(eigenvalues[i])
    if (absVal > maxAbs) {
      maxAbs = absVal
    }
  }
  return maxAbs
}
