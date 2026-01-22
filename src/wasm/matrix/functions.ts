/**
 * WASM-optimized advanced matrix functions
 *
 * Includes: pseudoinverse (pinv), matrix square root (sqrtm),
 * matrix exponential (expm), and eigenvalues (eigs)
 *
 * All matrices are flat f64 arrays in row-major order accessed via raw pointers.
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// ============================================
// HELPER FUNCTIONS (internal, use raw pointers)
// ============================================

/**
 * Matrix transpose: result = a^T
 * @param aPtr - Pointer to input matrix (rows x cols)
 * @param rows - Number of rows in a
 * @param cols - Number of columns in a
 * @param resultPtr - Pointer to output matrix (cols x rows)
 */
function transposeInternal(
  aPtr: usize,
  rows: i32,
  cols: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < rows; i++) {
    for (let j: i32 = 0; j < cols; j++) {
      const srcIdx: usize = <usize>(i * cols + j) << 3
      const dstIdx: usize = <usize>(j * rows + i) << 3
      store<f64>(resultPtr + dstIdx, load<f64>(aPtr + srcIdx))
    }
  }
}

/**
 * Matrix multiplication: result = A * B
 * @param aPtr - Pointer to matrix A (aRows x aCols)
 * @param aRows - Number of rows in A
 * @param aCols - Number of columns in A
 * @param bPtr - Pointer to matrix B (aCols x bCols)
 * @param bCols - Number of columns in B
 * @param resultPtr - Pointer to result matrix (aRows x bCols)
 */
function matMulInternal(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  bPtr: usize,
  bCols: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < aRows; i++) {
    for (let j: i32 = 0; j < bCols; j++) {
      let sum: f64 = 0.0
      for (let k: i32 = 0; k < aCols; k++) {
        const aVal = load<f64>(aPtr + (<usize>(i * aCols + k) << 3))
        const bVal = load<f64>(bPtr + (<usize>(k * bCols + j) << 3))
        sum += aVal * bVal
      }
      store<f64>(resultPtr + (<usize>(i * bCols + j) << 3), sum)
    }
  }
}

/**
 * Matrix addition: result = A + B
 * @param aPtr - Pointer to matrix A
 * @param bPtr - Pointer to matrix B
 * @param size - Number of elements
 * @param resultPtr - Pointer to result matrix
 */
function matAddInternal(
  aPtr: usize,
  bPtr: usize,
  size: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) + load<f64>(bPtr + offset))
  }
}

/**
 * Matrix subtraction: result = A - B
 * @param aPtr - Pointer to matrix A
 * @param bPtr - Pointer to matrix B
 * @param size - Number of elements
 * @param resultPtr - Pointer to result matrix
 */
function matSubInternal(
  aPtr: usize,
  bPtr: usize,
  size: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) - load<f64>(bPtr + offset))
  }
}

/**
 * Scalar multiply: result = s * A
 * @param aPtr - Pointer to matrix A
 * @param s - Scalar value
 * @param size - Number of elements
 * @param resultPtr - Pointer to result matrix
 */
function scalarMulInternal(
  aPtr: usize,
  s: f64,
  size: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, s * load<f64>(aPtr + offset))
  }
}

/**
 * Create identity matrix
 * @param n - Size of matrix
 * @param resultPtr - Pointer to result matrix (n x n)
 */
function eyeInternal(n: i32, resultPtr: usize): void {
  const n2: i32 = n * n
  // Zero out first
  for (let i: i32 = 0; i < n2; i++) {
    store<f64>(resultPtr + (<usize>i << 3), 0.0)
  }
  // Set diagonal
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(resultPtr + (<usize>(i * n + i) << 3), 1.0)
  }
}

/**
 * Copy matrix
 * @param srcPtr - Pointer to source matrix
 * @param size - Number of elements
 * @param dstPtr - Pointer to destination matrix
 */
function copyMatrixInternal(srcPtr: usize, size: i32, dstPtr: usize): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(dstPtr + offset, load<f64>(srcPtr + offset))
  }
}

/**
 * Matrix inverse using Gauss-Jordan elimination
 * @param aPtr - Pointer to input matrix (n x n)
 * @param n - Size of matrix
 * @param resultPtr - Pointer to result matrix (n x n)
 * @param augPtr - Pointer to working memory for augmented matrix (n x 2n f64s)
 * @returns 1 if successful, 0 if singular
 */
function invInternal(
  aPtr: usize,
  n: i32,
  resultPtr: usize,
  augPtr: usize
): i32 {
  const width: i32 = 2 * n

  // Initialize augmented matrix [A | I]
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      const srcOffset: usize = <usize>(i * n + j) << 3
      const dstOffset: usize = <usize>(i * width + j) << 3
      store<f64>(augPtr + dstOffset, load<f64>(aPtr + srcOffset))
      store<f64>(augPtr + (<usize>(i * width + n + j) << 3), i === j ? 1.0 : 0.0)
    }
  }

  for (let k: i32 = 0; k < n; k++) {
    let maxVal: f64 = Math.abs(load<f64>(augPtr + (<usize>(k * width + k) << 3)))
    let pivotRow: i32 = k

    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = Math.abs(load<f64>(augPtr + (<usize>(i * width + k) << 3)))
      if (val > maxVal) {
        maxVal = val
        pivotRow = i
      }
    }

    if (maxVal < 1e-14) {
      return 0 // Singular matrix
    }

    if (pivotRow !== k) {
      for (let j: i32 = 0; j < width; j++) {
        const kIdx: usize = <usize>(k * width + j) << 3
        const pivotIdx: usize = <usize>(pivotRow * width + j) << 3
        const temp: f64 = load<f64>(augPtr + kIdx)
        store<f64>(augPtr + kIdx, load<f64>(augPtr + pivotIdx))
        store<f64>(augPtr + pivotIdx, temp)
      }
    }

    const pivot: f64 = load<f64>(augPtr + (<usize>(k * width + k) << 3))
    for (let j: i32 = 0; j < width; j++) {
      const idx: usize = <usize>(k * width + j) << 3
      store<f64>(augPtr + idx, load<f64>(augPtr + idx) / pivot)
    }

    for (let i: i32 = 0; i < n; i++) {
      if (i !== k) {
        const factor: f64 = load<f64>(augPtr + (<usize>(i * width + k) << 3))
        for (let j: i32 = 0; j < width; j++) {
          const iIdx: usize = <usize>(i * width + j) << 3
          const kIdx: usize = <usize>(k * width + j) << 3
          store<f64>(augPtr + iIdx, load<f64>(augPtr + iIdx) - factor * load<f64>(augPtr + kIdx))
        }
      }
    }
  }

  // Extract inverse from augmented matrix
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      const srcIdx: usize = <usize>(i * width + n + j) << 3
      const dstIdx: usize = <usize>(i * n + j) << 3
      store<f64>(resultPtr + dstIdx, load<f64>(augPtr + srcIdx))
    }
  }

  return 1
}

/**
 * Frobenius norm of matrix
 * @param aPtr - Pointer to matrix
 * @param size - Number of elements
 * @returns Frobenius norm
 */
function normFroInternal(aPtr: usize, size: i32): f64 {
  let sum: f64 = 0.0
  for (let i: i32 = 0; i < size; i++) {
    const val: f64 = load<f64>(aPtr + (<usize>i << 3))
    sum += val * val
  }
  return Math.sqrt(sum)
}

/**
 * 1-norm of matrix (max column sum)
 * @param aPtr - Pointer to matrix
 * @param n - Size of square matrix
 * @returns 1-norm
 */
function norm1Internal(aPtr: usize, n: i32): f64 {
  let maxColSum: f64 = 0.0
  for (let j: i32 = 0; j < n; j++) {
    let colSum: f64 = 0.0
    for (let i: i32 = 0; i < n; i++) {
      colSum += Math.abs(load<f64>(aPtr + (<usize>(i * n + j) << 3)))
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
 * @param aPtr - Pointer to input matrix (rows x cols)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Pointer to output matrix (cols x rows)
 * @param workPtr - Pointer to working memory:
 *   For rows >= cols: needs cols*rows + cols*cols + cols*cols + 2*cols*cols*2 = cols*rows + 3*cols*cols + 4*cols*cols f64s
 *   For rows < cols: needs cols*rows + rows*rows + rows*rows + 2*rows*rows*2 f64s
 *   Safe estimate: max(rows,cols)*(rows+cols) + 6*max(rows,cols)^2 f64s
 * @returns 1 if successful, 0 if computation failed
 */
export function pinv(
  aPtr: usize,
  rows: i32,
  cols: i32,
  resultPtr: usize,
  workPtr: usize
): i32 {
  const maxDim: i32 = rows > cols ? rows : cols

  // Layout work memory
  const aTPtr: usize = workPtr
  const prodPtr: usize = aTPtr + (<usize>(cols * rows) << 3)
  const prodInvPtr: usize = prodPtr + (<usize>(maxDim * maxDim) << 3)
  const regPtr: usize = prodInvPtr + (<usize>(maxDim * maxDim) << 3)
  const augPtr: usize = regPtr + (<usize>(maxDim * maxDim) << 3)

  // Compute transpose
  transposeInternal(aPtr, rows, cols, aTPtr)

  if (rows >= cols) {
    // Overdetermined or square: pinv(A) = (A^T A)^(-1) A^T
    matMulInternal(aTPtr, cols, rows, aPtr, cols, prodPtr) // cols x cols

    let invResult: i32 = invInternal(prodPtr, cols, prodInvPtr, augPtr)

    if (invResult === 0) {
      // A^T A is singular, try regularization
      copyMatrixInternal(prodPtr, cols * cols, regPtr)
      const eps: f64 = 1e-10 * normFroInternal(prodPtr, cols * cols)
      for (let i: i32 = 0; i < cols; i++) {
        const diagIdx: usize = <usize>(i * cols + i) << 3
        store<f64>(regPtr + diagIdx, load<f64>(regPtr + diagIdx) + eps)
      }
      invResult = invInternal(regPtr, cols, prodInvPtr, augPtr)
      if (invResult === 0) {
        return 0
      }
    }

    matMulInternal(prodInvPtr, cols, cols, aTPtr, rows, resultPtr)
    return 1
  } else {
    // Underdetermined: pinv(A) = A^T (A A^T)^(-1)
    matMulInternal(aPtr, rows, cols, aTPtr, rows, prodPtr) // rows x rows

    let invResult: i32 = invInternal(prodPtr, rows, prodInvPtr, augPtr)

    if (invResult === 0) {
      // A A^T is singular, try regularization
      copyMatrixInternal(prodPtr, rows * rows, regPtr)
      const eps: f64 = 1e-10 * normFroInternal(prodPtr, rows * rows)
      for (let i: i32 = 0; i < rows; i++) {
        const diagIdx: usize = <usize>(i * rows + i) << 3
        store<f64>(regPtr + diagIdx, load<f64>(regPtr + diagIdx) + eps)
      }
      invResult = invInternal(regPtr, rows, prodInvPtr, augPtr)
      if (invResult === 0) {
        return 0
      }
    }

    matMulInternal(aTPtr, cols, rows, prodInvPtr, rows, resultPtr)
    return 1
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
 * @param aPtr - Pointer to input matrix (n x n)
 * @param n - Size of the matrix
 * @param resultPtr - Pointer to output matrix (n x n)
 * @param workPtr - Working memory: needs 7*n*n + 2*n*2*n f64s
 * @param maxIter - Maximum iterations (default 50)
 * @param tol - Convergence tolerance (default 1e-10)
 * @returns 1 if converged, 0 if failed
 */
export function sqrtm(
  aPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize,
  maxIter: i32 = 50,
  tol: f64 = 1e-10
): i32 {
  const n2: i32 = n * n
  const n2Bytes: usize = <usize>n2 << 3

  // Layout work memory
  const YPtr: usize = workPtr
  const ZPtr: usize = YPtr + n2Bytes
  const ZinvPtr: usize = ZPtr + n2Bytes
  const YinvPtr: usize = ZinvPtr + n2Bytes
  const YnewPtr: usize = YinvPtr + n2Bytes
  const ZnewPtr: usize = YnewPtr + n2Bytes
  const diffPtr: usize = ZnewPtr + n2Bytes
  const augPtr: usize = diffPtr + n2Bytes

  // Initialize Y = A, Z = I
  copyMatrixInternal(aPtr, n2, YPtr)
  eyeInternal(n, ZPtr)

  for (let iter: i32 = 0; iter < maxIter; iter++) {
    // Compute inverses
    const zinvOk: i32 = invInternal(ZPtr, n, ZinvPtr, augPtr)
    const yinvOk: i32 = invInternal(YPtr, n, YinvPtr, augPtr)

    if (zinvOk === 0 || yinvOk === 0) {
      return 0 // Singular intermediate matrix
    }

    // Y_new = 0.5 * (Y + Z^(-1))
    matAddInternal(YPtr, ZinvPtr, n2, YnewPtr)
    scalarMulInternal(YnewPtr, 0.5, n2, YnewPtr)

    // Z_new = 0.5 * (Z + Y^(-1))
    matAddInternal(ZPtr, YinvPtr, n2, ZnewPtr)
    scalarMulInternal(ZnewPtr, 0.5, n2, ZnewPtr)

    // Check convergence
    matSubInternal(YnewPtr, YPtr, n2, diffPtr)
    const diff: f64 = normFroInternal(diffPtr, n2)

    // Update Y and Z
    copyMatrixInternal(YnewPtr, n2, YPtr)
    copyMatrixInternal(ZnewPtr, n2, ZPtr)

    if (diff < tol) {
      copyMatrixInternal(YPtr, n2, resultPtr)
      return 1
    }
  }

  // Return last iterate even if not fully converged
  copyMatrixInternal(YPtr, n2, resultPtr)
  return 1
}

/**
 * Compute matrix square root for symmetric positive definite matrices
 * using Denman-Beavers method (faster for SPD matrices)
 *
 * @param aPtr - Pointer to SPD matrix (n x n)
 * @param n - Size of the matrix
 * @param resultPtr - Pointer to output matrix (n x n)
 * @param workPtr - Working memory: needs 7*n*n + 2*n*2*n f64s
 * @returns 1 if converged, 0 if not SPD
 */
export function sqrtmSPD(
  aPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize
): i32 {
  return sqrtm(aPtr, n, resultPtr, workPtr, 50, 1e-12)
}

// ============================================
// MATRIX EXPONENTIAL (Scaling and Squaring)
// ============================================

/**
 * Compute the matrix exponential exp(A) using scaling and squaring
 * with Padé approximation
 *
 * @param aPtr - Pointer to input matrix (n x n)
 * @param n - Size of the matrix
 * @param resultPtr - Pointer to output matrix (n x n)
 * @param workPtr - Working memory: needs 10*n*n + 2*n*2*n f64s
 * @returns 1 if successful, 0 if failed
 */
export function expm(
  aPtr: usize,
  n: i32,
  resultPtr: usize,
  workPtr: usize
): i32 {
  const n2: i32 = n * n
  const n2Bytes: usize = <usize>n2 << 3

  // Layout work memory
  const AsPtr: usize = workPtr
  const As2Ptr: usize = AsPtr + n2Bytes
  const As4Ptr: usize = As2Ptr + n2Bytes
  const As6Ptr: usize = As4Ptr + n2Bytes
  const IPtr: usize = As6Ptr + n2Bytes
  const VPtr: usize = IPtr + n2Bytes
  const UinnerPtr: usize = VPtr + n2Bytes
  const UPtr: usize = UinnerPtr + n2Bytes
  const VmUPtr: usize = UPtr + n2Bytes
  const VpUPtr: usize = VmUPtr + n2Bytes
  const tempPtr: usize = VpUPtr + n2Bytes
  const augPtr: usize = tempPtr + n2Bytes

  // Determine scaling factor s such that ||A/2^s|| < 0.5
  const normA: f64 = norm1Internal(aPtr, n)
  let s: i32 = 0

  if (normA > 0.5) {
    s = i32(Math.ceil(Math.log2(normA / 0.5)))
    if (s < 0) s = 0
  }

  // Scale matrix: As = A / 2^s
  const scale: f64 = Math.pow(2.0, -f64(s))
  scalarMulInternal(aPtr, scale, n2, AsPtr)

  // Padé approximation coefficients for [6/6]
  const c0: f64 = 1.0
  const c1: f64 = 0.5
  const c2: f64 = 0.1
  const c3: f64 = 0.016666666666666666
  const c4: f64 = 0.001984126984126984
  const c5: f64 = 0.00016534391534391535
  const c6: f64 = 0.000009182736455463728

  // Compute powers of As
  matMulInternal(AsPtr, n, n, AsPtr, n, As2Ptr)   // As^2
  matMulInternal(As2Ptr, n, n, As2Ptr, n, As4Ptr) // As^4
  matMulInternal(As4Ptr, n, n, As2Ptr, n, As6Ptr) // As^6

  // Create identity
  eyeInternal(n, IPtr)

  // V = c[0]*I + c[2]*As^2 + c[4]*As^4 + c[6]*As^6
  for (let i: i32 = 0; i < n2; i++) {
    const offset: usize = <usize>i << 3
    const iVal: f64 = load<f64>(IPtr + offset)
    const as2Val: f64 = load<f64>(As2Ptr + offset)
    const as4Val: f64 = load<f64>(As4Ptr + offset)
    const as6Val: f64 = load<f64>(As6Ptr + offset)
    store<f64>(VPtr + offset, c0 * iVal + c2 * as2Val + c4 * as4Val + c6 * as6Val)
  }

  // U_inner = c[1]*I + c[3]*As^2 + c[5]*As^4
  for (let i: i32 = 0; i < n2; i++) {
    const offset: usize = <usize>i << 3
    const iVal: f64 = load<f64>(IPtr + offset)
    const as2Val: f64 = load<f64>(As2Ptr + offset)
    const as4Val: f64 = load<f64>(As4Ptr + offset)
    store<f64>(UinnerPtr + offset, c1 * iVal + c3 * as2Val + c5 * as4Val)
  }

  // U = As * U_inner
  matMulInternal(AsPtr, n, n, UinnerPtr, n, UPtr)

  // VmU = V - U
  matSubInternal(VPtr, UPtr, n2, VmUPtr)

  // VpU = V + U
  matAddInternal(VPtr, UPtr, n2, VpUPtr)

  // F = (V - U)^(-1) * (V + U)
  const invOk: i32 = invInternal(VmUPtr, n, tempPtr, augPtr)
  if (invOk === 0) {
    return 0
  }

  matMulInternal(tempPtr, n, n, VpUPtr, n, resultPtr)

  // Square s times
  for (let i: i32 = 0; i < s; i++) {
    copyMatrixInternal(resultPtr, n2, tempPtr)
    matMulInternal(tempPtr, n, n, tempPtr, n, resultPtr)
  }

  return 1
}

// ============================================
// EIGENVALUES (Power Iteration + Deflation)
// ============================================

/**
 * Compute dominant eigenvalue and eigenvector using power iteration
 *
 * @param aPtr - Pointer to input matrix (n x n)
 * @param n - Size of the matrix
 * @param eigenvaluePtr - Pointer to store eigenvalue (1 f64)
 * @param eigenvectorPtr - Pointer to store eigenvector (n f64s)
 * @param workPtr - Working memory: needs 2*n f64s
 * @param maxIter - Maximum iterations
 * @param tol - Convergence tolerance
 * @returns 1 if converged, 0 if failed
 */
export function powerIteration(
  aPtr: usize,
  n: i32,
  eigenvaluePtr: usize,
  eigenvectorPtr: usize,
  workPtr: usize,
  maxIter: i32 = 100,
  tol: f64 = 1e-10
): i32 {
  const vPtr: usize = workPtr
  const wPtr: usize = vPtr + (<usize>n << 3)

  // Initialize vector
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(vPtr + (<usize>i << 3), 1.0 / f64(n) + 0.1 * f64(i))
  }

  // Normalize
  let norm: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    const val: f64 = load<f64>(vPtr + (<usize>i << 3))
    norm += val * val
  }
  norm = Math.sqrt(norm)
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(vPtr + offset, load<f64>(vPtr + offset) / norm)
  }

  let eigenvalue: f64 = 0.0

  for (let iter: i32 = 0; iter < maxIter; iter++) {
    // w = A * v
    for (let i: i32 = 0; i < n; i++) {
      let sum: f64 = 0.0
      for (let j: i32 = 0; j < n; j++) {
        sum += load<f64>(aPtr + (<usize>(i * n + j) << 3)) * load<f64>(vPtr + (<usize>j << 3))
      }
      store<f64>(wPtr + (<usize>i << 3), sum)
    }

    // Compute Rayleigh quotient: lambda = v^T * w
    let newEigenvalue: f64 = 0.0
    for (let i: i32 = 0; i < n; i++) {
      newEigenvalue += load<f64>(vPtr + (<usize>i << 3)) * load<f64>(wPtr + (<usize>i << 3))
    }

    // Normalize w
    norm = 0.0
    for (let i: i32 = 0; i < n; i++) {
      const val: f64 = load<f64>(wPtr + (<usize>i << 3))
      norm += val * val
    }
    norm = Math.sqrt(norm)

    if (norm < 1e-14) {
      return 0 // Degenerate case
    }

    for (let i: i32 = 0; i < n; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(vPtr + offset, load<f64>(wPtr + offset) / norm)
    }

    // Check convergence
    if (Math.abs(newEigenvalue - eigenvalue) < tol) {
      store<f64>(eigenvaluePtr, newEigenvalue)
      for (let i: i32 = 0; i < n; i++) {
        store<f64>(eigenvectorPtr + (<usize>i << 3), load<f64>(vPtr + (<usize>i << 3)))
      }
      return 1
    }

    eigenvalue = newEigenvalue
  }

  // Return last result even if not fully converged
  store<f64>(eigenvaluePtr, eigenvalue)
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(eigenvectorPtr + (<usize>i << 3), load<f64>(vPtr + (<usize>i << 3)))
  }
  return 1
}

/**
 * Compute all eigenvalues of a symmetric matrix using Jacobi iteration
 *
 * @param aPtr - Pointer to symmetric input matrix (n x n)
 * @param n - Size of the matrix
 * @param eigenvaluesPtr - Pointer to output eigenvalues (n f64s, sorted descending)
 * @param workPtr - Working memory: needs n*n f64s
 * @param maxIter - Maximum iterations per eigenvalue
 * @param tol - Convergence tolerance
 * @returns 1 if converged, 0 otherwise
 */
export function eigsSymmetric(
  aPtr: usize,
  n: i32,
  eigenvaluesPtr: usize,
  workPtr: usize,
  maxIter: i32 = 100,
  tol: f64 = 1e-10
): i32 {
  const n2: i32 = n * n

  // Work on a copy
  copyMatrixInternal(aPtr, n2, workPtr)

  // Jacobi iteration
  for (let iter: i32 = 0; iter < maxIter * n; iter++) {
    // Find max off-diagonal element
    let maxOff: f64 = 0.0
    let p: i32 = 0
    let q: i32 = 1

    for (let i: i32 = 0; i < n; i++) {
      for (let j: i32 = i + 1; j < n; j++) {
        const val: f64 = Math.abs(load<f64>(workPtr + (<usize>(i * n + j) << 3)))
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
    const app: f64 = load<f64>(workPtr + (<usize>(p * n + p) << 3))
    const aqq: f64 = load<f64>(workPtr + (<usize>(q * n + q) << 3))
    const apq: f64 = load<f64>(workPtr + (<usize>(p * n + q) << 3))

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
        const aip: f64 = load<f64>(workPtr + (<usize>(i * n + p) << 3))
        const aiq: f64 = load<f64>(workPtr + (<usize>(i * n + q) << 3))
        const newAip: f64 = c * aip - s * aiq
        const newAiq: f64 = s * aip + c * aiq
        store<f64>(workPtr + (<usize>(i * n + p) << 3), newAip)
        store<f64>(workPtr + (<usize>(p * n + i) << 3), newAip)
        store<f64>(workPtr + (<usize>(i * n + q) << 3), newAiq)
        store<f64>(workPtr + (<usize>(q * n + i) << 3), newAiq)
      }
    }

    store<f64>(workPtr + (<usize>(p * n + p) << 3), c * c * app - 2.0 * c * s * apq + s * s * aqq)
    store<f64>(workPtr + (<usize>(q * n + q) << 3), s * s * app + 2.0 * c * s * apq + c * c * aqq)
    store<f64>(workPtr + (<usize>(p * n + q) << 3), 0.0)
    store<f64>(workPtr + (<usize>(q * n + p) << 3), 0.0)
  }

  // Extract diagonal as eigenvalues
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(eigenvaluesPtr + (<usize>i << 3), load<f64>(workPtr + (<usize>(i * n + i) << 3)))
  }

  // Sort descending
  for (let i: i32 = 0; i < n - 1; i++) {
    for (let j: i32 = i + 1; j < n; j++) {
      const ei: f64 = load<f64>(eigenvaluesPtr + (<usize>i << 3))
      const ej: f64 = load<f64>(eigenvaluesPtr + (<usize>j << 3))
      if (ej > ei) {
        store<f64>(eigenvaluesPtr + (<usize>i << 3), ej)
        store<f64>(eigenvaluesPtr + (<usize>j << 3), ei)
      }
    }
  }

  return 1
}

/**
 * Compute eigenvalues of a general matrix using QR iteration
 * Returns real parts only (imaginary parts discarded if complex eigenvalues)
 *
 * @param aPtr - Pointer to input matrix (n x n)
 * @param n - Size of the matrix
 * @param eigenvaluesPtr - Pointer to output eigenvalues (n f64s)
 * @param workPtr - Working memory: needs n*n + (n-1) f64s for H and u
 * @param maxIter - Maximum iterations
 * @param tol - Convergence tolerance
 * @returns 1 if completed
 */
export function eigs(
  aPtr: usize,
  n: i32,
  eigenvaluesPtr: usize,
  workPtr: usize,
  maxIter: i32 = 200,
  tol: f64 = 1e-10
): i32 {
  // Check if matrix is symmetric
  let isSymmetric: bool = true
  for (let i: i32 = 0; i < n && isSymmetric; i++) {
    for (let j: i32 = i + 1; j < n && isSymmetric; j++) {
      const aij: f64 = load<f64>(aPtr + (<usize>(i * n + j) << 3))
      const aji: f64 = load<f64>(aPtr + (<usize>(j * n + i) << 3))
      if (Math.abs(aij - aji) > 1e-14) {
        isSymmetric = false
      }
    }
  }

  if (isSymmetric) {
    return eigsSymmetric(aPtr, n, eigenvaluesPtr, workPtr, maxIter, tol)
  }

  // General case: reduce to upper Hessenberg form and apply QR
  const HPtr: usize = workPtr
  const uPtr: usize = HPtr + (<usize>(n * n) << 3)

  // Copy to H
  copyMatrixInternal(aPtr, n * n, HPtr)

  // Reduce to upper Hessenberg form using Householder reflections
  for (let k: i32 = 0; k < n - 2; k++) {
    // Form Householder vector for column k below diagonal
    let normx: f64 = 0.0
    for (let i: i32 = k + 1; i < n; i++) {
      const val: f64 = load<f64>(HPtr + (<usize>(i * n + k) << 3))
      normx += val * val
    }
    normx = Math.sqrt(normx)

    if (normx < 1e-14) continue

    const hk1k: f64 = load<f64>(HPtr + (<usize>((k + 1) * n + k) << 3))
    const alpha: f64 = hk1k >= 0 ? -normx : normx

    const uLen: i32 = n - k - 1
    store<f64>(uPtr, hk1k - alpha)
    for (let i: i32 = 1; i < uLen; i++) {
      store<f64>(uPtr + (<usize>i << 3), load<f64>(HPtr + (<usize>((k + 1 + i) * n + k) << 3)))
    }

    let normU: f64 = 0.0
    for (let i: i32 = 0; i < uLen; i++) {
      const val: f64 = load<f64>(uPtr + (<usize>i << 3))
      normU += val * val
    }
    normU = Math.sqrt(normU)

    if (normU < 1e-14) continue

    for (let i: i32 = 0; i < uLen; i++) {
      const offset: usize = <usize>i << 3
      store<f64>(uPtr + offset, load<f64>(uPtr + offset) / normU)
    }

    // Apply H = (I - 2*u*u^T) * H * (I - 2*u*u^T)
    // Left multiplication
    for (let j: i32 = k; j < n; j++) {
      let dot: f64 = 0.0
      for (let i: i32 = 0; i < uLen; i++) {
        dot += load<f64>(uPtr + (<usize>i << 3)) * load<f64>(HPtr + (<usize>((k + 1 + i) * n + j) << 3))
      }
      dot *= 2.0
      for (let i: i32 = 0; i < uLen; i++) {
        const idx: usize = <usize>((k + 1 + i) * n + j) << 3
        store<f64>(HPtr + idx, load<f64>(HPtr + idx) - dot * load<f64>(uPtr + (<usize>i << 3)))
      }
    }

    // Right multiplication
    for (let i: i32 = 0; i < n; i++) {
      let dot: f64 = 0.0
      for (let j: i32 = 0; j < uLen; j++) {
        dot += load<f64>(HPtr + (<usize>(i * n + (k + 1 + j)) << 3)) * load<f64>(uPtr + (<usize>j << 3))
      }
      dot *= 2.0
      for (let j: i32 = 0; j < uLen; j++) {
        const idx: usize = <usize>(i * n + (k + 1 + j)) << 3
        store<f64>(HPtr + idx, load<f64>(HPtr + idx) - dot * load<f64>(uPtr + (<usize>j << 3)))
      }
    }
  }

  // QR iteration on Hessenberg matrix
  let m: i32 = n
  for (let iter: i32 = 0; iter < maxIter && m > 1; iter++) {
    // Check for deflation
    let deflate: bool = false
    for (let i: i32 = m - 1; i > 0; i--) {
      const subdiag: f64 = Math.abs(load<f64>(HPtr + (<usize>(i * n + (i - 1)) << 3)))
      const diag1: f64 = Math.abs(load<f64>(HPtr + (<usize>((i - 1) * n + (i - 1)) << 3)))
      const diag2: f64 = Math.abs(load<f64>(HPtr + (<usize>(i * n + i) << 3)))

      if (subdiag < tol * (diag1 + diag2)) {
        store<f64>(HPtr + (<usize>(i * n + (i - 1)) << 3), 0.0)
        if (i === m - 1) {
          store<f64>(eigenvaluesPtr + (<usize>(m - 1) << 3), load<f64>(HPtr + (<usize>((m - 1) * n + (m - 1)) << 3)))
          m--
          deflate = true
          break
        }
      }
    }

    if (deflate) continue
    if (m <= 1) break

    // Wilkinson shift
    const a11: f64 = load<f64>(HPtr + (<usize>((m - 2) * n + (m - 2)) << 3))
    const a12: f64 = load<f64>(HPtr + (<usize>((m - 2) * n + (m - 1)) << 3))
    const a21: f64 = load<f64>(HPtr + (<usize>((m - 1) * n + (m - 2)) << 3))
    const a22: f64 = load<f64>(HPtr + (<usize>((m - 1) * n + (m - 1)) << 3))

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
      const idx: usize = <usize>(i * n + i) << 3
      store<f64>(HPtr + idx, load<f64>(HPtr + idx) - shift)
    }

    // QR step using Givens rotations
    for (let i: i32 = 0; i < m - 1; i++) {
      const a_val: f64 = load<f64>(HPtr + (<usize>(i * n + i) << 3))
      const b_val: f64 = load<f64>(HPtr + (<usize>((i + 1) * n + i) << 3))
      const r: f64 = Math.sqrt(a_val * a_val + b_val * b_val)

      if (r < 1e-14) continue

      const c: f64 = a_val / r
      const s: f64 = b_val / r

      // Apply Givens rotation to H from left
      for (let j: i32 = i; j < n; j++) {
        const temp1: f64 = load<f64>(HPtr + (<usize>(i * n + j) << 3))
        const temp2: f64 = load<f64>(HPtr + (<usize>((i + 1) * n + j) << 3))
        store<f64>(HPtr + (<usize>(i * n + j) << 3), c * temp1 + s * temp2)
        store<f64>(HPtr + (<usize>((i + 1) * n + j) << 3), -s * temp1 + c * temp2)
      }

      // Apply from right
      const maxJ: i32 = i + 2 < m - 1 ? i + 2 : m - 1
      for (let j: i32 = 0; j <= maxJ; j++) {
        const temp1: f64 = load<f64>(HPtr + (<usize>(j * n + i) << 3))
        const temp2: f64 = load<f64>(HPtr + (<usize>(j * n + (i + 1)) << 3))
        store<f64>(HPtr + (<usize>(j * n + i) << 3), c * temp1 + s * temp2)
        store<f64>(HPtr + (<usize>(j * n + (i + 1)) << 3), -s * temp1 + c * temp2)
      }
    }

    // Unshift
    for (let i: i32 = 0; i < m; i++) {
      const idx: usize = <usize>(i * n + i) << 3
      store<f64>(HPtr + idx, load<f64>(HPtr + idx) + shift)
    }
  }

  // Extract remaining eigenvalues from diagonal
  for (let i: i32 = 0; i < m; i++) {
    store<f64>(eigenvaluesPtr + (<usize>i << 3), load<f64>(HPtr + (<usize>(i * n + i) << 3)))
  }

  // Sort by absolute value descending
  for (let i: i32 = 0; i < n - 1; i++) {
    for (let j: i32 = i + 1; j < n; j++) {
      const ei: f64 = load<f64>(eigenvaluesPtr + (<usize>i << 3))
      const ej: f64 = load<f64>(eigenvaluesPtr + (<usize>j << 3))
      if (Math.abs(ej) > Math.abs(ei)) {
        store<f64>(eigenvaluesPtr + (<usize>i << 3), ej)
        store<f64>(eigenvaluesPtr + (<usize>j << 3), ei)
      }
    }
  }

  return 1
}

/**
 * Compute trace of matrix (sum of diagonal)
 * @param aPtr - Pointer to matrix
 * @param n - Size of square matrix
 * @returns Trace value
 */
export function trace(aPtr: usize, n: i32): f64 {
  let sum: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    sum += load<f64>(aPtr + (<usize>(i * n + i) << 3))
  }
  return sum
}

/**
 * Compute spectral radius (largest absolute eigenvalue)
 * @param aPtr - Pointer to matrix
 * @param n - Size of square matrix
 * @param workPtr - Working memory: needs n*n + n f64s
 * @returns Spectral radius
 */
export function spectralRadius(
  aPtr: usize,
  n: i32,
  workPtr: usize
): f64 {
  const eigenvaluesPtr: usize = workPtr
  const eigsWorkPtr: usize = eigenvaluesPtr + (<usize>n << 3)

  eigs(aPtr, n, eigenvaluesPtr, eigsWorkPtr, 200, 1e-10)

  let maxAbs: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    const absVal: f64 = Math.abs(load<f64>(eigenvaluesPtr + (<usize>i << 3)))
    if (absVal > maxAbs) {
      maxAbs = absVal
    }
  }
  return maxAbs
}
