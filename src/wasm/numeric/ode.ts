/**
 * WASM-optimized ODE (Ordinary Differential Equation) solvers
 *
 * Implements high-performance Runge-Kutta methods for numerical integration:
 * - RK23: Bogacki-Shampine method (3rd order with 2nd order error estimate)
 * - RK45: Dormand-Prince method (5th order with 4th order error estimate)
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * RK45 (Dormand-Prince) single step
 *
 * Performs one step of the Dormand-Prince RK5(4)7M method
 * This is the most widely used adaptive RK method (used by MATLAB's ode45)
 *
 * @param yPtr - Pointer to current state vector (f64 array)
 * @param t - Current time
 * @param h - Step size
 * @param n - Dimension of state vector
 * @param kPtr - Pointer to work array for k values (size 7*n f64)
 * @param yNextPtr - Pointer to output next state (f64 array, size n)
 * @param yErrorPtr - Pointer to output error estimate (f64 array, size n)
 */
export function rk45Step(
  yPtr: usize,
  t: f64,
  h: f64,
  n: i32,
  kPtr: usize,
  yNextPtr: usize,
  yErrorPtr: usize
): void {
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
    const yOffset: usize = (<usize>i) << 3
    const k1Offset: usize = (<usize>i) << 3
    const k2Offset: usize = (<usize>(n + i)) << 3
    const k3Offset: usize = (<usize>(2 * n + i)) << 3
    const k4Offset: usize = (<usize>(3 * n + i)) << 3
    const k5Offset: usize = (<usize>(4 * n + i)) << 3
    const k6Offset: usize = (<usize>(5 * n + i)) << 3
    const k7Offset: usize = (<usize>(6 * n + i)) << 3

    const yVal: f64 = load<f64>(yPtr + yOffset)
    const k1: f64 = load<f64>(kPtr + k1Offset)
    const k2: f64 = load<f64>(kPtr + k2Offset)
    const k3: f64 = load<f64>(kPtr + k3Offset)
    const k4: f64 = load<f64>(kPtr + k4Offset)
    const k5: f64 = load<f64>(kPtr + k5Offset)
    const k6: f64 = load<f64>(kPtr + k6Offset)
    const k7: f64 = load<f64>(kPtr + k7Offset)

    const yNext: f64 =
      yVal +
      h * (b1 * k1 + b2 * k2 + b3 * k3 + b4 * k4 + b5 * k5 + b6 * k6 + b7 * k7)

    store<f64>(yNextPtr + yOffset, yNext)
  }

  // Compute 4th order solution and error estimate
  for (let i: i32 = 0; i < n; i++) {
    const yOffset: usize = (<usize>i) << 3
    const k1Offset: usize = (<usize>i) << 3
    const k2Offset: usize = (<usize>(n + i)) << 3
    const k3Offset: usize = (<usize>(2 * n + i)) << 3
    const k4Offset: usize = (<usize>(3 * n + i)) << 3
    const k5Offset: usize = (<usize>(4 * n + i)) << 3
    const k6Offset: usize = (<usize>(5 * n + i)) << 3
    const k7Offset: usize = (<usize>(6 * n + i)) << 3

    const yVal: f64 = load<f64>(yPtr + yOffset)
    const k1: f64 = load<f64>(kPtr + k1Offset)
    const k2: f64 = load<f64>(kPtr + k2Offset)
    const k3: f64 = load<f64>(kPtr + k3Offset)
    const k4: f64 = load<f64>(kPtr + k4Offset)
    const k5: f64 = load<f64>(kPtr + k5Offset)
    const k6: f64 = load<f64>(kPtr + k6Offset)
    const k7: f64 = load<f64>(kPtr + k7Offset)

    const yp: f64 =
      yVal +
      h *
        (bp1 * k1 +
          bp2 * k2 +
          bp3 * k3 +
          bp4 * k4 +
          bp5 * k5 +
          bp6 * k6 +
          bp7 * k7)

    const yNext: f64 = load<f64>(yNextPtr + yOffset)
    // Error is difference between 5th and 4th order solutions
    store<f64>(yErrorPtr + yOffset, Math.abs(yNext - yp))
  }
}

/**
 * RK23 (Bogacki-Shampine) single step
 *
 * Performs one step of the Bogacki-Shampine method
 * Lower order than RK45 but requires fewer function evaluations
 * Good for less stiff problems or when function evaluations are expensive
 *
 * @param yPtr - Pointer to current state vector (f64 array)
 * @param t - Current time
 * @param h - Step size
 * @param n - Dimension of state vector
 * @param kPtr - Pointer to work array for k values (size 4*n f64)
 * @param yNextPtr - Pointer to output next state (f64 array, size n)
 * @param yErrorPtr - Pointer to output error estimate (f64 array, size n)
 */
export function rk23Step(
  yPtr: usize,
  t: f64,
  h: f64,
  n: i32,
  kPtr: usize,
  yNextPtr: usize,
  yErrorPtr: usize
): void {
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
    const yOffset: usize = (<usize>i) << 3
    const k1Offset: usize = (<usize>i) << 3
    const k2Offset: usize = (<usize>(n + i)) << 3
    const k3Offset: usize = (<usize>(2 * n + i)) << 3
    const k4Offset: usize = (<usize>(3 * n + i)) << 3

    const yVal: f64 = load<f64>(yPtr + yOffset)
    const k1: f64 = load<f64>(kPtr + k1Offset)
    const k2: f64 = load<f64>(kPtr + k2Offset)
    const k3: f64 = load<f64>(kPtr + k3Offset)
    const k4: f64 = load<f64>(kPtr + k4Offset)

    const yNext: f64 = yVal + h * (b1 * k1 + b2 * k2 + b3 * k3 + b4 * k4)
    store<f64>(yNextPtr + yOffset, yNext)
  }

  // Compute 2nd order solution and error estimate
  for (let i: i32 = 0; i < n; i++) {
    const yOffset: usize = (<usize>i) << 3
    const k1Offset: usize = (<usize>i) << 3
    const k2Offset: usize = (<usize>(n + i)) << 3
    const k3Offset: usize = (<usize>(2 * n + i)) << 3
    const k4Offset: usize = (<usize>(3 * n + i)) << 3

    const yVal: f64 = load<f64>(yPtr + yOffset)
    const k1: f64 = load<f64>(kPtr + k1Offset)
    const k2: f64 = load<f64>(kPtr + k2Offset)
    const k3: f64 = load<f64>(kPtr + k3Offset)
    const k4: f64 = load<f64>(kPtr + k4Offset)

    const yp: f64 = yVal + h * (bp1 * k1 + bp2 * k2 + bp3 * k3 + bp4 * k4)
    const yNext: f64 = load<f64>(yNextPtr + yOffset)
    store<f64>(yErrorPtr + yOffset, Math.abs(yNext - yp))
  }
}

/**
 * Compute maximum error for adaptive step control
 * @param errorPtr - Pointer to error vector (f64 array)
 * @param n - Vector length
 * @returns Maximum absolute error
 */
export function maxError(errorPtr: usize, n: i32): f64 {
  let maxErr: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    const err: f64 = Math.abs(load<f64>(errorPtr + ((<usize>i) << 3)))
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
 * @param y0Ptr - Pointer to state at t0 (f64 array)
 * @param y1Ptr - Pointer to state at t1 (f64 array)
 * @param t0 - Start time
 * @param t1 - End time
 * @param t - Interpolation time
 * @param n - State dimension
 * @param resultPtr - Pointer to output interpolated state (f64 array)
 */
export function interpolate(
  y0Ptr: usize,
  y1Ptr: usize,
  t0: f64,
  t1: f64,
  t: f64,
  n: i32,
  resultPtr: usize
): void {
  const alpha: f64 = (t - t0) / (t1 - t0)
  const beta: f64 = 1.0 - alpha

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    const y0: f64 = load<f64>(y0Ptr + offset)
    const y1: f64 = load<f64>(y1Ptr + offset)
    store<f64>(resultPtr + offset, beta * y0 + alpha * y1)
  }
}

/**
 * Vector copy utility
 * @param srcPtr - Pointer to source vector (f64 array)
 * @param n - Vector length
 * @param dstPtr - Pointer to destination vector (f64 array)
 */
export function vectorCopy(srcPtr: usize, n: i32, dstPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(dstPtr + offset, load<f64>(srcPtr + offset))
  }
}

/**
 * Vector scale utility
 * @param vecPtr - Pointer to vector to scale (f64 array)
 * @param scale - Scale factor
 * @param n - Vector length
 * @param resultPtr - Pointer to output scaled vector (f64 array)
 */
export function vectorScale(
  vecPtr: usize,
  scale: f64,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(resultPtr + offset, load<f64>(vecPtr + offset) * scale)
  }
}

/**
 * Vector addition utility
 * @param aPtr - Pointer to first vector (f64 array)
 * @param bPtr - Pointer to second vector (f64 array)
 * @param n - Vector length
 * @param resultPtr - Pointer to output sum vector (f64 array)
 */
export function vectorAdd(
  aPtr: usize,
  bPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(
      resultPtr + offset,
      load<f64>(aPtr + offset) + load<f64>(bPtr + offset)
    )
  }
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
