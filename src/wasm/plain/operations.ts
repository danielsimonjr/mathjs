/**
 * AssemblyScript WASM module for plain number operations
 * This module contains high-performance implementations of mathematical operations
 * optimized for WebAssembly compilation.
 *
 * ALL FUNCTIONS USE WASM-NATIVE TYPES (f64, i32, i64) FOR MAXIMUM PERFORMANCE
 */

// ============================================================================
// ARITHMETIC OPERATIONS
// ============================================================================

export function abs(a: f64): f64 {
  return Math.abs(a)
}

export function add(a: f64, b: f64): f64 {
  return a + b
}

export function subtract(a: f64, b: f64): f64 {
  return a - b
}

export function multiply(a: f64, b: f64): f64 {
  return a * b
}

export function divide(a: f64, b: f64): f64 {
  return a / b
}

export function unaryMinus(x: f64): f64 {
  return -x
}

export function unaryPlus(x: f64): f64 {
  return x
}

export function cbrt(x: f64): f64 {
  if (x === 0) return x

  const negate = x < 0
  let result: f64
  if (negate) {
    x = -x
  }

  if (isFinite(x)) {
    result = Math.exp(Math.log(x) / 3)
    // from https://en.wikipedia.org/wiki/Cube_root#Numerical_methods
    result = (x / (result * result) + 2 * result) / 3
  } else {
    result = x
  }

  return negate ? -result : result
}

export function cube(x: f64): f64 {
  return x * x * x
}

export function exp(x: f64): f64 {
  return Math.exp(x)
}

export function expm1(x: f64): f64 {
  return x >= 2e-4 || x <= -2e-4
    ? Math.exp(x) - 1
    : x + (x * x) / 2 + (x * x * x) / 6
}

/**
 * Check if a number is an integer
 */
function isInteger(value: f64): bool {
  return isFinite(value) && value === Math.floor(value)
}

/**
 * Calculate GCD (Greatest Common Divisor) using Euclidean algorithm
 */
export function gcd(a: f64, b: f64): f64 {
  if (!isInteger(a) || !isInteger(b)) {
    return f64.NaN // Return NaN for non-integer inputs (WASM compatible)
  }

  let r: f64
  while (b !== 0) {
    r = a % b
    a = b
    b = r
  }
  return a < 0 ? -a : a
}

/**
 * Calculate LCM (Least Common Multiple)
 */
export function lcm(a: f64, b: f64): f64 {
  if (!isInteger(a) || !isInteger(b)) {
    return f64.NaN // Return NaN for non-integer inputs (WASM compatible)
  }

  if (a === 0 || b === 0) {
    return 0
  }

  let t: f64
  const prod = a * b
  while (b !== 0) {
    t = b
    b = a % t
    a = t
  }
  return Math.abs(prod / a)
}

export function log(x: f64): f64 {
  return Math.log(x)
}

export function log2(x: f64): f64 {
  return Math.log(x) / Math.LN2
}

export function log10(x: f64): f64 {
  return Math.log(x) / Math.LN10
}

export function log1p(x: f64): f64 {
  return Math.log(x + 1)
}

/**
 * Modulus operation (proper mathematical modulo, not remainder)
 */
export function mod(x: f64, y: f64): f64 {
  return y === 0 ? x : x - y * Math.floor(x / y)
}

/**
 * Calculate nth root
 */
export function nthRoot(a: f64, root: f64): f64 {
  const inv = root < 0
  if (inv) {
    root = -root
  }

  if (root === 0) {
    return f64.NaN // Return NaN for zero root (WASM compatible)
  }
  if (a < 0 && Math.abs(root) % 2 !== 1) {
    return f64.NaN // Return NaN for even root of negative (WASM compatible)
  }

  // edge cases zero and infinity
  if (a === 0) {
    return inv ? Infinity : 0
  }
  if (!isFinite(a)) {
    return inv ? 0 : a
  }

  let x = Math.pow(Math.abs(a), 1 / root)
  x = a < 0 ? -x : x
  return inv ? 1 / x : x
}

export function sign(x: f64): f64 {
  if (x > 0) return 1
  if (x < 0) return -1
  return 0
}

export function sqrt(x: f64): f64 {
  return Math.sqrt(x)
}

export function square(x: f64): f64 {
  return x * x
}

export function pow(x: f64, y: f64): f64 {
  // x^Infinity === 0 if -1 < x < 1
  if ((x * x < 1 && y === Infinity) || (x * x > 1 && y === -Infinity)) {
    return 0
  }

  return Math.pow(x, y)
}

export function norm(x: f64): f64 {
  return Math.abs(x)
}

// ============================================================================
// BITWISE OPERATIONS (using i32 for bitwise ops)
// ============================================================================

export function bitAnd(x: i32, y: i32): i32 {
  return x & y
}

export function bitNot(x: i32): i32 {
  return ~x
}

export function bitOr(x: i32, y: i32): i32 {
  return x | y
}

export function bitXor(x: i32, y: i32): i32 {
  return x ^ y
}

export function leftShift(x: i32, y: i32): i32 {
  return x << y
}

export function rightArithShift(x: i32, y: i32): i32 {
  return x >> y
}

export function rightLogShift(x: i32, y: i32): i32 {
  return x >>> y
}

// ============================================================================
// COMBINATIONS
// ============================================================================

/**
 * Simple product function for combinations
 */
function product(start: f64, end: f64): f64 {
  let result: f64 = 1
  for (let i = start; i <= end; i++) {
    result *= i
  }
  return result
}

/**
 * Calculate combinations (binomial coefficient)
 */
export function combinations(n: f64, k: f64): f64 {
  if (!isInteger(n) || n < 0) {
    return f64.NaN // Return NaN for non-positive-integer n (WASM compatible)
  }
  if (!isInteger(k) || k < 0) {
    return f64.NaN // Return NaN for non-positive-integer k (WASM compatible)
  }
  if (k > n) {
    return f64.NaN // Return NaN when k > n (WASM compatible)
  }

  const nMinusk = n - k

  let answer: f64 = 1
  const firstnumerator = k < nMinusk ? nMinusk + 1 : k + 1
  let nextdivisor: f64 = 2
  const lastdivisor = k < nMinusk ? k : nMinusk

  for (
    let nextnumerator = firstnumerator;
    nextnumerator <= n;
    ++nextnumerator
  ) {
    answer *= nextnumerator
    while (nextdivisor <= lastdivisor && answer % nextdivisor === 0) {
      answer /= nextdivisor
      ++nextdivisor
    }
  }

  if (nextdivisor <= lastdivisor) {
    answer /= product(nextdivisor, lastdivisor)
  }
  return answer
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PI: f64 = Math.PI
export const TAU: f64 = 2 * Math.PI
export const E: f64 = Math.E
export const PHI: f64 = 1.6180339887498948

// ============================================================================
// LOGICAL OPERATIONS
// ============================================================================

export function not(x: f64): bool {
  return !x
}

export function or(x: f64, y: f64): bool {
  return !!(x || y)
}

export function xor(x: f64, y: f64): bool {
  return !!x !== !!y
}

export function and(x: f64, y: f64): bool {
  return !!(x && y)
}

// ============================================================================
// RELATIONAL OPERATIONS
// ============================================================================

export function equal(x: f64, y: f64): bool {
  return x === y
}

export function unequal(x: f64, y: f64): bool {
  return x !== y
}

export function smaller(x: f64, y: f64): bool {
  return x < y
}

export function smallerEq(x: f64, y: f64): bool {
  return x <= y
}

export function larger(x: f64, y: f64): bool {
  return x > y
}

export function largerEq(x: f64, y: f64): bool {
  return x >= y
}

export function compare(x: f64, y: f64): i32 {
  if (x === y) return 0
  if (x < y) return -1
  return 1
}

// ============================================================================
// PROBABILITY FUNCTIONS
// ============================================================================

// Gamma function constants
const GAMMA_G: f64 = 4.7421875
const GAMMA_P_LENGTH: i32 = 15

/**
 * Inline lookup function for GAMMA_P coefficients (WASM compatible - no arrays)
 */
function getGammaP(index: i32): f64 {
  if (index === 0) return 0.99999999999999709182
  if (index === 1) return 57.156235665862923517
  if (index === 2) return -59.597960355475491248
  if (index === 3) return 14.136097974741747174
  if (index === 4) return -0.49191381609762019978
  if (index === 5) return 0.33994649984811888699e-4
  if (index === 6) return 0.46523628927048575665e-4
  if (index === 7) return -0.98374475304879564677e-4
  if (index === 8) return 0.15808870322491248884e-3
  if (index === 9) return -0.21026444172410488319e-3
  if (index === 10) return 0.2174396181152126432e-3
  if (index === 11) return -0.16431810653676389022e-3
  if (index === 12) return 0.84418223983852743293e-4
  if (index === 13) return -0.2619083840158140867e-4
  if (index === 14) return 0.36899182659531622704e-5
  return 0.0
}

/**
 * Gamma function
 */
export function gamma(n: f64): f64 {
  let x: f64

  if (isInteger(n)) {
    if (n <= 0) {
      return isFinite(n) ? Infinity : NaN
    }

    if (n > 171) {
      return Infinity
    }

    return product(1, n - 1)
  }

  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n))
  }

  if (n >= 171.35) {
    return Infinity
  }

  if (n > 85.0) {
    const twoN = n * n
    const threeN = twoN * n
    const fourN = threeN * n
    const fiveN = fourN * n
    return (
      Math.sqrt((2 * Math.PI) / n) *
      Math.pow(n / Math.E, n) *
      (1 +
        1 / (12 * n) +
        1 / (288 * twoN) -
        139 / (51840 * threeN) -
        571 / (2488320 * fourN) +
        163879 / (209018880 * fiveN) +
        5246819 / (75246796800 * fiveN * n))
    )
  }

  --n
  x = getGammaP(0)
  for (let i: i32 = 1; i < GAMMA_P_LENGTH; ++i) {
    x += getGammaP(i) / (n + <f64>i)
  }

  const t = n + GAMMA_G + 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x
}

// lgamma constants
const LN_SQRT_2PI: f64 = 0.91893853320467274178
const LGAMMA_G: f64 = 5
const LGAMMA_N: i32 = 7

/**
 * Inline lookup function for LGAMMA_SERIES coefficients (WASM compatible - no arrays)
 */
function getLgammaSeries(index: i32): f64 {
  if (index === 0) return 1.000000000190015
  if (index === 1) return 76.18009172947146
  if (index === 2) return -86.50532032941677
  if (index === 3) return 24.01409824083091
  if (index === 4) return -1.231739572450155
  if (index === 5) return 0.1208650973866179e-2
  if (index === 6) return -0.5395239384953e-5
  return 0.0
}

/**
 * Natural logarithm of gamma function
 */
export function lgamma(n: f64): f64 {
  if (n < 0) return NaN
  if (n === 0) return Infinity
  if (!isFinite(n)) return n

  if (n < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * n)) - lgamma(1 - n)
  }

  n = n - 1
  const base = n + LGAMMA_G + 0.5
  let sum = getLgammaSeries(0)

  for (let i: i32 = LGAMMA_N - 1; i >= 1; i--) {
    sum += getLgammaSeries(i) / (n + <f64>i)
  }

  return LN_SQRT_2PI + (n + 0.5) * Math.log(base) - base + Math.log(sum)
}

// ============================================================================
// TRIGONOMETRIC FUNCTIONS
// ============================================================================

export function acos(x: f64): f64 {
  return Math.acos(x)
}

export function acosh(x: f64): f64 {
  return Math.log(Math.sqrt(x * x - 1) + x)
}

export function acot(x: f64): f64 {
  return Math.atan(1 / x)
}

export function acoth(x: f64): f64 {
  return isFinite(x) ? (Math.log((x + 1) / x) + Math.log(x / (x - 1))) / 2 : 0
}

export function acsc(x: f64): f64 {
  return Math.asin(1 / x)
}

export function acsch(x: f64): f64 {
  const xInv = 1 / x
  return Math.log(xInv + Math.sqrt(xInv * xInv + 1))
}

export function asec(x: f64): f64 {
  return Math.acos(1 / x)
}

export function asech(x: f64): f64 {
  const xInv = 1 / x
  const ret = Math.sqrt(xInv * xInv - 1)
  return Math.log(ret + xInv)
}

export function asin(x: f64): f64 {
  return Math.asin(x)
}

export function asinh(x: f64): f64 {
  return Math.log(Math.sqrt(x * x + 1) + x)
}

export function atan(x: f64): f64 {
  return Math.atan(x)
}

export function atan2(y: f64, x: f64): f64 {
  return Math.atan2(y, x)
}

export function atanh(x: f64): f64 {
  return Math.log((1 + x) / (1 - x)) / 2
}

export function cos(x: f64): f64 {
  return Math.cos(x)
}

export function cosh(x: f64): f64 {
  return (Math.exp(x) + Math.exp(-x)) / 2
}

export function cot(x: f64): f64 {
  return 1 / Math.tan(x)
}

export function coth(x: f64): f64 {
  const e = Math.exp(2 * x)
  return (e + 1) / (e - 1)
}

export function csc(x: f64): f64 {
  return 1 / Math.sin(x)
}

export function csch(x: f64): f64 {
  if (x === 0) {
    return Infinity
  } else {
    return Math.abs(2 / (Math.exp(x) - Math.exp(-x))) * sign(x)
  }
}

export function sec(x: f64): f64 {
  return 1 / Math.cos(x)
}

export function sech(x: f64): f64 {
  return 2 / (Math.exp(x) + Math.exp(-x))
}

export function sin(x: f64): f64 {
  return Math.sin(x)
}

export function sinh(x: f64): f64 {
  return (Math.exp(x) - Math.exp(-x)) / 2
}

export function tan(x: f64): f64 {
  return Math.tan(x)
}

export function tanh(x: f64): f64 {
  const e = Math.exp(2 * x)
  return (e - 1) / (e + 1)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isIntegerValue(x: f64): bool {
  return isInteger(x)
}

export function isNegative(x: f64): bool {
  return x < 0
}

export function isPositive(x: f64): bool {
  return x > 0
}

export function isZero(x: f64): bool {
  return x === 0
}

export function isNaN(x: f64): bool {
  return x !== x
}
