/**
 * SIMD-Optimized Operations for AssemblyScript/WASM
 *
 * Uses 128-bit SIMD vectors (v128) for parallel processing of 2 f64 or 4 f32 values.
 * Provides 2-4x speedup for vector and matrix operations on supported hardware.
 *
 * SIMD support: WebAssembly SIMD is widely supported in modern browsers (Chrome 91+,
 * Firefox 89+, Safari 16.4+, Edge 91+) and Node.js 16+.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// ============================================================================
// SIMD VECTOR OPERATIONS (f64x2 - 2 doubles per vector)
// ============================================================================

/**
 * SIMD vector addition: result[i] = a[i] + b[i]
 * Processes 2 elements at a time using f64x2 SIMD
 * @param aPtr Pointer to first input array
 * @param bPtr Pointer to second input array
 * @param resultPtr Pointer to output array
 * @param length Number of elements (should be even for optimal performance)
 */
export function simdAddF64(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1 // Round down to even number

  // Process 2 elements at a time with SIMD
  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = f64x2.add(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  // Handle remaining odd element
  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) + load<f64>(bPtr + offset))
  }
}

/**
 * SIMD vector subtraction: result[i] = a[i] - b[i]
 */
export function simdSubF64(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = f64x2.sub(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) - load<f64>(bPtr + offset))
  }
}

/**
 * SIMD vector multiplication: result[i] = a[i] * b[i]
 */
export function simdMulF64(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = f64x2.mul(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) * load<f64>(bPtr + offset))
  }
}

/**
 * SIMD vector division: result[i] = a[i] / b[i]
 */
export function simdDivF64(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = f64x2.div(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) / load<f64>(bPtr + offset))
  }
}

/**
 * SIMD scalar multiplication: result[i] = a[i] * scalar
 */
export function simdScaleF64(
  aPtr: usize,
  scalar: f64,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1
  const vs = f64x2.splat(scalar)

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vr = f64x2.mul(va, vs)
    v128.store(resultPtr + offset, vr)
  }

  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, load<f64>(aPtr + offset) * scalar)
  }
}

/**
 * SIMD dot product: sum(a[i] * b[i])
 * Uses horizontal addition for final reduction
 */
export function simdDotF64(aPtr: usize, bPtr: usize, length: i32): f64 {
  const simdLength = length & ~1
  let sum: v128 = f64x2.splat(0.0)

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    sum = f64x2.add(sum, f64x2.mul(va, vb))
  }

  // Horizontal sum of vector
  let result = f64x2.extract_lane(sum, 0) + f64x2.extract_lane(sum, 1)

  // Handle remaining odd element
  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    result += load<f64>(aPtr + offset) * load<f64>(bPtr + offset)
  }

  return result
}

/**
 * SIMD sum of array elements
 */
export function simdSumF64(aPtr: usize, length: i32): f64 {
  const simdLength = length & ~1
  let sum: v128 = f64x2.splat(0.0)

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    sum = f64x2.add(sum, va)
  }

  let result = f64x2.extract_lane(sum, 0) + f64x2.extract_lane(sum, 1)

  if (length & 1) {
    result += load<f64>(aPtr + (<usize>simdLength << 3))
  }

  return result
}

/**
 * SIMD squared sum: sum(a[i]^2) - useful for norm calculations
 */
export function simdSumSquaresF64(aPtr: usize, length: i32): f64 {
  const simdLength = length & ~1
  let sum: v128 = f64x2.splat(0.0)

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    sum = f64x2.add(sum, f64x2.mul(va, va))
  }

  let result = f64x2.extract_lane(sum, 0) + f64x2.extract_lane(sum, 1)

  if (length & 1) {
    const val = load<f64>(aPtr + (<usize>simdLength << 3))
    result += val * val
  }

  return result
}

/**
 * SIMD L2 norm (Euclidean norm): sqrt(sum(a[i]^2))
 */
export function simdNormF64(aPtr: usize, length: i32): f64 {
  return Math.sqrt(simdSumSquaresF64(aPtr, length))
}

/**
 * SIMD min of array elements
 */
export function simdMinF64(aPtr: usize, length: i32): f64 {
  if (length === 0) return f64.NaN

  const simdLength = length & ~1
  let minVec: v128 = f64x2.splat(f64.MAX_VALUE)

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    minVec = f64x2.min(minVec, va)
  }

  let result = Math.min(
    f64x2.extract_lane(minVec, 0),
    f64x2.extract_lane(minVec, 1)
  )

  if (length & 1) {
    result = Math.min(result, load<f64>(aPtr + (<usize>simdLength << 3)))
  }

  return result
}

/**
 * SIMD max of array elements
 */
export function simdMaxF64(aPtr: usize, length: i32): f64 {
  if (length === 0) return f64.NaN

  const simdLength = length & ~1
  let maxVec: v128 = f64x2.splat(f64.MIN_VALUE)

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    maxVec = f64x2.max(maxVec, va)
  }

  let result = Math.max(
    f64x2.extract_lane(maxVec, 0),
    f64x2.extract_lane(maxVec, 1)
  )

  if (length & 1) {
    result = Math.max(result, load<f64>(aPtr + (<usize>simdLength << 3)))
  }

  return result
}

/**
 * SIMD absolute value: result[i] = |a[i]|
 */
export function simdAbsF64(
  aPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vr = f64x2.abs(va)
    v128.store(resultPtr + offset, vr)
  }

  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, Math.abs(load<f64>(aPtr + offset)))
  }
}

/**
 * SIMD square root: result[i] = sqrt(a[i])
 */
export function simdSqrtF64(
  aPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vr = f64x2.sqrt(va)
    v128.store(resultPtr + offset, vr)
  }

  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, Math.sqrt(load<f64>(aPtr + offset)))
  }
}

/**
 * SIMD negation: result[i] = -a[i]
 */
export function simdNegF64(
  aPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~1

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const vr = f64x2.neg(va)
    v128.store(resultPtr + offset, vr)
  }

  if (length & 1) {
    const offset: usize = <usize>simdLength << 3
    store<f64>(resultPtr + offset, -load<f64>(aPtr + offset))
  }
}

// ============================================================================
// SIMD MATRIX OPERATIONS
// ============================================================================

/**
 * SIMD matrix-vector multiplication: result = A * x
 * A is m x n, x is n x 1, result is m x 1
 */
export function simdMatVecMulF64(
  APtr: usize,
  xPtr: usize,
  resultPtr: usize,
  m: i32,
  n: i32
): void {
  const simdN = n & ~1

  for (let i: i32 = 0; i < m; i++) {
    let sum: v128 = f64x2.splat(0.0)
    const rowOffset: usize = <usize>(i * n) << 3

    // SIMD part
    for (let j: i32 = 0; j < simdN; j += 2) {
      const colOffset: usize = <usize>j << 3
      const va = v128.load(APtr + rowOffset + colOffset)
      const vx = v128.load(xPtr + colOffset)
      sum = f64x2.add(sum, f64x2.mul(va, vx))
    }

    let rowSum = f64x2.extract_lane(sum, 0) + f64x2.extract_lane(sum, 1)

    // Handle remaining column
    if (n & 1) {
      const aOffset: usize = rowOffset + (<usize>simdN << 3)
      const xOffset: usize = <usize>simdN << 3
      rowSum += load<f64>(APtr + aOffset) * load<f64>(xPtr + xOffset)
    }

    store<f64>(resultPtr + (<usize>i << 3), rowSum)
  }
}

/**
 * SIMD matrix addition: C = A + B
 * All matrices are m x n stored in row-major order
 */
export function simdMatAddF64(
  APtr: usize,
  BPtr: usize,
  CPtr: usize,
  m: i32,
  n: i32
): void {
  const total = m * n
  simdAddF64(APtr, BPtr, CPtr, total)
}

/**
 * SIMD matrix subtraction: C = A - B
 */
export function simdMatSubF64(
  APtr: usize,
  BPtr: usize,
  CPtr: usize,
  m: i32,
  n: i32
): void {
  const total = m * n
  simdSubF64(APtr, BPtr, CPtr, total)
}

/**
 * SIMD element-wise matrix multiplication (Hadamard product): C = A .* B
 */
export function simdMatDotMulF64(
  APtr: usize,
  BPtr: usize,
  CPtr: usize,
  m: i32,
  n: i32
): void {
  const total = m * n
  simdMulF64(APtr, BPtr, CPtr, total)
}

/**
 * SIMD scalar matrix multiplication: B = scalar * A
 */
export function simdMatScaleF64(
  APtr: usize,
  scalar: f64,
  BPtr: usize,
  m: i32,
  n: i32
): void {
  const total = m * n
  simdScaleF64(APtr, scalar, BPtr, total)
}

/**
 * SIMD matrix multiplication: C = A * B
 * A is m x k, B is k x n, C is m x n
 * Uses SIMD for the inner loop (dot product)
 */
export function simdMatMulF64(
  APtr: usize,
  BPtr: usize,
  CPtr: usize,
  m: i32,
  k: i32,
  n: i32
): void {
  const simdK = k & ~1

  for (let i: i32 = 0; i < m; i++) {
    const rowOffsetA: usize = <usize>(i * k) << 3
    const rowOffsetC: usize = <usize>(i * n) << 3

    for (let j: i32 = 0; j < n; j++) {
      let sum: v128 = f64x2.splat(0.0)

      // SIMD inner product
      for (let p: i32 = 0; p < simdK; p += 2) {
        // Load 2 elements from row of A
        const va = v128.load(APtr + rowOffsetA + (<usize>p << 3))
        // Load 2 elements from column of B (non-contiguous, so manual load)
        const b0 = load<f64>(BPtr + (<usize>(p * n + j) << 3))
        const b1 = load<f64>(BPtr + (<usize>((p + 1) * n + j) << 3))
        const vb = f64x2.replace_lane(
          f64x2.replace_lane(f64x2.splat(0.0), 0, b0),
          1,
          b1
        )
        sum = f64x2.add(sum, f64x2.mul(va, vb))
      }

      let dotSum = f64x2.extract_lane(sum, 0) + f64x2.extract_lane(sum, 1)

      // Handle remaining element
      if (k & 1) {
        const aVal = load<f64>(APtr + rowOffsetA + (<usize>simdK << 3))
        const bVal = load<f64>(BPtr + (<usize>(simdK * n + j) << 3))
        dotSum += aVal * bVal
      }

      store<f64>(CPtr + rowOffsetC + (<usize>j << 3), dotSum)
    }
  }
}

/**
 * SIMD matrix transpose: B = A^T
 * A is m x n, B is n x m
 * Note: Transpose is memory-bound, SIMD helps less here
 */
export function simdMatTransposeF64(
  APtr: usize,
  BPtr: usize,
  m: i32,
  n: i32
): void {
  // For 2x2 blocks, we can use manual transposition
  const m2 = m & ~1
  const n2 = n & ~1

  // Process 2x2 blocks
  for (let i: i32 = 0; i < m2; i += 2) {
    for (let j: i32 = 0; j < n2; j += 2) {
      // Load 2x2 block from A
      const a00 = load<f64>(APtr + (<usize>(i * n + j) << 3))
      const a01 = load<f64>(APtr + (<usize>(i * n + j + 1) << 3))
      const a10 = load<f64>(APtr + (<usize>((i + 1) * n + j) << 3))
      const a11 = load<f64>(APtr + (<usize>((i + 1) * n + j + 1) << 3))

      // Store transposed 2x2 block to B
      store<f64>(BPtr + (<usize>(j * m + i) << 3), a00)
      store<f64>(BPtr + (<usize>(j * m + i + 1) << 3), a10)
      store<f64>(BPtr + (<usize>((j + 1) * m + i) << 3), a01)
      store<f64>(BPtr + (<usize>((j + 1) * m + i + 1) << 3), a11)
    }
  }

  // Handle remaining rows
  for (let i: i32 = m2; i < m; i++) {
    for (let j: i32 = 0; j < n; j++) {
      store<f64>(
        BPtr + (<usize>(j * m + i) << 3),
        load<f64>(APtr + (<usize>(i * n + j) << 3))
      )
    }
  }

  // Handle remaining columns
  for (let i: i32 = 0; i < m2; i++) {
    for (let j: i32 = n2; j < n; j++) {
      store<f64>(
        BPtr + (<usize>(j * m + i) << 3),
        load<f64>(APtr + (<usize>(i * n + j) << 3))
      )
    }
  }
}

// ============================================================================
// SIMD STATISTICAL OPERATIONS
// ============================================================================

/**
 * SIMD mean of array elements
 */
export function simdMeanF64(aPtr: usize, length: i32): f64 {
  if (length === 0) return f64.NaN
  return simdSumF64(aPtr, length) / f64(length)
}

/**
 * SIMD variance calculation
 * Uses two-pass algorithm for numerical stability
 */
export function simdVarianceF64(
  aPtr: usize,
  length: i32,
  ddof: i32 = 0
): f64 {
  if (length <= ddof) return f64.NaN

  const mean = simdMeanF64(aPtr, length)
  const simdLength = length & ~1
  let sumSq: v128 = f64x2.splat(0.0)
  const vMean: v128 = f64x2.splat(mean)

  for (let i: i32 = 0; i < simdLength; i += 2) {
    const offset: usize = <usize>i << 3
    const va = v128.load(aPtr + offset)
    const diff = f64x2.sub(va, vMean)
    sumSq = f64x2.add(sumSq, f64x2.mul(diff, diff))
  }

  let result = f64x2.extract_lane(sumSq, 0) + f64x2.extract_lane(sumSq, 1)

  if (length & 1) {
    const diff = load<f64>(aPtr + (<usize>simdLength << 3)) - mean
    result += diff * diff
  }

  return result / f64(length - ddof)
}

/**
 * SIMD standard deviation
 */
export function simdStdF64(aPtr: usize, length: i32, ddof: i32 = 0): f64 {
  return Math.sqrt(simdVarianceF64(aPtr, length, ddof))
}

// ============================================================================
// SIMD OPERATIONS (f32x4 - 4 floats per vector) for larger parallelism
// ============================================================================

/**
 * SIMD vector addition using f32x4 (4 elements at a time)
 */
export function simdAddF32(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~3 // Round down to multiple of 4

  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset: usize = <usize>i << 2
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = f32x4.add(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  // Handle remaining elements
  for (let i: i32 = simdLength; i < length; i++) {
    const offset: usize = <usize>i << 2
    store<f32>(resultPtr + offset, load<f32>(aPtr + offset) + load<f32>(bPtr + offset))
  }
}

/**
 * SIMD vector multiplication using f32x4
 */
export function simdMulF32(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~3

  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset: usize = <usize>i << 2
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = f32x4.mul(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  for (let i: i32 = simdLength; i < length; i++) {
    const offset: usize = <usize>i << 2
    store<f32>(resultPtr + offset, load<f32>(aPtr + offset) * load<f32>(bPtr + offset))
  }
}

/**
 * SIMD dot product using f32x4
 */
export function simdDotF32(aPtr: usize, bPtr: usize, length: i32): f32 {
  const simdLength = length & ~3
  let sum: v128 = f32x4.splat(0.0)

  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset: usize = <usize>i << 2
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    sum = f32x4.add(sum, f32x4.mul(va, vb))
  }

  // Horizontal sum
  let result: f32 =
    f32x4.extract_lane(sum, 0) +
    f32x4.extract_lane(sum, 1) +
    f32x4.extract_lane(sum, 2) +
    f32x4.extract_lane(sum, 3)

  for (let i: i32 = simdLength; i < length; i++) {
    const offset: usize = <usize>i << 2
    result += load<f32>(aPtr + offset) * load<f32>(bPtr + offset)
  }

  return result
}

/**
 * SIMD sum using f32x4
 */
export function simdSumF32(aPtr: usize, length: i32): f32 {
  const simdLength = length & ~3
  let sum: v128 = f32x4.splat(0.0)

  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset: usize = <usize>i << 2
    const va = v128.load(aPtr + offset)
    sum = f32x4.add(sum, va)
  }

  let result: f32 =
    f32x4.extract_lane(sum, 0) +
    f32x4.extract_lane(sum, 1) +
    f32x4.extract_lane(sum, 2) +
    f32x4.extract_lane(sum, 3)

  for (let i: i32 = simdLength; i < length; i++) {
    result += load<f32>(aPtr + (<usize>i << 2))
  }

  return result
}

// ============================================================================
// SIMD INTEGER OPERATIONS (i32x4 - 4 integers per vector)
// Using v128 load/store with i32x4 operations
// ============================================================================

/**
 * SIMD integer vector addition
 */
export function simdAddI32(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~3

  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset: usize = <usize>i << 2
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = i32x4.add(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  for (let i: i32 = simdLength; i < length; i++) {
    const offset: usize = <usize>i << 2
    store<i32>(resultPtr + offset, load<i32>(aPtr + offset) + load<i32>(bPtr + offset))
  }
}

/**
 * SIMD integer vector multiplication
 */
export function simdMulI32(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: i32
): void {
  const simdLength = length & ~3

  for (let i: i32 = 0; i < simdLength; i += 4) {
    const offset: usize = <usize>i << 2
    const va = v128.load(aPtr + offset)
    const vb = v128.load(bPtr + offset)
    const vr = i32x4.mul(va, vb)
    v128.store(resultPtr + offset, vr)
  }

  for (let i: i32 = simdLength; i < length; i++) {
    const offset: usize = <usize>i << 2
    store<i32>(resultPtr + offset, load<i32>(aPtr + offset) * load<i32>(bPtr + offset))
  }
}

// ============================================================================
// SIMD-ACCELERATED COMPLEX OPERATIONS
// ============================================================================

/**
 * SIMD complex multiplication
 * Complex numbers stored as [re0, im0, re1, im1, ...]
 * (a + bi)(c + di) = (ac - bd) + (ad + bc)i
 */
export function simdComplexMulF64(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  count: i32
): void {
  for (let i: i32 = 0; i < count; i++) {
    const offset: usize = <usize>(i * 2) << 3
    const aRe = load<f64>(aPtr + offset)
    const aIm = load<f64>(aPtr + offset + 8)
    const bRe = load<f64>(bPtr + offset)
    const bIm = load<f64>(bPtr + offset + 8)

    store<f64>(resultPtr + offset, aRe * bRe - aIm * bIm)
    store<f64>(resultPtr + offset + 8, aRe * bIm + aIm * bRe)
  }
}

/**
 * SIMD complex addition
 */
export function simdComplexAddF64(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  count: i32
): void {
  // Complex numbers are just pairs of f64, so we can use regular SIMD add
  simdAddF64(aPtr, bPtr, resultPtr, count * 2)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if SIMD is supported (always true in compiled WASM)
 */
export function simdSupported(): bool {
  return true
}

/**
 * Get optimal vector size for SIMD operations
 * Returns number of f64 elements processed per SIMD instruction
 */
export function simdVectorSizeF64(): i32 {
  return 2 // f64x2 processes 2 doubles
}

/**
 * Get optimal vector size for f32 SIMD operations
 */
export function simdVectorSizeF32(): i32 {
  return 4 // f32x4 processes 4 floats
}
