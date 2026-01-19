/**
 * Plain Number Trigonometric Functions - AssemblyScript
 *
 * Trigonometric and hyperbolic functions for WebAssembly compilation.
 * Converted from src/plain/number/trigonometry.js
 *
 * Sprint: Phase 6 - Sprint 1 - Plain Number Implementations
 * Task: 6.1.4
 */

// ============================================================================
// Basic Trigonometric Functions
// ============================================================================

export function sinNumber(x: f64): f64 {
  return Math.sin(x)
}

export function cosNumber(x: f64): f64 {
  return Math.cos(x)
}

export function tanNumber(x: f64): f64 {
  return Math.tan(x)
}

export function asinNumber(x: f64): f64 {
  return Math.asin(x)
}

export function acosNumber(x: f64): f64 {
  return Math.acos(x)
}

export function atanNumber(x: f64): f64 {
  return Math.atan(x)
}

export function atan2Number(y: f64, x: f64): f64 {
  return Math.atan2(y, x)
}

// ============================================================================
// Hyperbolic Functions
// ============================================================================

export function sinhNumber(x: f64): f64 {
  return Math.sinh(x)
}

export function coshNumber(x: f64): f64 {
  return Math.cosh(x)
}

export function tanhNumber(x: f64): f64 {
  return Math.tanh(x)
}

export function asinhNumber(x: f64): f64 {
  return Math.asinh(x)
}

export function acoshNumber(x: f64): f64 {
  return Math.acosh(x)
}

export function atanhNumber(x: f64): f64 {
  return Math.atanh(x)
}

// ============================================================================
// Reciprocal Trigonometric Functions
// ============================================================================

/**
 * Cotangent: cot(x) = 1 / tan(x)
 */
export function cotNumber(x: f64): f64 {
  return 1 / Math.tan(x)
}

/**
 * Secant: sec(x) = 1 / cos(x)
 */
export function secNumber(x: f64): f64 {
  return 1 / Math.cos(x)
}

/**
 * Cosecant: csc(x) = 1 / sin(x)
 */
export function cscNumber(x: f64): f64 {
  return 1 / Math.sin(x)
}

// ============================================================================
// Inverse Reciprocal Trigonometric Functions
// ============================================================================

/**
 * Inverse cotangent: acot(x) = atan(1/x)
 */
export function acotNumber(x: f64): f64 {
  return Math.atan(1 / x)
}

/**
 * Inverse secant: asec(x) = acos(1/x)
 */
export function asecNumber(x: f64): f64 {
  return Math.acos(1 / x)
}

/**
 * Inverse cosecant: acsc(x) = asin(1/x)
 */
export function acscNumber(x: f64): f64 {
  return Math.asin(1 / x)
}

// ============================================================================
// Reciprocal Hyperbolic Functions
// ============================================================================

/**
 * Hyperbolic cotangent: coth(x) = (e^(2x) + 1) / (e^(2x) - 1)
 */
export function cothNumber(x: f64): f64 {
  const e = Math.exp(2 * x)
  return (e + 1) / (e - 1)
}

/**
 * Hyperbolic secant: sech(x) = 2 / (e^x + e^(-x))
 */
export function sechNumber(x: f64): f64 {
  return 2 / (Math.exp(x) + Math.exp(-x))
}

/**
 * Hyperbolic cosecant: csch(x) = 2 / (e^x - e^(-x))
 * Special handling for values close to zero
 */
export function cschNumber(x: f64): f64 {
  // Consider values close to zero (+/-)
  if (x === 0) {
    return f64.POSITIVE_INFINITY
  } else {
    const expX = Math.exp(x)
    const expNegX = Math.exp(-x)
    return Math.abs(2 / (expX - expNegX)) * Math.sign(x)
  }
}

// ============================================================================
// Inverse Reciprocal Hyperbolic Functions
// ============================================================================

/**
 * Inverse hyperbolic cotangent: acoth(x) = (ln((x+1)/x) + ln(x/(x-1))) / 2
 */
export function acothNumber(x: f64): f64 {
  return isFinite(x)
    ? (Math.log((x + 1) / x) + Math.log(x / (x - 1))) / 2
    : 0
}

/**
 * Inverse hyperbolic secant: asech(x) = ln(sqrt(1/x^2 - 1) + 1/x)
 */
export function asechNumber(x: f64): f64 {
  const xInv = 1 / x
  const ret = Math.sqrt(xInv * xInv - 1)
  return Math.log(ret + xInv)
}

/**
 * Inverse hyperbolic cosecant: acsch(x) = ln(1/x + sqrt(1/x^2 + 1))
 */
export function acschNumber(x: f64): f64 {
  const xInv = 1 / x
  return Math.log(xInv + Math.sqrt(xInv * xInv + 1))
}
