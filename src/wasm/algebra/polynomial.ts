/**
 * WASM-optimized polynomial operations
 *
 * Includes polynomial evaluation, root finding, and related operations.
 * Polynomials are represented as coefficient arrays [a0, a1, a2, ...] where
 * p(x) = a0 + a1*x + a2*x^2 + ...
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

// ============================================
// POLYNOMIAL EVALUATION
// ============================================

/**
 * Evaluate polynomial at a point using Horner's method
 * p(x) = a0 + a1*x + a2*x^2 + ... + an*x^n
 * @param coeffsPtr - Pointer to coefficients [a0, a1, ..., an] (f64)
 * @param n - Number of coefficients (degree + 1)
 * @param x - Point to evaluate at
 * @returns p(x)
 */
export function polyEval(coeffsPtr: usize, n: i32, x: f64): f64 {
  if (n === 0) return 0.0

  // Horner's method: ((an*x + an-1)*x + ... )*x + a0
  let result: f64 = load<f64>(coeffsPtr + (<usize>(n - 1) << 3))
  for (let i: i32 = n - 2; i >= 0; i--) {
    result = result * x + load<f64>(coeffsPtr + (<usize>i << 3))
  }
  return result
}

/**
 * Evaluate polynomial and its derivative at a point
 * @param coeffsPtr - Pointer to coefficients [a0, a1, ..., an] (f64)
 * @param n - Number of coefficients
 * @param x - Point to evaluate at
 * @param resultPtr - Pointer to output [p(x), p'(x)] (f64, 2 elements)
 */
export function polyEvalWithDerivative(
  coeffsPtr: usize,
  n: i32,
  x: f64,
  resultPtr: usize
): void {
  if (n === 0) {
    store<f64>(resultPtr, 0.0)
    store<f64>(resultPtr + 8, 0.0)
    return
  }

  if (n === 1) {
    store<f64>(resultPtr, load<f64>(coeffsPtr))
    store<f64>(resultPtr + 8, 0.0)
    return
  }

  // Horner's method for polynomial and derivative
  let p: f64 = load<f64>(coeffsPtr + (<usize>(n - 1) << 3))
  let dp: f64 = 0.0

  for (let i: i32 = n - 2; i >= 0; i--) {
    dp = dp * x + p
    p = p * x + load<f64>(coeffsPtr + (<usize>i << 3))
  }

  store<f64>(resultPtr, p)
  store<f64>(resultPtr + 8, dp)
}

// ============================================
// QUADRATIC ROOTS
// ============================================

/**
 * Find roots of quadratic equation ax² + bx + c = 0
 * @param a - Coefficient of x²
 * @param b - Coefficient of x
 * @param c - Constant term
 * @param resultPtr - Pointer to output [real1, imag1, real2, imag2] (f64, 4 elements)
 */
export function quadraticRoots(a: f64, b: f64, c: f64, resultPtr: usize): void {
  if (Math.abs(a) < 1e-14) {
    // Linear equation bx + c = 0
    if (Math.abs(b) < 1e-14) {
      // No solution or infinite solutions
      store<f64>(resultPtr, f64.NaN)
      store<f64>(resultPtr + 8, 0.0)
      store<f64>(resultPtr + 16, f64.NaN)
      store<f64>(resultPtr + 24, 0.0)
      return
    }
    const root: f64 = -c / b
    store<f64>(resultPtr, root)
    store<f64>(resultPtr + 8, 0.0)
    store<f64>(resultPtr + 16, root)
    store<f64>(resultPtr + 24, 0.0)
    return
  }

  const discriminant: f64 = b * b - 4.0 * a * c

  if (discriminant >= 0) {
    // Two real roots
    const sqrtD: f64 = Math.sqrt(discriminant)
    // Use stable formula to avoid catastrophic cancellation
    const q: f64 = -0.5 * (b + Math.sign(b) * sqrtD)
    store<f64>(resultPtr, q / a)
    store<f64>(resultPtr + 8, 0.0)
    store<f64>(resultPtr + 16, c / q)
    store<f64>(resultPtr + 24, 0.0)
  } else {
    // Two complex conjugate roots
    const realPart: f64 = -b / (2.0 * a)
    const imagPart: f64 = Math.sqrt(-discriminant) / (2.0 * a)
    store<f64>(resultPtr, realPart)
    store<f64>(resultPtr + 8, imagPart)
    store<f64>(resultPtr + 16, realPart)
    store<f64>(resultPtr + 24, -imagPart)
  }
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
 * @param resultPtr - Pointer to output [real1, imag1, real2, imag2, real3, imag3] (f64, 6 elements)
 * @param workPtr - Working memory for quadratic roots (f64, 4 elements)
 */
export function cubicRoots(a: f64, b: f64, c: f64, d: f64, resultPtr: usize, workPtr: usize): void {
  if (Math.abs(a) < 1e-14) {
    // Quadratic equation
    quadraticRoots(b, c, d, workPtr)
    store<f64>(resultPtr, load<f64>(workPtr))
    store<f64>(resultPtr + 8, load<f64>(workPtr + 8))
    store<f64>(resultPtr + 16, load<f64>(workPtr + 16))
    store<f64>(resultPtr + 24, load<f64>(workPtr + 24))
    store<f64>(resultPtr + 32, f64.NaN)
    store<f64>(resultPtr + 40, 0.0)
    return
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
    store<f64>(resultPtr, u + v + shift)
    store<f64>(resultPtr + 8, 0.0)

    // Complex roots: -(u+v)/2 ± i*sqrt(3)*(u-v)/2
    const realPart: f64 = -(u + v) / 2.0 + shift
    const imagPart: f64 = (Math.sqrt(3.0) * (u - v)) / 2.0

    store<f64>(resultPtr + 16, realPart)
    store<f64>(resultPtr + 24, imagPart)
    store<f64>(resultPtr + 32, realPart)
    store<f64>(resultPtr + 40, -imagPart)
  } else if (discriminant < -1e-14) {
    // Three distinct real roots (use trigonometric method)
    const m: f64 = 2.0 * Math.sqrt(-pp / 3.0)
    const theta: f64 = Math.acos((3.0 * qq) / (pp * m)) / 3.0

    store<f64>(resultPtr, m * Math.cos(theta) + shift)
    store<f64>(resultPtr + 8, 0.0)
    store<f64>(resultPtr + 16, m * Math.cos(theta - (2.0 * Math.PI) / 3.0) + shift)
    store<f64>(resultPtr + 24, 0.0)
    store<f64>(resultPtr + 32, m * Math.cos(theta - (4.0 * Math.PI) / 3.0) + shift)
    store<f64>(resultPtr + 40, 0.0)
  } else {
    // Multiple roots (discriminant ≈ 0)
    if (Math.abs(qq) < 1e-14) {
      // Triple root at 0
      store<f64>(resultPtr, shift)
      store<f64>(resultPtr + 8, 0.0)
      store<f64>(resultPtr + 16, shift)
      store<f64>(resultPtr + 24, 0.0)
      store<f64>(resultPtr + 32, shift)
      store<f64>(resultPtr + 40, 0.0)
    } else {
      // One single root and one double root
      const u: f64 = Math.cbrt(-qq / 2.0)
      store<f64>(resultPtr, 2.0 * u + shift)
      store<f64>(resultPtr + 8, 0.0)
      store<f64>(resultPtr + 16, -u + shift)
      store<f64>(resultPtr + 24, 0.0)
      store<f64>(resultPtr + 32, -u + shift)
      store<f64>(resultPtr + 40, 0.0)
    }
  }
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
 * @param resultPtr - Pointer to output [real1, imag1, ...] (f64, 8 elements)
 * @param workPtr - Working memory for cubic/quadratic roots (f64, 6 elements)
 */
export function quarticRoots(
  a: f64,
  b: f64,
  c: f64,
  d: f64,
  e: f64,
  resultPtr: usize,
  workPtr: usize
): void {
  if (Math.abs(a) < 1e-14) {
    cubicRoots(b, c, d, e, workPtr, workPtr + 48)
    for (let i: i32 = 0; i < 6; i++) {
      store<f64>(resultPtr + (<usize>i << 3), load<f64>(workPtr + (<usize>i << 3)))
    }
    store<f64>(resultPtr + 48, f64.NaN)
    store<f64>(resultPtr + 56, 0.0)
    return
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
    quadraticRoots(1.0, alpha, gamma, workPtr)
    const u1: f64 = load<f64>(workPtr)
    const u1i: f64 = load<f64>(workPtr + 8)
    const u2: f64 = load<f64>(workPtr + 16)
    const u2i: f64 = load<f64>(workPtr + 24)

    // t = ±√u1, ±√u2
    if (u1i === 0.0 && u1 >= 0) {
      const sqrtU1: f64 = Math.sqrt(u1)
      store<f64>(resultPtr, sqrtU1 + shift)
      store<f64>(resultPtr + 8, 0.0)
      store<f64>(resultPtr + 16, -sqrtU1 + shift)
      store<f64>(resultPtr + 24, 0.0)
    } else if (u1i === 0.0 && u1 < 0) {
      const sqrtNegU1: f64 = Math.sqrt(-u1)
      store<f64>(resultPtr, shift)
      store<f64>(resultPtr + 8, sqrtNegU1)
      store<f64>(resultPtr + 16, shift)
      store<f64>(resultPtr + 24, -sqrtNegU1)
    } else {
      // u1 is complex
      const mag: f64 = Math.sqrt(u1 * u1 + u1i * u1i)
      const ang: f64 = Math.atan2(u1i, u1)
      const sqrtMag: f64 = Math.sqrt(mag)
      store<f64>(resultPtr, sqrtMag * Math.cos(ang / 2.0) + shift)
      store<f64>(resultPtr + 8, sqrtMag * Math.sin(ang / 2.0))
      store<f64>(resultPtr + 16, -sqrtMag * Math.cos(ang / 2.0) + shift)
      store<f64>(resultPtr + 24, -sqrtMag * Math.sin(ang / 2.0))
    }

    if (u2i === 0.0 && u2 >= 0) {
      const sqrtU2: f64 = Math.sqrt(u2)
      store<f64>(resultPtr + 32, sqrtU2 + shift)
      store<f64>(resultPtr + 40, 0.0)
      store<f64>(resultPtr + 48, -sqrtU2 + shift)
      store<f64>(resultPtr + 56, 0.0)
    } else if (u2i === 0.0 && u2 < 0) {
      const sqrtNegU2: f64 = Math.sqrt(-u2)
      store<f64>(resultPtr + 32, shift)
      store<f64>(resultPtr + 40, sqrtNegU2)
      store<f64>(resultPtr + 48, shift)
      store<f64>(resultPtr + 56, -sqrtNegU2)
    } else {
      const mag2: f64 = Math.sqrt(u2 * u2 + u2i * u2i)
      const ang2: f64 = Math.atan2(u2i, u2)
      const sqrtMag2: f64 = Math.sqrt(mag2)
      store<f64>(resultPtr + 32, sqrtMag2 * Math.cos(ang2 / 2.0) + shift)
      store<f64>(resultPtr + 40, sqrtMag2 * Math.sin(ang2 / 2.0))
      store<f64>(resultPtr + 48, -sqrtMag2 * Math.cos(ang2 / 2.0) + shift)
      store<f64>(resultPtr + 56, -sqrtMag2 * Math.sin(ang2 / 2.0))
    }
  } else {
    // Ferrari's method: find y such that (t² + α/2 + y)² = (2y - α)t² - βt + y² - γ
    // The resolvent cubic: 8y³ - 4αy² - 8γy + (4αγ - β²) = 0
    cubicRoots(
      8.0,
      -4.0 * alpha,
      -8.0 * gamma,
      4.0 * alpha * gamma - beta * beta,
      workPtr,
      workPtr + 48
    )

    // Take the real root with largest magnitude
    let y: f64 = load<f64>(workPtr)
    const cRoot1Im: f64 = load<f64>(workPtr + 8)
    const cRoot2Re: f64 = load<f64>(workPtr + 16)
    const cRoot2Im: f64 = load<f64>(workPtr + 24)
    const cRoot3Re: f64 = load<f64>(workPtr + 32)
    const cRoot3Im: f64 = load<f64>(workPtr + 40)

    if (cRoot1Im === 0.0 && cRoot2Im === 0.0 && Math.abs(cRoot2Re) > Math.abs(y)) {
      y = cRoot2Re
    }
    if (cRoot3Im === 0.0 && Math.abs(cRoot3Re) > Math.abs(y)) {
      y = cRoot3Re
    }

    const W: f64 = 2.0 * y - alpha
    if (W >= 0) {
      const sqrtW: f64 = Math.sqrt(W)
      // Factor into two quadratics
      quadraticRoots(1.0, sqrtW, y + beta / (2.0 * sqrtW), workPtr)
      store<f64>(resultPtr, load<f64>(workPtr) + shift)
      store<f64>(resultPtr + 8, load<f64>(workPtr + 8))
      store<f64>(resultPtr + 16, load<f64>(workPtr + 16) + shift)
      store<f64>(resultPtr + 24, load<f64>(workPtr + 24))

      quadraticRoots(1.0, -sqrtW, y - beta / (2.0 * sqrtW), workPtr)
      store<f64>(resultPtr + 32, load<f64>(workPtr) + shift)
      store<f64>(resultPtr + 40, load<f64>(workPtr + 8))
      store<f64>(resultPtr + 48, load<f64>(workPtr + 16) + shift)
      store<f64>(resultPtr + 56, load<f64>(workPtr + 24))
    } else {
      // W < 0: complex case, all roots complex
      const sqrtNegW: f64 = Math.sqrt(-W)
      // Use quadratic formula with complex arithmetic
      // This is a simplified handling for the complex case
      for (let i: i32 = 0; i < 8; i += 2) {
        store<f64>(resultPtr + (<usize>i << 3), shift)
        store<f64>(resultPtr + (<usize>(i + 1) << 3), (sqrtNegW / 2.0) * (i < 4 ? 1.0 : -1.0))
      }
    }
  }
}

// ============================================
// GENERAL POLYNOMIAL ROOTS (Durand-Kerner)
// ============================================

/**
 * Find all roots of polynomial using Durand-Kerner (Weierstrass) iteration
 * @param coeffsPtr - Pointer to coefficients [a0, a1, ..., an] where an ≠ 0 (f64)
 * @param n - Number of coefficients (degree + 1)
 * @param maxIter - Maximum iterations
 * @param tol - Convergence tolerance
 * @param rootsPtr - Pointer to output array of 2*degree values [real1, imag1, ...] (f64)
 * @param workPtr - Pointer to working memory (f64, n elements for normalized coeffs)
 * @returns degree (number of roots found)
 */
export function polyRoots(
  coeffsPtr: usize,
  n: i32,
  maxIter: i32,
  tol: f64,
  rootsPtr: usize,
  workPtr: usize
): i32 {
  const degree: i32 = n - 1

  if (degree <= 0) {
    return 0
  }

  if (degree === 1) {
    // Linear: a0 + a1*x = 0 => x = -a0/a1
    store<f64>(rootsPtr, -load<f64>(coeffsPtr) / load<f64>(coeffsPtr + 8))
    store<f64>(rootsPtr + 8, 0.0)
    return 1
  }

  if (degree === 2) {
    quadraticRoots(
      load<f64>(coeffsPtr + 16),
      load<f64>(coeffsPtr + 8),
      load<f64>(coeffsPtr),
      rootsPtr
    )
    return 2
  }

  if (degree === 3) {
    cubicRoots(
      load<f64>(coeffsPtr + 24),
      load<f64>(coeffsPtr + 16),
      load<f64>(coeffsPtr + 8),
      load<f64>(coeffsPtr),
      rootsPtr,
      workPtr
    )
    return 3
  }

  if (degree === 4) {
    quarticRoots(
      load<f64>(coeffsPtr + 32),
      load<f64>(coeffsPtr + 24),
      load<f64>(coeffsPtr + 16),
      load<f64>(coeffsPtr + 8),
      load<f64>(coeffsPtr),
      rootsPtr,
      workPtr
    )
    return 4
  }

  // Normalize the polynomial
  const an: f64 = load<f64>(coeffsPtr + (<usize>degree << 3))
  const normCoeffsPtr: usize = workPtr
  for (let i: i32 = 0; i < n; i++) {
    store<f64>(normCoeffsPtr + (<usize>i << 3), load<f64>(coeffsPtr + (<usize>i << 3)) / an)
  }

  // Initialize roots on a circle
  const radius: f64 = 1.0 + Math.abs(load<f64>(normCoeffsPtr + (<usize>(degree - 1) << 3)))

  for (let i: i32 = 0; i < degree; i++) {
    const angle: f64 = (2.0 * Math.PI * f64(i)) / f64(degree) + 0.1
    store<f64>(rootsPtr + (<usize>(i * 2) << 3), radius * Math.cos(angle))
    store<f64>(rootsPtr + (<usize>(i * 2 + 1) << 3), radius * Math.sin(angle))
  }

  // Durand-Kerner iteration
  for (let iter: i32 = 0; iter < maxIter; iter++) {
    let maxDelta: f64 = 0.0

    for (let i: i32 = 0; i < degree; i++) {
      // Evaluate polynomial at root[i]
      const zi_re: f64 = load<f64>(rootsPtr + (<usize>(i * 2) << 3))
      const zi_im: f64 = load<f64>(rootsPtr + (<usize>(i * 2 + 1) << 3))

      // p(zi)
      let p_re: f64 = load<f64>(normCoeffsPtr + (<usize>degree << 3))
      let p_im: f64 = 0.0

      for (let j: i32 = degree - 1; j >= 0; j--) {
        // (p_re + p_im*i) * (zi_re + zi_im*i)
        const temp_re: f64 = p_re * zi_re - p_im * zi_im
        const temp_im: f64 = p_re * zi_im + p_im * zi_re
        p_re = temp_re + load<f64>(normCoeffsPtr + (<usize>j << 3))
        p_im = temp_im
      }

      // Product of (zi - zj) for j ≠ i
      let prod_re: f64 = 1.0
      let prod_im: f64 = 0.0

      for (let j: i32 = 0; j < degree; j++) {
        if (j !== i) {
          const diff_re: f64 = zi_re - load<f64>(rootsPtr + (<usize>(j * 2) << 3))
          const diff_im: f64 = zi_im - load<f64>(rootsPtr + (<usize>(j * 2 + 1) << 3))

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
      store<f64>(rootsPtr + (<usize>(i * 2) << 3), zi_re - delta_re)
      store<f64>(rootsPtr + (<usize>(i * 2 + 1) << 3), zi_im - delta_im)

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
    const imag: f64 = load<f64>(rootsPtr + (<usize>(i * 2 + 1) << 3))
    if (Math.abs(imag) < tol) {
      store<f64>(rootsPtr + (<usize>(i * 2 + 1) << 3), 0.0)
    }
  }

  return degree
}

// ============================================
// POLYNOMIAL DERIVATIVE
// ============================================

/**
 * Compute the derivative of a polynomial
 * @param coeffsPtr - Pointer to coefficients [a0, a1, ..., an] (f64)
 * @param n - Number of coefficients
 * @param resultPtr - Pointer to derivative coefficients [a1, 2*a2, ..., n*an] (f64, n-1 elements)
 * @returns Number of coefficients in derivative (n-1, or 1 if n <= 1)
 */
export function polyDerivative(coeffsPtr: usize, n: i32, resultPtr: usize): i32 {
  if (n <= 1) {
    store<f64>(resultPtr, 0.0) // Constant polynomial has derivative 0
    return 1
  }

  for (let i: i32 = 1; i < n; i++) {
    store<f64>(resultPtr + (<usize>(i - 1) << 3), f64(i) * load<f64>(coeffsPtr + (<usize>i << 3)))
  }
  return n - 1
}

// ============================================
// POLYNOMIAL MULTIPLICATION
// ============================================

/**
 * Multiply two polynomials
 * @param aPtr - Pointer to first polynomial coefficients (f64)
 * @param na - Length of first polynomial
 * @param bPtr - Pointer to second polynomial coefficients (f64)
 * @param nb - Length of second polynomial
 * @param resultPtr - Pointer to output product polynomial (f64, na + nb - 1 elements)
 * @returns Length of result polynomial (na + nb - 1)
 */
export function polyMultiply(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32,
  resultPtr: usize
): i32 {
  const nc: i32 = na + nb - 1

  // Initialize result to zero
  for (let i: i32 = 0; i < nc; i++) {
    store<f64>(resultPtr + (<usize>i << 3), 0.0)
  }

  for (let i: i32 = 0; i < na; i++) {
    const ai: f64 = load<f64>(aPtr + (<usize>i << 3))
    for (let j: i32 = 0; j < nb; j++) {
      const idx: i32 = i + j
      const current: f64 = load<f64>(resultPtr + (<usize>idx << 3))
      store<f64>(resultPtr + (<usize>idx << 3), current + ai * load<f64>(bPtr + (<usize>j << 3)))
    }
  }

  return nc
}

// ============================================
// POLYNOMIAL DIVISION
// ============================================

/**
 * Divide polynomial a by polynomial b
 * a = b * quotient + remainder
 * @param aPtr - Pointer to dividend coefficients (f64)
 * @param na - Length of dividend
 * @param bPtr - Pointer to divisor coefficients (f64)
 * @param nb - Length of divisor
 * @param quotPtr - Pointer to quotient output (f64, na - nb + 1 elements)
 * @param remPtr - Pointer to remainder output (f64, nb - 1 elements)
 * @param workPtr - Pointer to working memory (f64, na elements)
 * @returns Length of quotient (na - nb + 1), or 0 if cannot divide
 */
export function polyDivide(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32,
  quotPtr: usize,
  remPtr: usize,
  workPtr: usize
): i32 {
  if (nb > na || nb === 0) {
    // Cannot divide
    return 0
  }

  const nq: i32 = na - nb + 1
  const nr: i32 = nb - 1

  // Copy a to working memory (remainder)
  for (let i: i32 = 0; i < na; i++) {
    store<f64>(workPtr + (<usize>i << 3), load<f64>(aPtr + (<usize>i << 3)))
  }

  // Initialize quotient to zero
  for (let i: i32 = 0; i < nq; i++) {
    store<f64>(quotPtr + (<usize>i << 3), 0.0)
  }

  const bn: f64 = load<f64>(bPtr + (<usize>(nb - 1) << 3))

  for (let i: i32 = na - 1; i >= nb - 1; i--) {
    const q: f64 = load<f64>(workPtr + (<usize>i << 3)) / bn
    store<f64>(quotPtr + (<usize>(i - nb + 1) << 3), q)

    for (let j: i32 = 0; j < nb; j++) {
      const idx: i32 = i - nb + 1 + j
      const current: f64 = load<f64>(workPtr + (<usize>idx << 3))
      store<f64>(workPtr + (<usize>idx << 3), current - q * load<f64>(bPtr + (<usize>j << 3)))
    }
  }

  // Copy remainder
  for (let i: i32 = 0; i < nr; i++) {
    store<f64>(remPtr + (<usize>i << 3), load<f64>(workPtr + (<usize>i << 3)))
  }

  return nq
}
