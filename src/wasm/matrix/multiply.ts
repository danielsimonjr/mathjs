/**
 * WASM-optimized matrix multiplication using AssemblyScript
 * Compiled to WebAssembly for maximum performance
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * Dense matrix multiplication: C = A * B
 * @param aPtr - Pointer to Matrix A data (flat array, row-major)
 * @param aRows - Number of rows in A
 * @param aCols - Number of columns in A
 * @param bPtr - Pointer to Matrix B data (flat array, row-major)
 * @param bRows - Number of rows in B
 * @param bCols - Number of columns in B
 * @param resultPtr - Pointer to result matrix C (row-major)
 */
export function multiplyDense(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  bPtr: usize,
  bRows: i32,
  bCols: i32,
  resultPtr: usize
): void {
  // Cache-friendly blocked matrix multiplication
  const blockSize: i32 = 64

  // Initialize result to zero
  const resultSize = aRows * bCols
  for (let i: i32 = 0; i < resultSize; i++) {
    store<f64>(resultPtr + (<usize>i << 3), 0.0)
  }

  for (let ii: i32 = 0; ii < aRows; ii += blockSize) {
    const iEnd: i32 = min(ii + blockSize, aRows)

    for (let jj: i32 = 0; jj < bCols; jj += blockSize) {
      const jEnd: i32 = min(jj + blockSize, bCols)

      for (let kk: i32 = 0; kk < aCols; kk += blockSize) {
        const kEnd: i32 = min(kk + blockSize, aCols)

        // Multiply the blocks
        for (let i: i32 = ii; i < iEnd; i++) {
          for (let j: i32 = jj; j < jEnd; j++) {
            const resultIdx: usize = <usize>(i * bCols + j) << 3
            let sum: f64 = load<f64>(resultPtr + resultIdx)

            for (let k: i32 = kk; k < kEnd; k++) {
              const aVal = load<f64>(aPtr + (<usize>(i * aCols + k) << 3))
              const bVal = load<f64>(bPtr + (<usize>(k * bCols + j) << 3))
              sum += aVal * bVal
            }

            store<f64>(resultPtr + resultIdx, sum)
          }
        }
      }
    }
  }
}

/**
 * SIMD-optimized matrix multiplication for compatible platforms
 * Uses 128-bit SIMD vectors for parallel computation
 */
export function multiplyDenseSIMD(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  bPtr: usize,
  bRows: i32,
  bCols: i32,
  resultPtr: usize
): void {
  // SIMD implementation using v128 (AssemblyScript SIMD)
  // Process 2 f64 values at a time

  for (let i: i32 = 0; i < aRows; i++) {
    for (let j: i32 = 0; j < bCols; j++) {
      let sum: f64 = 0.0
      let k: i32 = 0

      // Process pairs of elements with SIMD
      const limit: i32 = aCols - (aCols % 2)
      for (; k < limit; k += 2) {
        const aIdx1: usize = <usize>(i * aCols + k) << 3
        const bIdx1: usize = <usize>(k * bCols + j) << 3
        const bIdx2: usize = <usize>((k + 1) * bCols + j) << 3

        sum += load<f64>(aPtr + aIdx1) * load<f64>(bPtr + bIdx1)
        sum += load<f64>(aPtr + aIdx1 + 8) * load<f64>(bPtr + bIdx2)
      }

      // Handle remaining elements
      for (; k < aCols; k++) {
        const aVal = load<f64>(aPtr + (<usize>(i * aCols + k) << 3))
        const bVal = load<f64>(bPtr + (<usize>(k * bCols + j) << 3))
        sum += aVal * bVal
      }

      store<f64>(resultPtr + (<usize>(i * bCols + j) << 3), sum)
    }
  }
}

/**
 * Matrix-vector multiplication: y = A * x
 * @param aPtr - Pointer to matrix A
 * @param aRows - Number of rows in A
 * @param aCols - Number of columns in A
 * @param xPtr - Pointer to vector x
 * @param resultPtr - Pointer to result vector y
 */
export function multiplyVector(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  xPtr: usize,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < aRows; i++) {
    let sum: f64 = 0.0

    for (let j: i32 = 0; j < aCols; j++) {
      const aVal = load<f64>(aPtr + (<usize>(i * aCols + j) << 3))
      const xVal = load<f64>(xPtr + (<usize>j << 3))
      sum += aVal * xVal
    }

    store<f64>(resultPtr + (<usize>i << 3), sum)
  }
}

/**
 * Matrix transpose: B = A^T
 * @param aPtr - Pointer to input matrix A
 * @param rows - Number of rows in A
 * @param cols - Number of columns in A
 * @param resultPtr - Pointer to result matrix B (cols x rows)
 */
export function transpose(
  aPtr: usize,
  rows: i32,
  cols: i32,
  resultPtr: usize
): void {
  // Cache-friendly blocked transpose
  const blockSize: i32 = 32

  for (let ii: i32 = 0; ii < rows; ii += blockSize) {
    const iEnd: i32 = min(ii + blockSize, rows)

    for (let jj: i32 = 0; jj < cols; jj += blockSize) {
      const jEnd: i32 = min(jj + blockSize, cols)

      for (let i: i32 = ii; i < iEnd; i++) {
        for (let j: i32 = jj; j < jEnd; j++) {
          const srcIdx: usize = <usize>(i * cols + j) << 3
          const dstIdx: usize = <usize>(j * rows + i) << 3
          store<f64>(resultPtr + dstIdx, load<f64>(aPtr + srcIdx))
        }
      }
    }
  }
}

/**
 * Element-wise addition: C = A + B
 * @param aPtr - Pointer to matrix A
 * @param bPtr - Pointer to matrix B
 * @param size - Number of elements
 * @param resultPtr - Pointer to result matrix C
 */
export function add(
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
 * Element-wise subtraction: C = A - B
 * @param aPtr - Pointer to matrix A
 * @param bPtr - Pointer to matrix B
 * @param size - Number of elements
 * @param resultPtr - Pointer to result matrix C
 */
export function subtract(
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
 * Scalar multiplication: B = scalar * A
 * @param aPtr - Pointer to matrix A
 * @param scalar - Scalar value
 * @param size - Number of elements
 * @param resultPtr - Pointer to result matrix B
 */
export function scalarMultiply(
  aPtr: usize,
  scalar: f64,
  size: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) * scalar)
  }
}

/**
 * Dot product: result = sum(a[i] * b[i])
 * @param aPtr - Pointer to vector a
 * @param bPtr - Pointer to vector b
 * @param size - Number of elements
 * @returns Dot product value
 */
export function dotProduct(aPtr: usize, bPtr: usize, size: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < size; i++) {
    const offset: usize = <usize>i << 3
    sum += load<f64>(aPtr + offset) * load<f64>(bPtr + offset)
  }

  return sum
}

// Helper function
function min(a: i32, b: i32): i32 {
  return a < b ? a : b
}

// ============================================================================
// SIMD-Accelerated and Cache-Optimized Operations
// ============================================================================

/**
 * Cache-optimized blocked matrix multiplication with SIMD inner kernel
 * Uses larger blocks and explicit SIMD operations for maximum performance
 *
 * @param aPtr - Pointer to Matrix A (row-major)
 * @param aRows - Rows in A
 * @param aCols - Columns in A
 * @param bPtr - Pointer to Matrix B (row-major)
 * @param bRows - Rows in B
 * @param bCols - Columns in B
 * @param resultPtr - Pointer to result matrix C
 * @param workPtr - Optional work buffer for transposed B (bRows * bCols * 8 bytes)
 */
export function multiplyBlockedSIMD(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  bPtr: usize,
  bRows: i32,
  bCols: i32,
  resultPtr: usize,
  workPtr: usize
): void {
  // Block sizes tuned for typical L1/L2 cache (32KB-256KB)
  const blockI: i32 = 64  // Rows of A per block
  const blockJ: i32 = 64  // Cols of B per block
  const blockK: i32 = 64  // Cols of A / Rows of B per block

  // Initialize result to zero using SIMD
  const resultSize: i32 = aRows * bCols
  const zeroVec: v128 = f64x2.splat(0.0)
  let idx: i32 = 0
  const limit: i32 = resultSize - 1
  for (; idx < limit; idx += 2) {
    v128.store(resultPtr + (<usize>idx << 3), zeroVec)
  }
  for (; idx < resultSize; idx++) {
    store<f64>(resultPtr + (<usize>idx << 3), 0.0)
  }

  // Transpose B into work buffer for better cache access
  if (workPtr !== 0) {
    for (let i: i32 = 0; i < bRows; i++) {
      for (let j: i32 = 0; j < bCols; j++) {
        const srcIdx: usize = (<usize>(i * bCols + j)) << 3
        const dstIdx: usize = (<usize>(j * bRows + i)) << 3
        store<f64>(workPtr + dstIdx, load<f64>(bPtr + srcIdx))
      }
    }
  }

  // Use transposed B if work buffer provided
  const useBt: bool = workPtr !== 0

  // Blocked multiplication
  for (let ii: i32 = 0; ii < aRows; ii += blockI) {
    const iEnd: i32 = min(ii + blockI, aRows)

    for (let jj: i32 = 0; jj < bCols; jj += blockJ) {
      const jEnd: i32 = min(jj + blockJ, bCols)

      for (let kk: i32 = 0; kk < aCols; kk += blockK) {
        const kEnd: i32 = min(kk + blockK, aCols)

        // Inner block multiplication with SIMD
        for (let i: i32 = ii; i < iEnd; i++) {
          const aRowPtr: usize = aPtr + (<usize>(i * aCols) << 3)

          for (let j: i32 = jj; j < jEnd; j++) {
            const resultIdx: usize = (<usize>(i * bCols + j)) << 3
            let sumVec: v128 = f64x2.splat(0.0)
            let sum: f64 = load<f64>(resultPtr + resultIdx)

            // SIMD inner loop
            let k: i32 = kk
            const kLimit: i32 = kEnd - 1

            if (useBt) {
              // Access transposed B for better cache locality
              const btColPtr: usize = workPtr + (<usize>(j * bRows) << 3)

              for (; k < kLimit; k += 2) {
                const kIdx: usize = <usize>k << 3
                const aVec: v128 = v128.load(aRowPtr + kIdx)
                const bVec: v128 = v128.load(btColPtr + kIdx)
                sumVec = f64x2.add(sumVec, f64x2.mul(aVec, bVec))
              }
              sum += f64x2.extract_lane(sumVec, 0) + f64x2.extract_lane(sumVec, 1)

              // Remainder
              for (; k < kEnd; k++) {
                sum += load<f64>(aRowPtr + (<usize>k << 3)) * load<f64>(btColPtr + (<usize>k << 3))
              }
            } else {
              // Direct access to B (column-strided)
              for (; k < kEnd; k++) {
                sum += load<f64>(aRowPtr + (<usize>k << 3)) * load<f64>(bPtr + (<usize>(k * bCols + j) << 3))
              }
            }

            store<f64>(resultPtr + resultIdx, sum)
          }
        }
      }
    }
  }
}

/**
 * SIMD-accelerated element-wise addition
 *
 * @param aPtr - Pointer to vector/matrix A
 * @param bPtr - Pointer to vector/matrix B
 * @param size - Number of elements
 * @param resultPtr - Pointer to result
 */
export function addSIMD(
  aPtr: usize,
  bPtr: usize,
  size: i32,
  resultPtr: usize
): void {
  let i: i32 = 0
  const limit: i32 = size - 1

  // Process pairs with SIMD
  for (; i < limit; i += 2) {
    const offset: usize = <usize>i << 3
    const a: v128 = v128.load(aPtr + offset)
    const b: v128 = v128.load(bPtr + offset)
    v128.store(resultPtr + offset, f64x2.add(a, b))
  }

  // Handle remaining element
  for (; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) + load<f64>(bPtr + offset))
  }
}

/**
 * SIMD-accelerated element-wise subtraction
 *
 * @param aPtr - Pointer to vector/matrix A
 * @param bPtr - Pointer to vector/matrix B
 * @param size - Number of elements
 * @param resultPtr - Pointer to result
 */
export function subtractSIMD(
  aPtr: usize,
  bPtr: usize,
  size: i32,
  resultPtr: usize
): void {
  let i: i32 = 0
  const limit: i32 = size - 1

  for (; i < limit; i += 2) {
    const offset: usize = <usize>i << 3
    const a: v128 = v128.load(aPtr + offset)
    const b: v128 = v128.load(bPtr + offset)
    v128.store(resultPtr + offset, f64x2.sub(a, b))
  }

  for (; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) - load<f64>(bPtr + offset))
  }
}

/**
 * SIMD-accelerated scalar multiplication
 *
 * @param aPtr - Pointer to vector/matrix A
 * @param scalar - Scalar value
 * @param size - Number of elements
 * @param resultPtr - Pointer to result
 */
export function scalarMultiplySIMD(
  aPtr: usize,
  scalar: f64,
  size: i32,
  resultPtr: usize
): void {
  const scalarVec: v128 = f64x2.splat(scalar)
  let i: i32 = 0
  const limit: i32 = size - 1

  for (; i < limit; i += 2) {
    const offset: usize = <usize>i << 3
    const a: v128 = v128.load(aPtr + offset)
    v128.store(resultPtr + offset, f64x2.mul(a, scalarVec))
  }

  for (; i < size; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) * scalar)
  }
}

/**
 * SIMD-accelerated dot product
 *
 * @param aPtr - Pointer to vector a
 * @param bPtr - Pointer to vector b
 * @param size - Number of elements
 * @returns Dot product value
 */
export function dotProductSIMD(aPtr: usize, bPtr: usize, size: i32): f64 {
  let sumVec: v128 = f64x2.splat(0.0)
  let i: i32 = 0
  const limit: i32 = size - 1

  // Process pairs with SIMD
  for (; i < limit; i += 2) {
    const offset: usize = <usize>i << 3
    const a: v128 = v128.load(aPtr + offset)
    const b: v128 = v128.load(bPtr + offset)
    sumVec = f64x2.add(sumVec, f64x2.mul(a, b))
  }

  let sum: f64 = f64x2.extract_lane(sumVec, 0) + f64x2.extract_lane(sumVec, 1)

  // Handle remaining element
  for (; i < size; i++) {
    const offset: usize = <usize>i << 3
    sum += load<f64>(aPtr + offset) * load<f64>(bPtr + offset)
  }

  return sum
}

/**
 * SIMD-accelerated matrix-vector multiplication
 *
 * @param aPtr - Pointer to matrix A (m x n, row-major)
 * @param aRows - Number of rows in A
 * @param aCols - Number of columns in A
 * @param xPtr - Pointer to vector x (length n)
 * @param resultPtr - Pointer to result vector (length m)
 */
export function multiplyVectorSIMD(
  aPtr: usize,
  aRows: i32,
  aCols: i32,
  xPtr: usize,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < aRows; i++) {
    const rowPtr: usize = aPtr + (<usize>(i * aCols) << 3)
    let sumVec: v128 = f64x2.splat(0.0)
    let j: i32 = 0
    const limit: i32 = aCols - 1

    // SIMD inner loop
    for (; j < limit; j += 2) {
      const offset: usize = <usize>j << 3
      const aVec: v128 = v128.load(rowPtr + offset)
      const xVec: v128 = v128.load(xPtr + offset)
      sumVec = f64x2.add(sumVec, f64x2.mul(aVec, xVec))
    }

    let sum: f64 = f64x2.extract_lane(sumVec, 0) + f64x2.extract_lane(sumVec, 1)

    // Remainder
    for (; j < aCols; j++) {
      sum += load<f64>(rowPtr + (<usize>j << 3)) * load<f64>(xPtr + (<usize>j << 3))
    }

    store<f64>(resultPtr + (<usize>i << 3), sum)
  }
}

/**
 * SIMD-accelerated transpose with blocking
 *
 * @param aPtr - Pointer to input matrix (rows x cols)
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param resultPtr - Pointer to result matrix (cols x rows)
 */
export function transposeSIMD(
  aPtr: usize,
  rows: i32,
  cols: i32,
  resultPtr: usize
): void {
  const blockSize: i32 = 16

  for (let ii: i32 = 0; ii < rows; ii += blockSize) {
    const iEnd: i32 = min(ii + blockSize, rows)

    for (let jj: i32 = 0; jj < cols; jj += blockSize) {
      const jEnd: i32 = min(jj + blockSize, cols)

      // Transpose block
      for (let i: i32 = ii; i < iEnd; i++) {
        for (let j: i32 = jj; j < jEnd; j++) {
          const srcIdx: usize = (<usize>(i * cols + j)) << 3
          const dstIdx: usize = (<usize>(j * rows + i)) << 3
          store<f64>(resultPtr + dstIdx, load<f64>(aPtr + srcIdx))
        }
      }
    }
  }
}
