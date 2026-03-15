/**
 * WASM-optimized basic arithmetic operations
 *
 * These functions operate on plain numbers only and are compiled to WebAssembly
 * for maximum performance. They are called from the JavaScript/TypeScript layer
 * when operating on large arrays or when WASM acceleration is enabled.
 *
 * All array functions use raw memory pointers (usize) for proper WASM/JS interop.
 *
 * Performance: 2-5x faster than JavaScript for simple operations
 */

// Re-export canonical scalar operations from plain/operations
export {
  abs, add, subtract, multiply, divide,
  unaryMinus, unaryPlus, cbrt, cube, square, sign
} from '../plain/operations'

/**
 * Round towards zero (fix)
 * @param x The number to round
 * @returns x rounded towards zero
 */
export function fix(x: f64): f64 {
  return x > 0 ? Math.floor(x) : Math.ceil(x)
}

/**
 * Round towards zero with decimals
 * @param x The number to round
 * @param n Number of decimal places
 * @returns x rounded towards zero to n decimal places
 */
export function fixDecimals(x: f64, n: i32): f64 {
  const shift = Math.pow(10, n)
  return fix(x * shift) / shift
}

/**
 * Ceiling function
 * @param x The number
 * @returns Smallest integer >= x
 */
export function ceil(x: f64): f64 {
  return Math.ceil(x)
}

/**
 * Ceiling with decimals
 * @param x The number
 * @param n Number of decimal places
 * @returns x rounded up to n decimal places
 */
export function ceilDecimals(x: f64, n: i32): f64 {
  const shift = Math.pow(10, n)
  return Math.ceil(x * shift) / shift
}

/**
 * Floor function
 * @param x The number
 * @returns Largest integer <= x
 */
export function floor(x: f64): f64 {
  return Math.floor(x)
}

/**
 * Floor with decimals
 * @param x The number
 * @param n Number of decimal places
 * @returns x rounded down to n decimal places
 */
export function floorDecimals(x: f64, n: i32): f64 {
  const shift = Math.pow(10, n)
  return Math.floor(x * shift) / shift
}

/**
 * Round to nearest integer
 * @param x The number
 * @returns x rounded to nearest integer
 */
export function round(x: f64): f64 {
  return Math.round(x)
}

/**
 * Round with decimals
 * @param x The number
 * @param n Number of decimal places
 * @returns x rounded to n decimal places
 */
export function roundDecimals(x: f64, n: i32): f64 {
  const shift = Math.pow(10, n)
  return Math.round(x * shift) / shift
}

/**
 * Integer addition
 */
export function addInt(x: i32, y: i32): i32 {
  return x + y
}

/**
 * Integer subtraction
 */
export function subtractInt(x: i32, y: i32): i32 {
  return x - y
}

/**
 * Integer multiplication
 */
export function multiplyInt(x: i32, y: i32): i32 {
  return x * y
}

/**
 * Integer division
 */
export function divideInt(x: i32, y: i32): i32 {
  return x / y
}

/**
 * Vectorized unary minus operation
 * @param inputPtr Pointer to input array (f64)
 * @param outputPtr Pointer to output array (f64, must be same length as input)
 * @param length Length of arrays
 */
export function unaryMinusArray(
  inputPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(outputPtr + offset, -load<f64>(inputPtr + offset))
  }
}

/**
 * Vectorized square operation
 * @param inputPtr Pointer to input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function squareArray(
  inputPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    const x: f64 = load<f64>(inputPtr + offset)
    store<f64>(outputPtr + offset, x * x)
  }
}

/**
 * Vectorized cube operation
 * @param inputPtr Pointer to input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function cubeArray(
  inputPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    const x: f64 = load<f64>(inputPtr + offset)
    store<f64>(outputPtr + offset, x * x * x)
  }
}

/**
 * Vectorized absolute value operation
 * @param inputPtr Pointer to input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function absArray(inputPtr: usize, outputPtr: usize, length: i32): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(outputPtr + offset, Math.abs(load<f64>(inputPtr + offset)))
  }
}

/**
 * Vectorized sign operation
 * @param inputPtr Pointer to input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function signArray(
  inputPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    const x: f64 = load<f64>(inputPtr + offset)
    store<f64>(outputPtr + offset, x > 0 ? 1.0 : x < 0 ? -1.0 : 0.0)
  }
}

/**
 * Vectorized addition
 * @param aPtr Pointer to first input array (f64)
 * @param bPtr Pointer to second input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function addArray(
  aPtr: usize,
  bPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      outputPtr + offset,
      load<f64>(aPtr + offset) + load<f64>(bPtr + offset)
    )
  }
}

/**
 * Vectorized subtraction
 * @param aPtr Pointer to first input array (f64)
 * @param bPtr Pointer to second input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function subtractArray(
  aPtr: usize,
  bPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      outputPtr + offset,
      load<f64>(aPtr + offset) - load<f64>(bPtr + offset)
    )
  }
}

/**
 * Vectorized multiplication
 * @param aPtr Pointer to first input array (f64)
 * @param bPtr Pointer to second input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function multiplyArray(
  aPtr: usize,
  bPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      outputPtr + offset,
      load<f64>(aPtr + offset) * load<f64>(bPtr + offset)
    )
  }
}

/**
 * Vectorized division
 * @param aPtr Pointer to first input array (f64)
 * @param bPtr Pointer to second input array (f64)
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function divideArray(
  aPtr: usize,
  bPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      outputPtr + offset,
      load<f64>(aPtr + offset) / load<f64>(bPtr + offset)
    )
  }
}

/**
 * Scalar addition to array
 * @param inputPtr Pointer to input array (f64)
 * @param scalar Scalar value to add
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function addScalarArray(
  inputPtr: usize,
  scalar: f64,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(outputPtr + offset, load<f64>(inputPtr + offset) + scalar)
  }
}

/**
 * Scalar multiplication to array
 * @param inputPtr Pointer to input array (f64)
 * @param scalar Scalar value to multiply
 * @param outputPtr Pointer to output array (f64)
 * @param length Length of arrays
 */
export function multiplyScalarArray(
  inputPtr: usize,
  scalar: f64,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(outputPtr + offset, load<f64>(inputPtr + offset) * scalar)
  }
}
