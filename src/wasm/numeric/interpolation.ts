/**
 * Interpolation algorithms for AssemblyScript/WASM
 *
 * WASM-compatible implementations of interpolation methods.
 * These provide numerical alternatives to expression-based interpolation.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
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
 * @param xValuesPtr Pointer to sorted x values (f64)
 * @param yValuesPtr Pointer to corresponding y values (f64)
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function linearInterpTable(
  xValuesPtr: usize,
  yValuesPtr: usize,
  x: f64,
  n: i32
): f64 {
  if (n < 2) return load<f64>(yValuesPtr)

  const x0: f64 = load<f64>(xValuesPtr)
  const x1: f64 = load<f64>(xValuesPtr + 8)
  const xn1: f64 = load<f64>(xValuesPtr + (<usize>(n - 1) << 3))
  const xn2: f64 = load<f64>(xValuesPtr + (<usize>(n - 2) << 3))

  // Handle extrapolation
  if (x <= x0) {
    return linearInterp(
      x0,
      load<f64>(yValuesPtr),
      x1,
      load<f64>(yValuesPtr + 8),
      x
    )
  }
  if (x >= xn1) {
    return linearInterp(
      xn2,
      load<f64>(yValuesPtr + (<usize>(n - 2) << 3)),
      xn1,
      load<f64>(yValuesPtr + (<usize>(n - 1) << 3)),
      x
    )
  }

  // Binary search for interval
  let lo: i32 = 0
  let hi: i32 = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (load<f64>(xValuesPtr + (<usize>mid << 3)) > x) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return linearInterp(
    load<f64>(xValuesPtr + (<usize>lo << 3)),
    load<f64>(yValuesPtr + (<usize>lo << 3)),
    load<f64>(xValuesPtr + (<usize>hi << 3)),
    load<f64>(yValuesPtr + (<usize>hi << 3)),
    x
  )
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
 * @param xValuesPtr Pointer to x coordinates of data points (f64)
 * @param yValuesPtr Pointer to y coordinates of data points (f64)
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function lagrangeInterp(
  xValuesPtr: usize,
  yValuesPtr: usize,
  x: f64,
  n: i32
): f64 {
  let result: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    let term = load<f64>(yValuesPtr + (<usize>i << 3))
    const xi = load<f64>(xValuesPtr + (<usize>i << 3))
    for (let j: i32 = 0; j < n; j++) {
      if (j !== i) {
        const xj = load<f64>(xValuesPtr + (<usize>j << 3))
        term = (term * (x - xj)) / (xi - xj)
      }
    }
    result += term
  }

  return result
}

/**
 * Compute Lagrange basis polynomial L_i(x)
 * @param xValuesPtr Pointer to x coordinates of data points (f64)
 * @param i Index of basis polynomial
 * @param x Target x value
 * @param n Number of points
 * @returns Value of L_i(x)
 */
export function lagrangeBasis(
  xValuesPtr: usize,
  i: i32,
  x: f64,
  n: i32
): f64 {
  let result: f64 = 1.0
  const xi = load<f64>(xValuesPtr + (<usize>i << 3))

  for (let j: i32 = 0; j < n; j++) {
    if (j !== i) {
      const xj = load<f64>(xValuesPtr + (<usize>j << 3))
      result *= (x - xj) / (xi - xj)
    }
  }

  return result
}

// ============================================================================
// NEWTON'S DIVIDED DIFFERENCES
// ============================================================================

/**
 * Compute divided difference table (writes coefficients to result)
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param n Number of points
 * @param coeffsPtr Pointer to output coefficients (f64, n elements)
 */
export function dividedDifferences(
  xValuesPtr: usize,
  yValuesPtr: usize,
  n: i32,
  coeffsPtr: usize
): void {
  // Copy y values to coefficients
  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    store<f64>(coeffsPtr + offset, load<f64>(yValuesPtr + offset))
  }

  // Compute divided differences
  for (let j: i32 = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      const xi = load<f64>(xValuesPtr + (<usize>i << 3))
      const xij = load<f64>(xValuesPtr + (<usize>(i - j) << 3))
      const ci = load<f64>(coeffsPtr + (<usize>i << 3))
      const cim1 = load<f64>(coeffsPtr + (<usize>(i - 1) << 3))
      store<f64>(coeffsPtr + (<usize>i << 3), (ci - cim1) / (xi - xij))
    }
  }
}

/**
 * Newton's form polynomial evaluation using Horner's method
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param coeffsPtr Pointer to divided difference coefficients (f64)
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function newtonInterp(
  xValuesPtr: usize,
  coeffsPtr: usize,
  x: f64,
  n: i32
): f64 {
  // Horner's method for Newton form
  let result = load<f64>(coeffsPtr + (<usize>(n - 1) << 3))

  for (let i = n - 2; i >= 0; i--) {
    result = result * (x - load<f64>(xValuesPtr + (<usize>i << 3))) + load<f64>(coeffsPtr + (<usize>i << 3))
  }

  return result
}

/**
 * Combined Newton interpolation: compute coefficients and evaluate
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param x Target x value
 * @param n Number of points
 * @param workPtr Pointer to working memory for coefficients (f64, n elements)
 * @returns Interpolated y value
 */
export function newtonInterpFull(
  xValuesPtr: usize,
  yValuesPtr: usize,
  x: f64,
  n: i32,
  workPtr: usize
): f64 {
  dividedDifferences(xValuesPtr, yValuesPtr, n, workPtr)
  return newtonInterp(xValuesPtr, workPtr, x, n)
}

// ============================================================================
// BARYCENTRIC INTERPOLATION
// ============================================================================

/**
 * Compute barycentric weights for interpolation
 * More numerically stable than standard Lagrange for many points
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param n Number of points
 * @param weightsPtr Pointer to output weights (f64, n elements)
 */
export function barycentricWeights(
  xValuesPtr: usize,
  n: i32,
  weightsPtr: usize
): void {
  for (let i: i32 = 0; i < n; i++) {
    let w: f64 = 1.0
    const xi = load<f64>(xValuesPtr + (<usize>i << 3))
    for (let j: i32 = 0; j < n; j++) {
      if (j !== i) {
        w /= xi - load<f64>(xValuesPtr + (<usize>j << 3))
      }
    }
    store<f64>(weightsPtr + (<usize>i << 3), w)
  }
}

/**
 * Barycentric interpolation (second form)
 * O(n) evaluation after O(n²) precomputation of weights
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param weightsPtr Pointer to barycentric weights (f64)
 * @param x Target x value
 * @param n Number of points
 * @returns Interpolated y value
 */
export function barycentricInterp(
  xValuesPtr: usize,
  yValuesPtr: usize,
  weightsPtr: usize,
  x: f64,
  n: i32
): f64 {
  // Check if x is exactly a data point
  for (let i: i32 = 0; i < n; i++) {
    const xi = load<f64>(xValuesPtr + (<usize>i << 3))
    if (x === xi) return load<f64>(yValuesPtr + (<usize>i << 3))
  }

  let numerator: f64 = 0.0
  let denominator: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = <usize>i << 3
    const diff = x - load<f64>(xValuesPtr + offset)
    const term = load<f64>(weightsPtr + offset) / diff
    numerator += term * load<f64>(yValuesPtr + offset)
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
 * @param xValuesPtr Pointer to x coordinates (must be sorted) (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param n Number of points
 * @param coeffsPtr Pointer to output coefficients (f64, (n-1)*4 elements)
 *                  Each segment i: [a_i, b_i, c_i, d_i]
 *                  S_i(x) = a_i + b_i*(x-x_i) + c_i*(x-x_i)² + d_i*(x-x_i)³
 * @param workPtr Pointer to working memory (f64, at least 6*n elements)
 */
export function naturalCubicSplineCoeffs(
  xValuesPtr: usize,
  yValuesPtr: usize,
  n: i32,
  coeffsPtr: usize,
  workPtr: usize
): void {
  if (n < 2) {
    store<f64>(coeffsPtr, load<f64>(yValuesPtr))
    return
  }

  const segments = n - 1

  // Working memory layout: h, alpha, l, mu, z, c
  // Each array is n elements (some need fewer but for simplicity)
  const hPtr: usize = workPtr
  const alphaPtr: usize = workPtr + (<usize>n << 3)
  const lPtr: usize = workPtr + (<usize>(2 * n) << 3)
  const muPtr: usize = workPtr + (<usize>(3 * n) << 3)
  const zPtr: usize = workPtr + (<usize>(4 * n) << 3)
  const cPtr: usize = workPtr + (<usize>(5 * n) << 3)

  // Compute intervals
  for (let i: i32 = 0; i < segments; i++) {
    store<f64>(
      hPtr + (<usize>i << 3),
      load<f64>(xValuesPtr + (<usize>(i + 1) << 3)) - load<f64>(xValuesPtr + (<usize>i << 3))
    )
  }

  // Set up tridiagonal system for second derivatives
  // Natural spline: M[0] = M[n-1] = 0
  store<f64>(lPtr, 1.0)
  store<f64>(muPtr, 0.0)
  store<f64>(zPtr, 0.0)

  for (let i: i32 = 1; i < segments; i++) {
    const hi = load<f64>(hPtr + (<usize>i << 3))
    const him1 = load<f64>(hPtr + (<usize>(i - 1) << 3))
    const yi = load<f64>(yValuesPtr + (<usize>i << 3))
    const yip1 = load<f64>(yValuesPtr + (<usize>(i + 1) << 3))
    const yim1 = load<f64>(yValuesPtr + (<usize>(i - 1) << 3))

    const alpha =
      (3.0 / hi) * (yip1 - yi) -
      (3.0 / him1) * (yi - yim1)

    const xip1 = load<f64>(xValuesPtr + (<usize>(i + 1) << 3))
    const xim1 = load<f64>(xValuesPtr + (<usize>(i - 1) << 3))
    const muim1 = load<f64>(muPtr + (<usize>(i - 1) << 3))
    const zim1 = load<f64>(zPtr + (<usize>(i - 1) << 3))

    const l = 2.0 * (xip1 - xim1) - him1 * muim1
    store<f64>(lPtr + (<usize>i << 3), l)
    store<f64>(muPtr + (<usize>i << 3), hi / l)
    store<f64>(zPtr + (<usize>i << 3), (alpha - him1 * zim1) / l)
  }

  store<f64>(lPtr + (<usize>(n - 1) << 3), 1.0)
  store<f64>(zPtr + (<usize>(n - 1) << 3), 0.0)

  // Second derivatives (c coefficients)
  store<f64>(cPtr + (<usize>(n - 1) << 3), 0.0)

  for (let j = segments - 1; j >= 0; j--) {
    const zj = load<f64>(zPtr + (<usize>j << 3))
    const muj = load<f64>(muPtr + (<usize>j << 3))
    const cjp1 = load<f64>(cPtr + (<usize>(j + 1) << 3))
    store<f64>(cPtr + (<usize>j << 3), zj - muj * cjp1)
  }

  // Compute all coefficients
  for (let i: i32 = 0; i < segments; i++) {
    const hi = load<f64>(hPtr + (<usize>i << 3))
    const yi = load<f64>(yValuesPtr + (<usize>i << 3))
    const yip1 = load<f64>(yValuesPtr + (<usize>(i + 1) << 3))
    const ci = load<f64>(cPtr + (<usize>i << 3))
    const cip1 = load<f64>(cPtr + (<usize>(i + 1) << 3))

    const a = yi
    const b = (yip1 - yi) / hi - (hi * (cip1 + 2.0 * ci)) / 3.0
    const d = (cip1 - ci) / (3.0 * hi)

    const base: usize = <usize>(i * 4) << 3
    store<f64>(coeffsPtr + base, a)
    store<f64>(coeffsPtr + base + 8, b)
    store<f64>(coeffsPtr + base + 16, ci)
    store<f64>(coeffsPtr + base + 24, d)
  }
}

/**
 * Compute clamped cubic spline coefficients
 * Clamped spline: first derivative specified at endpoints
 * @param xValuesPtr Pointer to x coordinates (must be sorted) (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param n Number of points
 * @param fp0 First derivative at x[0]
 * @param fpn First derivative at x[n-1]
 * @param coeffsPtr Pointer to output coefficients (f64, (n-1)*4 elements)
 * @param workPtr Pointer to working memory (f64, at least 6*n elements)
 */
export function clampedCubicSplineCoeffs(
  xValuesPtr: usize,
  yValuesPtr: usize,
  n: i32,
  fp0: f64,
  fpn: f64,
  coeffsPtr: usize,
  workPtr: usize
): void {
  if (n < 2) {
    store<f64>(coeffsPtr, load<f64>(yValuesPtr))
    store<f64>(coeffsPtr + 8, fp0)
    return
  }

  const segments = n - 1

  // Working memory layout
  const hPtr: usize = workPtr
  const alphaPtr: usize = workPtr + (<usize>n << 3)
  const lPtr: usize = workPtr + (<usize>(2 * n) << 3)
  const muPtr: usize = workPtr + (<usize>(3 * n) << 3)
  const zPtr: usize = workPtr + (<usize>(4 * n) << 3)
  const cPtr: usize = workPtr + (<usize>(5 * n) << 3)

  for (let i: i32 = 0; i < segments; i++) {
    store<f64>(
      hPtr + (<usize>i << 3),
      load<f64>(xValuesPtr + (<usize>(i + 1) << 3)) - load<f64>(xValuesPtr + (<usize>i << 3))
    )
  }

  const h0 = load<f64>(hPtr)
  const y0 = load<f64>(yValuesPtr)
  const y1 = load<f64>(yValuesPtr + 8)
  store<f64>(alphaPtr, (3.0 * (y1 - y0)) / h0 - 3.0 * fp0)

  const hn1 = load<f64>(hPtr + (<usize>(segments - 1) << 3))
  const yn1 = load<f64>(yValuesPtr + (<usize>(n - 1) << 3))
  const yn2 = load<f64>(yValuesPtr + (<usize>(n - 2) << 3))
  store<f64>(alphaPtr + (<usize>(n - 1) << 3), 3.0 * fpn - (3.0 * (yn1 - yn2)) / hn1)

  for (let i: i32 = 1; i < segments; i++) {
    const hi = load<f64>(hPtr + (<usize>i << 3))
    const him1 = load<f64>(hPtr + (<usize>(i - 1) << 3))
    const yi = load<f64>(yValuesPtr + (<usize>i << 3))
    const yip1 = load<f64>(yValuesPtr + (<usize>(i + 1) << 3))
    const yim1 = load<f64>(yValuesPtr + (<usize>(i - 1) << 3))
    store<f64>(
      alphaPtr + (<usize>i << 3),
      (3.0 / hi) * (yip1 - yi) - (3.0 / him1) * (yi - yim1)
    )
  }

  store<f64>(lPtr, 2.0 * h0)
  store<f64>(muPtr, 0.5)
  store<f64>(zPtr, load<f64>(alphaPtr) / load<f64>(lPtr))

  for (let i: i32 = 1; i < segments; i++) {
    const hi = load<f64>(hPtr + (<usize>i << 3))
    const him1 = load<f64>(hPtr + (<usize>(i - 1) << 3))
    const xip1 = load<f64>(xValuesPtr + (<usize>(i + 1) << 3))
    const xim1 = load<f64>(xValuesPtr + (<usize>(i - 1) << 3))
    const muim1 = load<f64>(muPtr + (<usize>(i - 1) << 3))
    const zim1 = load<f64>(zPtr + (<usize>(i - 1) << 3))
    const alphai = load<f64>(alphaPtr + (<usize>i << 3))

    const l = 2.0 * (xip1 - xim1) - him1 * muim1
    store<f64>(lPtr + (<usize>i << 3), l)
    store<f64>(muPtr + (<usize>i << 3), hi / l)
    store<f64>(zPtr + (<usize>i << 3), (alphai - him1 * zim1) / l)
  }

  const musm1 = load<f64>(muPtr + (<usize>(segments - 1) << 3))
  const hsm1 = load<f64>(hPtr + (<usize>(segments - 1) << 3))
  store<f64>(lPtr + (<usize>(n - 1) << 3), hsm1 * (2.0 - musm1))

  const zsm1 = load<f64>(zPtr + (<usize>(segments - 1) << 3))
  const alphan1 = load<f64>(alphaPtr + (<usize>(n - 1) << 3))
  const ln1 = load<f64>(lPtr + (<usize>(n - 1) << 3))
  store<f64>(zPtr + (<usize>(n - 1) << 3), (alphan1 - hsm1 * zsm1) / ln1)

  store<f64>(cPtr + (<usize>(n - 1) << 3), load<f64>(zPtr + (<usize>(n - 1) << 3)))

  for (let j = segments - 1; j >= 0; j--) {
    const zj = load<f64>(zPtr + (<usize>j << 3))
    const muj = load<f64>(muPtr + (<usize>j << 3))
    const cjp1 = load<f64>(cPtr + (<usize>(j + 1) << 3))
    store<f64>(cPtr + (<usize>j << 3), zj - muj * cjp1)
  }

  for (let i: i32 = 0; i < segments; i++) {
    const hi = load<f64>(hPtr + (<usize>i << 3))
    const yi = load<f64>(yValuesPtr + (<usize>i << 3))
    const yip1 = load<f64>(yValuesPtr + (<usize>(i + 1) << 3))
    const ci = load<f64>(cPtr + (<usize>i << 3))
    const cip1 = load<f64>(cPtr + (<usize>(i + 1) << 3))

    const a = yi
    const b = (yip1 - yi) / hi - (hi * (cip1 + 2.0 * ci)) / 3.0
    const d = (cip1 - ci) / (3.0 * hi)

    const base: usize = <usize>(i * 4) << 3
    store<f64>(coeffsPtr + base, a)
    store<f64>(coeffsPtr + base + 8, b)
    store<f64>(coeffsPtr + base + 16, ci)
    store<f64>(coeffsPtr + base + 24, d)
  }
}

/**
 * Evaluate cubic spline at a point
 * @param xValuesPtr Pointer to original x coordinates (f64)
 * @param coeffsPtr Pointer to spline coefficients from naturalCubicSplineCoeffs or clampedCubicSplineCoeffs
 * @param x Target x value
 * @param n Number of original points
 * @returns Interpolated y value
 */
export function cubicSplineEval(
  xValuesPtr: usize,
  coeffsPtr: usize,
  x: f64,
  n: i32
): f64 {
  const segments = n - 1

  // Find segment
  let seg: i32 = 0
  const x0 = load<f64>(xValuesPtr)
  const xn1 = load<f64>(xValuesPtr + (<usize>(n - 1) << 3))

  if (x <= x0) {
    seg = 0
  } else if (x >= xn1) {
    seg = segments - 1
  } else {
    // Binary search
    let lo: i32 = 0
    let hi: i32 = segments
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (load<f64>(xValuesPtr + (<usize>mid << 3)) > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  // Evaluate polynomial
  const dx = x - load<f64>(xValuesPtr + (<usize>seg << 3))
  const base: usize = <usize>(seg * 4) << 3
  const a = load<f64>(coeffsPtr + base)
  const b = load<f64>(coeffsPtr + base + 8)
  const c = load<f64>(coeffsPtr + base + 16)
  const d = load<f64>(coeffsPtr + base + 24)

  // Horner's method: a + dx*(b + dx*(c + dx*d))
  return a + dx * (b + dx * (c + dx * d))
}

/**
 * Evaluate cubic spline derivative at a point
 * @param xValuesPtr Pointer to original x coordinates (f64)
 * @param coeffsPtr Pointer to spline coefficients
 * @param x Target x value
 * @param n Number of original points
 * @returns Derivative value
 */
export function cubicSplineDerivative(
  xValuesPtr: usize,
  coeffsPtr: usize,
  x: f64,
  n: i32
): f64 {
  const segments = n - 1

  // Find segment
  let seg: i32 = 0
  const x0 = load<f64>(xValuesPtr)
  const xn1 = load<f64>(xValuesPtr + (<usize>(n - 1) << 3))

  if (x <= x0) {
    seg = 0
  } else if (x >= xn1) {
    seg = segments - 1
  } else {
    let lo: i32 = 0
    let hi: i32 = segments
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (load<f64>(xValuesPtr + (<usize>mid << 3)) > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  const dx = x - load<f64>(xValuesPtr + (<usize>seg << 3))
  const base: usize = <usize>(seg * 4) << 3
  const b = load<f64>(coeffsPtr + base + 8)
  const c = load<f64>(coeffsPtr + base + 16)
  const d = load<f64>(coeffsPtr + base + 24)

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
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param x Target x
 * @param n Number of points
 * @param workPtr Pointer to working memory for slopes (f64, n elements)
 * @returns Interpolated value
 */
export function pchipInterp(
  xValuesPtr: usize,
  yValuesPtr: usize,
  x: f64,
  n: i32,
  workPtr: usize
): f64 {
  if (n < 2) return load<f64>(yValuesPtr)

  // Compute slopes at each point (store in workPtr)

  // Interior points
  for (let i: i32 = 1; i < n - 1; i++) {
    const xi = load<f64>(xValuesPtr + (<usize>i << 3))
    const xim1 = load<f64>(xValuesPtr + (<usize>(i - 1) << 3))
    const xip1 = load<f64>(xValuesPtr + (<usize>(i + 1) << 3))
    const yi = load<f64>(yValuesPtr + (<usize>i << 3))
    const yim1 = load<f64>(yValuesPtr + (<usize>(i - 1) << 3))
    const yip1 = load<f64>(yValuesPtr + (<usize>(i + 1) << 3))

    const h0 = xi - xim1
    const h1 = xip1 - xi
    const d0 = (yi - yim1) / h0
    const d1 = (yip1 - yi) / h1

    // Fritsch-Carlson: weighted harmonic mean for monotonicity
    if (d0 * d1 > 0) {
      const w0 = 2.0 * h1 + h0
      const w1 = h1 + 2.0 * h0
      store<f64>(workPtr + (<usize>i << 3), (w0 + w1) / (w0 / d0 + w1 / d1))
    } else {
      store<f64>(workPtr + (<usize>i << 3), 0.0)
    }
  }

  // Endpoints: one-sided differences
  const y0 = load<f64>(yValuesPtr)
  const y1 = load<f64>(yValuesPtr + 8)
  const x0 = load<f64>(xValuesPtr)
  const x1 = load<f64>(xValuesPtr + 8)
  store<f64>(workPtr, (y1 - y0) / (x1 - x0))

  const yn1 = load<f64>(yValuesPtr + (<usize>(n - 1) << 3))
  const yn2 = load<f64>(yValuesPtr + (<usize>(n - 2) << 3))
  const xn1 = load<f64>(xValuesPtr + (<usize>(n - 1) << 3))
  const xn2 = load<f64>(xValuesPtr + (<usize>(n - 2) << 3))
  store<f64>(workPtr + (<usize>(n - 1) << 3), (yn1 - yn2) / (xn1 - xn2))

  // Find segment
  let seg: i32 = 0
  if (x <= x0) {
    seg = 0
  } else if (x >= xn1) {
    seg = n - 2
  } else {
    let lo: i32 = 0
    let hi: i32 = n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (load<f64>(xValuesPtr + (<usize>mid << 3)) > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  return hermiteInterp(
    load<f64>(xValuesPtr + (<usize>seg << 3)),
    load<f64>(yValuesPtr + (<usize>seg << 3)),
    load<f64>(workPtr + (<usize>seg << 3)),
    load<f64>(xValuesPtr + (<usize>(seg + 1) << 3)),
    load<f64>(yValuesPtr + (<usize>(seg + 1) << 3)),
    load<f64>(workPtr + (<usize>(seg + 1) << 3)),
    x
  )
}

/**
 * Akima interpolation
 * Avoids oscillations in regions where data is locally flat
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param x Target x
 * @param n Number of points
 * @param workPtr Pointer to working memory (f64, at least 2*n + 3 elements for m and t arrays)
 * @returns Interpolated value
 */
export function akimaInterp(
  xValuesPtr: usize,
  yValuesPtr: usize,
  x: f64,
  n: i32,
  workPtr: usize
): f64 {
  if (n < 2) return load<f64>(yValuesPtr)
  if (n < 5) {
    // Fall back to pchip for small n
    return pchipInterp(xValuesPtr, yValuesPtr, x, n, workPtr)
  }

  // Work memory layout: m (n+3 elements), t (n elements)
  const mPtr: usize = workPtr
  const tPtr: usize = workPtr + (<usize>(n + 3) << 3)

  // Compute slopes between points
  for (let i: i32 = 0; i < n - 1; i++) {
    const xip1 = load<f64>(xValuesPtr + (<usize>(i + 1) << 3))
    const xi = load<f64>(xValuesPtr + (<usize>i << 3))
    const yip1 = load<f64>(yValuesPtr + (<usize>(i + 1) << 3))
    const yi = load<f64>(yValuesPtr + (<usize>i << 3))
    store<f64>(mPtr + (<usize>(i + 2) << 3), (yip1 - yi) / (xip1 - xi))
  }

  // Extrapolate end slopes
  const m2 = load<f64>(mPtr + 16)
  const m3 = load<f64>(mPtr + 24)
  store<f64>(mPtr + 8, 2.0 * m2 - m3)
  store<f64>(mPtr, 2.0 * load<f64>(mPtr + 8) - m2)

  const mn = load<f64>(mPtr + (<usize>n << 3))
  const mnm1 = load<f64>(mPtr + (<usize>(n - 1) << 3))
  store<f64>(mPtr + (<usize>(n + 1) << 3), 2.0 * mn - mnm1)
  store<f64>(mPtr + (<usize>(n + 2) << 3), 2.0 * load<f64>(mPtr + (<usize>(n + 1) << 3)) - mn)

  // Compute Akima weights
  for (let i: i32 = 0; i < n; i++) {
    const mip3 = load<f64>(mPtr + (<usize>(i + 3) << 3))
    const mip2 = load<f64>(mPtr + (<usize>(i + 2) << 3))
    const mip1 = load<f64>(mPtr + (<usize>(i + 1) << 3))
    const mi = load<f64>(mPtr + (<usize>i << 3))

    const w1 = Math.abs(mip3 - mip2)
    const w2 = Math.abs(mip1 - mi)

    if (w1 + w2 !== 0) {
      store<f64>(tPtr + (<usize>i << 3), (w1 * mip1 + w2 * mip2) / (w1 + w2))
    } else {
      store<f64>(tPtr + (<usize>i << 3), 0.5 * (mip1 + mip2))
    }
  }

  // Find segment
  const x0 = load<f64>(xValuesPtr)
  const xn1 = load<f64>(xValuesPtr + (<usize>(n - 1) << 3))
  let seg: i32 = 0
  if (x <= x0) {
    seg = 0
  } else if (x >= xn1) {
    seg = n - 2
  } else {
    let lo: i32 = 0
    let hi: i32 = n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (load<f64>(xValuesPtr + (<usize>mid << 3)) > x) {
        hi = mid
      } else {
        lo = mid
      }
    }
    seg = lo
  }

  return hermiteInterp(
    load<f64>(xValuesPtr + (<usize>seg << 3)),
    load<f64>(yValuesPtr + (<usize>seg << 3)),
    load<f64>(tPtr + (<usize>seg << 3)),
    load<f64>(xValuesPtr + (<usize>(seg + 1) << 3)),
    load<f64>(yValuesPtr + (<usize>(seg + 1) << 3)),
    load<f64>(tPtr + (<usize>(seg + 1) << 3)),
    x
  )
}

// ============================================================================
// POLYNOMIAL EVALUATION UTILITIES
// ============================================================================

/**
 * Evaluate polynomial using Horner's method
 * p(x) = coeffs[0] + coeffs[1]*x + coeffs[2]*x² + ...
 * @param coeffsPtr Pointer to polynomial coefficients [a0, a1, a2, ...] (f64)
 * @param x Target x
 * @param degree Degree of polynomial (length - 1)
 * @returns p(x)
 */
export function polyEval(coeffsPtr: usize, x: f64, degree: i32): f64 {
  let result = load<f64>(coeffsPtr + (<usize>degree << 3))

  for (let i = degree - 1; i >= 0; i--) {
    result = result * x + load<f64>(coeffsPtr + (<usize>i << 3))
  }

  return result
}

/**
 * Polynomial derivative evaluation
 * @param coeffsPtr Pointer to polynomial coefficients [a0, a1, a2, ...] (f64)
 * @param x Target x
 * @param degree Degree of polynomial
 * @returns p'(x)
 */
export function polyDerivEval(coeffsPtr: usize, x: f64, degree: i32): f64 {
  if (degree < 1) return 0.0

  // Derivative coefficients: [a1, 2*a2, 3*a3, ...]
  let result = f64(degree) * load<f64>(coeffsPtr + (<usize>degree << 3))

  for (let i = degree - 1; i >= 1; i--) {
    result = result * x + f64(i) * load<f64>(coeffsPtr + (<usize>i << 3))
  }

  return result
}

/**
 * Fit polynomial to data using least squares (normal equations)
 * @param xValuesPtr Pointer to x coordinates (f64)
 * @param yValuesPtr Pointer to y coordinates (f64)
 * @param n Number of points
 * @param degree Polynomial degree
 * @param coeffsPtr Pointer to output coefficients [a0, a1, a2, ...] (f64, degree+1 elements)
 * @param workPtr Pointer to working memory (f64, at least (degree+1)*(degree+2) elements)
 */
export function polyFit(
  xValuesPtr: usize,
  yValuesPtr: usize,
  n: i32,
  degree: i32,
  coeffsPtr: usize,
  workPtr: usize
): void {
  const m = degree + 1

  // Working memory layout: ATA (m*m), ATy (m)
  const ATAPtr: usize = workPtr
  const ATyPtr: usize = workPtr + (<usize>(m * m) << 3)

  // Initialize to zero
  for (let i: i32 = 0; i < m * m; i++) {
    store<f64>(ATAPtr + (<usize>i << 3), 0.0)
  }
  for (let i: i32 = 0; i < m; i++) {
    store<f64>(ATyPtr + (<usize>i << 3), 0.0)
  }

  // Compute A^T * A and A^T * y
  for (let i: i32 = 0; i < n; i++) {
    const xi = load<f64>(xValuesPtr + (<usize>i << 3))
    const yi = load<f64>(yValuesPtr + (<usize>i << 3))

    let xpowi: f64 = 1.0
    for (let j: i32 = 0; j < m; j++) {
      const atyj = load<f64>(ATyPtr + (<usize>j << 3))
      store<f64>(ATyPtr + (<usize>j << 3), atyj + xpowi * yi)

      let xpowk = xpowi
      for (let k: i32 = j; k < m; k++) {
        const idx: usize = <usize>(j * m + k) << 3
        const val = load<f64>(ATAPtr + idx)
        store<f64>(ATAPtr + idx, val + xpowk)
        if (k !== j) {
          const idx2: usize = <usize>(k * m + j) << 3
          store<f64>(ATAPtr + idx2, val + xpowk)
        }
        xpowk *= xi
      }
      xpowi *= xi
    }
  }

  // Solve using simple Gaussian elimination with partial pivoting
  for (let k: i32 = 0; k < m; k++) {
    // Find pivot
    let maxVal = Math.abs(load<f64>(ATAPtr + (<usize>(k * m + k) << 3)))
    let maxRow = k
    for (let i = k + 1; i < m; i++) {
      const val = Math.abs(load<f64>(ATAPtr + (<usize>(i * m + k) << 3)))
      if (val > maxVal) {
        maxVal = val
        maxRow = i
      }
    }

    // Swap rows
    if (maxRow !== k) {
      for (let j: i32 = 0; j < m; j++) {
        const idx1: usize = <usize>(k * m + j) << 3
        const idx2: usize = <usize>(maxRow * m + j) << 3
        const tmp = load<f64>(ATAPtr + idx1)
        store<f64>(ATAPtr + idx1, load<f64>(ATAPtr + idx2))
        store<f64>(ATAPtr + idx2, tmp)
      }
      const tmp = load<f64>(ATyPtr + (<usize>k << 3))
      store<f64>(ATyPtr + (<usize>k << 3), load<f64>(ATyPtr + (<usize>maxRow << 3)))
      store<f64>(ATyPtr + (<usize>maxRow << 3), tmp)
    }

    // Eliminate
    const pivot = load<f64>(ATAPtr + (<usize>(k * m + k) << 3))
    if (Math.abs(pivot) < 1e-14) continue

    for (let i = k + 1; i < m; i++) {
      const factor = load<f64>(ATAPtr + (<usize>(i * m + k) << 3)) / pivot
      for (let j = k + 1; j < m; j++) {
        const idx: usize = <usize>(i * m + j) << 3
        const val = load<f64>(ATAPtr + idx) - factor * load<f64>(ATAPtr + (<usize>(k * m + j) << 3))
        store<f64>(ATAPtr + idx, val)
      }
      const atyi = load<f64>(ATyPtr + (<usize>i << 3)) - factor * load<f64>(ATyPtr + (<usize>k << 3))
      store<f64>(ATyPtr + (<usize>i << 3), atyi)
    }
  }

  // Back substitution
  for (let i = m - 1; i >= 0; i--) {
    let sum = load<f64>(ATyPtr + (<usize>i << 3))
    for (let j = i + 1; j < m; j++) {
      sum -= load<f64>(ATAPtr + (<usize>(i * m + j) << 3)) * load<f64>(coeffsPtr + (<usize>j << 3))
    }
    const diag = load<f64>(ATAPtr + (<usize>(i * m + i) << 3))
    store<f64>(coeffsPtr + (<usize>i << 3), Math.abs(diag) > 1e-14 ? sum / diag : 0.0)
  }
}

// ============================================================================
// BATCH INTERPOLATION
// ============================================================================

/**
 * Evaluate interpolation at multiple points
 * @param xValuesPtr Pointer to data x coordinates (f64)
 * @param yValuesPtr Pointer to data y coordinates (f64)
 * @param n Number of data points
 * @param xTargetsPtr Pointer to target x values (f64)
 * @param nTargets Number of targets
 * @param method 0=linear, 1=lagrange, 2=spline, 3=pchip, 4=akima
 * @param resultsPtr Pointer to output array (f64, nTargets elements)
 * @param workPtr Pointer to working memory (size depends on method, see individual functions)
 */
export function batchInterpolate(
  xValuesPtr: usize,
  yValuesPtr: usize,
  n: i32,
  xTargetsPtr: usize,
  nTargets: i32,
  method: i32,
  resultsPtr: usize,
  workPtr: usize
): void {
  // Precompute coefficients for spline/newton methods
  if (method === 2) {
    // Natural cubic spline - need (n-1)*4 coeffs + 6*n work space
    const splineCoeffsPtr: usize = workPtr
    const splineWorkPtr: usize = workPtr + (<usize>((n - 1) * 4) << 3)
    naturalCubicSplineCoeffs(xValuesPtr, yValuesPtr, n, splineCoeffsPtr, splineWorkPtr)

    for (let i: i32 = 0; i < nTargets; i++) {
      const x = load<f64>(xTargetsPtr + (<usize>i << 3))
      store<f64>(resultsPtr + (<usize>i << 3), cubicSplineEval(xValuesPtr, splineCoeffsPtr, x, n))
    }
  } else if (method === 1 && n > 10) {
    // Use barycentric for many points
    barycentricWeights(xValuesPtr, n, workPtr)

    for (let i: i32 = 0; i < nTargets; i++) {
      const x = load<f64>(xTargetsPtr + (<usize>i << 3))
      store<f64>(resultsPtr + (<usize>i << 3), barycentricInterp(xValuesPtr, yValuesPtr, workPtr, x, n))
    }
  } else {
    for (let i: i32 = 0; i < nTargets; i++) {
      const x = load<f64>(xTargetsPtr + (<usize>i << 3))

      if (method === 0) {
        store<f64>(resultsPtr + (<usize>i << 3), linearInterpTable(xValuesPtr, yValuesPtr, x, n))
      } else if (method === 1) {
        store<f64>(resultsPtr + (<usize>i << 3), lagrangeInterp(xValuesPtr, yValuesPtr, x, n))
      } else if (method === 3) {
        store<f64>(resultsPtr + (<usize>i << 3), pchipInterp(xValuesPtr, yValuesPtr, x, n, workPtr))
      } else if (method === 4) {
        store<f64>(resultsPtr + (<usize>i << 3), akimaInterp(xValuesPtr, yValuesPtr, x, n, workPtr))
      } else {
        store<f64>(resultsPtr + (<usize>i << 3), linearInterpTable(xValuesPtr, yValuesPtr, x, n))
      }
    }
  }
}
