/**
 * WASM-optimized broadcast element-wise operations
 *
 * Implements NumPy-style broadcasting for element-wise operations
 * between matrices of compatible but different shapes.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// Operation codes for broadcastBinaryOp and broadcastApply
// @ts-ignore: used as documentation
const OP_ADD: i32 = 0
// @ts-ignore: used as documentation
const OP_SUB: i32 = 1
// @ts-ignore: used as documentation
const OP_MUL: i32 = 2
// @ts-ignore: used as documentation
const OP_DIV: i32 = 3
// @ts-ignore: used as documentation
const OP_POW: i32 = 4
// @ts-ignore: used as documentation
const OP_MIN: i32 = 5
// @ts-ignore: used as documentation
const OP_MAX: i32 = 6
// @ts-ignore: used as documentation
const OP_MOD: i32 = 7
// @ts-ignore: used as documentation
const OP_LESS: i32 = 8
// @ts-ignore: used as documentation
const OP_GREATER: i32 = 9

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
  const outRow: i32 = <i32>Math.trunc(<f64>outIdx / <f64>outCols)
  const outCol: i32 = outIdx % outCols

  const inRow: i32 = inRows === 1 ? 0 : outRow
  const inCol: i32 = inCols === 1 ? 0 : outCol

  return inRow * inCols + inCol
}

/**
 * Apply a binary operation element-wise
 */
function applyOp(a: f64, b: f64, op: i32): f64 {
  if (op === 0) return a + b
  if (op === 1) return a - b
  if (op === 2) return a * b
  if (op === 3) return a / b
  if (op === 4) return Math.pow(a, b)
  if (op === 5) return a < b ? a : b
  if (op === 6) return a > b ? a : b
  if (op === 7) return a % b
  if (op === 8) return a < b ? 1.0 : 0.0
  if (op === 9) return a > b ? 1.0 : 0.0
  return 0.0
}

/**
 * Common broadcast binary operation for 2D matrices with different shapes.
 * Handles dimension calculation, compatibility check, index mapping, and operation.
 *
 * @param aPtr - Pointer to first matrix (f64, rows1 x cols1, row-major)
 * @param rows1 - Rows in A
 * @param cols1 - Columns in A
 * @param bPtr - Pointer to second matrix (f64, rows2 x cols2, row-major)
 * @param rows2 - Rows in B
 * @param cols2 - Columns in B
 * @param op - Operation code (0=add, 1=sub, 2=mul, 3=div, 4=pow, 5=min, 6=max, 7=mod, 8=less, 9=greater)
 * @param resultPtr - Pointer to result matrix (f64, pre-allocated)
 * @param outRowsPtr - Pointer to output rows count (i32, single value)
 * @param outColsPtr - Pointer to output cols count (i32, single value)
 * @returns 1 on success, 0 if shapes incompatible
 */
function broadcastBinaryOp(
  aPtr: usize,
  rows1: i32,
  cols1: i32,
  bPtr: usize,
  rows2: i32,
  cols2: i32,
  op: i32,
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
    store<f64>(resultPtr + (<usize>i << 3), applyOp(a, b, op))
  }

  return 1
}

/** Broadcast multiply two matrices element-wise */
export function broadcastMultiply(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 2, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast divide two matrices element-wise (A / B) */
export function broadcastDivide(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 3, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast add two matrices element-wise */
export function broadcastAdd(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 0, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast subtract two matrices element-wise (A - B) */
export function broadcastSubtract(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 1, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast power two matrices element-wise (A ^ B) */
export function broadcastPow(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 4, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast minimum of two matrices element-wise */
export function broadcastMin(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 5, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast maximum of two matrices element-wise */
export function broadcastMax(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 6, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast modulo of two matrices element-wise (A % B) */
export function broadcastMod(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 7, resultPtr, outRowsPtr, outColsPtr)
}

/**
 * Broadcast equality comparison (A == B), returns 1.0 or 0.0
 * Has an extra tolerance parameter, so uses broadcastBinaryOp setup but custom logic
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

/** Broadcast less-than comparison (A < B), returns 1.0 or 0.0 */
export function broadcastLess(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 8, resultPtr, outRowsPtr, outColsPtr)
}

/** Broadcast greater-than comparison (A > B), returns 1.0 or 0.0 */
export function broadcastGreater(
  aPtr: usize, rows1: i32, cols1: i32,
  bPtr: usize, rows2: i32, cols2: i32,
  resultPtr: usize, outRowsPtr: usize, outColsPtr: usize
): i32 {
  return broadcastBinaryOp(aPtr, rows1, cols1, bPtr, rows2, cols2, 9, resultPtr, outRowsPtr, outColsPtr)
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
 * @returns 1 on success
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
    store<f64>(resultPtr + (<usize>i << 3), applyOp(a, b, op))
  }

  return 1
}
