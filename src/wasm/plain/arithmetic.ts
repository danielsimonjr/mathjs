/**
 * Plain Number Arithmetic Operations - AssemblyScript
 *
 * High-performance numeric operations for WebAssembly compilation.
 * Converted from src/plain/number/arithmetic.js
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 *
 * Sprint: Phase 6 - Sprint 1 - Plain Number Implementations
 * Task: 6.1.1
 */

// ============================================================================
// Basic Arithmetic Operations
// ============================================================================

export function absNumber(a: f64): f64 {
  return Math.abs(a)
}

export function addNumber(a: f64, b: f64): f64 {
  return a + b
}

export function subtractNumber(a: f64, b: f64): f64 {
  return a - b
}

export function multiplyNumber(a: f64, b: f64): f64 {
  return a * b
}

export function divideNumber(a: f64, b: f64): f64 {
  return a / b
}

export function unaryMinusNumber(x: f64): f64 {
  return -x
}

export function unaryPlusNumber(x: f64): f64 {
  return x
}

// ============================================================================
// Power and Root Operations
// ============================================================================

export function cbrtNumber(x: f64): f64 {
  return Math.cbrt(x)
}

export function cubeNumber(x: f64): f64 {
  return x * x * x
}

export function sqrtNumber(x: f64): f64 {
  return Math.sqrt(x)
}

export function squareNumber(x: f64): f64 {
  return x * x
}

/**
 * Calculate the nth root of a, solve x^root == a
 * http://rosettacode.org/wiki/Nth_root#JavaScript
 * @param a - The value to take the root of
 * @param root - The root to calculate (default 2)
 * @returns The nth root of a
 */
export function nthRootNumber(a: f64, root: f64 = 2): f64 {
  const inv = root < 0
  if (inv) {
    root = -root
  }

  if (root === 0) {
    // In AssemblyScript, we return NaN for error cases
    return f64.NaN
  }

  if (a < 0 && Math.abs(root) % 2 !== 1) {
    // Root must be odd when a is negative
    return f64.NaN
  }

  // Edge cases zero and infinity
  if (a === 0) {
    return inv ? f64.POSITIVE_INFINITY : 0
  }
  if (!isFinite(a)) {
    return inv ? 0 : a
  }

  let x = Math.pow(Math.abs(a), 1 / root)
  // If a < 0, we require that root is an odd integer,
  // so (-1) ^ (1/root) = -1
  x = a < 0 ? -x : x
  return inv ? 1 / x : x
}

// ============================================================================
// Exponential and Logarithmic Functions
// ============================================================================

export function expNumber(x: f64): f64 {
  return Math.exp(x)
}

export function expm1Number(x: f64): f64 {
  return Math.expm1(x)
}

/**
 * Calculate the logarithm of a value, optionally to a given base.
 * @param x - The value
 * @param base - Optional base (uses natural log if not provided)
 * @returns The logarithm
 */
export function logNumber(x: f64, base: f64 = 0): f64 {
  if (base !== 0) {
    return Math.log(x) / Math.log(base)
  }
  return Math.log(x)
}

export function log10Number(x: f64): f64 {
  return Math.log10(x)
}

export function log2Number(x: f64): f64 {
  return Math.log2(x)
}

export function log1pNumber(x: f64): f64 {
  return Math.log1p(x)
}

// ============================================================================
// Power Function
// ============================================================================

/**
 * Calculates the power of x to y, x^y, for two numbers.
 * @param x - Base
 * @param y - Exponent
 * @returns x^y
 */
export function powNumber(x: f64, y: f64): f64 {
  // x^Infinity === 0 if -1 < x < 1
  // A real number 0 is returned instead of complex(0)
  if (
    (x * x < 1 && y === f64.POSITIVE_INFINITY) ||
    (x * x > 1 && y === f64.NEGATIVE_INFINITY)
  ) {
    return 0
  }

  return Math.pow(x, y)
}

// ============================================================================
// Integer Operations (GCD, LCM, XGCD)
// ============================================================================

/**
 * Helper: Check if a number is an integer
 */
function isIntegerNumber(x: f64): bool {
  return x === Math.floor(x) && isFinite(x)
}

/**
 * Calculate gcd for numbers
 * @param a - First number (must be integer)
 * @param b - Second number (must be integer)
 * @returns The greatest common denominator of a and b (or NaN on error)
 */
export function gcdNumber(a: f64, b: f64): f64 {
  if (!isIntegerNumber(a) || !isIntegerNumber(b)) {
    // Return NaN for non-integer inputs in AssemblyScript
    return f64.NaN
  }

  // https://en.wikipedia.org/wiki/Euclidean_algorithm
  let r: f64
  while (b !== 0) {
    r = a % b
    a = b
    b = r
  }
  return a < 0 ? -a : a
}

/**
 * Calculate lcm for two numbers
 * @param a - First number (must be integer)
 * @param b - Second number (must be integer)
 * @returns The least common multiple of a and b (or NaN on error)
 */
export function lcmNumber(a: f64, b: f64): f64 {
  if (!isIntegerNumber(a) || !isIntegerNumber(b)) {
    // Return NaN for non-integer inputs
    return f64.NaN
  }

  if (a === 0 || b === 0) {
    return 0
  }

  // https://en.wikipedia.org/wiki/Euclidean_algorithm
  // evaluate lcm here inline to reduce overhead
  let t: f64
  const prod = a * b
  while (b !== 0) {
    t = b
    b = a % t
    a = t
  }
  return Math.abs(prod / a)
}

/**
 * Calculate xgcd for two numbers (Extended Euclidean Algorithm)
 * @param a - First number (must be integer)
 * @param b - Second number (must be integer)
 * @param resultPtr - Pointer to output array (3 f64s): [gcd, x, y] where gcd = a*x + b*y
 * @returns 1 if successful, 0 if inputs are not integers
 */
export function xgcdNumber(a: f64, b: f64, resultPtr: usize): i32 {
  if (!isIntegerNumber(a) || !isIntegerNumber(b)) {
    // Store NaN for error case
    store<f64>(resultPtr, f64.NaN)
    store<f64>(resultPtr + 8, f64.NaN)
    store<f64>(resultPtr + 16, f64.NaN)
    return 0
  }

  // source: https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
  let t: f64 // used to swap two variables
  let q: f64 // quotient
  let r: f64 // remainder
  let x: f64 = 0
  let lastx: f64 = 1
  let y: f64 = 1
  let lasty: f64 = 0

  while (b !== 0) {
    q = Math.floor(a / b)
    r = a - q * b

    t = x
    x = lastx - q * x
    lastx = t

    t = y
    y = lasty - q * y
    lasty = t

    a = b
    b = r
  }

  if (a < 0) {
    store<f64>(resultPtr, -a)
    store<f64>(resultPtr + 8, -lastx)
    store<f64>(resultPtr + 16, -lasty)
  } else {
    store<f64>(resultPtr, a)
    store<f64>(resultPtr + 8, a !== 0 ? lastx : 0)
    store<f64>(resultPtr + 16, lasty)
  }
  return 1
}

// ============================================================================
// Modulo and Other Operations
// ============================================================================

/**
 * Calculate the modulus of two numbers
 * @param x - Dividend
 * @param y - Divisor
 * @returns Modulus result
 */
export function modNumber(x: f64, y: f64): f64 {
  // We don't use AssemblyScript's % operator here as this doesn't work
  // correctly for x < 0 and x === 0
  // see https://en.wikipedia.org/wiki/Modulo_operation
  return y === 0 ? x : x - y * Math.floor(x / y)
}

export function signNumber(x: f64): f64 {
  return Math.sign(x)
}

/**
 * Round a number to the given number of decimals
 * @param value - Value to round
 * @param decimals - Number of decimals (0-15, default 0)
 * @returns Rounded value
 */
export function roundNumber(value: f64, decimals: i32 = 0): f64 {
  if (decimals < 0 || decimals > 15 || !isFinite(f64(decimals))) {
    return f64.NaN
  }

  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Calculate the norm of a number (absolute value)
 * @param x - The number
 * @returns The absolute value
 */
export function normNumber(x: f64): f64 {
  return Math.abs(x)
}
