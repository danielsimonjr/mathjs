/**
 * WASM-optimized ODE (Ordinary Differential Equation) solvers
 *
 * Implements high-performance Runge-Kutta methods for numerical integration:
 * - RK23: Bogacki-Shampine method (3rd order with 2nd order error estimate)
 * - RK45: Dormand-Prince method (5th order with 4th order error estimate)
 *
 * All functions return new arrays for proper WASM/JS interop
 */

/**
 * Result of RK step computation
 */
class RKStepResult {
  yNext: Float64Array
  yError: Float64Array

  constructor(yNext: Float64Array, yError: Float64Array) {
    this.yNext = yNext
    this.yError = yError
  }
}

/**
 * RK45 (Dormand-Prince) single step
 *
 * Performs one step of the Dormand-Prince RK5(4)7M method
 * This is the most widely used adaptive RK method (used by MATLAB's ode45)
 *
 * @param y - Current state vector
 * @param t - Current time
 * @param h - Step size
 * @param n - Dimension of state vector
 * @param k - Work array for k values (size 7*n)
 * @returns Next state and error estimate
 */
export function rk45Step(
  y: Float64Array,
  t: f64,
  h: f64,
  n: i32,
  k: Float64Array
): RKStepResult {
  const yNext = new Float64Array(n)
  const yError = new Float64Array(n)

  // Dormand-Prince coefficients
  // b vector (5th order solution)
  const b1: f64 = 35.0 / 384.0
  const b2: f64 = 0.0
  const b3: f64 = 500.0 / 1113.0
  const b4: f64 = 125.0 / 192.0
  const b5: f64 = -2187.0 / 6784.0
  const b6: f64 = 11.0 / 84.0
  const b7: f64 = 0.0

  // bp vector (4th order solution for error estimation)
  const bp1: f64 = 5179.0 / 57600.0
  const bp2: f64 = 0.0
  const bp3: f64 = 7571.0 / 16695.0
  const bp4: f64 = 393.0 / 640.0
  const bp5: f64 = -92097.0 / 339200.0
  const bp6: f64 = 187.0 / 2100.0
  const bp7: f64 = 1.0 / 40.0

  // Compute 5th order solution
  for (let i: i32 = 0; i < n; i++) {
    const idx_k1: i32 = i
    const idx_k2: i32 = n + i
    const idx_k3: i32 = 2 * n + i
    const idx_k4: i32 = 3 * n + i
    const idx_k5: i32 = 4 * n + i
    const idx_k6: i32 = 5 * n + i
    const idx_k7: i32 = 6 * n + i

    unchecked(
      (yNext[i] =
        unchecked(y[i]) +
        h *
          (b1 * unchecked(k[idx_k1]) +
            b2 * unchecked(k[idx_k2]) +
            b3 * unchecked(k[idx_k3]) +
            b4 * unchecked(k[idx_k4]) +
            b5 * unchecked(k[idx_k5]) +
            b6 * unchecked(k[idx_k6]) +
            b7 * unchecked(k[idx_k7])))
    )
  }

  // Compute 4th order solution and error estimate
  for (let i: i32 = 0; i < n; i++) {
    const idx_k1: i32 = i
    const idx_k2: i32 = n + i
    const idx_k3: i32 = 2 * n + i
    const idx_k4: i32 = 3 * n + i
    const idx_k5: i32 = 4 * n + i
    const idx_k6: i32 = 5 * n + i
    const idx_k7: i32 = 6 * n + i

    const yp: f64 =
      unchecked(y[i]) +
      h *
        (bp1 * unchecked(k[idx_k1]) +
          bp2 * unchecked(k[idx_k2]) +
          bp3 * unchecked(k[idx_k3]) +
          bp4 * unchecked(k[idx_k4]) +
          bp5 * unchecked(k[idx_k5]) +
          bp6 * unchecked(k[idx_k6]) +
          bp7 * unchecked(k[idx_k7]))

    // Error is difference between 5th and 4th order solutions
    unchecked((yError[i] = Math.abs(unchecked(yNext[i]) - yp)))
  }

  return new RKStepResult(yNext, yError)
}

/**
 * Get yNext from RK step result
 */
export function getRKYNext(result: RKStepResult): Float64Array {
  return result.yNext
}

/**
 * Get yError from RK step result
 */
export function getRKYError(result: RKStepResult): Float64Array {
  return result.yError
}

/**
 * RK23 (Bogacki-Shampine) single step
 *
 * Performs one step of the Bogacki-Shampine method
 * Lower order than RK45 but requires fewer function evaluations
 * Good for less stiff problems or when function evaluations are expensive
 *
 * @param y - Current state vector
 * @param t - Current time
 * @param h - Step size
 * @param n - Dimension of state vector
 * @param k - Work array for k values (size 4*n)
 * @returns Next state and error estimate
 */
export function rk23Step(
  y: Float64Array,
  t: f64,
  h: f64,
  n: i32,
  k: Float64Array
): RKStepResult {
  const yNext = new Float64Array(n)
  const yError = new Float64Array(n)

  // Bogacki-Shampine coefficients
  // b vector (3rd order solution)
  const b1: f64 = 2.0 / 9.0
  const b2: f64 = 1.0 / 3.0
  const b3: f64 = 4.0 / 9.0
  const b4: f64 = 0.0

  // bp vector (2nd order solution for error estimation)
  const bp1: f64 = 7.0 / 24.0
  const bp2: f64 = 1.0 / 4.0
  const bp3: f64 = 1.0 / 3.0
  const bp4: f64 = 1.0 / 8.0

  // Compute 3rd order solution
  for (let i: i32 = 0; i < n; i++) {
    const idx_k1: i32 = i
    const idx_k2: i32 = n + i
    const idx_k3: i32 = 2 * n + i
    const idx_k4: i32 = 3 * n + i

    unchecked(
      (yNext[i] =
        unchecked(y[i]) +
        h *
          (b1 * unchecked(k[idx_k1]) +
            b2 * unchecked(k[idx_k2]) +
            b3 * unchecked(k[idx_k3]) +
            b4 * unchecked(k[idx_k4])))
    )
  }

  // Compute 2nd order solution and error estimate
  for (let i: i32 = 0; i < n; i++) {
    const idx_k1: i32 = i
    const idx_k2: i32 = n + i
    const idx_k3: i32 = 2 * n + i
    const idx_k4: i32 = 3 * n + i

    const yp: f64 =
      unchecked(y[i]) +
      h *
        (bp1 * unchecked(k[idx_k1]) +
          bp2 * unchecked(k[idx_k2]) +
          bp3 * unchecked(k[idx_k3]) +
          bp4 * unchecked(k[idx_k4]))

    unchecked((yError[i] = Math.abs(unchecked(yNext[i]) - yp)))
  }

  return new RKStepResult(yNext, yError)
}

/**
 * Compute maximum error for adaptive step control
 * @param error - Error vector
 * @param n - Vector length
 * @returns Maximum absolute error
 */
export function maxError(error: Float64Array, n: i32): f64 {
  let maxErr: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    const err: f64 = Math.abs(unchecked(error[i]))
    if (err > maxErr) {
      maxErr = err
    }
  }
  return maxErr
}

/**
 * Compute optimal step size adjustment factor
 * @param error - Current error
 * @param tolerance - Desired tolerance
 * @param order - Order of the method (3 for RK23, 5 for RK45)
 * @param minDelta - Minimum adjustment factor
 * @param maxDelta - Maximum adjustment factor
 * @returns Step size adjustment factor
 */
export function computeStepAdjustment(
  error: f64,
  tolerance: f64,
  order: i32,
  minDelta: f64,
  maxDelta: f64
): f64 {
  // Safety factor
  const safety: f64 = 0.84

  // Compute adjustment: delta = safety * (tol/error)^(1/order)
  let delta: f64 = safety * Math.pow(tolerance / error, 1.0 / <f64>order)

  // Clamp to [minDelta, maxDelta]
  if (delta < minDelta) {
    delta = minDelta
  } else if (delta > maxDelta) {
    delta = maxDelta
  }

  return delta
}

/**
 * Linear interpolation for dense output
 * @param y0 - State at t0
 * @param y1 - State at t1
 * @param t0 - Start time
 * @param t1 - End time
 * @param t - Interpolation time
 * @param n - State dimension
 * @returns Interpolated state
 */
export function interpolate(
  y0: Float64Array,
  y1: Float64Array,
  t0: f64,
  t1: f64,
  t: f64,
  n: i32
): Float64Array {
  const result = new Float64Array(n)
  const alpha: f64 = (t - t0) / (t1 - t0)
  const beta: f64 = 1.0 - alpha

  for (let i: i32 = 0; i < n; i++) {
    unchecked((result[i] = beta * unchecked(y0[i]) + alpha * unchecked(y1[i])))
  }

  return result
}

/**
 * Vector copy utility
 * @param src - Source vector
 * @param n - Vector length
 * @returns Copy of the vector
 */
export function vectorCopy(src: Float64Array, n: i32): Float64Array {
  const dst = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    unchecked((dst[i] = unchecked(src[i])))
  }
  return dst
}

/**
 * Vector scale utility
 * @param vec - Vector to scale
 * @param scale - Scale factor
 * @param n - Vector length
 * @returns Scaled vector
 */
export function vectorScale(
  vec: Float64Array,
  scale: f64,
  n: i32
): Float64Array {
  const result = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    unchecked((result[i] = unchecked(vec[i]) * scale))
  }
  return result
}

/**
 * Vector addition utility
 * @param a - First vector
 * @param b - Second vector
 * @param n - Vector length
 * @returns Sum vector
 */
export function vectorAdd(
  a: Float64Array,
  b: Float64Array,
  n: i32
): Float64Array {
  const result = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    unchecked((result[i] = unchecked(a[i]) + unchecked(b[i])))
  }
  return result
}

/**
 * Check if step would overshoot final time
 * @param t - Current time
 * @param tf - Final time
 * @param h - Step size
 * @param forward - 1 if integrating forward, 0 if backward
 * @returns 1 if would overshoot, 0 otherwise
 */
export function wouldOvershoot(t: f64, tf: f64, h: f64, forward: i32): i32 {
  if (forward) {
    return t + h > tf ? 1 : 0
  } else {
    return t + h < tf ? 1 : 0
  }
}

/**
 * Trim step size to avoid overshooting
 * @param t - Current time
 * @param tf - Final time
 * @param h - Proposed step size
 * @param forward - 1 if integrating forward, 0 if backward
 * @returns Adjusted step size
 */
export function trimStep(t: f64, tf: f64, h: f64, forward: i32): f64 {
  if (wouldOvershoot(t, tf, h, forward)) {
    return tf - t
  }
  return h
}
