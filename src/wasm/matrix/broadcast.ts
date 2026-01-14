/**
 * WASM-optimized broadcast element-wise operations
 *
 * Implements NumPy-style broadcasting for element-wise operations
 * between matrices of compatible but different shapes.
 */

/**
 * Check if two shapes are compatible for broadcasting
 * @param shape1 - First shape [rows, cols]
 * @param shape2 - Second shape [rows, cols]
 * @returns true if shapes are broadcast-compatible
 */
export function canBroadcast(shape1: Int32Array, shape2: Int32Array): bool {
  const n1: i32 = shape1.length
  const n2: i32 = shape2.length
  const maxLen: i32 = n1 > n2 ? n1 : n2

  for (let i: i32 = 0; i < maxLen; i++) {
    const d1: i32 = i < n1 ? shape1[n1 - 1 - i] : 1
    const d2: i32 = i < n2 ? shape2[n2 - 1 - i] : 1
    if (d1 !== d2 && d1 !== 1 && d2 !== 1) {
      return false
    }
  }
  return true
}

/**
 * Compute the output shape after broadcasting two shapes
 * @param shape1 - First shape [rows, cols]
 * @param shape2 - Second shape [rows, cols]
 * @returns Output shape or empty array if incompatible
 */
export function broadcastShape(shape1: Int32Array, shape2: Int32Array): Int32Array {
  const n1: i32 = shape1.length
  const n2: i32 = shape2.length
  const maxLen: i32 = n1 > n2 ? n1 : n2

  const result = new Int32Array(maxLen)

  for (let i: i32 = 0; i < maxLen; i++) {
    const d1: i32 = i < n1 ? shape1[n1 - 1 - i] : 1
    const d2: i32 = i < n2 ? shape2[n2 - 1 - i] : 1

    if (d1 === d2) {
      result[maxLen - 1 - i] = d1
    } else if (d1 === 1) {
      result[maxLen - 1 - i] = d2
    } else if (d2 === 1) {
      result[maxLen - 1 - i] = d1
    } else {
      return new Int32Array(0)
    }
  }

  return result
}

/**
 * Get broadcasted index for a matrix
 */
function getBroadcastIndex(
  outIdx: i32,
  outRows: i32,
  outCols: i32,
  inRows: i32,
  inCols: i32
): i32 {
  const outRow: i32 = Math.floor(f64(outIdx) / f64(outCols)) as i32
  const outCol: i32 = outIdx % outCols

  const inRow: i32 = inRows === 1 ? 0 : outRow
  const inCol: i32 = inCols === 1 ? 0 : outCol

  return inRow * inCols + inCol
}

/**
 * Broadcast multiply two matrices element-wise
 * @param A - First matrix (rows1 x cols1, row-major)
 * @param rows1 - Rows in A
 * @param cols1 - Columns in A
 * @param B - Second matrix (rows2 x cols2, row-major)
 * @param rows2 - Rows in B
 * @param cols2 - Columns in B
 * @returns Result matrix or empty if shapes incompatible
 */
export function broadcastMultiply(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  // Check compatibility
  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] * B[idxB]
  }

  return result
}

/**
 * Broadcast divide two matrices element-wise (A / B)
 */
export function broadcastDivide(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] / B[idxB]
  }

  return result
}

/**
 * Broadcast add two matrices element-wise
 */
export function broadcastAdd(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] + B[idxB]
  }

  return result
}

/**
 * Broadcast subtract two matrices element-wise (A - B)
 */
export function broadcastSubtract(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] - B[idxB]
  }

  return result
}

/**
 * Broadcast power two matrices element-wise (A ^ B)
 */
export function broadcastPow(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = Math.pow(A[idxA], B[idxB])
  }

  return result
}

/**
 * Broadcast minimum of two matrices element-wise
 */
export function broadcastMin(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] < B[idxB] ? A[idxA] : B[idxB]
  }

  return result
}

/**
 * Broadcast maximum of two matrices element-wise
 */
export function broadcastMax(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] > B[idxB] ? A[idxA] : B[idxB]
  }

  return result
}

/**
 * Broadcast modulo of two matrices element-wise (A % B)
 */
export function broadcastMod(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] % B[idxB]
  }

  return result
}

/**
 * Broadcast equality comparison (A == B), returns 1.0 or 0.0
 */
export function broadcastEqual(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32,
  tol: f64
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = Math.abs(A[idxA] - B[idxB]) < tol ? 1.0 : 0.0
  }

  return result
}

/**
 * Broadcast less-than comparison (A < B), returns 1.0 or 0.0
 */
export function broadcastLess(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] < B[idxB] ? 1.0 : 0.0
  }

  return result
}

/**
 * Broadcast greater-than comparison (A > B), returns 1.0 or 0.0
 */
export function broadcastGreater(
  A: Float64Array,
  rows1: i32,
  cols1: i32,
  B: Float64Array,
  rows2: i32,
  cols2: i32
): Float64Array {
  const outRows: i32 = rows1 > rows2 ? rows1 : (rows2 > 1 ? rows2 : rows1)
  const outCols: i32 = cols1 > cols2 ? cols1 : (cols2 > 1 ? cols2 : cols1)

  if ((rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
      (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)) {
    return new Float64Array(0)
  }

  const result = new Float64Array(outRows * outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    result[i] = A[idxA] > B[idxB] ? 1.0 : 0.0
  }

  return result
}

/**
 * Scalar broadcast - multiply matrix by scalar
 */
export function broadcastScalarMultiply(
  A: Float64Array,
  scalar: f64
): Float64Array {
  const n: i32 = A.length
  const result = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    result[i] = A[i] * scalar
  }
  return result
}

/**
 * Scalar broadcast - add scalar to matrix
 */
export function broadcastScalarAdd(
  A: Float64Array,
  scalar: f64
): Float64Array {
  const n: i32 = A.length
  const result = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    result[i] = A[i] + scalar
  }
  return result
}

/**
 * Apply function element-wise with broadcasting
 * For matrices with same shape
 */
export function broadcastApply(
  A: Float64Array,
  B: Float64Array,
  op: i32 // 0=add, 1=sub, 2=mul, 3=div, 4=pow, 5=min, 6=max, 7=mod
): Float64Array {
  const n: i32 = A.length
  if (B.length !== n) {
    return new Float64Array(0)
  }

  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    if (op === 0) {
      result[i] = A[i] + B[i]
    } else if (op === 1) {
      result[i] = A[i] - B[i]
    } else if (op === 2) {
      result[i] = A[i] * B[i]
    } else if (op === 3) {
      result[i] = A[i] / B[i]
    } else if (op === 4) {
      result[i] = Math.pow(A[i], B[i])
    } else if (op === 5) {
      result[i] = A[i] < B[i] ? A[i] : B[i]
    } else if (op === 6) {
      result[i] = A[i] > B[i] ? A[i] : B[i]
    } else if (op === 7) {
      result[i] = A[i] % B[i]
    }
  }

  return result
}
