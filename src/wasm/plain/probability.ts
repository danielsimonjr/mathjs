/**
 * Plain Number Probability Functions - AssemblyScript
 *
 * Probability and statistical functions for WebAssembly compilation.
 * Converted from src/plain/number/probability.js
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 *
 * Sprint: Phase 6 - Sprint 1 - Plain Number Implementations
 * Task: 6.1.5
 */

/**
 * Helper: Check if a number is an integer
 */
function isIntegerNumber(x: f64): bool {
  return x === Math.floor(x) && isFinite(x)
}

/**
 * Helper: Calculate product of integers from start to end (inclusive)
 */
function product(start: f64, end: f64): f64 {
  let result: f64 = 1
  for (let i = start; i <= end; i++) {
    result *= i
  }
  return result
}

// ============================================================================
// Gamma Function Constants
// ============================================================================

export const gammaG: f64 = 4.7421875

// Coefficients for gamma function approximation
// Using inline function to access coefficients instead of StaticArray
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
 * Computes the gamma function Γ(n)
 * @param n - Input value
 * @returns Gamma function value
 */
export function gammaNumber(n: f64): f64 {
  let x: f64

  if (isIntegerNumber(n)) {
    if (n <= 0) {
      return isFinite(n) ? f64.POSITIVE_INFINITY : f64.NaN
    }

    if (n > 171) {
      return f64.POSITIVE_INFINITY // Will overflow
    }

    return product(1, n - 1)
  }

  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gammaNumber(1 - n))
  }

  if (n >= 171.35) {
    return f64.POSITIVE_INFINITY // Will overflow
  }

  if (n > 85.0) {
    // Extended Stirling Approximation
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

  n = n - 1
  x = getGammaP(0)
  for (let i: i32 = 1; i < 15; i++) {
    x += getGammaP(i) / (n + f64(i))
  }

  const t = n + gammaG + 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x
}

// ============================================================================
// Log-Gamma Function Constants
// ============================================================================

// log(2 * pi) / 2
export const lnSqrt2PI: f64 = 0.91893853320467274178

export const lgammaG: f64 = 5 // Lanczos parameter "g"
export const lgammaN: i32 = 7 // Range of coefficients "n"

// lgamma implementation ref: https://mrob.com/pub/ries/lanczos-gamma.html#code
// Using inline function to access coefficients instead of StaticArray
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
 * Log-gamma function
 * Computes the natural logarithm of the gamma function log(Γ(n))
 * @param n - Input value
 * @returns Log-gamma function value
 */
export function lgammaNumber(n: f64): f64 {
  if (n < 0) return f64.NaN
  if (n === 0) return f64.POSITIVE_INFINITY
  if (!isFinite(n)) return n

  if (n < 0.5) {
    // Use Euler's reflection formula:
    // gamma(z) = PI / (sin(PI * z) * gamma(1 - z))
    return Math.log(Math.PI / Math.sin(Math.PI * n)) - lgammaNumber(1 - n)
  }

  // Compute the logarithm of the Gamma function using the Lanczos method
  let nAdjusted = n - 1
  const base = nAdjusted + lgammaG + 0.5 // Base of the Lanczos exponential
  let sum = getLgammaSeries(0)

  // We start with the terms that have the smallest coefficients and largest denominator
  for (let i: i32 = lgammaN - 1; i >= 1; i--) {
    sum += getLgammaSeries(i) / (nAdjusted + f64(i))
  }

  return lnSqrt2PI + (nAdjusted + 0.5) * Math.log(base) - base + Math.log(sum)
}
