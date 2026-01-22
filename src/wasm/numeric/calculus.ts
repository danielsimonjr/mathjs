/**
 * WASM-optimized numerical calculus operations
 *
 * Provides numerical alternatives to symbolic differentiation and integration.
 * These are WASM-compatible replacements for functions that cannot be converted
 * due to their symbolic/AST-manipulation nature.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// ============================================
// NUMERICAL DIFFERENTIATION
// ============================================

/**
 * Compute numerical derivative using forward difference
 * f'(x) ≈ (f(x+h) - f(x)) / h
 *
 * @param fx - Value of f(x)
 * @param fxh - Value of f(x+h)
 * @param h - Step size
 * @returns Approximate derivative
 */
export function forwardDifference(fx: f64, fxh: f64, h: f64): f64 {
  if (h === 0) return f64.NaN
  return (fxh - fx) / h
}

/**
 * Compute numerical derivative using backward difference
 * f'(x) ≈ (f(x) - f(x-h)) / h
 *
 * @param fx - Value of f(x)
 * @param fxmh - Value of f(x-h)
 * @param h - Step size
 * @returns Approximate derivative
 */
export function backwardDifference(fx: f64, fxmh: f64, h: f64): f64 {
  if (h === 0) return f64.NaN
  return (fx - fxmh) / h
}

/**
 * Compute numerical derivative using central difference (more accurate)
 * f'(x) ≈ (f(x+h) - f(x-h)) / (2h)
 *
 * @param fxph - Value of f(x+h)
 * @param fxmh - Value of f(x-h)
 * @param h - Step size
 * @returns Approximate derivative
 */
export function centralDifference(fxph: f64, fxmh: f64, h: f64): f64 {
  if (h === 0) return f64.NaN
  return (fxph - fxmh) / (2.0 * h)
}

/**
 * Compute second derivative using central difference
 * f''(x) ≈ (f(x+h) - 2f(x) + f(x-h)) / h²
 *
 * @param fxph - Value of f(x+h)
 * @param fx - Value of f(x)
 * @param fxmh - Value of f(x-h)
 * @param h - Step size
 * @returns Approximate second derivative
 */
export function secondDerivative(fxph: f64, fx: f64, fxmh: f64, h: f64): f64 {
  if (h === 0) return f64.NaN
  return (fxph - 2.0 * fx + fxmh) / (h * h)
}

/**
 * Compute numerical derivative using 5-point stencil (higher accuracy)
 * f'(x) ≈ (-f(x+2h) + 8f(x+h) - 8f(x-h) + f(x-2h)) / (12h)
 *
 * @param fxp2h - Value of f(x+2h)
 * @param fxph - Value of f(x+h)
 * @param fxmh - Value of f(x-h)
 * @param fxm2h - Value of f(x-2h)
 * @param h - Step size
 * @returns Approximate derivative
 */
export function fivePointStencil(
  fxp2h: f64,
  fxph: f64,
  fxmh: f64,
  fxm2h: f64,
  h: f64
): f64 {
  if (h === 0) return f64.NaN
  return (-fxp2h + 8.0 * fxph - 8.0 * fxmh + fxm2h) / (12.0 * h)
}

/**
 * Richardson extrapolation for improved derivative accuracy
 * Combines estimates with different step sizes
 *
 * @param d1 - Derivative estimate with step h
 * @param d2 - Derivative estimate with step h/2
 * @param order - Order of the method (2 for central difference)
 * @returns Improved estimate
 */
export function richardsonExtrapolation(d1: f64, d2: f64, order: i32): f64 {
  const factor: f64 = Math.pow(2.0, f64(order))
  return (factor * d2 - d1) / (factor - 1.0)
}

/**
 * Compute numerical gradient of a function at a point
 * Uses central differences for each dimension
 *
 * @param fValuesPtr - Pointer to function values: [f(x-h), f(x+h), f(y-h), f(y+h), ...]
 * @param h - Step size
 * @param n - Number of dimensions
 * @param resultPtr - Pointer to output gradient vector (f64, n elements)
 */
export function gradient(fValuesPtr: usize, h: f64, n: i32, resultPtr: usize): void {
  for (let i: i32 = 0; i < n; i++) {
    const fminus: f64 = load<f64>(fValuesPtr + (<usize>(i * 2) << 3))
    const fplus: f64 = load<f64>(fValuesPtr + (<usize>(i * 2 + 1) << 3))
    store<f64>(resultPtr + (<usize>i << 3), (fplus - fminus) / (2.0 * h))
  }
}

/**
 * Compute numerical Hessian matrix (second derivatives)
 *
 * @param fValuesPtr - Pointer to function values for Hessian computation
 *                     Layout: [f(x+h_i), f(x-h_i), f(x+h_i+h_j), ...]
 * @param fx - Value at center point
 * @param h - Step size
 * @param n - Number of dimensions
 * @param resultPtr - Pointer to output Hessian matrix (f64, n*n elements, row-major)
 */
export function hessian(
  fValuesPtr: usize,
  fx: f64,
  h: f64,
  n: i32,
  resultPtr: usize
): void {
  const h2: f64 = h * h

  let idx: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      if (i === j) {
        // Diagonal: (f(x+h_i) - 2f(x) + f(x-h_i)) / h²
        const fplus: f64 = load<f64>(fValuesPtr + (<usize>idx << 3))
        const fminus: f64 = load<f64>(fValuesPtr + (<usize>(idx + 1) << 3))
        store<f64>(resultPtr + (<usize>(i * n + j) << 3), (fplus - 2.0 * fx + fminus) / h2)
        idx += 2
      } else if (j > i) {
        // Off-diagonal: (f(x+h_i+h_j) - f(x+h_i-h_j) - f(x-h_i+h_j) + f(x-h_i-h_j)) / (4h²)
        const fpp: f64 = load<f64>(fValuesPtr + (<usize>idx << 3))
        const fpm: f64 = load<f64>(fValuesPtr + (<usize>(idx + 1) << 3))
        const fmp: f64 = load<f64>(fValuesPtr + (<usize>(idx + 2) << 3))
        const fmm: f64 = load<f64>(fValuesPtr + (<usize>(idx + 3) << 3))
        const val: f64 = (fpp - fpm - fmp + fmm) / (4.0 * h2)
        store<f64>(resultPtr + (<usize>(i * n + j) << 3), val)
        store<f64>(resultPtr + (<usize>(j * n + i) << 3), val) // Symmetric
        idx += 4
      }
    }
  }
}

// ============================================
// NUMERICAL INTEGRATION
// ============================================

/**
 * Trapezoidal rule integration
 * ∫f(x)dx ≈ h * (f0/2 + f1 + f2 + ... + fn-1 + fn/2)
 *
 * @param fValuesPtr - Pointer to function values at equally spaced points (f64)
 * @param h - Step size
 * @param n - Number of points
 * @returns Approximate integral
 */
export function trapezoidalRule(fValuesPtr: usize, h: f64, n: i32): f64 {
  if (n < 2) return 0.0

  let sum: f64 = (load<f64>(fValuesPtr) + load<f64>(fValuesPtr + (<usize>(n - 1) << 3))) / 2.0

  for (let i: i32 = 1; i < n - 1; i++) {
    sum += load<f64>(fValuesPtr + (<usize>i << 3))
  }

  return sum * h
}

/**
 * Simpson's 1/3 rule integration (requires odd number of points)
 * ∫f(x)dx ≈ (h/3) * (f0 + 4f1 + 2f2 + 4f3 + ... + fn)
 *
 * @param fValuesPtr - Pointer to function values at equally spaced points (f64)
 * @param h - Step size
 * @param n - Number of points (must be odd)
 * @returns Approximate integral
 */
export function simpsonsRule(fValuesPtr: usize, h: f64, n: i32): f64 {
  if (n < 3 || n % 2 === 0) return f64.NaN

  let sum: f64 = load<f64>(fValuesPtr) + load<f64>(fValuesPtr + (<usize>(n - 1) << 3))

  for (let i: i32 = 1; i < n - 1; i++) {
    if (i % 2 === 1) {
      sum += 4.0 * load<f64>(fValuesPtr + (<usize>i << 3))
    } else {
      sum += 2.0 * load<f64>(fValuesPtr + (<usize>i << 3))
    }
  }

  return (sum * h) / 3.0
}

/**
 * Simpson's 3/8 rule integration (requires 4, 7, 10, ... points)
 *
 * @param fValuesPtr - Pointer to function values at equally spaced points (f64)
 * @param h - Step size
 * @param n - Number of points (must be 3k+1)
 * @returns Approximate integral
 */
export function simpsons38Rule(fValuesPtr: usize, h: f64, n: i32): f64 {
  if (n < 4 || (n - 1) % 3 !== 0) return f64.NaN

  let sum: f64 = load<f64>(fValuesPtr) + load<f64>(fValuesPtr + (<usize>(n - 1) << 3))

  for (let i: i32 = 1; i < n - 1; i++) {
    if (i % 3 === 0) {
      sum += 2.0 * load<f64>(fValuesPtr + (<usize>i << 3))
    } else {
      sum += 3.0 * load<f64>(fValuesPtr + (<usize>i << 3))
    }
  }

  return (sum * 3.0 * h) / 8.0
}

/**
 * Boole's rule integration (requires 5, 9, 13, ... points)
 * Higher order than Simpson's
 *
 * @param fValuesPtr - Pointer to function values at equally spaced points (f64)
 * @param h - Step size
 * @param n - Number of points (must be 4k+1)
 * @returns Approximate integral
 */
export function boolesRule(fValuesPtr: usize, h: f64, n: i32): f64 {
  if (n < 5 || (n - 1) % 4 !== 0) return f64.NaN

  let sum: f64 = 0.0
  const numPanels: i32 = (n - 1) / 4

  for (let panel: i32 = 0; panel < numPanels; panel++) {
    const base: i32 = panel * 4
    sum += 7.0 * load<f64>(fValuesPtr + (<usize>base << 3))
    sum += 32.0 * load<f64>(fValuesPtr + (<usize>(base + 1) << 3))
    sum += 12.0 * load<f64>(fValuesPtr + (<usize>(base + 2) << 3))
    sum += 32.0 * load<f64>(fValuesPtr + (<usize>(base + 3) << 3))
    sum += 7.0 * load<f64>(fValuesPtr + (<usize>(base + 4) << 3))
  }

  // Subtract overcounted endpoints for multiple panels
  if (numPanels > 1) {
    for (let i: i32 = 1; i < numPanels; i++) {
      sum -= 7.0 * load<f64>(fValuesPtr + (<usize>(i * 4) << 3))
    }
  }

  return (sum * 2.0 * h) / 45.0
}

// Gauss-Legendre quadrature nodes and weights (stored as constants)
// 2-point
const GL2_NODE_0: f64 = -0.5773502691896257
const GL2_NODE_1: f64 = 0.5773502691896257
const GL2_WEIGHT_0: f64 = 1.0
const GL2_WEIGHT_1: f64 = 1.0

// 3-point
const GL3_NODE_0: f64 = -0.7745966692414834
const GL3_NODE_1: f64 = 0.0
const GL3_NODE_2: f64 = 0.7745966692414834
const GL3_WEIGHT_0: f64 = 0.5555555555555556
const GL3_WEIGHT_1: f64 = 0.8888888888888888
const GL3_WEIGHT_2: f64 = 0.5555555555555556

// 4-point
const GL4_NODE_0: f64 = -0.8611363115940526
const GL4_NODE_1: f64 = -0.3399810435848563
const GL4_NODE_2: f64 = 0.3399810435848563
const GL4_NODE_3: f64 = 0.8611363115940526
const GL4_WEIGHT_0: f64 = 0.3478548451374538
const GL4_WEIGHT_1: f64 = 0.6521451548625461
const GL4_WEIGHT_2: f64 = 0.6521451548625461
const GL4_WEIGHT_3: f64 = 0.3478548451374538

// 5-point
const GL5_NODE_0: f64 = -0.906179845938664
const GL5_NODE_1: f64 = -0.5384693101056831
const GL5_NODE_2: f64 = 0.0
const GL5_NODE_3: f64 = 0.5384693101056831
const GL5_NODE_4: f64 = 0.906179845938664
const GL5_WEIGHT_0: f64 = 0.2369268850561891
const GL5_WEIGHT_1: f64 = 0.4786286704993665
const GL5_WEIGHT_2: f64 = 0.5688888888888889
const GL5_WEIGHT_3: f64 = 0.4786286704993665
const GL5_WEIGHT_4: f64 = 0.2369268850561891

/**
 * Get Gauss-Legendre nodes for a given number of points
 * Transforms from [-1,1] to [a,b]
 *
 * @param a - Lower bound
 * @param b - Upper bound
 * @param nPoints - Number of quadrature points (2-5 supported)
 * @param resultPtr - Pointer to output array (f64, nPoints elements)
 * @returns Number of nodes written (0 if unsupported)
 */
export function gaussLegendreNodes(a: f64, b: f64, nPoints: i32, resultPtr: usize): i32 {
  const mid: f64 = (a + b) / 2.0
  const halfWidth: f64 = (b - a) / 2.0

  if (nPoints === 2) {
    store<f64>(resultPtr, mid + halfWidth * GL2_NODE_0)
    store<f64>(resultPtr + 8, mid + halfWidth * GL2_NODE_1)
    return 2
  } else if (nPoints === 3) {
    store<f64>(resultPtr, mid + halfWidth * GL3_NODE_0)
    store<f64>(resultPtr + 8, mid + halfWidth * GL3_NODE_1)
    store<f64>(resultPtr + 16, mid + halfWidth * GL3_NODE_2)
    return 3
  } else if (nPoints === 4) {
    store<f64>(resultPtr, mid + halfWidth * GL4_NODE_0)
    store<f64>(resultPtr + 8, mid + halfWidth * GL4_NODE_1)
    store<f64>(resultPtr + 16, mid + halfWidth * GL4_NODE_2)
    store<f64>(resultPtr + 24, mid + halfWidth * GL4_NODE_3)
    return 4
  } else if (nPoints === 5) {
    store<f64>(resultPtr, mid + halfWidth * GL5_NODE_0)
    store<f64>(resultPtr + 8, mid + halfWidth * GL5_NODE_1)
    store<f64>(resultPtr + 16, mid + halfWidth * GL5_NODE_2)
    store<f64>(resultPtr + 24, mid + halfWidth * GL5_NODE_3)
    store<f64>(resultPtr + 32, mid + halfWidth * GL5_NODE_4)
    return 5
  }

  return 0 // Unsupported
}

/**
 * Get Gauss-Legendre weights for a given number of points
 * Scaled for interval [a,b]
 *
 * @param a - Lower bound
 * @param b - Upper bound
 * @param nPoints - Number of quadrature points (2-5 supported)
 * @param resultPtr - Pointer to output array (f64, nPoints elements)
 * @returns Number of weights written (0 if unsupported)
 */
export function gaussLegendreWeights(
  a: f64,
  b: f64,
  nPoints: i32,
  resultPtr: usize
): i32 {
  const halfWidth: f64 = (b - a) / 2.0

  if (nPoints === 2) {
    store<f64>(resultPtr, halfWidth * GL2_WEIGHT_0)
    store<f64>(resultPtr + 8, halfWidth * GL2_WEIGHT_1)
    return 2
  } else if (nPoints === 3) {
    store<f64>(resultPtr, halfWidth * GL3_WEIGHT_0)
    store<f64>(resultPtr + 8, halfWidth * GL3_WEIGHT_1)
    store<f64>(resultPtr + 16, halfWidth * GL3_WEIGHT_2)
    return 3
  } else if (nPoints === 4) {
    store<f64>(resultPtr, halfWidth * GL4_WEIGHT_0)
    store<f64>(resultPtr + 8, halfWidth * GL4_WEIGHT_1)
    store<f64>(resultPtr + 16, halfWidth * GL4_WEIGHT_2)
    store<f64>(resultPtr + 24, halfWidth * GL4_WEIGHT_3)
    return 4
  } else if (nPoints === 5) {
    store<f64>(resultPtr, halfWidth * GL5_WEIGHT_0)
    store<f64>(resultPtr + 8, halfWidth * GL5_WEIGHT_1)
    store<f64>(resultPtr + 16, halfWidth * GL5_WEIGHT_2)
    store<f64>(resultPtr + 24, halfWidth * GL5_WEIGHT_3)
    store<f64>(resultPtr + 32, halfWidth * GL5_WEIGHT_4)
    return 5
  }

  return 0 // Unsupported
}

/**
 * Gauss-Legendre quadrature integration
 * Given pre-computed function values at Gauss-Legendre nodes
 *
 * @param fValuesPtr - Pointer to function values at GL nodes (f64)
 * @param weightsPtr - Pointer to GL weights (f64)
 * @param nPoints - Number of points
 * @returns Approximate integral
 */
export function gaussLegendre(
  fValuesPtr: usize,
  weightsPtr: usize,
  nPoints: i32
): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < nPoints; i++) {
    const offset: usize = <usize>i << 3
    sum += load<f64>(weightsPtr + offset) * load<f64>(fValuesPtr + offset)
  }

  return sum
}

/**
 * Composite Gauss-Legendre quadrature
 * Divides [a,b] into subintervals and applies GL quadrature to each
 *
 * @param fValuesPtr - Pointer to function values at all GL nodes across subintervals (f64)
 * @param a - Lower bound
 * @param b - Upper bound
 * @param nSubintervals - Number of subintervals
 * @param nPoints - GL points per subinterval (2-5)
 * @param workPtr - Pointer to working memory for weights (f64, nPoints elements)
 * @returns Approximate integral
 */
export function compositeGaussLegendre(
  fValuesPtr: usize,
  a: f64,
  b: f64,
  nSubintervals: i32,
  nPoints: i32,
  workPtr: usize
): f64 {
  const subWidth: f64 = (b - a) / f64(nSubintervals)
  let sum: f64 = 0.0

  for (let sub: i32 = 0; sub < nSubintervals; sub++) {
    const subA: f64 = a + f64(sub) * subWidth
    const subB: f64 = subA + subWidth
    gaussLegendreWeights(subA, subB, nPoints, workPtr)

    for (let i: i32 = 0; i < nPoints; i++) {
      const offset: usize = <usize>i << 3
      const fIdx: usize = <usize>(sub * nPoints + i) << 3
      sum += load<f64>(workPtr + offset) * load<f64>(fValuesPtr + fIdx)
    }
  }

  return sum
}

/**
 * Romberg integration (Richardson extrapolation on trapezoidal rule)
 *
 * @param trapValuesPtr - Pointer to trapezoidal estimates with h, h/2, h/4, ..., h/2^(n-1) (f64)
 * @param n - Number of estimates
 * @param workPtr - Pointer to working memory for R matrix (f64, n*n elements)
 * @returns Improved estimate using Richardson extrapolation
 */
export function romberg(trapValuesPtr: usize, n: i32, workPtr: usize): f64 {
  if (n < 1) return f64.NaN
  if (n === 1) return load<f64>(trapValuesPtr)

  // First column is trapezoidal estimates
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(workPtr + (<usize>(i * n) << 3), load<f64>(trapValuesPtr + (<usize>i << 3)))
  }

  // Apply Richardson extrapolation
  for (let j: i32 = 1; j < n; j++) {
    const factor: f64 = Math.pow(4.0, f64(j))
    for (let i: i32 = j; i < n; i++) {
      const val1: f64 = load<f64>(workPtr + (<usize>(i * n + j - 1) << 3))
      const val2: f64 = load<f64>(workPtr + (<usize>((i - 1) * n + j - 1) << 3))
      store<f64>(workPtr + (<usize>(i * n + j) << 3), (factor * val1 - val2) / (factor - 1.0))
    }
  }

  return load<f64>(workPtr + (<usize>((n - 1) * n + n - 1) << 3))
}

// ============================================
// DIFFERENTIAL EQUATIONS (additional utilities)
// ============================================

/**
 * Compute Jacobian matrix numerically
 *
 * @param fValuesPtr - Pointer to function values: for n functions, m variables
 *                     Layout: [f1(x+h1), f1(x-h1), f1(x+h2), ..., f2(x+h1), ...]
 * @param h - Step size
 * @param nFunctions - Number of functions (rows)
 * @param nVariables - Number of variables (cols)
 * @param resultPtr - Pointer to output Jacobian matrix (f64, nFunctions*nVariables, row-major)
 */
export function jacobian(
  fValuesPtr: usize,
  h: f64,
  nFunctions: i32,
  nVariables: i32,
  resultPtr: usize
): void {
  for (let i: i32 = 0; i < nFunctions; i++) {
    for (let j: i32 = 0; j < nVariables; j++) {
      const idx: i32 = (i * nVariables + j) * 2
      const fplus: f64 = load<f64>(fValuesPtr + (<usize>idx << 3))
      const fminus: f64 = load<f64>(fValuesPtr + (<usize>(idx + 1) << 3))
      store<f64>(resultPtr + (<usize>(i * nVariables + j) << 3), (fplus - fminus) / (2.0 * h))
    }
  }
}

/**
 * Laplacian (sum of second derivatives) using finite differences
 *
 * @param fValuesPtr - Pointer to function values at stencil points (f64)
 *                     For 2D: [f(x+h,y), f(x-h,y), f(x,y+h), f(x,y-h)]
 * @param fx - Value at center point
 * @param h - Step size
 * @param nDim - Number of dimensions
 * @returns Laplacian value
 */
export function laplacian(
  fValuesPtr: usize,
  fx: f64,
  h: f64,
  nDim: i32
): f64 {
  const h2: f64 = h * h
  let sum: f64 = -2.0 * f64(nDim) * fx

  for (let i: i32 = 0; i < nDim; i++) {
    sum += load<f64>(fValuesPtr + (<usize>(i * 2) << 3)) + load<f64>(fValuesPtr + (<usize>(i * 2 + 1) << 3))
  }

  return sum / h2
}

/**
 * Divergence of a vector field using central differences
 *
 * @param fieldValuesPtr - Pointer to field component values (f64)
 *                         Layout: [F1(x+h), F1(x-h), F2(y+h), F2(y-h), ...]
 * @param h - Step size
 * @param nDim - Number of dimensions
 * @returns Divergence value
 */
export function divergence(fieldValuesPtr: usize, h: f64, nDim: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < nDim; i++) {
    const fplus: f64 = load<f64>(fieldValuesPtr + (<usize>(i * 2) << 3))
    const fminus: f64 = load<f64>(fieldValuesPtr + (<usize>(i * 2 + 1) << 3))
    sum += (fplus - fminus) / (2.0 * h)
  }

  return sum
}

/**
 * Curl of a 3D vector field (returns 3D vector)
 *
 * @param fieldValuesPtr - Pointer to partial derivatives (f64):
 *                         [dFz/dy, dFy/dz, dFx/dz, dFz/dx, dFy/dx, dFx/dy]
 * @param resultPtr - Pointer to output curl vector (f64, 3 elements)
 */
export function curl3D(fieldValuesPtr: usize, resultPtr: usize): void {
  // curl_x = dFz/dy - dFy/dz
  store<f64>(resultPtr, load<f64>(fieldValuesPtr) - load<f64>(fieldValuesPtr + 8))

  // curl_y = dFx/dz - dFz/dx
  store<f64>(resultPtr + 8, load<f64>(fieldValuesPtr + 16) - load<f64>(fieldValuesPtr + 24))

  // curl_z = dFy/dx - dFx/dy
  store<f64>(resultPtr + 16, load<f64>(fieldValuesPtr + 32) - load<f64>(fieldValuesPtr + 40))
}
