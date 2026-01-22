/**
 * WASM-optimized broadcast element-wise operations
 *
 * Implements NumPy-style broadcasting for element-wise operations
 * between matrices of compatible but different shapes.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

/**
 * Check if two shapes are compatible for broadcasting
 * @param shape1Ptr - Pointer to first shape (i32)
 * @param n1 - Length of first shape
 * @param shape2Ptr - Pointer to second shape (i32)
 * @param n2 - Length of second shape
 * @returns true if shapes are broadcast-compatible
 */
export function canBroadcast(
  shape1Ptr: usize,
  n1: i32,
  shape2Ptr: usize,
  n2: i32
): bool {
  const maxLen: i32 = n1 > n2 ? n1 : n2

  for (let i: i32 = 0; i < maxLen; i++) {
    const d1: i32 = i < n1 ? load<i32>(shape1Ptr + (<usize>(n1 - 1 - i) << 2)) : 1
    const d2: i32 = i < n2 ? load<i32>(shape2Ptr + (<usize>(n2 - 1 - i) << 2)) : 1
    if (d1 !== d2 && d1 !== 1 && d2 !== 1) {
      return false
    }
  }
  return true
}

/**
 * Compute the output shape after broadcasting two shapes
 * @param shape1Ptr - Pointer to first shape (i32)
 * @param n1 - Length of first shape
 * @param shape2Ptr - Pointer to second shape (i32)
 * @param n2 - Length of second shape
 * @param resultPtr - Pointer to output shape (i32, size max(n1,n2))
 * @returns Length of result shape, or 0 if incompatible
 */
export function broadcastShape(
  shape1Ptr: usize,
  n1: i32,
  shape2Ptr: usize,
  n2: i32,
  resultPtr: usize
): i32 {
  const maxLen: i32 = n1 > n2 ? n1 : n2

  for (let i: i32 = 0; i < maxLen; i++) {
    const d1: i32 = i < n1 ? load<i32>(shape1Ptr + (<usize>(n1 - 1 - i) << 2)) : 1
    const d2: i32 = i < n2 ? load<i32>(shape2Ptr + (<usize>(n2 - 1 - i) << 2)) : 1

    if (d1 === d2) {
      store<i32>(resultPtr + (<usize>(maxLen - 1 - i) << 2), d1)
    } else if (d1 === 1) {
      store<i32>(resultPtr + (<usize>(maxLen - 1 - i) << 2), d2)
    } else if (d2 === 1) {
      store<i32>(resultPtr + (<usize>(maxLen - 1 - i) << 2), d1)
    } else {
      return 0 // Incompatible
    }
  }

  return maxLen
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
  const outRow: i32 = outIdx / outCols
  const outCol: i32 = outIdx % outCols

  const inRow: i32 = inRows === 1 ? 0 : outRow
  const inCol: i32 = inCols === 1 ? 0 : outCol

  return inRow * inCols + inCol
}

/**
 * Broadcast multiply two matrices element-wise
 * @param aPtr - Pointer to first matrix (f64, rows1 x cols1, row-major)
 * @param rows1 - Rows in A
 * @param cols1 - Columns in A
 * @param bPtr - Pointer to second matrix (f64, rows2 x cols2, row-major)
 * @param rows2 - Rows in B
 * @param cols2 - Columns in B
 * @param resultPtr - Pointer to result matrix (f64, pre-allocated)
 * @param outRowsPtr - Pointer to output rows count (i32, single value)
 * @param outColsPtr - Pointer to output cols count (i32, single value)
 * @returns 1 on success, 0 if shapes incompatible
 */
export function broadcastMultiply(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  // Check compatibility
  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>idxA << 3)) * load<f64>(bPtr + (<usize>idxB << 3)))
  }

  return 1
}

/**
 * Broadcast divide two matrices element-wise (A / B)
 */
export function broadcastDivide(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>idxA << 3)) / load<f64>(bPtr + (<usize>idxB << 3)))
  }

  return 1
}

/**
 * Broadcast add two matrices element-wise
 */
export function broadcastAdd(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>idxA << 3)) + load<f64>(bPtr + (<usize>idxB << 3)))
  }

  return 1
}

/**
 * Broadcast subtract two matrices element-wise (A - B)
 */
export function broadcastSubtract(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>idxA << 3)) - load<f64>(bPtr + (<usize>idxB << 3)))
  }

  return 1
}

/**
 * Broadcast power two matrices element-wise (A ^ B)
 */
export function broadcastPow(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), Math.pow(load<f64>(aPtr + (<usize>idxA << 3)), load<f64>(bPtr + (<usize>idxB << 3))))
  }

  return 1
}

/**
 * Broadcast minimum of two matrices element-wise
 */
export function broadcastMin(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    const a: f64 = load<f64>(aPtr + (<usize>idxA << 3))
    const b: f64 = load<f64>(bPtr + (<usize>idxB << 3))
    store<f64>(resultPtr + (<usize>i << 3), a < b ? a : b)
  }

  return 1
}

/**
 * Broadcast maximum of two matrices element-wise
 */
export function broadcastMax(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    const a: f64 = load<f64>(aPtr + (<usize>idxA << 3))
    const b: f64 = load<f64>(bPtr + (<usize>idxB << 3))
    store<f64>(resultPtr + (<usize>i << 3), a > b ? a : b)
  }

  return 1
}

/**
 * Broadcast modulo of two matrices element-wise (A % B)
 */
export function broadcastMod(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>idxA << 3)) % load<f64>(bPtr + (<usize>idxB << 3)))
  }

  return 1
}

/**
 * Broadcast equality comparison (A == B), returns 1.0 or 0.0
 */
export function broadcastEqual(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  tol: f64,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), Math.abs(load<f64>(aPtr + (<usize>idxA << 3)) - load<f64>(bPtr + (<usize>idxB << 3))) < tol ? 1.0 : 0.0)
  }

  return 1
}

/**
 * Broadcast less-than comparison (A < B), returns 1.0 or 0.0
 */
export function broadcastLess(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>idxA << 3)) < load<f64>(bPtr + (<usize>idxB << 3)) ? 1.0 : 0.0)
  }

  return 1
}

/**
 * Broadcast greater-than comparison (A > B), returns 1.0 or 0.0
 */
export function broadcastGreater(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  resultPtr: usize,
  outRowsPtr: usize,
  outColsPtr: usize
): i32 {
  const outRows: i32 = rows1 > rows2 ? rows1 : rows2 > 1 ? rows2 : rows1
  const outCols: i32 = cols1 > cols2 ? cols1 : cols2 > 1 ? cols2 : cols1

  if (
    (rows1 !== rows2 && rows1 !== 1 && rows2 !== 1) ||
    (cols1 !== cols2 && cols1 !== 1 && cols2 !== 1)
  ) {
    return 0
  }

  store<i32>(outRowsPtr, outRows)
  store<i32>(outColsPtr, outCols)

  for (let i: i32 = 0; i < outRows * outCols; i++) {
    const idxA: i32 = getBroadcastIndex(i, outRows, outCols, rows1, cols1)
    const idxB: i32 = getBroadcastIndex(i, outRows, outCols, rows2, cols2)
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>idxA << 3)) > load<f64>(bPtr + (<usize>idxB << 3)) ? 1.0 : 0.0)
  }

  return 1
}

/**
 * Scalar broadcast - multiply matrix by scalar
 * @param aPtr - Pointer to input matrix (f64)
 * @param n - Number of elements
 * @param scalar - Scalar value
 * @param resultPtr - Pointer to output matrix (f64)
 */
export function broadcastScalarMultiply(
  aPtr: usize,
  n: i32,
  scalar: f64,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>i << 3)) * scalar)
  }
}

/**
 * Scalar broadcast - add scalar to matrix
 * @param aPtr - Pointer to input matrix (f64)
 * @param n - Number of elements
 * @param scalar - Scalar value
 * @param resultPtr - Pointer to output matrix (f64)
 */
export function broadcastScalarAdd(
  aPtr: usize,
  n: i32,
  scalar: f64,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(resultPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>i << 3)) + scalar)
  }
}

/**
 * Apply function element-wise with broadcasting
 * For matrices with same shape
 * @param aPtr - Pointer to first matrix (f64)
 * @param bPtr - Pointer to second matrix (f64)
 * @param n - Number of elements (must be same for both)
 * @param op - Operation: 0=add, 1=sub, 2=mul, 3=div, 4=pow, 5=min, 6=max, 7=mod
 * @param resultPtr - Pointer to output matrix (f64)
 * @returns 1 on success, 0 if lengths don't match
 */
export function broadcastApply(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  op: i32,
  resultPtr: usize
): i32 {
  for (let i: i32 = 0; i < n; i++) {
    const a: f64 = load<f64>(aPtr + (<usize>i << 3))
    const b: f64 = load<f64>(bPtr + (<usize>i << 3))
    let result: f64

    if (op === 0) {
      result = a + b
    } else if (op === 1) {
      result = a - b
    } else if (op === 2) {
      result = a * b
    } else if (op === 3) {
      result = a / b
    } else if (op === 4) {
      result = Math.pow(a, b)
    } else if (op === 5) {
      result = a < b ? a : b
    } else if (op === 6) {
      result = a > b ? a : b
    } else if (op === 7) {
      result = a % b
    } else {
      result = 0.0
    }

    store<f64>(resultPtr + (<usize>i << 3), result)
  }

  return 1
}
