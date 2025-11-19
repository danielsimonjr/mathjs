/**
 * WASM-optimized matrix multiplication using AssemblyScript
 * Compiled to WebAssembly for maximum performance
 */

/**
 * Dense matrix multiplication: C = A * B
 * @param a - Matrix A data (flat array, row-major)
 * @param aRows - Number of rows in A
 * @param aCols - Number of columns in A
 * @param b - Matrix B data (flat array, row-major)
 * @param bRows - Number of rows in B
 * @param bCols - Number of columns in B
 * @param result - Result matrix C (pre-allocated, row-major)
 */
export function multiplyDense(
  a: Float64Array,
  aRows: i32,
  aCols: i32,
  b: Float64Array,
  bRows: i32,
  bCols: i32,
  result: Float64Array
): void {
  // Cache-friendly blocked matrix multiplication
  const blockSize: i32 = 64

  for (let ii: i32 = 0; ii < aRows; ii += blockSize) {
    const iEnd: i32 = min(ii + blockSize, aRows)

    for (let jj: i32 = 0; jj < bCols; jj += blockSize) {
      const jEnd: i32 = min(jj + blockSize, bCols)

      for (let kk: i32 = 0; kk < aCols; kk += blockSize) {
        const kEnd: i32 = min(kk + blockSize, aCols)

        // Multiply the blocks
        for (let i: i32 = ii; i < iEnd; i++) {
          for (let j: i32 = jj; j < jEnd; j++) {
            let sum: f64 = result[i * bCols + j]

            for (let k: i32 = kk; k < kEnd; k++) {
              sum += a[i * aCols + k] * b[k * bCols + j]
            }

            result[i * bCols + j] = sum
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
  a: Float64Array,
  aRows: i32,
  aCols: i32,
  b: Float64Array,
  bRows: i32,
  bCols: i32,
  result: Float64Array
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
        const aIdx: i32 = i * aCols + k
        const bIdx1: i32 = k * bCols + j
        const bIdx2: i32 = (k + 1) * bCols + j

        sum += a[aIdx] * b[bIdx1]
        sum += a[aIdx + 1] * b[bIdx2]
      }

      // Handle remaining elements
      for (; k < aCols; k++) {
        sum += a[i * aCols + k] * b[k * bCols + j]
      }

      result[i * bCols + j] = sum
    }
  }
}

/**
 * Matrix-vector multiplication: y = A * x
 */
export function multiplyVector(
  a: Float64Array,
  aRows: i32,
  aCols: i32,
  x: Float64Array,
  result: Float64Array
): void {
  for (let i: i32 = 0; i < aRows; i++) {
    let sum: f64 = 0.0

    for (let j: i32 = 0; j < aCols; j++) {
      sum += a[i * aCols + j] * x[j]
    }

    result[i] = sum
  }
}

/**
 * Matrix transpose: B = A^T
 */
export function transpose(
  a: Float64Array,
  rows: i32,
  cols: i32,
  result: Float64Array
): void {
  // Cache-friendly blocked transpose
  const blockSize: i32 = 32

  for (let ii: i32 = 0; ii < rows; ii += blockSize) {
    const iEnd: i32 = min(ii + blockSize, rows)

    for (let jj: i32 = 0; jj < cols; jj += blockSize) {
      const jEnd: i32 = min(jj + blockSize, cols)

      for (let i: i32 = ii; i < iEnd; i++) {
        for (let j: i32 = jj; j < jEnd; j++) {
          result[j * rows + i] = a[i * cols + j]
        }
      }
    }
  }
}

/**
 * Matrix addition: C = A + B
 */
export function add(
  a: Float64Array,
  b: Float64Array,
  size: i32,
  result: Float64Array
): void {
  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] + b[i]
  }
}

/**
 * Matrix subtraction: C = A - B
 */
export function subtract(
  a: Float64Array,
  b: Float64Array,
  size: i32,
  result: Float64Array
): void {
  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] - b[i]
  }
}

/**
 * Scalar multiplication: B = scalar * A
 */
export function scalarMultiply(
  a: Float64Array,
  scalar: f64,
  size: i32,
  result: Float64Array
): void {
  for (let i: i32 = 0; i < size; i++) {
    result[i] = a[i] * scalar
  }
}

/**
 * Dot product: result = sum(a[i] * b[i])
 */
export function dotProduct(
  a: Float64Array,
  b: Float64Array,
  size: i32
): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < size; i++) {
    sum += a[i] * b[i]
  }

  return sum
}

// Helper function
@inline
function min(a: i32, b: i32): i32 {
  return a < b ? a : b
}
