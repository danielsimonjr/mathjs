/**
 * Interpolation algorithms for AssemblyScript/WASM
 *
 * WASM-compatible implementations of interpolation methods.
 * These provide numerical alternatives to expression-based interpolation.
 *
 * Includes:
 * - Linear interpolation
 * - Lagrange polynomial interpolation
 * - Newton's divided differences
 * - Cubic spline interpolation (natural and clamped)
 * - Barycentric interpolation
 * - Hermite interpolation
 */

// ============================================================================
// LINEAR INTERPOLATION
// ============================================================================

/**
 * Simple linear interpolation between two points
 * @param x0 First x value
 * @param y0 First y value (f(x0))
 * @param x1 Second x value
 * @param y1 Second y value (f(x1))
 * @param x Target x value
 * @returns Interpolated y value
 */
export function linearInterp(x0: f64, y0: f64, x1: f64, y1: f64, x: f64): f64 {
  if (x1 === x0) return y0
  const t = (x - x0) / (x1 - x0)
  return y0 + t * (y1 - y0)
}

/**
 * Linear interpolation in a table of (x, y) pairs
 * @param xValues Sorted x values
 * @param yValues Corresponding y values
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function linearInterpTable(
  xValues: Float64Array,
  yValues: Float64Array,
  x: f64,
  n: i32
): f64 {
  if (n < 2) return yValues[0]

  // Handle extrapolation
  if (x <= xValues[0]) {
    return linearInterp(xValues[0], yValues[0], xValues[1], yValues[1], x)
  }
  if (x >= xValues[n - 1]) {
    return linearInterp(
      xValues[n - 2],
      yValues[n - 2],
      xValues[n - 1],
      yValues[n - 1],
      x
    )
  }

  // Binary search for interval
  let lo: i32 = 0
  let hi: i32 = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (xValues[mid] > x) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return linearInterp(xValues[lo], yValues[lo], xValues[hi], yValues[hi], x)
}

/**
 * Bilinear interpolation on a 2D grid
 * @param x1 Lower x bound
 * @param x2 Upper x bound
 * @param y1 Lower y bound
 * @param y2 Upper y bound
 * @param q11 Value at (x1, y1)
 * @param q12 Value at (x1, y2)
 * @param q21 Value at (x2, y1)
 * @param q22 Value at (x2, y2)
 * @param x Target x
 * @param y Target y
 * @returns Interpolated value
 */
export function bilinearInterp(
  x1: f64,
  x2: f64,
  y1: f64,
  y2: f64,
  q11: f64,
  q12: f64,
  q21: f64,
  q22: f64,
  x: f64,
  y: f64
): f64 {
  const denom = (x2 - x1) * (y2 - y1)
  if (denom === 0) return q11

  const t1 = (x2 - x) * (y2 - y) * q11
  const t2 = (x - x1) * (y2 - y) * q21
  const t3 = (x2 - x) * (y - y1) * q12
  const t4 = (x - x1) * (y - y1) * q22

  return (t1 + t2 + t3 + t4) / denom
}

// ============================================================================
// LAGRANGE POLYNOMIAL INTERPOLATION
// ============================================================================

/**
 * Lagrange polynomial interpolation
 * @param xValues x coordinates of data points
 * @param yValues y coordinates of data points
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function lagrangeInterp(
  xValues: Float64Array,
  yValues: Float64Array,
  x: f64,
  n: i32
): f64 {
  let result: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    let term = yValues[i]
    for (let j: i32 = 0; j < n; j++) {
      if (j !== i) {
        term = (term * (x - xValues[j])) / (xValues[i] - xValues[j])
      }
    }
    result += term
  }

  return result
}

/**
 * Compute Lagrange basis polynomial L_i(x)
 * @param xValues x coordinates of data points
 * @param i Index of basis polynomial
 * @param x Target x value
 * @param n Number of points
 * @returns Value of L_i(x)
 */
export function lagrangeBasis(
  xValues: Float64Array,
  i: i32,
  x: f64,
  n: i32
): f64 {
  let result: f64 = 1.0

  for (let j: i32 = 0; j < n; j++) {
    if (j !== i) {
      result *= (x - xValues[j]) / (xValues[i] - xValues[j])
    }
  }

  return result
}

// ============================================================================
// NEWTON'S DIVIDED DIFFERENCES
// ============================================================================

/**
 * Compute divided difference table (in-place modification of coeffs)
 * @param xValues x coordinates
 * @param yValues y coordinates (initial values)
 * @param n Number of points
 * @returns Divided difference coefficients (modifies and returns yValues)
 */
export function dividedDifferences(
  xValues: Float64Array,
  yValues: Float64Array,
  n: i32
): Float64Array {
  // Create copy for coefficients
  const coeffs = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    coeffs[i] = yValues[i]
  }

  // Compute divided differences
  for (let j: i32 = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      coeffs[i] = (coeffs[i] - coeffs[i - 1]) / (xValues[i] - xValues[i - j])
    }
  }

  return coeffs
}

/**
 * Newton's form polynomial evaluation using Horner's method
 * @param xValues x coordinates
 * @param coeffs Divided difference coefficients
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function newtonInterp(
  xValues: Float64Array,
  coeffs: Float64Array,
  x: f64,
  n: i32
): f64 {
  // Horner's method for Newton form
  let result = coeffs[n - 1]

  for (let i = n - 2; i >= 0; i--) {
    result = result * (x - xValues[i]) + coeffs[i]
  }

  return result
}

/**
 * Combined Newton interpolation: compute coefficients and evaluate
 * @param xValues x coordinates
 * @param yValues y coordinates
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function newtonInterpFull(
  xValues: Float64Array,
  yValues: Float64Array,
  x: f64,
  n: i32
): f64 {
  const coeffs = dividedDifferences(xValues, yValues, n)
  return newtonInterp(xValues, coeffs, x, n)
}

// ============================================================================
// BARYCENTRIC INTERPOLATION
// ============================================================================

/**
 * Compute barycentric weights for interpolation
 * More numerically stable than standard Lagrange for many points
 * @param xValues x coordinates
 * @param n Number of points
 * @returns Barycentric weights
 */
export function barycentricWeights(
  xValues: Float64Array,
  n: i32
): Float64Array {
  const weights = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    let w: f64 = 1.0
    for (let j: i32 = 0; j < n; j++) {
      if (j !== i) {
        w /= xValues[i] - xValues[j]
      }
    }
    weights[i] = w
  }

  return weights
}

/**
 * Barycentric interpolation (second form)
 * O(n) evaluation after O(n²) precomputation of weights
 * @param xValues x coordinates
 * @param yValues y coordinates
 * @param weights Barycentric weights
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function barycentricInterp(
  xValues: Float64Array,
  yValues: Float64Array,
  weights: Float64Array,
  x: f64,
  n: i32
): f64 {
  // Check if x is exactly a data point
  for (let i: i32 = 0; i < n; i++) {
    if (x === xValues[i]) return yValues[i]
  }

  let numerator: f64 = 0.0
  let denominator: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const diff = x - xValues[i]
    const term = weights[i] / diff
    numerator += term * yValues[i]
    denominator += term
  }

  return numerator / denominator
}

// ============================================================================
// CUBIC SPLINE INTERPOLATION
// ============================================================================

/**
 * Compute natural cubic spline coefficients
 * Natural spline: second derivative = 0 at endpoints
 * @param xValues x coordinates (must be sorted)
 * @param yValues y coordinates
 * @param n Number of points
 * @returns Coefficient array [a0, b0, c0, d0, a1, b1, c1, d1, ...] for n-1 segments
 *          Each segment i: S_i(x) = a_i + b_i*(x-x_i) + c_i*(x-x_i)² + d_i*(x-x_i)³
 */
export function naturalCubicSplineCoeffs(
  xValues: Float64Array,
  yValues: Float64Array,
  n: i32
): Float64Array {
  if (n < 2) {
    const result = new Float64Array(4)
    result[0] = yValues[0]
    return result
  }

  const segments = n - 1
  const h = new Float64Array(segments)

  // Compute intervals
  for (let i: i32 = 0; i < segments; i++) {
    h[i] = xValues[i + 1] - xValues[i]
  }

  // Set up tridiagonal system for second derivatives
  // Natural spline: M[0] = M[n-1] = 0
  const alpha = new Float64Array(n)
  const l = new Float64Array(n)
  const mu = new Float64Array(n)
  const z = new Float64Array(n)

  l[0] = 1.0
  mu[0] = 0.0
  z[0] = 0.0

  for (let i: i32 = 1; i < segments; i++) {
    alpha[i] =
      (3.0 / h[i]) * (yValues[i + 1] - yValues[i]) -
      (3.0 / h[i - 1]) * (yValues[i] - yValues[i - 1])
    l[i] = 2.0 * (xValues[i + 1] - xValues[i - 1]) - h[i - 1] * mu[i - 1]
    mu[i] = h[i] / l[i]
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i]
  }

  l[n - 1] = 1.0
  z[n - 1] = 0.0

  // Second derivatives (c coefficients)
  const c = new Float64Array(n)
  c[n - 1] = 0.0

  for (let j = segments - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1]
  }

  // Compute all coefficients
  const coeffs = new Float64Array(segments * 4)

  for (let i: i32 = 0; i < segments; i++) {
    const a = yValues[i]
    const b =
      (yValues[i + 1] - yValues[i]) / h[i] -
      (h[i] * (c[i + 1] + 2.0 * c[i])) / 3.0
    const d = (c[i + 1] - c[i]) / (3.0 * h[i])

    coeffs[i * 4] = a
    coeffs[i * 4 + 1] = b
    coeffs[i * 4 + 2] = c[i]
    coeffs[i * 4 + 3] = d
  }

  return coeffs
}

/**
 * Compute clamped cubic spline coefficients
 * Clamped spline: first derivative specified at endpoints
 * @param xValues x coordinates (must be sorted)
 * @param yValues y coordinates
 * @param n Number of points
 * @param fp0 First derivative at x[0]
 * @param fpn First derivative at x[n-1]
 * @returns Coefficient array [a0, b0, c0, d0, ...] for n-1 segments
 */
export function clampedCubicSplineCoeffs(
  xValues: Float64Array,
  yValues: Float64Array,
  n: i32,
  fp0: f64,
  fpn: f64
): Float64Array {
  if (n < 2) {
    const result = new Float64Array(4)
    result[0] = yValues[0]
    result[1] = fp0
    return result
  }

  const segments = n - 1
  const h = new Float64Array(segments)

  for (let i: i32 = 0; i < segments; i++) {
    h[i] = xValues[i + 1] - xValues[i]
  }

  const alpha = new Float64Array(n)
  alpha[0] = (3.0 * (yValues[1] - yValues[0])) / h[0] - 3.0 * fp0
  alpha[n - 1] =
    3.0 * fpn - (3.0 * (yValues[n - 1] - yValues[n - 2])) / h[segments - 1]

  for (let i: i32 = 1; i < segments; i++) {
    alpha[i] =
      (3.0 / h[i]) * (yValues[i + 1] - yValues[i]) -
      (3.0 / h[i - 1]) * (yValues[i] - yValues[i - 1])
  }

  const l = new Float64Array(n)
  const mu = new Float64Array(n)
  const z = new Float64Array(n)

  l[0] = 2.0 * h[0]
  mu[0] = 0.5
  z[0] = alpha[0] / l[0]

  for (let i: i32 = 1; i < segments; i++) {
    l[i] = 2.0 * (xValues[i + 1] - xValues[i - 1]) - h[i - 1] * mu[i - 1]
    mu[i] = h[i] / l[i]
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i]
  }

  l[n - 1] = h[segments - 1] * (2.0 - mu[segments - 1])
  z[n - 1] = (alpha[n - 1] - h[segments - 1] * z[segments - 1]) / l[n - 1]

  const c = new Float64Array(n)
  c[n - 1] = z[n - 1]

  for (let j = segments - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1]
  }

  const coeffs = new Float64Array(segments * 4)

  for (let i: i32 = 0; i < segments; i++) {
    const a = yValues[i]
    const b =
      (yValues[i + 1] - yValues[i]) / h[i] -
      (h[i] * (c[i + 1] + 2.0 * c[i])) / 3.0
    const d = (c[i + 1] - c[i]) / (3.0 * h[i])

    coeffs[i * 4] = a
    coeffs[i * 4 + 1] = b
    coeffs[i * 4 + 2] = c[i]
    coeffs[i * 4 + 3] = d
  }

  return coeffs
}

/**
 * Evaluate cubic spline at a point
 * @param xValues Original x coordinates
 * @param coeffs Spline coefficients from naturalCubicSplineCoeffs or clampedCubicSplineCoeffs
 * @param x Target x value
 * @param n Number of original points
 * @returns Interpolated y value
 */
export function cubicSplineEval(
  xValues: Float64Array,
  coeffs: Float64Array,
  x: f64,
  n: i32
): f64 {
  const segments = n - 1

  // Find segment
  let seg: i32 = 0
  if (x <= xValues[0]) {
    seg = 0
  } else if (x >= xValues[n - 1]) {
    seg = segments - 1
  } else {
    // Binary search
    let lo: i32 = 0
    let hi: i32 = segments
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xValues[mid] > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  // Evaluate polynomial
  const dx = x - xValues[seg]
  const a = coeffs[seg * 4]
  const b = coeffs[seg * 4 + 1]
  const c = coeffs[seg * 4 + 2]
  const d = coeffs[seg * 4 + 3]

  // Horner's method: a + dx*(b + dx*(c + dx*d))
  return a + dx * (b + dx * (c + dx * d))
}

/**
 * Evaluate cubic spline derivative at a point
 * @param xValues Original x coordinates
 * @param coeffs Spline coefficients
 * @param x Target x value
 * @param n Number of original points
 * @returns Derivative value
 */
export function cubicSplineDerivative(
  xValues: Float64Array,
  coeffs: Float64Array,
  x: f64,
  n: i32
): f64 {
  const segments = n - 1

  // Find segment
  let seg: i32 = 0
  if (x <= xValues[0]) {
    seg = 0
  } else if (x >= xValues[n - 1]) {
    seg = segments - 1
  } else {
    let lo: i32 = 0
    let hi: i32 = segments
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xValues[mid] > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  const dx = x - xValues[seg]
  const b = coeffs[seg * 4 + 1]
  const c = coeffs[seg * 4 + 2]
  const d = coeffs[seg * 4 + 3]

  // Derivative: b + 2*c*dx + 3*d*dx²
  return b + dx * (2.0 * c + 3.0 * d * dx)
}

// ============================================================================
// HERMITE INTERPOLATION
// ============================================================================

/**
 * Hermite interpolation with function values and derivatives
 * @param x0 First point x
 * @param y0 Value at x0
 * @param dy0 Derivative at x0
 * @param x1 Second point x
 * @param y1 Value at x1
 * @param dy1 Derivative at x1
 * @param x Target x
 * @returns Interpolated value
 */
export function hermiteInterp(
  x0: f64,
  y0: f64,
  dy0: f64,
  x1: f64,
  y1: f64,
  dy1: f64,
  x: f64
): f64 {
  const h = x1 - x0
  if (h === 0) return y0

  const t = (x - x0) / h
  const t2 = t * t
  const t3 = t2 * t

  // Hermite basis functions
  const h00 = 2.0 * t3 - 3.0 * t2 + 1.0
  const h10 = t3 - 2.0 * t2 + t
  const h01 = -2.0 * t3 + 3.0 * t2
  const h11 = t3 - t2

  return h00 * y0 + h10 * h * dy0 + h01 * y1 + h11 * h * dy1
}

/**
 * Piecewise Hermite interpolation (Pchip-like)
 * Uses Fritsch-Carlson monotonicity-preserving tangent estimation
 * @param xValues x coordinates
 * @param yValues y coordinates
 * @param x Target x
 * @param n Number of points
 * @returns Interpolated value
 */
export function pchipInterp(
  xValues: Float64Array,
  yValues: Float64Array,
  x: f64,
  n: i32
): f64 {
  if (n < 2) return yValues[0]

  // Compute slopes at each point
  const slopes = new Float64Array(n)

  // Interior points
  for (let i: i32 = 1; i < n - 1; i++) {
    const h0 = xValues[i] - xValues[i - 1]
    const h1 = xValues[i + 1] - xValues[i]
    const d0 = (yValues[i] - yValues[i - 1]) / h0
    const d1 = (yValues[i + 1] - yValues[i]) / h1

    // Fritsch-Carlson: weighted harmonic mean for monotonicity
    if (d0 * d1 > 0) {
      const w0 = 2.0 * h1 + h0
      const w1 = h1 + 2.0 * h0
      slopes[i] = (w0 + w1) / (w0 / d0 + w1 / d1)
    } else {
      slopes[i] = 0.0
    }
  }

  // Endpoints: one-sided differences
  slopes[0] = (yValues[1] - yValues[0]) / (xValues[1] - xValues[0])
  slopes[n - 1] =
    (yValues[n - 1] - yValues[n - 2]) / (xValues[n - 1] - xValues[n - 2])

  // Find segment
  let seg: i32 = 0
  if (x <= xValues[0]) {
    seg = 0
  } else if (x >= xValues[n - 1]) {
    seg = n - 2
  } else {
    let lo: i32 = 0
    let hi: i32 = n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xValues[mid] > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  return hermiteInterp(
    xValues[seg],
    yValues[seg],
    slopes[seg],
    xValues[seg + 1],
    yValues[seg + 1],
    slopes[seg + 1],
    x
  )
}

// ============================================================================
// AKIMA INTERPOLATION
// ============================================================================

/**
 * Akima interpolation
 * Avoids oscillations in regions where data is locally flat
 * @param xValues x coordinates
 * @param yValues y coordinates
 * @param x Target x
 * @param n Number of points
 * @returns Interpolated value
 */
export function akimaInterp(
  xValues: Float64Array,
  yValues: Float64Array,
  x: f64,
  n: i32
): f64 {
  if (n < 2) return yValues[0]
  if (n < 5) {
    // Fall back to pchip for small n
    return pchipInterp(xValues, yValues, x, n)
  }

  // Compute slopes between points
  const m = new Float64Array(n + 3)

  for (let i: i32 = 0; i < n - 1; i++) {
    m[i + 2] = (yValues[i + 1] - yValues[i]) / (xValues[i + 1] - xValues[i])
  }

  // Extrapolate end slopes
  m[1] = 2.0 * m[2] - m[3]
  m[0] = 2.0 * m[1] - m[2]
  m[n + 1] = 2.0 * m[n] - m[n - 1]
  m[n + 2] = 2.0 * m[n + 1] - m[n]

  // Compute Akima weights
  const t = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    const w1 = Math.abs(m[i + 3] - m[i + 2])
    const w2 = Math.abs(m[i + 1] - m[i])

    if (w1 + w2 !== 0) {
      t[i] = (w1 * m[i + 1] + w2 * m[i + 2]) / (w1 + w2)
    } else {
      t[i] = 0.5 * (m[i + 1] + m[i + 2])
    }
  }

  // Find segment
  let seg: i32 = 0
  if (x <= xValues[0]) {
    seg = 0
  } else if (x >= xValues[n - 1]) {
    seg = n - 2
  } else {
    let lo: i32 = 0
    let hi: i32 = n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xValues[mid] > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  return hermiteInterp(
    xValues[seg],
    yValues[seg],
    t[seg],
    xValues[seg + 1],
    yValues[seg + 1],
    t[seg + 1],
    x
  )
}

// ============================================================================
// POLYNOMIAL EVALUATION UTILITIES
// ============================================================================

/**
 * Evaluate polynomial using Horner's method
 * p(x) = coeffs[0] + coeffs[1]*x + coeffs[2]*x² + ...
 * @param coeffs Polynomial coefficients [a0, a1, a2, ...]
 * @param x Target x
 * @param degree Degree of polynomial (length - 1)
 * @returns p(x)
 */
export function polyEval(coeffs: Float64Array, x: f64, degree: i32): f64 {
  let result = coeffs[degree]

  for (let i = degree - 1; i >= 0; i--) {
    result = result * x + coeffs[i]
  }

  return result
}

/**
 * Polynomial derivative evaluation
 * @param coeffs Polynomial coefficients [a0, a1, a2, ...]
 * @param x Target x
 * @param degree Degree of polynomial
 * @returns p'(x)
 */
export function polyDerivEval(coeffs: Float64Array, x: f64, degree: i32): f64 {
  if (degree < 1) return 0.0

  // Derivative coefficients: [a1, 2*a2, 3*a3, ...]
  let result = f64(degree) * coeffs[degree]

  for (let i = degree - 1; i >= 1; i--) {
    result = result * x + f64(i) * coeffs[i]
  }

  return result
}

/**
 * Fit polynomial to data using least squares (normal equations)
 * @param xValues x coordinates
 * @param yValues y coordinates
 * @param n Number of points
 * @param degree Polynomial degree
 * @returns Polynomial coefficients [a0, a1, a2, ...]
 */
export function polyFit(
  xValues: Float64Array,
  yValues: Float64Array,
  n: i32,
  degree: i32
): Float64Array {
  const m = degree + 1

  // Build normal equations: A^T * A * c = A^T * y
  // Where A is the Vandermonde matrix

  const ATA = new Float64Array(m * m)
  const ATy = new Float64Array(m)

  // Compute A^T * A and A^T * y
  for (let i: i32 = 0; i < n; i++) {
    const xi = xValues[i]
    const yi = yValues[i]

    let xpowi: f64 = 1.0
    for (let j: i32 = 0; j < m; j++) {
      ATy[j] += xpowi * yi

      let xpowk = xpowi
      for (let k: i32 = j; k < m; k++) {
        ATA[j * m + k] += xpowk
        if (k !== j) {
          ATA[k * m + j] += xpowk
        }
        xpowk *= xi
      }
      xpowi *= xi
    }
  }

  // Solve using simple Gaussian elimination
  // (For production, use proper pivoting)
  for (let k: i32 = 0; k < m; k++) {
    // Find pivot
    let maxVal = Math.abs(ATA[k * m + k])
    let maxRow = k
    for (let i = k + 1; i < m; i++) {
      const val = Math.abs(ATA[i * m + k])
      if (val > maxVal) {
        maxVal = val
        maxRow = i
      }
    }

    // Swap rows
    if (maxRow !== k) {
      for (let j: i32 = 0; j < m; j++) {
        const tmp = ATA[k * m + j]
        ATA[k * m + j] = ATA[maxRow * m + j]
        ATA[maxRow * m + j] = tmp
      }
      const tmp = ATy[k]
      ATy[k] = ATy[maxRow]
      ATy[maxRow] = tmp
    }

    // Eliminate
    const pivot = ATA[k * m + k]
    if (Math.abs(pivot) < 1e-14) continue

    for (let i = k + 1; i < m; i++) {
      const factor = ATA[i * m + k] / pivot
      for (let j = k + 1; j < m; j++) {
        ATA[i * m + j] -= factor * ATA[k * m + j]
      }
      ATy[i] -= factor * ATy[k]
    }
  }

  // Back substitution
  const coeffs = new Float64Array(m)
  for (let i = m - 1; i >= 0; i--) {
    let sum = ATy[i]
    for (let j = i + 1; j < m; j++) {
      sum -= ATA[i * m + j] * coeffs[j]
    }
    const diag = ATA[i * m + i]
    coeffs[i] = Math.abs(diag) > 1e-14 ? sum / diag : 0.0
  }

  return coeffs
}

// ============================================================================
// BATCH INTERPOLATION
// ============================================================================

/**
 * Evaluate interpolation at multiple points
 * @param xValues Data x coordinates
 * @param yValues Data y coordinates
 * @param n Number of data points
 * @param xTargets Target x values
 * @param nTargets Number of targets
 * @param method 0=linear, 1=lagrange, 2=spline, 3=pchip, 4=akima
 * @returns Array of interpolated values
 */
export function batchInterpolate(
  xValues: Float64Array,
  yValues: Float64Array,
  n: i32,
  xTargets: Float64Array,
  nTargets: i32,
  method: i32
): Float64Array {
  const results = new Float64Array(nTargets)

  // Precompute coefficients for spline methods
  let splineCoeffs: Float64Array | null = null
  let baryWeights: Float64Array | null = null

  if (method === 2) {
    splineCoeffs = naturalCubicSplineCoeffs(xValues, yValues, n)
  } else if (method === 1 && n > 10) {
    // Use barycentric for many points
    baryWeights = barycentricWeights(xValues, n)
  }

  for (let i: i32 = 0; i < nTargets; i++) {
    const x = xTargets[i]

    if (method === 0) {
      results[i] = linearInterpTable(xValues, yValues, x, n)
    } else if (method === 1) {
      if (baryWeights !== null) {
        results[i] = barycentricInterp(xValues, yValues, baryWeights!, x, n)
      } else {
        results[i] = lagrangeInterp(xValues, yValues, x, n)
      }
    } else if (method === 2) {
      results[i] = cubicSplineEval(xValues, splineCoeffs!, x, n)
    } else if (method === 3) {
      results[i] = pchipInterp(xValues, yValues, x, n)
    } else if (method === 4) {
      results[i] = akimaInterp(xValues, yValues, x, n)
    } else {
      results[i] = linearInterpTable(xValues, yValues, x, n)
    }
  }

  return results
}
