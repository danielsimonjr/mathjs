/**
 * WASM-optimized root finding algorithms
 *
 * Numerical methods for finding zeros of functions.
 * These complement the symbolic equation solving that cannot be converted to WASM.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 *
 * State arrays use the following conventions:
 * - Status codes: 1.0 = continue, 0.0 = converged, -1.0 = failed/no bracket
 * - 2.0 = need function evaluation (caller must evaluate and update)
 */

/**
 * Bisection method setup
 * Requires f(a) and f(b) have opposite signs
 *
 * @param fa - f(a) value
 * @param fb - f(b) value
 * @param a - Left endpoint
 * @param b - Right endpoint
 * @param statePtr - Pointer to output state array (f64, 6 elements):
 *                   [nextX, currentA, currentB, fa, fb, status]
 *                   status: 1 = continue, 0 = converged, -1 = no bracket
 */
export function bisectionSetup(
  fa: f64,
  fb: f64,
  a: f64,
  b: f64,
  statePtr: usize
): void {
  if (fa * fb > 0) {
    store<f64>(statePtr + 40, -1.0) // No bracket
    return
  }

  store<f64>(statePtr, (a + b) / 2.0) // nextX (midpoint)
  store<f64>(statePtr + 8, a)
  store<f64>(statePtr + 16, b)
  store<f64>(statePtr + 24, fa)
  store<f64>(statePtr + 32, fb)
  store<f64>(statePtr + 40, 1.0) // Continue
}

/**
 * Bisection iteration step
 *
 * @param statePtr - Pointer to state array [nextX, a, b, fa, fb, status]
 * @param fmid - Function value at midpoint
 * @param tol - Tolerance
 */
export function bisectionStep(statePtr: usize, fmid: f64, tol: f64): void {
  const mid: f64 = load<f64>(statePtr)
  let a: f64 = load<f64>(statePtr + 8)
  let b: f64 = load<f64>(statePtr + 16)
  let fa: f64 = load<f64>(statePtr + 24)
  let fb: f64 = load<f64>(statePtr + 32)

  // Check convergence
  if (Math.abs(fmid) < tol || (b - a) / 2.0 < tol) {
    store<f64>(statePtr, mid)
    store<f64>(statePtr + 40, 0.0) // Converged
    return
  }

  // Update bracket
  if (fa * fmid < 0) {
    b = mid
    fb = fmid
  } else {
    a = mid
    fa = fmid
  }

  store<f64>(statePtr, (a + b) / 2.0)
  store<f64>(statePtr + 8, a)
  store<f64>(statePtr + 16, b)
  store<f64>(statePtr + 24, fa)
  store<f64>(statePtr + 32, fb)
  store<f64>(statePtr + 40, 1.0) // Continue
}

/**
 * Newton-Raphson method setup
 *
 * @param x0 - Initial guess
 * @param statePtr - Pointer to output state array (f64, 2 elements): [currentX, status]
 */
export function newtonSetup(x0: f64, statePtr: usize): void {
  store<f64>(statePtr, x0)
  store<f64>(statePtr + 8, 1.0) // Continue
}

/**
 * Newton-Raphson iteration step
 * x_{n+1} = x_n - f(x_n) / f'(x_n)
 *
 * @param statePtr - Pointer to state array [x, status]
 * @param fx - f(x) value
 * @param fpx - f'(x) value (derivative)
 * @param tol - Tolerance
 */
export function newtonStep(statePtr: usize, fx: f64, fpx: f64, tol: f64): void {
  const x: f64 = load<f64>(statePtr)

  // Check convergence
  if (Math.abs(fx) < tol) {
    store<f64>(statePtr + 8, 0.0) // Converged
    return
  }

  // Check for zero derivative
  if (Math.abs(fpx) < 1e-15) {
    store<f64>(statePtr + 8, -1.0) // Failed (zero derivative)
    return
  }

  const newX: f64 = x - fx / fpx
  store<f64>(statePtr, newX)
  store<f64>(statePtr + 8, 1.0) // Continue
}

/**
 * Secant method setup
 *
 * @param x0 - First initial point
 * @param x1 - Second initial point
 * @param fx0 - f(x0)
 * @param fx1 - f(x1)
 * @param statePtr - Pointer to output state array (f64, 5 elements):
 *                   [currentX, prevX, currentF, prevF, status]
 */
export function secantSetup(
  x0: f64,
  x1: f64,
  fx0: f64,
  fx1: f64,
  statePtr: usize
): void {
  store<f64>(statePtr, x1)
  store<f64>(statePtr + 8, x0)
  store<f64>(statePtr + 16, fx1)
  store<f64>(statePtr + 24, fx0)
  store<f64>(statePtr + 32, 1.0) // Continue
}

/**
 * Secant method iteration step
 * x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))
 *
 * @param statePtr - Pointer to state array [x, xPrev, fx, fxPrev, status]
 * @param tol - Tolerance
 * @returns New x value to evaluate (if status becomes 2.0)
 */
export function secantStep(statePtr: usize, tol: f64): f64 {
  const x: f64 = load<f64>(statePtr)
  const xPrev: f64 = load<f64>(statePtr + 8)
  const fx: f64 = load<f64>(statePtr + 16)
  const fxPrev: f64 = load<f64>(statePtr + 24)

  // Check convergence
  if (Math.abs(fx) < tol) {
    store<f64>(statePtr + 32, 0.0) // Converged
    return x
  }

  const denom: f64 = fx - fxPrev

  // Check for zero denominator
  if (Math.abs(denom) < 1e-15) {
    store<f64>(statePtr + 32, -1.0) // Failed
    return x
  }

  const newX: f64 = x - (fx * (x - xPrev)) / denom

  store<f64>(statePtr, newX) // Return new x for evaluation
  store<f64>(statePtr + 8, x)
  store<f64>(statePtr + 16, 0.0) // Placeholder for f(newX) - caller must fill
  store<f64>(statePtr + 24, fx)
  store<f64>(statePtr + 32, 2.0) // Need function evaluation

  return newX
}

/**
 * Update secant state after function evaluation
 *
 * @param statePtr - Pointer to state array after secantStep
 * @param fNewX - f(newX) value
 */
export function secantUpdate(statePtr: usize, fNewX: f64): void {
  store<f64>(statePtr + 16, fNewX)
  store<f64>(statePtr + 32, 1.0) // Continue
}

/**
 * Brent's method setup (combines bisection, secant, and inverse quadratic interpolation)
 *
 * @param a - Left endpoint
 * @param b - Right endpoint
 * @param fa - f(a)
 * @param fb - f(b)
 * @param statePtr - Pointer to output state array (f64, 9 elements):
 *                   [a, b, c, fa, fb, fc, d, e, status]
 */
export function brentSetup(
  a: f64,
  b: f64,
  fa: f64,
  fb: f64,
  statePtr: usize
): void {
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
    store<f64>(statePtr + 64, -1.0) // No bracket
    return
  }

  store<f64>(statePtr, aa) // a
  store<f64>(statePtr + 8, bb) // b (best guess)
  store<f64>(statePtr + 16, aa) // c = a initially
  store<f64>(statePtr + 24, faa) // fa
  store<f64>(statePtr + 32, fbb) // fb
  store<f64>(statePtr + 40, faa) // fc = fa
  store<f64>(statePtr + 48, bb - aa) // d
  store<f64>(statePtr + 56, bb - aa) // e
  store<f64>(statePtr + 64, 1.0) // Continue
}

/**
 * Brent's method iteration step
 *
 * @param statePtr - Pointer to state array
 * @param tol - Tolerance
 * @returns Next x value to evaluate (b in state)
 */
export function brentStep(statePtr: usize, tol: f64): f64 {
  let a: f64 = load<f64>(statePtr)
  let b: f64 = load<f64>(statePtr + 8)
  let c: f64 = load<f64>(statePtr + 16)
  let fa: f64 = load<f64>(statePtr + 24)
  let fb: f64 = load<f64>(statePtr + 32)
  let fc: f64 = load<f64>(statePtr + 40)
  let d: f64 = load<f64>(statePtr + 48)
  let e: f64 = load<f64>(statePtr + 56)

  // Check convergence
  if (Math.abs(fb) < tol) {
    store<f64>(statePtr + 64, 0.0) // Converged
    return b
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
    store<f64>(statePtr + 8, b)
    store<f64>(statePtr + 64, 0.0) // Converged
    return b
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

  store<f64>(statePtr, a)
  store<f64>(statePtr + 8, b) // Next x to evaluate
  store<f64>(statePtr + 16, c)
  store<f64>(statePtr + 24, fa)
  store<f64>(statePtr + 32, 0.0) // Placeholder for f(newB)
  store<f64>(statePtr + 40, fc)
  store<f64>(statePtr + 48, d)
  store<f64>(statePtr + 56, e)
  store<f64>(statePtr + 64, 2.0) // Need function evaluation

  return newB
}

/**
 * Update Brent state after function evaluation
 *
 * @param statePtr - Pointer to state array after brentStep
 * @param fNewB - f(newB) value
 */
export function brentUpdate(statePtr: usize, fNewB: f64): void {
  store<f64>(statePtr + 32, fNewB)
  store<f64>(statePtr + 64, 1.0) // Continue
}

/**
 * Fixed-point iteration: x = g(x)
 * Setup for iteration
 *
 * @param x0 - Initial guess
 * @param statePtr - Pointer to output state array (f64, 2 elements): [x, status]
 */
export function fixedPointSetup(x0: f64, statePtr: usize): void {
  store<f64>(statePtr, x0)
  store<f64>(statePtr + 8, 1.0) // Continue
}

/**
 * Fixed-point iteration step
 *
 * @param statePtr - Pointer to state array [x, status]
 * @param gx - g(x) value
 * @param tol - Tolerance
 */
export function fixedPointStep(statePtr: usize, gx: f64, tol: f64): void {
  const x: f64 = load<f64>(statePtr)

  // Check convergence
  if (Math.abs(gx - x) < tol) {
    store<f64>(statePtr, gx)
    store<f64>(statePtr + 8, 0.0) // Converged
    return
  }

  store<f64>(statePtr, gx)
  store<f64>(statePtr + 8, 1.0) // Continue
}

/**
 * Illinois method (modified regula falsi)
 * More robust than standard regula falsi
 *
 * @param a - Left endpoint
 * @param b - Right endpoint
 * @param fa - f(a)
 * @param fb - f(b)
 * @param statePtr - Pointer to output state array (f64, 6 elements):
 *                   [a, b, fa, fb, side, status]
 */
export function illinoisSetup(
  a: f64,
  b: f64,
  fa: f64,
  fb: f64,
  statePtr: usize
): void {
  if (fa * fb > 0) {
    store<f64>(statePtr + 40, -1.0) // No bracket
    return
  }

  store<f64>(statePtr, a)
  store<f64>(statePtr + 8, b)
  store<f64>(statePtr + 16, fa)
  store<f64>(statePtr + 24, fb)
  store<f64>(statePtr + 32, 0.0) // side indicator
  store<f64>(statePtr + 40, 1.0) // Continue
}

/**
 * Illinois method step
 *
 * @param statePtr - Pointer to state array
 * @param fc - f(c) where c is the secant point
 * @param tol - Tolerance
 */
export function illinoisStep(statePtr: usize, fc: f64, tol: f64): void {
  let a: f64 = load<f64>(statePtr)
  let b: f64 = load<f64>(statePtr + 8)
  let fa: f64 = load<f64>(statePtr + 16)
  let fb: f64 = load<f64>(statePtr + 24)
  let side: f64 = load<f64>(statePtr + 32)

  // Compute secant point
  const c: f64 = (fa * b - fb * a) / (fa - fb)

  // Check convergence
  if (Math.abs(fc) < tol || Math.abs(b - a) < tol) {
    store<f64>(statePtr, c)
    store<f64>(statePtr + 40, 0.0) // Converged
    return
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

  store<f64>(statePtr, a)
  store<f64>(statePtr + 8, b)
  store<f64>(statePtr + 16, fa)
  store<f64>(statePtr + 24, fb)
  store<f64>(statePtr + 32, side)
  // state[5] already = 1.0 (Continue)
}

/**
 * Get the next x value to evaluate for Illinois method
 *
 * @param statePtr - Pointer to state array
 * @returns x value to evaluate
 */
export function illinoisNextX(statePtr: usize): f64 {
  const a: f64 = load<f64>(statePtr)
  const b: f64 = load<f64>(statePtr + 8)
  const fa: f64 = load<f64>(statePtr + 16)
  const fb: f64 = load<f64>(statePtr + 24)

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
 * @param tol - Tolerance
 * @param resultPtr - Pointer to output array (f64, 2 elements): [newX, status]
 */
export function mullerStep(
  x0: f64,
  x1: f64,
  x2: f64,
  f0: f64,
  f1: f64,
  f2: f64,
  tol: f64,
  resultPtr: usize
): void {
  if (Math.abs(f2) < tol) {
    store<f64>(resultPtr, x2)
    store<f64>(resultPtr + 8, 0.0) // Converged
    return
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
    store<f64>(resultPtr, x2)
    store<f64>(resultPtr + 8, -1.0) // Failed
    return
  }

  store<f64>(resultPtr, x2 - (2.0 * c) / denom)
  store<f64>(resultPtr + 8, 1.0) // Continue
}

/**
 * Steffensen's method (quadratic convergence without derivatives)
 * x_{n+1} = x_n - f(x_n)² / (f(x_n + f(x_n)) - f(x_n))
 *
 * @param x - Current x
 * @param fx - f(x)
 * @param fxpfx - f(x + f(x))
 * @param tol - Tolerance
 * @param resultPtr - Pointer to output array (f64, 2 elements): [newX, status]
 */
export function steffensenStep(
  x: f64,
  fx: f64,
  fxpfx: f64,
  tol: f64,
  resultPtr: usize
): void {
  if (Math.abs(fx) < tol) {
    store<f64>(resultPtr, x)
    store<f64>(resultPtr + 8, 0.0) // Converged
    return
  }

  const denom: f64 = fxpfx - fx

  if (Math.abs(denom) < 1e-15) {
    store<f64>(resultPtr, x)
    store<f64>(resultPtr + 8, -1.0) // Failed
    return
  }

  store<f64>(resultPtr, x - (fx * fx) / denom)
  store<f64>(resultPtr + 8, 1.0) // Continue
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
 * @param resultPtr - Pointer to output array (f64, 2 elements): [newX, status]
 */
export function halleyStep(
  x: f64,
  fx: f64,
  fpx: f64,
  fppx: f64,
  tol: f64,
  resultPtr: usize
): void {
  if (Math.abs(fx) < tol) {
    store<f64>(resultPtr, x)
    store<f64>(resultPtr + 8, 0.0) // Converged
    return
  }

  const denom: f64 = 2.0 * fpx * fpx - fx * fppx

  if (Math.abs(denom) < 1e-15) {
    store<f64>(resultPtr, x)
    store<f64>(resultPtr + 8, -1.0) // Failed
    return
  }

  store<f64>(resultPtr, x - (2.0 * fx * fpx) / denom)
  store<f64>(resultPtr + 8, 1.0) // Continue
}

/**
 * Get status from a state array
 * Utility function to read the status field from different state arrays
 *
 * @param statePtr - Pointer to state array
 * @param statusOffset - Byte offset of status field (e.g., 8 for 2-element, 40 for 6-element)
 * @returns Status value: 1.0 = continue, 0.0 = converged, -1.0 = failed, 2.0 = need eval
 */
export function getStatus(statePtr: usize, statusOffset: i32): f64 {
  return load<f64>(statePtr + <usize>statusOffset)
}

/**
 * Get current best estimate from a state array
 *
 * @param statePtr - Pointer to state array
 * @param estimateOffset - Byte offset of estimate field (usually 0 or 8)
 * @returns Current estimate
 */
export function getEstimate(statePtr: usize, estimateOffset: i32): f64 {
  return load<f64>(statePtr + <usize>estimateOffset)
}
