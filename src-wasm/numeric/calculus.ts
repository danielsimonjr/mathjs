/**
 * WASM-optimized numerical calculus operations
 *
 * Provides numerical alternatives to symbolic differentiation and integration.
 * These are WASM-compatible replacements for functions that cannot be converted
 * due to their symbolic/AST-manipulation nature.
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
 * @param fValues - Function values: [f(x-h), f(x+h), f(y-h), f(y+h), ...]
 * @param h - Step size
 * @param n - Number of dimensions
 * @returns Gradient vector
 */
export function gradient(fValues: Float64Array, h: f64, n: i32): Float64Array {
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    const fminus: f64 = fValues[i * 2]
    const fplus: f64 = fValues[i * 2 + 1]
    result[i] = (fplus - fminus) / (2.0 * h)
  }

  return result
}

/**
 * Compute numerical Hessian matrix (second derivatives)
 *
 * @param fValues - Function values for Hessian computation
 *                  Layout: [f(x), f(x+h_i), f(x-h_i), f(x+h_i+h_j), ...]
 * @param h - Step size
 * @param n - Number of dimensions
 * @returns Hessian matrix (row-major, n x n)
 */
export function hessian(fValues: Float64Array, fx: f64, h: f64, n: i32): Float64Array {
  const result = new Float64Array(n * n)
  const h2: f64 = h * h

  let idx: i32 = 0
  for (let i: i32 = 0; i < n; i++) {
    for (let j: i32 = 0; j < n; j++) {
      if (i === j) {
        // Diagonal: (f(x+h_i) - 2f(x) + f(x-h_i)) / h²
        const fplus: f64 = fValues[idx]
        const fminus: f64 = fValues[idx + 1]
        result[i * n + j] = (fplus - 2.0 * fx + fminus) / h2
        idx += 2
      } else if (j > i) {
        // Off-diagonal: (f(x+h_i+h_j) - f(x+h_i-h_j) - f(x-h_i+h_j) + f(x-h_i-h_j)) / (4h²)
        const fpp: f64 = fValues[idx]
        const fpm: f64 = fValues[idx + 1]
        const fmp: f64 = fValues[idx + 2]
        const fmm: f64 = fValues[idx + 3]
        const val: f64 = (fpp - fpm - fmp + fmm) / (4.0 * h2)
        result[i * n + j] = val
        result[j * n + i] = val // Symmetric
        idx += 4
      }
    }
  }

  return result
}

// ============================================
// NUMERICAL INTEGRATION
// ============================================

/**
 * Trapezoidal rule integration
 * ∫f(x)dx ≈ h * (f0/2 + f1 + f2 + ... + fn-1 + fn/2)
 *
 * @param fValues - Function values at equally spaced points
 * @param h - Step size
 * @param n - Number of points
 * @returns Approximate integral
 */
export function trapezoidalRule(fValues: Float64Array, h: f64, n: i32): f64 {
  if (n < 2) return 0.0

  let sum: f64 = (fValues[0] + fValues[n - 1]) / 2.0

  for (let i: i32 = 1; i < n - 1; i++) {
    sum += fValues[i]
  }

  return sum * h
}

/**
 * Simpson's 1/3 rule integration (requires odd number of points)
 * ∫f(x)dx ≈ (h/3) * (f0 + 4f1 + 2f2 + 4f3 + ... + fn)
 *
 * @param fValues - Function values at equally spaced points
 * @param h - Step size
 * @param n - Number of points (must be odd)
 * @returns Approximate integral
 */
export function simpsonsRule(fValues: Float64Array, h: f64, n: i32): f64 {
  if (n < 3 || (n % 2) === 0) return f64.NaN

  let sum: f64 = fValues[0] + fValues[n - 1]

  for (let i: i32 = 1; i < n - 1; i++) {
    if ((i % 2) === 1) {
      sum += 4.0 * fValues[i]
    } else {
      sum += 2.0 * fValues[i]
    }
  }

  return sum * h / 3.0
}

/**
 * Simpson's 3/8 rule integration (requires 4, 7, 10, ... points)
 *
 * @param fValues - Function values at equally spaced points
 * @param h - Step size
 * @param n - Number of points (must be 3k+1)
 * @returns Approximate integral
 */
export function simpsons38Rule(fValues: Float64Array, h: f64, n: i32): f64 {
  if (n < 4 || ((n - 1) % 3) !== 0) return f64.NaN

  let sum: f64 = fValues[0] + fValues[n - 1]

  for (let i: i32 = 1; i < n - 1; i++) {
    if ((i % 3) === 0) {
      sum += 2.0 * fValues[i]
    } else {
      sum += 3.0 * fValues[i]
    }
  }

  return sum * 3.0 * h / 8.0
}

/**
 * Boole's rule integration (requires 5, 9, 13, ... points)
 * Higher order than Simpson's
 *
 * @param fValues - Function values at equally spaced points
 * @param h - Step size
 * @param n - Number of points (must be 4k+1)
 * @returns Approximate integral
 */
export function boolesRule(fValues: Float64Array, h: f64, n: i32): f64 {
  if (n < 5 || ((n - 1) % 4) !== 0) return f64.NaN

  let sum: f64 = 0.0
  const numPanels: i32 = (n - 1) / 4

  for (let panel: i32 = 0; panel < numPanels; panel++) {
    const base: i32 = panel * 4
    sum += 7.0 * fValues[base]
    sum += 32.0 * fValues[base + 1]
    sum += 12.0 * fValues[base + 2]
    sum += 32.0 * fValues[base + 3]
    sum += 7.0 * fValues[base + 4]
  }

  // Subtract overcounted endpoints for multiple panels
  if (numPanels > 1) {
    for (let i: i32 = 1; i < numPanels; i++) {
      sum -= 7.0 * fValues[i * 4]
    }
  }

  return sum * 2.0 * h / 45.0
}

// Gauss-Legendre quadrature nodes and weights (stored as constants)
// 2-point
const GL2_NODES: StaticArray<f64> = [-0.5773502691896257, 0.5773502691896257]
const GL2_WEIGHTS: StaticArray<f64> = [1.0, 1.0]

// 3-point
const GL3_NODES: StaticArray<f64> = [-0.7745966692414834, 0.0, 0.7745966692414834]
const GL3_WEIGHTS: StaticArray<f64> = [0.5555555555555556, 0.8888888888888888, 0.5555555555555556]

// 4-point
const GL4_NODES: StaticArray<f64> = [
  -0.8611363115940526, -0.3399810435848563,
  0.3399810435848563, 0.8611363115940526
]
const GL4_WEIGHTS: StaticArray<f64> = [
  0.3478548451374538, 0.6521451548625461,
  0.6521451548625461, 0.3478548451374538
]

// 5-point
const GL5_NODES: StaticArray<f64> = [
  -0.9061798459386640, -0.5384693101056831, 0.0,
  0.5384693101056831, 0.9061798459386640
]
const GL5_WEIGHTS: StaticArray<f64> = [
  0.2369268850561891, 0.4786286704993665, 0.5688888888888889,
  0.4786286704993665, 0.2369268850561891
]

/**
 * Get Gauss-Legendre nodes for a given number of points
 * Transforms from [-1,1] to [a,b]
 *
 * @param a - Lower bound
 * @param b - Upper bound
 * @param nPoints - Number of quadrature points (2-5 supported)
 * @returns Array of evaluation points
 */
export function gaussLegendreNodes(a: f64, b: f64, nPoints: i32): Float64Array {
  const result = new Float64Array(nPoints)
  const mid: f64 = (a + b) / 2.0
  const halfWidth: f64 = (b - a) / 2.0

  let nodes: StaticArray<f64>
  if (nPoints === 2) {
    nodes = GL2_NODES
  } else if (nPoints === 3) {
    nodes = GL3_NODES
  } else if (nPoints === 4) {
    nodes = GL4_NODES
  } else if (nPoints === 5) {
    nodes = GL5_NODES
  } else {
    return result // Empty for unsupported
  }

  for (let i: i32 = 0; i < nPoints; i++) {
    result[i] = mid + halfWidth * nodes[i]
  }

  return result
}

/**
 * Get Gauss-Legendre weights for a given number of points
 * Scaled for interval [a,b]
 *
 * @param a - Lower bound
 * @param b - Upper bound
 * @param nPoints - Number of quadrature points (2-5 supported)
 * @returns Array of weights
 */
export function gaussLegendreWeights(a: f64, b: f64, nPoints: i32): Float64Array {
  const result = new Float64Array(nPoints)
  const halfWidth: f64 = (b - a) / 2.0

  let weights: StaticArray<f64>
  if (nPoints === 2) {
    weights = GL2_WEIGHTS
  } else if (nPoints === 3) {
    weights = GL3_WEIGHTS
  } else if (nPoints === 4) {
    weights = GL4_WEIGHTS
  } else if (nPoints === 5) {
    weights = GL5_WEIGHTS
  } else {
    return result
  }

  for (let i: i32 = 0; i < nPoints; i++) {
    result[i] = halfWidth * weights[i]
  }

  return result
}

/**
 * Gauss-Legendre quadrature integration
 * Given pre-computed function values at Gauss-Legendre nodes
 *
 * @param fValues - Function values at GL nodes
 * @param weights - GL weights (from gaussLegendreWeights)
 * @param nPoints - Number of points
 * @returns Approximate integral
 */
export function gaussLegendre(fValues: Float64Array, weights: Float64Array, nPoints: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < nPoints; i++) {
    sum += weights[i] * fValues[i]
  }

  return sum
}

/**
 * Composite Gauss-Legendre quadrature
 * Divides [a,b] into subintervals and applies GL quadrature to each
 *
 * @param fValues - Function values at all GL nodes across subintervals
 * @param a - Lower bound
 * @param b - Upper bound
 * @param nSubintervals - Number of subintervals
 * @param nPoints - GL points per subinterval (2-5)
 * @returns Approximate integral
 */
export function compositeGaussLegendre(
  fValues: Float64Array,
  a: f64,
  b: f64,
  nSubintervals: i32,
  nPoints: i32
): f64 {
  const subWidth: f64 = (b - a) / f64(nSubintervals)
  let sum: f64 = 0.0

  for (let sub: i32 = 0; sub < nSubintervals; sub++) {
    const subA: f64 = a + f64(sub) * subWidth
    const subB: f64 = subA + subWidth
    const weights = gaussLegendreWeights(subA, subB, nPoints)

    for (let i: i32 = 0; i < nPoints; i++) {
      sum += weights[i] * fValues[sub * nPoints + i]
    }
  }

  return sum
}

/**
 * Romberg integration (Richardson extrapolation on trapezoidal rule)
 *
 * @param trapValues - Trapezoidal estimates with h, h/2, h/4, ..., h/2^(n-1)
 * @param n - Number of estimates
 * @returns Improved estimate using Richardson extrapolation
 */
export function romberg(trapValues: Float64Array, n: i32): f64 {
  if (n < 1) return f64.NaN
  if (n === 1) return trapValues[0]

  // Create working copy
  const R = new Float64Array(n * n)

  // First column is trapezoidal estimates
  for (let i: i32 = 0; i < n; i++) {
    R[i * n] = trapValues[i]
  }

  // Apply Richardson extrapolation
  for (let j: i32 = 1; j < n; j++) {
    const factor: f64 = Math.pow(4.0, f64(j))
    for (let i: i32 = j; i < n; i++) {
      R[i * n + j] = (factor * R[i * n + j - 1] - R[(i - 1) * n + j - 1]) / (factor - 1.0)
    }
  }

  return R[(n - 1) * n + n - 1]
}

// ============================================
// DIFFERENTIAL EQUATIONS (additional utilities)
// ============================================

/**
 * Compute Jacobian matrix numerically
 *
 * @param fValues - Function values: for n functions, m variables
 *                  Layout: [f1(x+h1), f1(x-h1), f1(x+h2), ..., f2(x+h1), ...]
 * @param h - Step size
 * @param nFunctions - Number of functions (rows)
 * @param nVariables - Number of variables (cols)
 * @returns Jacobian matrix (nFunctions x nVariables, row-major)
 */
export function jacobian(
  fValues: Float64Array,
  h: f64,
  nFunctions: i32,
  nVariables: i32
): Float64Array {
  const result = new Float64Array(nFunctions * nVariables)

  for (let i: i32 = 0; i < nFunctions; i++) {
    for (let j: i32 = 0; j < nVariables; j++) {
      const idx: i32 = (i * nVariables + j) * 2
      const fplus: f64 = fValues[idx]
      const fminus: f64 = fValues[idx + 1]
      result[i * nVariables + j] = (fplus - fminus) / (2.0 * h)
    }
  }

  return result
}

/**
 * Laplacian (sum of second derivatives) using finite differences
 *
 * @param fValues - Function values at stencil points
 *                  For 2D: [f(x,y), f(x+h,y), f(x-h,y), f(x,y+h), f(x,y-h)]
 * @param fx - Value at center point
 * @param h - Step size
 * @param nDim - Number of dimensions
 * @returns Laplacian value
 */
export function laplacian(fValues: Float64Array, fx: f64, h: f64, nDim: i32): f64 {
  const h2: f64 = h * h
  let sum: f64 = -2.0 * f64(nDim) * fx

  for (let i: i32 = 0; i < nDim; i++) {
    sum += fValues[i * 2] + fValues[i * 2 + 1]
  }

  return sum / h2
}

/**
 * Divergence of a vector field using central differences
 *
 * @param fieldValues - Field component values
 *                      Layout: [F1(x+h), F1(x-h), F2(y+h), F2(y-h), ...]
 * @param h - Step size
 * @param nDim - Number of dimensions
 * @returns Divergence value
 */
export function divergence(fieldValues: Float64Array, h: f64, nDim: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < nDim; i++) {
    const fplus: f64 = fieldValues[i * 2]
    const fminus: f64 = fieldValues[i * 2 + 1]
    sum += (fplus - fminus) / (2.0 * h)
  }

  return sum
}

/**
 * Curl of a 3D vector field (returns 3D vector)
 *
 * @param fieldValues - Partial derivatives:
 *   [dFz/dy, dFy/dz, dFx/dz, dFz/dx, dFy/dx, dFx/dy]
 * @returns Curl vector [curlX, curlY, curlZ]
 */
export function curl3D(fieldValues: Float64Array): Float64Array {
  const result = new Float64Array(3)

  // curl_x = dFz/dy - dFy/dz
  result[0] = fieldValues[0] - fieldValues[1]

  // curl_y = dFx/dz - dFz/dx
  result[1] = fieldValues[2] - fieldValues[3]

  // curl_z = dFy/dx - dFx/dy
  result[2] = fieldValues[4] - fieldValues[5]

  return result
}
