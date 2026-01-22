/**
 * WASM-optimized relational operations using AssemblyScript
 * Returns i32 for boolean results (0 = false, 1 = true)
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

// Tolerance for floating-point comparisons
const EPSILON: f64 = 1e-12

/**
 * Compare two numbers: returns -1 if a < b, 0 if equal, 1 if a > b
 * @param a - First number
 * @param b - Second number
 * @returns -1, 0, or 1
 */
export function compare(a: f64, b: f64): i32 {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Compare arrays element-wise
 * @param aPtr - Pointer to first array (f64)
 * @param bPtr - Pointer to second array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, -1, 0, or 1)
 */
export function compareArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    const a: f64 = load<f64>(aPtr + f64Offset)
    const b: f64 = load<f64>(bPtr + f64Offset)
    if (a < b) {
      store<i32>(resultPtr + i32Offset, -1)
    } else if (a > b) {
      store<i32>(resultPtr + i32Offset, 1)
    } else {
      store<i32>(resultPtr + i32Offset, 0)
    }
  }
}

/**
 * Check if two numbers are equal
 * @param a - First number
 * @param b - Second number
 * @returns 1 if equal, 0 otherwise
 */
export function equal(a: f64, b: f64): i32 {
  return a === b ? 1 : 0
}

/**
 * Check if two numbers are approximately equal (within tolerance)
 * @param a - First number
 * @param b - Second number
 * @param tolerance - Maximum allowed difference
 * @returns 1 if approximately equal, 0 otherwise
 */
export function nearlyEqual(a: f64, b: f64, tolerance: f64): i32 {
  return Math.abs(a - b) <= tolerance ? 1 : 0
}

/**
 * Element-wise equality check for arrays
 * @param aPtr - Pointer to first array (f64)
 * @param bPtr - Pointer to second array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, 0 or 1)
 */
export function equalArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    const a: f64 = load<f64>(aPtr + f64Offset)
    const b: f64 = load<f64>(bPtr + f64Offset)
    store<i32>(resultPtr + i32Offset, a === b ? 1 : 0)
  }
}

/**
 * Check if two numbers are not equal
 * @param a - First number
 * @param b - Second number
 * @returns 1 if not equal, 0 otherwise
 */
export function unequal(a: f64, b: f64): i32 {
  return a !== b ? 1 : 0
}

/**
 * Element-wise inequality check for arrays
 * @param aPtr - Pointer to first array (f64)
 * @param bPtr - Pointer to second array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, 0 or 1)
 */
export function unequalArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    const a: f64 = load<f64>(aPtr + f64Offset)
    const b: f64 = load<f64>(bPtr + f64Offset)
    store<i32>(resultPtr + i32Offset, a !== b ? 1 : 0)
  }
}

/**
 * Check if a is larger than b
 * @param a - First number
 * @param b - Second number
 * @returns 1 if a > b, 0 otherwise
 */
export function larger(a: f64, b: f64): i32 {
  return a > b ? 1 : 0
}

/**
 * Element-wise larger check for arrays
 * @param aPtr - Pointer to first array (f64)
 * @param bPtr - Pointer to second array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, 0 or 1)
 */
export function largerArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    store<i32>(
      resultPtr + i32Offset,
      load<f64>(aPtr + f64Offset) > load<f64>(bPtr + f64Offset) ? 1 : 0
    )
  }
}

/**
 * Check if a is larger than or equal to b
 * @param a - First number
 * @param b - Second number
 * @returns 1 if a >= b, 0 otherwise
 */
export function largerEq(a: f64, b: f64): i32 {
  return a >= b ? 1 : 0
}

/**
 * Element-wise largerEq check for arrays
 * @param aPtr - Pointer to first array (f64)
 * @param bPtr - Pointer to second array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, 0 or 1)
 */
export function largerEqArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    store<i32>(
      resultPtr + i32Offset,
      load<f64>(aPtr + f64Offset) >= load<f64>(bPtr + f64Offset) ? 1 : 0
    )
  }
}

/**
 * Check if a is smaller than b
 * @param a - First number
 * @param b - Second number
 * @returns 1 if a < b, 0 otherwise
 */
export function smaller(a: f64, b: f64): i32 {
  return a < b ? 1 : 0
}

/**
 * Element-wise smaller check for arrays
 * @param aPtr - Pointer to first array (f64)
 * @param bPtr - Pointer to second array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, 0 or 1)
 */
export function smallerArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    store<i32>(
      resultPtr + i32Offset,
      load<f64>(aPtr + f64Offset) < load<f64>(bPtr + f64Offset) ? 1 : 0
    )
  }
}

/**
 * Check if a is smaller than or equal to b
 * @param a - First number
 * @param b - Second number
 * @returns 1 if a <= b, 0 otherwise
 */
export function smallerEq(a: f64, b: f64): i32 {
  return a <= b ? 1 : 0
}

/**
 * Element-wise smallerEq check for arrays
 * @param aPtr - Pointer to first array (f64)
 * @param bPtr - Pointer to second array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, 0 or 1)
 */
export function smallerEqArray(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    store<i32>(
      resultPtr + i32Offset,
      load<f64>(aPtr + f64Offset) <= load<f64>(bPtr + f64Offset) ? 1 : 0
    )
  }
}

/**
 * Find minimum value in array
 * @param aPtr - Pointer to input array (f64)
 * @param n - Array length
 * @returns Minimum value
 */
export function min(aPtr: usize, n: i32): f64 {
  if (n === 0) return f64.NaN

  let minVal: f64 = load<f64>(aPtr)
  for (let i: i32 = 1; i < n; i++) {
    const val: f64 = load<f64>(aPtr + (<usize>i << 3))
    if (val < minVal) minVal = val
  }

  return minVal
}

/**
 * Find maximum value in array
 * @param aPtr - Pointer to input array (f64)
 * @param n - Array length
 * @returns Maximum value
 */
export function max(aPtr: usize, n: i32): f64 {
  if (n === 0) return f64.NaN

  let maxVal: f64 = load<f64>(aPtr)
  for (let i: i32 = 1; i < n; i++) {
    const val: f64 = load<f64>(aPtr + (<usize>i << 3))
    if (val > maxVal) maxVal = val
  }

  return maxVal
}

/**
 * Find index of minimum value in array
 * @param aPtr - Pointer to input array (f64)
 * @param n - Array length
 * @returns Index of minimum value
 */
export function argmin(aPtr: usize, n: i32): i32 {
  if (n === 0) return -1

  let minIdx: i32 = 0
  let minVal: f64 = load<f64>(aPtr)

  for (let i: i32 = 1; i < n; i++) {
    const val: f64 = load<f64>(aPtr + (<usize>i << 3))
    if (val < minVal) {
      minVal = val
      minIdx = i
    }
  }

  return minIdx
}

/**
 * Find index of maximum value in array
 * @param aPtr - Pointer to input array (f64)
 * @param n - Array length
 * @returns Index of maximum value
 */
export function argmax(aPtr: usize, n: i32): i32 {
  if (n === 0) return -1

  let maxIdx: i32 = 0
  let maxVal: f64 = load<f64>(aPtr)

  for (let i: i32 = 1; i < n; i++) {
    const val: f64 = load<f64>(aPtr + (<usize>i << 3))
    if (val > maxVal) {
      maxVal = val
      maxIdx = i
    }
  }

  return maxIdx
}

/**
 * Clamp value to range [min, max]
 * @param value - Value to clamp
 * @param minVal - Minimum allowed value
 * @param maxVal - Maximum allowed value
 * @returns Clamped value
 */
export function clamp(value: f64, minVal: f64, maxVal: f64): f64 {
  if (value < minVal) return minVal
  if (value > maxVal) return maxVal
  return value
}

/**
 * Element-wise clamp for arrays
 * @param aPtr - Pointer to input array (f64)
 * @param minVal - Minimum allowed value
 * @param maxVal - Maximum allowed value
 * @param n - Array length
 * @param resultPtr - Pointer to output array (f64)
 */
export function clampArray(
  aPtr: usize,
  minVal: f64,
  maxVal: f64,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    let v: f64 = load<f64>(aPtr + offset)
    if (v < minVal) v = minVal
    if (v > maxVal) v = maxVal
    store<f64>(resultPtr + offset, v)
  }
}

/**
 * Check if value is in range [min, max]
 * @param value - Value to check
 * @param minVal - Minimum of range
 * @param maxVal - Maximum of range
 * @returns 1 if in range, 0 otherwise
 */
export function inRange(value: f64, minVal: f64, maxVal: f64): i32 {
  return value >= minVal && value <= maxVal ? 1 : 0
}

/**
 * Element-wise range check for arrays
 * @param aPtr - Pointer to input array (f64)
 * @param minVal - Minimum of range
 * @param maxVal - Maximum of range
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, 0 or 1)
 */
export function inRangeArray(
  aPtr: usize,
  minVal: f64,
  maxVal: f64,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    const val: f64 = load<f64>(aPtr + f64Offset)
    store<i32>(resultPtr + i32Offset, val >= minVal && val <= maxVal ? 1 : 0)
  }
}

/**
 * Check if value is positive
 * @param a - Value to check
 * @returns 1 if positive, 0 otherwise
 */
export function isPositive(a: f64): i32 {
  return a > 0 ? 1 : 0
}

/**
 * Check if value is negative
 * @param a - Value to check
 * @returns 1 if negative, 0 otherwise
 */
export function isNegative(a: f64): i32 {
  return a < 0 ? 1 : 0
}

/**
 * Check if value is zero
 * @param a - Value to check
 * @returns 1 if zero, 0 otherwise
 */
export function isZero(a: f64): i32 {
  return a === 0.0 ? 1 : 0
}

/**
 * Check if value is NaN
 * @param a - Value to check
 * @returns 1 if NaN, 0 otherwise
 */
export function isNaN(a: f64): i32 {
  return a !== a ? 1 : 0 // NaN is the only value not equal to itself
}

/**
 * Check if value is finite
 * @param a - Value to check
 * @returns 1 if finite, 0 otherwise
 */
export function isFinite(a: f64): i32 {
  return a === a && a !== f64.POSITIVE_INFINITY && a !== f64.NEGATIVE_INFINITY
    ? 1
    : 0
}

/**
 * Check if value is an integer
 * @param a - Value to check
 * @returns 1 if integer, 0 otherwise
 */
export function isInteger(a: f64): i32 {
  return Math.floor(a) === a ? 1 : 0
}

/**
 * Return sign of value: -1, 0, or 1
 * @param a - Value to check
 * @returns Sign of value
 */
export function sign(a: f64): i32 {
  if (a > 0) return 1
  if (a < 0) return -1
  return 0
}

/**
 * Element-wise sign for arrays
 * @param aPtr - Pointer to input array (f64)
 * @param n - Array length
 * @param resultPtr - Pointer to output array (i32, -1, 0, or 1)
 */
export function signArray(aPtr: usize, n: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    const f64Offset: usize = <usize>i << 3
    const i32Offset: usize = <usize>i << 2
    const val: f64 = load<f64>(aPtr + f64Offset)
    if (val > 0) {
      store<i32>(resultPtr + i32Offset, 1)
    } else if (val < 0) {
      store<i32>(resultPtr + i32Offset, -1)
    } else {
      store<i32>(resultPtr + i32Offset, 0)
    }
  }
}
