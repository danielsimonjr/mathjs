/**
 * WASM-optimized polynomial operations
 *
 * Includes polynomial evaluation, root finding, and related operations.
 * Polynomials are represented as coefficient arrays [a0, a1, a2, ...] where
 * p(x) = a0 + a1*x + a2*x^2 + ...
 */

// ============================================
// POLYNOMIAL EVALUATION
// ============================================

/**
 * Evaluate polynomial at a point using Horner's method
 * p(x) = a0 + a1*x + a2*x^2 + ... + an*x^n
 * @param coeffs - Coefficients [a0, a1, ..., an]
 * @param n - Number of coefficients (degree + 1)
 * @param x - Point to evaluate at
 * @returns p(x)
 */
export function polyEval(coeffs: Float64Array, n: i32, x: f64): f64 {
  if (n === 0) return 0.0

  // Horner's method: ((an*x + an-1)*x + ... )*x + a0
  let result: f64 = coeffs[n - 1]
  for (let i: i32 = n - 2; i >= 0; i--) {
    result = result * x + coeffs[i]
  }
  return result
}

/**
 * Evaluate polynomial and its derivative at a point
 * @param coeffs - Coefficients [a0, a1, ..., an]
 * @param n - Number of coefficients
 * @param x - Point to evaluate at
 * @returns [p(x), p'(x)]
 */
export function polyEvalWithDerivative(
  coeffs: Float64Array,
  n: i32,
  x: f64
): Float64Array {
  const result = new Float64Array(2)

  if (n === 0) {
    result[0] = 0.0
    result[1] = 0.0
    return result
  }

  if (n === 1) {
    result[0] = coeffs[0]
    result[1] = 0.0
    return result
  }

  // Horner's method for polynomial and derivative
  let p: f64 = coeffs[n - 1]
  let dp: f64 = 0.0

  for (let i: i32 = n - 2; i >= 0; i--) {
    dp = dp * x + p
    p = p * x + coeffs[i]
  }

  result[0] = p
  result[1] = dp
  return result
}

// ============================================
// QUADRATIC ROOTS
// ============================================

/**
 * Find roots of quadratic equation ax² + bx + c = 0
 * @param a - Coefficient of x²
 * @param b - Coefficient of x
 * @param c - Constant term
 * @returns [real1, imag1, real2, imag2] - Two complex roots
 */
export function quadraticRoots(a: f64, b: f64, c: f64): Float64Array {
  const result = new Float64Array(4)

  if (Math.abs(a) < 1e-14) {
    // Linear equation bx + c = 0
    if (Math.abs(b) < 1e-14) {
      // No solution or infinite solutions
      result[0] = NaN
      result[1] = 0.0
      result[2] = NaN
      result[3] = 0.0
      return result
    }
    result[0] = -c / b
    result[1] = 0.0
    result[2] = -c / b
    result[3] = 0.0
    return result
  }

  const discriminant: f64 = b * b - 4.0 * a * c

  if (discriminant >= 0) {
    // Two real roots
    const sqrtD: f64 = Math.sqrt(discriminant)
    // Use stable formula to avoid catastrophic cancellation
    const q: f64 = -0.5 * (b + Math.sign(b) * sqrtD)
    result[0] = q / a
    result[1] = 0.0
    result[2] = c / q
    result[3] = 0.0
  } else {
    // Two complex conjugate roots
    const realPart: f64 = -b / (2.0 * a)
    const imagPart: f64 = Math.sqrt(-discriminant) / (2.0 * a)
    result[0] = realPart
    result[1] = imagPart
    result[2] = realPart
    result[3] = -imagPart
  }

  return result
}

// ============================================
// CUBIC ROOTS (Cardano's formula)
// ============================================

/**
 * Find roots of cubic equation ax³ + bx² + cx + d = 0
 * Using Cardano's formula with trigonometric method for three real roots
 * @param a - Coefficient of x³
 * @param b - Coefficient of x²
 * @param c - Coefficient of x
 * @param d - Constant term
 * @returns [real1, imag1, real2, imag2, real3, imag3] - Three complex roots
 */
export function cubicRoots(a: f64, b: f64, c: f64, d: f64): Float64Array {
  const result = new Float64Array(6)

  if (Math.abs(a) < 1e-14) {
    // Quadratic equation
    const qRoots = quadraticRoots(b, c, d)
    result[0] = qRoots[0]
    result[1] = qRoots[1]
    result[2] = qRoots[2]
    result[3] = qRoots[3]
    result[4] = NaN
    result[5] = 0.0
    return result
  }

  // Normalize to x³ + px² + qx + r = 0
  const p: f64 = b / a
  const q: f64 = c / a
  const r: f64 = d / a

  // Convert to depressed cubic t³ + pt + q = 0 via substitution x = t - p/3
  const p2: f64 = p * p
  const pp: f64 = (3.0 * q - p2) / 3.0
  const qq: f64 = (2.0 * p2 * p - 9.0 * p * q + 27.0 * r) / 27.0

  const discriminant: f64 = (qq * qq) / 4.0 + (pp * pp * pp) / 27.0

  const shift: f64 = -p / 3.0

  if (discriminant > 1e-14) {
    // One real root, two complex conjugate roots
    const sqrtD: f64 = Math.sqrt(discriminant)
    const u: f64 = Math.cbrt(-qq / 2.0 + sqrtD)
    const v: f64 = Math.cbrt(-qq / 2.0 - sqrtD)

    // Real root
    result[0] = u + v + shift
    result[1] = 0.0

    // Complex roots: -(u+v)/2 ± i*sqrt(3)*(u-v)/2
    const realPart: f64 = -(u + v) / 2.0 + shift
    const imagPart: f64 = (Math.sqrt(3.0) * (u - v)) / 2.0

    result[2] = realPart
    result[3] = imagPart
    result[4] = realPart
    result[5] = -imagPart
  } else if (discriminant < -1e-14) {
    // Three distinct real roots (use trigonometric method)
    const m: f64 = 2.0 * Math.sqrt(-pp / 3.0)
    const theta: f64 = Math.acos((3.0 * qq) / (pp * m)) / 3.0

    result[0] = m * Math.cos(theta) + shift
    result[1] = 0.0
    result[2] = m * Math.cos(theta - (2.0 * Math.PI) / 3.0) + shift
    result[3] = 0.0
    result[4] = m * Math.cos(theta - (4.0 * Math.PI) / 3.0) + shift
    result[5] = 0.0
  } else {
    // Multiple roots (discriminant ≈ 0)
    if (Math.abs(qq) < 1e-14) {
      // Triple root at 0
      result[0] = shift
      result[1] = 0.0
      result[2] = shift
      result[3] = 0.0
      result[4] = shift
      result[5] = 0.0
    } else {
      // One single root and one double root
      const u: f64 = Math.cbrt(-qq / 2.0)
      result[0] = 2.0 * u + shift
      result[1] = 0.0
      result[2] = -u + shift
      result[3] = 0.0
      result[4] = -u + shift
      result[5] = 0.0
    }
  }

  return result
}

// ============================================
// QUARTIC ROOTS (Ferrari's method)
// ============================================

/**
 * Find roots of quartic equation ax⁴ + bx³ + cx² + dx + e = 0
 * @param a - Coefficient of x⁴
 * @param b - Coefficient of x³
 * @param c - Coefficient of x²
 * @param d - Coefficient of x
 * @param e - Constant term
 * @returns [real1, imag1, real2, imag2, real3, imag3, real4, imag4] - Four complex roots
 */
export function quarticRoots(
  a: f64,
  b: f64,
  c: f64,
  d: f64,
  e: f64
): Float64Array {
  const result = new Float64Array(8)

  if (Math.abs(a) < 1e-14) {
    const cRoots = cubicRoots(b, c, d, e)
    for (let i: i32 = 0; i < 6; i++) {
      result[i] = cRoots[i]
    }
    result[6] = NaN
    result[7] = 0.0
    return result
  }

  // Normalize: x⁴ + px³ + qx² + rx + s = 0
  const p: f64 = b / a
  const q: f64 = c / a
  const r: f64 = d / a
  const s: f64 = e / a

  // Depressed quartic via x = t - p/4: t⁴ + αt² + βt + γ = 0
  const p2: f64 = p * p
  const alpha: f64 = q - (3.0 * p2) / 8.0
  const beta: f64 = r - (p * q) / 2.0 + (p2 * p) / 8.0
  const gamma: f64 =
    s - (p * r) / 4.0 + (p2 * q) / 16.0 - (3.0 * p2 * p2) / 256.0

  const shift: f64 = -p / 4.0

  if (Math.abs(beta) < 1e-14) {
    // Biquadratic: t⁴ + αt² + γ = 0
    const qRoots = quadraticRoots(1.0, alpha, gamma)
    const u1: f64 = qRoots[0]
    const u1i: f64 = qRoots[1]
    const u2: f64 = qRoots[2]
    const u2i: f64 = qRoots[3]

    // t = ±√u1, ±√u2
    if (u1i === 0.0 && u1 >= 0) {
      const sqrtU1: f64 = Math.sqrt(u1)
      result[0] = sqrtU1 + shift
      result[1] = 0.0
      result[2] = -sqrtU1 + shift
      result[3] = 0.0
    } else if (u1i === 0.0 && u1 < 0) {
      const sqrtNegU1: f64 = Math.sqrt(-u1)
      result[0] = shift
      result[1] = sqrtNegU1
      result[2] = shift
      result[3] = -sqrtNegU1
    } else {
      // u1 is complex
      const mag: f64 = Math.sqrt(u1 * u1 + u1i * u1i)
      const ang: f64 = Math.atan2(u1i, u1)
      const sqrtMag: f64 = Math.sqrt(mag)
      result[0] = sqrtMag * Math.cos(ang / 2.0) + shift
      result[1] = sqrtMag * Math.sin(ang / 2.0)
      result[2] = -sqrtMag * Math.cos(ang / 2.0) + shift
      result[3] = -sqrtMag * Math.sin(ang / 2.0)
    }

    if (u2i === 0.0 && u2 >= 0) {
      const sqrtU2: f64 = Math.sqrt(u2)
      result[4] = sqrtU2 + shift
      result[5] = 0.0
      result[6] = -sqrtU2 + shift
      result[7] = 0.0
    } else if (u2i === 0.0 && u2 < 0) {
      const sqrtNegU2: f64 = Math.sqrt(-u2)
      result[4] = shift
      result[5] = sqrtNegU2
      result[6] = shift
      result[7] = -sqrtNegU2
    } else {
      const mag2: f64 = Math.sqrt(u2 * u2 + u2i * u2i)
      const ang2: f64 = Math.atan2(u2i, u2)
      const sqrtMag2: f64 = Math.sqrt(mag2)
      result[4] = sqrtMag2 * Math.cos(ang2 / 2.0) + shift
      result[5] = sqrtMag2 * Math.sin(ang2 / 2.0)
      result[6] = -sqrtMag2 * Math.cos(ang2 / 2.0) + shift
      result[7] = -sqrtMag2 * Math.sin(ang2 / 2.0)
    }
  } else {
    // Ferrari's method: find y such that (t² + α/2 + y)² = (2y - α)t² - βt + y² - γ
    // The resolvent cubic: 8y³ - 4αy² - 8γy + (4αγ - β²) = 0
    const cRoots = cubicRoots(
      8.0,
      -4.0 * alpha,
      -8.0 * gamma,
      4.0 * alpha * gamma - beta * beta
    )

    // Take the real root with largest magnitude
    let y: f64 = cRoots[0]
    if (
      cRoots[1] === 0.0 &&
      Math.abs(cRoots[2]) > Math.abs(y) &&
      cRoots[3] === 0.0
    ) {
      y = cRoots[2]
    }
    if (cRoots[5] === 0.0 && Math.abs(cRoots[4]) > Math.abs(y)) {
      y = cRoots[4]
    }

    const W: f64 = 2.0 * y - alpha
    if (W >= 0) {
      const sqrtW: f64 = Math.sqrt(W)
      // Factor into two quadratics
      const q1Roots = quadraticRoots(1.0, sqrtW, y + beta / (2.0 * sqrtW))
      const q2Roots = quadraticRoots(1.0, -sqrtW, y - beta / (2.0 * sqrtW))

      result[0] = q1Roots[0] + shift
      result[1] = q1Roots[1]
      result[2] = q1Roots[2] + shift
      result[3] = q1Roots[3]
      result[4] = q2Roots[0] + shift
      result[5] = q2Roots[1]
      result[6] = q2Roots[2] + shift
      result[7] = q2Roots[3]
    } else {
      // W < 0: complex case, all roots complex
      const sqrtNegW: f64 = Math.sqrt(-W)
      // Use quadratic formula with complex arithmetic
      // This is a simplified handling for the complex case
      for (let i: i32 = 0; i < 8; i += 2) {
        result[i] = shift
        result[i + 1] = (sqrtNegW / 2.0) * (i < 4 ? 1.0 : -1.0)
      }
    }
  }

  return result
}

// ============================================
// GENERAL POLYNOMIAL ROOTS (Durand-Kerner)
// ============================================

/**
 * Find all roots of polynomial using Durand-Kerner (Weierstrass) iteration
 * @param coeffs - Coefficients [a0, a1, ..., an] where an ≠ 0
 * @param n - Number of coefficients (degree + 1)
 * @param maxIter - Maximum iterations
 * @param tol - Convergence tolerance
 * @returns Array of 2*degree values [real1, imag1, real2, imag2, ...]
 */
export function polyRoots(
  coeffs: Float64Array,
  n: i32,
  maxIter: i32,
  tol: f64
): Float64Array {
  const degree: i32 = n - 1

  if (degree <= 0) {
    return new Float64Array(0)
  }

  if (degree === 1) {
    // Linear: a0 + a1*x = 0 => x = -a0/a1
    const result = new Float64Array(2)
    result[0] = -coeffs[0] / coeffs[1]
    result[1] = 0.0
    return result
  }

  if (degree === 2) {
    return quadraticRoots(coeffs[2], coeffs[1], coeffs[0])
  }

  if (degree === 3) {
    return cubicRoots(coeffs[3], coeffs[2], coeffs[1], coeffs[0])
  }

  if (degree === 4) {
    return quarticRoots(coeffs[4], coeffs[3], coeffs[2], coeffs[1], coeffs[0])
  }

  // Normalize the polynomial
  const an: f64 = coeffs[degree]
  const normCoeffs = new Float64Array(n)
  for (let i: i32 = 0; i < n; i++) {
    normCoeffs[i] = coeffs[i] / an
  }

  // Initialize roots on a circle
  const roots = new Float64Array(degree * 2)
  const radius: f64 = 1.0 + Math.abs(normCoeffs[degree - 1])

  for (let i: i32 = 0; i < degree; i++) {
    const angle: f64 = (2.0 * Math.PI * f64(i)) / f64(degree) + 0.1
    roots[i * 2] = radius * Math.cos(angle)
    roots[i * 2 + 1] = radius * Math.sin(angle)
  }

  // Durand-Kerner iteration
  for (let iter: i32 = 0; iter < maxIter; iter++) {
    let maxDelta: f64 = 0.0

    for (let i: i32 = 0; i < degree; i++) {
      // Evaluate polynomial at root[i]
      const zi_re: f64 = roots[i * 2]
      const zi_im: f64 = roots[i * 2 + 1]

      // p(zi)
      let p_re: f64 = normCoeffs[degree]
      let p_im: f64 = 0.0

      for (let j: i32 = degree - 1; j >= 0; j--) {
        // (p_re + p_im*i) * (zi_re + zi_im*i)
        const temp_re: f64 = p_re * zi_re - p_im * zi_im
        const temp_im: f64 = p_re * zi_im + p_im * zi_re
        p_re = temp_re + normCoeffs[j]
        p_im = temp_im
      }

      // Product of (zi - zj) for j ≠ i
      let prod_re: f64 = 1.0
      let prod_im: f64 = 0.0

      for (let j: i32 = 0; j < degree; j++) {
        if (j !== i) {
          const diff_re: f64 = zi_re - roots[j * 2]
          const diff_im: f64 = zi_im - roots[j * 2 + 1]

          const new_re: f64 = prod_re * diff_re - prod_im * diff_im
          const new_im: f64 = prod_re * diff_im + prod_im * diff_re
          prod_re = new_re
          prod_im = new_im
        }
      }

      // delta = p(zi) / prod(zi - zj)
      const denom: f64 = prod_re * prod_re + prod_im * prod_im
      if (denom < 1e-30) continue

      const delta_re: f64 = (p_re * prod_re + p_im * prod_im) / denom
      const delta_im: f64 = (p_im * prod_re - p_re * prod_im) / denom

      // Update root
      roots[i * 2] -= delta_re
      roots[i * 2 + 1] -= delta_im

      const deltaMag: f64 = Math.sqrt(delta_re * delta_re + delta_im * delta_im)
      if (deltaMag > maxDelta) {
        maxDelta = deltaMag
      }
    }

    if (maxDelta < tol) {
      break
    }
  }

  // Clean up near-real roots
  for (let i: i32 = 0; i < degree; i++) {
    if (Math.abs(roots[i * 2 + 1]) < tol) {
      roots[i * 2 + 1] = 0.0
    }
  }

  return roots
}

// ============================================
// POLYNOMIAL DERIVATIVE
// ============================================

/**
 * Compute the derivative of a polynomial
 * @param coeffs - Coefficients [a0, a1, ..., an]
 * @param n - Number of coefficients
 * @returns Derivative coefficients [a1, 2*a2, ..., n*an]
 */
export function polyDerivative(coeffs: Float64Array, n: i32): Float64Array {
  if (n <= 1) {
    return new Float64Array(1) // Constant polynomial has derivative 0
  }

  const result = new Float64Array(n - 1)
  for (let i: i32 = 1; i < n; i++) {
    result[i - 1] = f64(i) * coeffs[i]
  }
  return result
}

// ============================================
// POLYNOMIAL MULTIPLICATION
// ============================================

/**
 * Multiply two polynomials
 * @param a - First polynomial coefficients
 * @param na - Length of first polynomial
 * @param b - Second polynomial coefficients
 * @param nb - Length of second polynomial
 * @returns Product polynomial coefficients
 */
export function polyMultiply(
  a: Float64Array,
  na: i32,
  b: Float64Array,
  nb: i32
): Float64Array {
  const nc: i32 = na + nb - 1
  const result = new Float64Array(nc)

  for (let i: i32 = 0; i < na; i++) {
    for (let j: i32 = 0; j < nb; j++) {
      result[i + j] += a[i] * b[j]
    }
  }

  return result
}

// ============================================
// POLYNOMIAL DIVISION
// ============================================

/**
 * Divide polynomial a by polynomial b
 * a = b * quotient + remainder
 * @param a - Dividend coefficients
 * @param na - Length of dividend
 * @param b - Divisor coefficients
 * @param nb - Length of divisor
 * @returns [quotient..., remainder...] with lengths (na-nb+1, nb-1)
 */
export function polyDivide(
  a: Float64Array,
  na: i32,
  b: Float64Array,
  nb: i32
): Float64Array {
  if (nb > na || nb === 0) {
    // Cannot divide, return zeros
    return new Float64Array(na)
  }

  const nq: i32 = na - nb + 1
  const nr: i32 = nb - 1

  // Copy a to remainder
  const rem = new Float64Array(na)
  for (let i: i32 = 0; i < na; i++) {
    rem[i] = a[i]
  }

  const quot = new Float64Array(nq)
  const bn: f64 = b[nb - 1]

  for (let i: i32 = na - 1; i >= nb - 1; i--) {
    const q: f64 = rem[i] / bn
    quot[i - nb + 1] = q

    for (let j: i32 = 0; j < nb; j++) {
      rem[i - nb + 1 + j] -= q * b[j]
    }
  }

  // Pack result: quotient first, then remainder
  const result = new Float64Array(nq + nr)
  for (let i: i32 = 0; i < nq; i++) {
    result[i] = quot[i]
  }
  for (let i: i32 = 0; i < nr; i++) {
    result[nq + i] = rem[i]
  }

  return result
}
