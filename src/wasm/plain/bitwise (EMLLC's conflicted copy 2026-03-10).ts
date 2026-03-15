/**
 * Plain Number Bitwise Operations - AssemblyScript
 *
 * Bitwise operations for WebAssembly compilation.
 * Converted from src/plain/number/bitwise.js
 *
 * Sprint: Phase 6 - Sprint 1 - Plain Number Implementations
 * Task: 6.1.3
 *
 * Note: Uses i32 (32-bit integers) for bitwise operations
 */

/**
 * Helper: Check if a number is an integer
 */
function isIntegerNumber(x: f64): bool {
  return x === Math.floor(x) && isFinite(x)
}

/**
 * Bitwise AND operation
 * @param x - First integer
 * @param y - Second integer
 * @returns x & y (or NaN if inputs are not integers)
 */
export function bitAndNumber(x: f64, y: f64): f64 {
  if (!isIntegerNumber(x) || !isIntegerNumber(y)) {
    return f64.NaN
  }

  return f64(i32(x) & i32(y))
}

/**
 * Bitwise NOT operation
 * @param x - Integer
 * @returns ~x (or NaN if input is not an integer)
 */
export function bitNotNumber(x: f64): f64 {
  if (!isIntegerNumber(x)) {
    return f64.NaN
  }

  return f64(~i32(x))
}

/**
 * Bitwise OR operation
 * @param x - First integer
 * @param y - Second integer
 * @returns x | y (or NaN if inputs are not integers)
 */
export function bitOrNumber(x: f64, y: f64): f64 {
  if (!isIntegerNumber(x) || !isIntegerNumber(y)) {
    return f64.NaN
  }

  return f64(i32(x) | i32(y))
}

/**
 * Bitwise XOR operation
 * @param x - First integer
 * @param y - Second integer
 * @returns x ^ y (or NaN if inputs are not integers)
 */
export function bitXorNumber(x: f64, y: f64): f64 {
  if (!isIntegerNumber(x) || !isIntegerNumber(y)) {
    return f64.NaN
  }

  return f64(i32(x) ^ i32(y))
}

/**
 * Left shift operation
 * @param x - Value to shift
 * @param y - Number of bits to shift
 * @returns x << y (or NaN if inputs are not integers)
 */
export function leftShiftNumber(x: f64, y: f64): f64 {
  if (!isIntegerNumber(x) || !isIntegerNumber(y)) {
    return f64.NaN
  }

  return f64(i32(x) << i32(y))
}

/**
 * Right arithmetic shift operation (sign-extending)
 * @param x - Value to shift
 * @param y - Number of bits to shift
 * @returns x >> y (or NaN if inputs are not integers)
 */
export function rightArithShiftNumber(x: f64, y: f64): f64 {
  if (!isIntegerNumber(x) || !isIntegerNumber(y)) {
    return f64.NaN
  }

  return f64(i32(x) >> i32(y))
}

/**
 * Right logical shift operation (zero-fill)
 * @param x - Value to shift
 * @param y - Number of bits to shift
 * @returns x >>> y (or NaN if inputs are not integers)
 */
export function rightLogShiftNumber(x: f64, y: f64): f64 {
  if (!isIntegerNumber(x) || !isIntegerNumber(y)) {
    return f64.NaN
  }

  return f64(i32(x) >>> i32(y))
}
