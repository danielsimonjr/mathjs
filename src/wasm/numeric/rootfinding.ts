/**
 * WASM-optimized root finding algorithms
 *
 * Numerical methods for finding zeros of functions.
 * These complement the symbolic equation solving that cannot be converted to WASM.
 */

/**
 * Bisection method for finding a root in [a, b]
 * Requires f(a) and f(b) have opposite signs
 *
 * @param fa - f(a) value
 * @param fb - f(b) value
 * @param a - Left endpoint
 * @param b - Right endpoint
 * @param fValues - Array to store intermediate f values (caller evaluates)
 * @param xValues - Array to store intermediate x values
 * @param maxIter - Maximum iterations
 * @param tol - Tolerance for convergence
 * @returns Number of iterations used, or -1 if no root bracketed
 */
export function bisectionSetup(fa: f64, fb: f64, a: f64, b: f64): Float64Array {
  // Returns [nextX, currentA, currentB, fa, fb, status]
  // status: 1 = continue, 0 = converged, -1 = no bracket
  const result = new Float64Array(6)

  if (fa * fb > 0) {
    result[5] = -1.0 // No bracket
    return result
  }

  result[0] = (a + b) / 2.0 // nextX (midpoint)
  result[1] = a
  result[2] = b
  result[3] = fa
  result[4] = fb
  result[5] = 1.0 // Continue

  return result
}

/**
 * Bisection iteration step
 *
 * @param state - Current state [nextX, a, b, fa, fb, status]
 * @param fmid - Function value at midpoint
 * @param tol - Tolerance
 * @returns Updated state
 */
export function bisectionStep(
  state: Float64Array,
  fmid: f64,
  tol: f64
): Float64Array {
  const result = new Float64Array(6)

  const mid: f64 = state[0]
  let a: f64 = state[1]
  let b: f64 = state[2]
  let fa: f64 = state[3]
  let fb: f64 = state[4]

  // Check convergence
  if (Math.abs(fmid) < tol || (b - a) / 2.0 < tol) {
    result[0] = mid
    result[5] = 0.0 // Converged
    return result
  }

  // Update bracket
  if (fa * fmid < 0) {
    b = mid
    fb = fmid
  } else {
    a = mid
    fa = fmid
  }

  result[0] = (a + b) / 2.0
  result[1] = a
  result[2] = b
  result[3] = fa
  result[4] = fb
  result[5] = 1.0 // Continue

  return result
}

/**
 * Newton-Raphson method setup
 *
 * @param x0 - Initial guess
 * @returns State array [currentX, status]
 */
export function newtonSetup(x0: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = x0
  result[1] = 1.0 // Continue
  return result
}

/**
 * Newton-Raphson iteration step
 * x_{n+1} = x_n - f(x_n) / f'(x_n)
 *
 * @param state - Current state [x, status]
 * @param fx - f(x) value
 * @param fpx - f'(x) value (derivative)
 * @param tol - Tolerance
 * @returns Updated state [newX, status]
 */
export function newtonStep(
  state: Float64Array,
  fx: f64,
  fpx: f64,
  tol: f64
): Float64Array {
  const result = new Float64Array(2)

  // Check convergence
  if (Math.abs(fx) < tol) {
    result[0] = state[0]
    result[1] = 0.0 // Converged
    return result
  }

  // Check for zero derivative
  if (Math.abs(fpx) < 1e-15) {
    result[0] = state[0]
    result[1] = -1.0 // Failed (zero derivative)
    return result
  }

  const newX: f64 = state[0] - fx / fpx
  result[0] = newX
  result[1] = 1.0 // Continue

  return result
}

/**
 * Secant method setup
 *
 * @param x0 - First initial point
 * @param x1 - Second initial point
 * @param fx0 - f(x0)
 * @param fx1 - f(x1)
 * @returns State array [currentX, prevX, currentF, prevF, status]
 */
export function secantSetup(
  x0: f64,
  x1: f64,
  fx0: f64,
  fx1: f64
): Float64Array {
  const result = new Float64Array(5)
  result[0] = x1
  result[1] = x0
  result[2] = fx1
  result[3] = fx0
  result[4] = 1.0 // Continue
  return result
}

/**
 * Secant method iteration step
 * x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))
 *
 * @param state - Current state [x, xPrev, fx, fxPrev, status]
 * @param tol - Tolerance
 * @returns Updated state
 */
export function secantStep(state: Float64Array, tol: f64): Float64Array {
  const result = new Float64Array(5)

  const x: f64 = state[0]
  const xPrev: f64 = state[1]
  const fx: f64 = state[2]
  const fxPrev: f64 = state[3]

  // Check convergence
  if (Math.abs(fx) < tol) {
    result[0] = x
    result[4] = 0.0 // Converged
    return result
  }

  const denom: f64 = fx - fxPrev

  // Check for zero denominator
  if (Math.abs(denom) < 1e-15) {
    result[0] = x
    result[4] = -1.0 // Failed
    return result
  }

  const newX: f64 = x - (fx * (x - xPrev)) / denom

  result[0] = newX // Return new x for evaluation
  result[1] = x
  result[2] = 0.0 // Placeholder for f(newX) - caller must fill
  result[3] = fx
  result[4] = 2.0 // Need function evaluation

  return result
}

/**
 * Update secant state after function evaluation
 *
 * @param state - State after secantStep
 * @param fNewX - f(newX) value
 * @returns Updated state
 */
export function secantUpdate(state: Float64Array, fNewX: f64): Float64Array {
  state[2] = fNewX
  state[4] = 1.0 // Continue
  return state
}

/**
 * Brent's method setup (combines bisection, secant, and inverse quadratic interpolation)
 *
 * @param a - Left endpoint
 * @param b - Right endpoint
 * @param fa - f(a)
 * @param fb - f(b)
 * @returns State [a, b, c, fa, fb, fc, d, e, status]
 */
export function brentSetup(a: f64, b: f64, fa: f64, fb: f64): Float64Array {
  const result = new Float64Array(9)

  // Ensure |f(b)| <= |f(a)|
  let aa: f64 = a
  let bb: f64 = b
  let faa: f64 = fa
  let fbb: f64 = fb

  if (Math.abs(fa) < Math.abs(fb)) {
    aa = b
    bb = a
    faa = fb
    fbb = fa
  }

  if (faa * fbb > 0) {
    result[8] = -1.0 // No bracket
    return result
  }

  result[0] = aa // a
  result[1] = bb // b (best guess)
  result[2] = aa // c = a initially
  result[3] = faa // fa
  result[4] = fbb // fb
  result[5] = faa // fc = fa
  result[6] = bb - aa // d
  result[7] = bb - aa // e
  result[8] = 1.0 // Continue

  return result
}

/**
 * Brent's method iteration step
 *
 * @param state - Current state
 * @param tol - Tolerance
 * @returns Updated state with next x to evaluate in state[1]
 */
export function brentStep(state: Float64Array, tol: f64): Float64Array {
  let a: f64 = state[0]
  let b: f64 = state[1]
  let c: f64 = state[2]
  let fa: f64 = state[3]
  let fb: f64 = state[4]
  let fc: f64 = state[5]
  let d: f64 = state[6]
  let e: f64 = state[7]

  // Check convergence
  if (Math.abs(fb) < tol) {
    state[8] = 0.0 // Converged
    return state
  }

  // Ensure f(c) and f(b) have opposite signs
  if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) {
    c = a
    fc = fa
    d = b - a
    e = d
  }

  // c is the "contrapoint"
  if (Math.abs(fc) < Math.abs(fb)) {
    a = b
    b = c
    c = a
    fa = fb
    fb = fc
    fc = fa
  }

  const tolAbs: f64 = 2.0 * 2.2e-16 * Math.abs(b) + 0.5 * tol
  const m: f64 = 0.5 * (c - b)

  if (Math.abs(m) <= tolAbs || fb === 0) {
    state[1] = b
    state[8] = 0.0 // Converged
    return state
  }

  let newB: f64

  if (Math.abs(e) < tolAbs || Math.abs(fa) <= Math.abs(fb)) {
    // Bisection
    d = m
    e = m
    newB = b + m
  } else {
    let s: f64

    if (a === c) {
      // Secant (linear interpolation)
      s = fb / fa
      newB = b + (2.0 * m * s) / (1.0 - s)
    } else {
      // Inverse quadratic interpolation
      const q: f64 = fa / fc
      const r: f64 = fb / fc
      s = fb / fa
      newB =
        b +
        (s * (2.0 * m * q * (q - r) - (b - a) * (r - 1.0))) /
          ((q - 1.0) * (r - 1.0) * (s - 1.0))
    }

    // Check if interpolation is acceptable
    const delta: f64 = newB - b
    if (2.0 * Math.abs(delta) < Math.min(Math.abs(e), 3.0 * m - tolAbs)) {
      e = d
      d = delta
    } else {
      // Fall back to bisection
      d = m
      e = m
      newB = b + m
    }
  }

  // Update state
  a = b
  fa = fb
  b = newB

  state[0] = a
  state[1] = b // Next x to evaluate
  state[2] = c
  state[3] = fa
  state[4] = 0.0 // Placeholder for f(newB)
  state[5] = fc
  state[6] = d
  state[7] = e
  state[8] = 2.0 // Need function evaluation

  return state
}

/**
 * Update Brent state after function evaluation
 *
 * @param state - State after brentStep
 * @param fNewB - f(newB) value
 * @returns Updated state
 */
export function brentUpdate(state: Float64Array, fNewB: f64): Float64Array {
  state[4] = fNewB
  state[8] = 1.0 // Continue
  return state
}

/**
 * Fixed-point iteration: x = g(x)
 * Setup for iteration
 *
 * @param x0 - Initial guess
 * @returns State [x, status]
 */
export function fixedPointSetup(x0: f64): Float64Array {
  const result = new Float64Array(2)
  result[0] = x0
  result[1] = 1.0 // Continue
  return result
}

/**
 * Fixed-point iteration step
 *
 * @param state - Current state [x, status]
 * @param gx - g(x) value
 * @param tol - Tolerance
 * @returns Updated state
 */
export function fixedPointStep(
  state: Float64Array,
  gx: f64,
  tol: f64
): Float64Array {
  const result = new Float64Array(2)

  const x: f64 = state[0]

  // Check convergence
  if (Math.abs(gx - x) < tol) {
    result[0] = gx
    result[1] = 0.0 // Converged
    return result
  }

  result[0] = gx
  result[1] = 1.0 // Continue

  return result
}

/**
 * Illinois method (modified regula falsi)
 * More robust than standard regula falsi
 *
 * @param a - Left endpoint
 * @param b - Right endpoint
 * @param fa - f(a)
 * @param fb - f(b)
 * @returns State [a, b, fa, fb, side, status]
 */
export function illinoisSetup(a: f64, b: f64, fa: f64, fb: f64): Float64Array {
  const result = new Float64Array(6)

  if (fa * fb > 0) {
    result[5] = -1.0 // No bracket
    return result
  }

  result[0] = a
  result[1] = b
  result[2] = fa
  result[3] = fb
  result[4] = 0.0 // side indicator
  result[5] = 1.0 // Continue

  return result
}

/**
 * Illinois method step
 *
 * @param state - Current state
 * @param fc - f(c) where c is the secant point
 * @param tol - Tolerance
 * @returns Updated state
 */
export function illinoisStep(
  state: Float64Array,
  fc: f64,
  tol: f64
): Float64Array {
  let a: f64 = state[0]
  let b: f64 = state[1]
  let fa: f64 = state[2]
  let fb: f64 = state[3]
  let side: f64 = state[4]

  // Compute secant point
  const c: f64 = (fa * b - fb * a) / (fa - fb)

  // Check convergence
  if (Math.abs(fc) < tol || Math.abs(b - a) < tol) {
    state[0] = c
    state[5] = 0.0 // Converged
    return state
  }

  // Update bracket
  if (fc * fb < 0) {
    a = b
    fa = fb
    side = 0.0
  } else {
    // Illinois modification: reduce fa when stuck on same side
    if (side === 1.0) {
      fa /= 2.0
    }
    side = 1.0
  }

  b = c
  fb = fc

  state[0] = a
  state[1] = b
  state[2] = fa
  state[3] = fb
  state[4] = side
  // state[5] already = 1.0 (Continue)

  return state
}

/**
 * Get the next x value to evaluate for Illinois method
 *
 * @param state - Current state
 * @returns x value to evaluate
 */
export function illinoisNextX(state: Float64Array): f64 {
  const a: f64 = state[0]
  const b: f64 = state[1]
  const fa: f64 = state[2]
  const fb: f64 = state[3]

  return (fa * b - fb * a) / (fa - fb)
}

/**
 * Muller's method for polynomial roots (can find complex roots)
 * Uses quadratic interpolation through 3 points
 *
 * @param x0 - First point
 * @param x1 - Second point
 * @param x2 - Third point (current best)
 * @param f0 - f(x0)
 * @param f1 - f(x1)
 * @param f2 - f(x2)
 * @returns [newX, status] - New estimate
 */
export function mullerStep(
  x0: f64,
  x1: f64,
  x2: f64,
  f0: f64,
  f1: f64,
  f2: f64,
  tol: f64
): Float64Array {
  const result = new Float64Array(2)

  if (Math.abs(f2) < tol) {
    result[0] = x2
    result[1] = 0.0 // Converged
    return result
  }

  const h1: f64 = x1 - x0
  const h2: f64 = x2 - x1
  const delta1: f64 = (f1 - f0) / h1
  const delta2: f64 = (f2 - f1) / h2

  const a: f64 = (delta2 - delta1) / (h2 + h1)
  const b: f64 = a * h2 + delta2
  const c: f64 = f2

  const discriminant: f64 = b * b - 4.0 * a * c

  let denom: f64
  if (discriminant >= 0) {
    const sqrtD: f64 = Math.sqrt(discriminant)
    // Choose sign to maximize denominator (reduce step)
    if (Math.abs(b + sqrtD) > Math.abs(b - sqrtD)) {
      denom = b + sqrtD
    } else {
      denom = b - sqrtD
    }
  } else {
    // Complex case - use magnitude
    denom = b
  }

  if (Math.abs(denom) < 1e-15) {
    result[0] = x2
    result[1] = -1.0 // Failed
    return result
  }

  result[0] = x2 - (2.0 * c) / denom
  result[1] = 1.0 // Continue

  return result
}

/**
 * Steffensen's method (quadratic convergence without derivatives)
 * x_{n+1} = x_n - f(x_n)² / (f(x_n + f(x_n)) - f(x_n))
 *
 * @param x - Current x
 * @param fx - f(x)
 * @param fxpfx - f(x + f(x))
 * @param tol - Tolerance
 * @returns [newX, status]
 */
export function steffensenStep(
  x: f64,
  fx: f64,
  fxpfx: f64,
  tol: f64
): Float64Array {
  const result = new Float64Array(2)

  if (Math.abs(fx) < tol) {
    result[0] = x
    result[1] = 0.0 // Converged
    return result
  }

  const denom: f64 = fxpfx - fx

  if (Math.abs(denom) < 1e-15) {
    result[0] = x
    result[1] = -1.0 // Failed
    return result
  }

  result[0] = x - (fx * fx) / denom
  result[1] = 1.0 // Continue

  return result
}

/**
 * Halley's method (cubic convergence)
 * x_{n+1} = x_n - 2f(x)f'(x) / (2f'(x)² - f(x)f''(x))
 *
 * @param x - Current x
 * @param fx - f(x)
 * @param fpx - f'(x)
 * @param fppx - f''(x)
 * @param tol - Tolerance
 * @returns [newX, status]
 */
export function halleyStep(
  x: f64,
  fx: f64,
  fpx: f64,
  fppx: f64,
  tol: f64
): Float64Array {
  const result = new Float64Array(2)

  if (Math.abs(fx) < tol) {
    result[0] = x
    result[1] = 0.0 // Converged
    return result
  }

  const denom: f64 = 2.0 * fpx * fpx - fx * fppx

  if (Math.abs(denom) < 1e-15) {
    result[0] = x
    result[1] = -1.0 // Failed
    return result
  }

  result[0] = x - (2.0 * fx * fpx) / denom
  result[1] = 1.0 // Continue

  return result
}
