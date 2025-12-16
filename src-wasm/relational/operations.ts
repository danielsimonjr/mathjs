/**
 * WASM-optimized relational operations using AssemblyScript
 * Returns i32 for boolean results (0 = false, 1 = true)
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
 * @param a - First array
 * @param b - Second array
 * @returns Array of comparison results (-1, 0, or 1)
 */
export function compareArray(a: Float64Array, b: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    if (a[i] < b[i]) {
      result[i] = -1
    } else if (a[i] > b[i]) {
      result[i] = 1
    } else {
      result[i] = 0
    }
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Array of equality results (0 or 1)
 */
export function equalArray(a: Float64Array, b: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] === b[i] ? 1 : 0
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Array of inequality results (0 or 1)
 */
export function unequalArray(a: Float64Array, b: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] !== b[i] ? 1 : 0
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Array of results (0 or 1)
 */
export function largerArray(a: Float64Array, b: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] > b[i] ? 1 : 0
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Array of results (0 or 1)
 */
export function largerEqArray(a: Float64Array, b: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] >= b[i] ? 1 : 0
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Array of results (0 or 1)
 */
export function smallerArray(a: Float64Array, b: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] < b[i] ? 1 : 0
  }

  return result
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
 * @param a - First array
 * @param b - Second array
 * @returns Array of results (0 or 1)
 */
export function smallerEqArray(a: Float64Array, b: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] <= b[i] ? 1 : 0
  }

  return result
}

/**
 * Find minimum value in array
 * @param a - Input array
 * @returns Minimum value
 */
export function min(a: Float64Array): f64 {
  const n: i32 = a.length
  if (n === 0) return f64.NaN

  let minVal: f64 = a[0]
  for (let i: i32 = 1; i < n; i++) {
    if (a[i] < minVal) minVal = a[i]
  }

  return minVal
}

/**
 * Find maximum value in array
 * @param a - Input array
 * @returns Maximum value
 */
export function max(a: Float64Array): f64 {
  const n: i32 = a.length
  if (n === 0) return f64.NaN

  let maxVal: f64 = a[0]
  for (let i: i32 = 1; i < n; i++) {
    if (a[i] > maxVal) maxVal = a[i]
  }

  return maxVal
}

/**
 * Find index of minimum value in array
 * @param a - Input array
 * @returns Index of minimum value
 */
export function argmin(a: Float64Array): i32 {
  const n: i32 = a.length
  if (n === 0) return -1

  let minIdx: i32 = 0
  let minVal: f64 = a[0]

  for (let i: i32 = 1; i < n; i++) {
    if (a[i] < minVal) {
      minVal = a[i]
      minIdx = i
    }
  }

  return minIdx
}

/**
 * Find index of maximum value in array
 * @param a - Input array
 * @returns Index of maximum value
 */
export function argmax(a: Float64Array): i32 {
  const n: i32 = a.length
  if (n === 0) return -1

  let maxIdx: i32 = 0
  let maxVal: f64 = a[0]

  for (let i: i32 = 1; i < n; i++) {
    if (a[i] > maxVal) {
      maxVal = a[i]
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
 * @param a - Input array
 * @param minVal - Minimum allowed value
 * @param maxVal - Maximum allowed value
 * @returns Clamped array
 */
export function clampArray(
  a: Float64Array,
  minVal: f64,
  maxVal: f64
): Float64Array {
  const n: i32 = a.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let v: f64 = a[i]
    if (v < minVal) v = minVal
    if (v > maxVal) v = maxVal
    result[i] = v
  }

  return result
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
 * @param a - Input array
 * @param minVal - Minimum of range
 * @param maxVal - Maximum of range
 * @returns Array of results (0 or 1)
 */
export function inRangeArray(
  a: Float64Array,
  minVal: f64,
  maxVal: f64
): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = a[i] >= minVal && a[i] <= maxVal ? 1 : 0
  }

  return result
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
 * @param a - Input array
 * @returns Array of signs (-1, 0, or 1)
 */
export function signArray(a: Float64Array): Int32Array {
  const n: i32 = a.length
  const result = new Int32Array(n)

  for (let i: i32 = 0; i < n; i++) {
    if (a[i] > 0) {
      result[i] = 1
    } else if (a[i] < 0) {
      result[i] = -1
    } else {
      result[i] = 0
    }
  }

  return result
}
