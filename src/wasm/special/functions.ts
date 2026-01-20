/**
 * WASM-optimized special mathematical functions using AssemblyScript
 */

// Constants
const PI: f64 = 3.141592653589793
const SQRT_PI: f64 = 1.7724538509055159
const SQRT_2: f64 = 1.4142135623730951
const LN_2: f64 = 0.6931471805599453
const LN_PI: f64 = 1.1447298858494002
const EULER_MASCHERONI: f64 = 0.5772156649015329

// Coefficients for erf approximation (Horner form)
const ERF_A1: f64 = 0.254829592
const ERF_A2: f64 = -0.284496736
const ERF_A3: f64 = 1.421413741
const ERF_A4: f64 = -1.453152027
const ERF_A5: f64 = 1.061405429
const ERF_P: f64 = 0.3275911

// Coefficients for gamma function (Lanczos approximation)
const LANCZOS_G: f64 = 7.0
const LANCZOS_COEFFICIENTS: StaticArray<f64> = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
]

/**
 * Compute the error function erf(x)
 * Uses Horner's method for polynomial approximation
 * @param x - Input value
 * @returns erf(x)
 */
export function erf(x: f64): f64 {
  // Save the sign of x
  const sign: f64 = x >= 0 ? 1.0 : -1.0
  x = Math.abs(x)

  // Abramowitz and Stegun approximation (maximum error: 1.5e-7)
  const t: f64 = 1.0 / (1.0 + ERF_P * x)
  const t2: f64 = t * t
  const t3: f64 = t2 * t
  const t4: f64 = t3 * t
  const t5: f64 = t4 * t

  const y: f64 =
    1.0 -
    (ERF_A1 * t + ERF_A2 * t2 + ERF_A3 * t3 + ERF_A4 * t4 + ERF_A5 * t5) *
      Math.exp(-x * x)

  return sign * y
}

/**
 * Compute erf for an array of values
 * @param a - Input array
 * @returns Array of erf values
 */
export function erfArray(a: Float64Array): Float64Array {
  const n: i32 = a.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = erf(a[i])
  }

  return result
}

/**
 * Compute the complementary error function erfc(x) = 1 - erf(x)
 * @param x - Input value
 * @returns erfc(x)
 */
export function erfc(x: f64): f64 {
  return 1.0 - erf(x)
}

/**
 * Compute erfc for an array of values
 * @param a - Input array
 * @returns Array of erfc values
 */
export function erfcArray(a: Float64Array): Float64Array {
  const n: i32 = a.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = erfc(a[i])
  }

  return result
}

/**
 * Compute the gamma function using Lanczos approximation
 * @param x - Input value
 * @returns gamma(x)
 */
export function gamma(x: f64): f64 {
  // Handle special cases
  if (x !== x) return f64.NaN // NaN check

  // Reflection formula for negative values
  if (x < 0.5) {
    return PI / (Math.sin(PI * x) * gamma(1.0 - x))
  }

  x -= 1.0

  let a: f64 = LANCZOS_COEFFICIENTS[0]
  const t: f64 = x + LANCZOS_G + 0.5

  for (let i: i32 = 1; i < 9; i++) {
    a += LANCZOS_COEFFICIENTS[i] / (x + <f64>i)
  }

  return SQRT_2 * SQRT_PI * Math.pow(t, x + 0.5) * Math.exp(-t) * a
}

/**
 * Compute gamma for an array of values
 * @param a - Input array
 * @returns Array of gamma values
 */
export function gammaArray(a: Float64Array): Float64Array {
  const n: i32 = a.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = gamma(a[i])
  }

  return result
}

/**
 * Compute the natural logarithm of the gamma function
 * @param x - Input value (must be positive)
 * @returns ln(gamma(x))
 */
export function lgamma(x: f64): f64 {
  if (x <= 0) return f64.POSITIVE_INFINITY

  // For small x, use reflection
  if (x < 0.5) {
    return LN_PI - Math.log(Math.abs(Math.sin(PI * x))) - lgamma(1.0 - x)
  }

  x -= 1.0

  let a: f64 = LANCZOS_COEFFICIENTS[0]
  const t: f64 = x + LANCZOS_G + 0.5

  for (let i: i32 = 1; i < 9; i++) {
    a += LANCZOS_COEFFICIENTS[i] / (x + <f64>i)
  }

  return 0.5 * Math.log(2.0 * PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

/**
 * Compute lgamma for an array of values
 * @param a - Input array
 * @returns Array of lgamma values
 */
export function lgammaArray(a: Float64Array): Float64Array {
  const n: i32 = a.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = lgamma(a[i])
  }

  return result
}

/**
 * Compute the Riemann zeta function for real s > 1
 * Uses series acceleration for convergence
 * @param s - Input value (s > 1 for convergence)
 * @returns zeta(s)
 */
export function zeta(s: f64): f64 {
  // Special cases
  if (s === 1.0) return f64.POSITIVE_INFINITY
  if (s === 0.0) return -0.5
  if (s < 0.0 && Math.floor(s) === s && ((<i32>s) & 1) === 0) {
    // Trivial zeros at negative even integers
    return 0.0
  }

  // For s > 1, use accelerated series
  if (s > 1.0) {
    return zetaPositive(s)
  }

  // For s < 1, use reflection formula
  // zeta(s) = 2^s * pi^(s-1) * sin(pi*s/2) * gamma(1-s) * zeta(1-s)
  const factor: f64 =
    Math.pow(2.0, s) *
    Math.pow(PI, s - 1.0) *
    Math.sin((PI * s) / 2.0) *
    gamma(1.0 - s)

  return factor * zetaPositive(1.0 - s)
}

/**
 * Helper function: Compute zeta for s > 1 using Borwein's algorithm
 * @param s - Input value (s > 1)
 * @returns zeta(s)
 */
function zetaPositive(s: f64): f64 {
  // Use simple series with acceleration for moderate precision
  const n: i32 = 50 // Number of terms

  let sum: f64 = 0.0
  let sign: f64 = 1.0

  // Dirichlet eta function: eta(s) = sum_{n=1}^inf (-1)^(n-1) / n^s
  // zeta(s) = eta(s) / (1 - 2^(1-s))
  for (let k: i32 = 1; k <= n; k++) {
    sum += sign / Math.pow(<f64>k, s)
    sign = -sign
  }

  // Convert eta to zeta
  const eta: f64 = sum
  const conversion: f64 = 1.0 - Math.pow(2.0, 1.0 - s)

  if (Math.abs(conversion) < 1e-15) {
    // Near s = 1, use direct sum
    sum = 0.0
    for (let k: i32 = 1; k <= n * 2; k++) {
      sum += 1.0 / Math.pow(<f64>k, s)
    }
    return sum
  }

  return eta / conversion
}

/**
 * Compute zeta for an array of values
 * @param a - Input array
 * @returns Array of zeta values
 */
export function zetaArray(a: Float64Array): Float64Array {
  const n: i32 = a.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = zeta(a[i])
  }

  return result
}

/**
 * Compute the beta function B(a, b) = gamma(a) * gamma(b) / gamma(a + b)
 * @param a - First parameter
 * @param b - Second parameter
 * @returns beta(a, b)
 */
export function beta(a: f64, b: f64): f64 {
  // Use log-gamma for numerical stability
  return Math.exp(lgamma(a) + lgamma(b) - lgamma(a + b))
}

/**
 * Compute the incomplete gamma function P(a, x) = gamma(a, x) / Gamma(a)
 * Also known as the regularized lower incomplete gamma function
 * @param a - Shape parameter
 * @param x - Upper limit
 * @returns P(a, x)
 */
export function gammainc(a: f64, x: f64): f64 {
  if (x < 0.0 || a <= 0.0) return f64.NaN
  if (x === 0.0) return 0.0

  // Use series expansion for small x
  if (x < a + 1.0) {
    return gammainc_series(a, x)
  }

  // Use continued fraction for large x
  return 1.0 - gammainc_cf(a, x)
}

/**
 * Series expansion for incomplete gamma function
 */
function gammainc_series(a: f64, x: f64): f64 {
  const maxIterations: i32 = 100
  const epsilon: f64 = 1e-15

  let sum: f64 = 1.0 / a
  let term: f64 = 1.0 / a

  for (let n: i32 = 1; n < maxIterations; n++) {
    term *= x / (a + <f64>n)
    sum += term

    if (Math.abs(term) < epsilon * Math.abs(sum)) {
      break
    }
  }

  return sum * Math.exp(-x + a * Math.log(x) - lgamma(a))
}

/**
 * Continued fraction for complementary incomplete gamma function
 */
function gammainc_cf(a: f64, x: f64): f64 {
  const maxIterations: i32 = 100
  const epsilon: f64 = 1e-15

  let b: f64 = x + 1.0 - a
  let c: f64 = 1.0 / 1e-30
  let d: f64 = 1.0 / b
  let h: f64 = d

  for (let i: i32 = 1; i < maxIterations; i++) {
    const an: f64 = -(<f64>i) * (<f64>i - a)
    b += 2.0
    d = an * d + b
    if (Math.abs(d) < 1e-30) d = 1e-30
    c = b + an / c
    if (Math.abs(c) < 1e-30) c = 1e-30
    d = 1.0 / d
    const del: f64 = d * c
    h *= del

    if (Math.abs(del - 1.0) < epsilon) {
      break
    }
  }

  return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h
}

/**
 * Compute the digamma function (psi function)
 * psi(x) = d/dx ln(gamma(x)) = gamma'(x) / gamma(x)
 * @param x - Input value
 * @returns psi(x)
 */
export function digamma(x: f64): f64 {
  // Handle negative values using reflection
  if (x < 0.0) {
    return digamma(1.0 - x) - PI / Math.tan(PI * x)
  }

  // For small x, use recurrence
  let result: f64 = 0.0
  while (x < 6.0) {
    result -= 1.0 / x
    x += 1.0
  }

  // Asymptotic expansion for large x
  const x2: f64 = 1.0 / (x * x)
  result +=
    Math.log(x) -
    0.5 / x -
    x2 *
      (1.0 / 12.0 -
        x2 * (1.0 / 120.0 - x2 * (1.0 / 252.0 - x2 * (1.0 / 240.0))))

  return result
}

/**
 * Compute digamma for an array of values
 * @param a - Input array
 * @returns Array of digamma values
 */
export function digammaArray(a: Float64Array): Float64Array {
  const n: i32 = a.length
  const result = new Float64Array(n)

  for (let i: i32 = 0; i < n; i++) {
    result[i] = digamma(a[i])
  }

  return result
}

/**
 * Compute the Bessel function J0(x)
 * @param x - Input value
 * @returns J0(x)
 */
export function besselJ0(x: f64): f64 {
  x = Math.abs(x)

  if (x < 8.0) {
    const y: f64 = x * x
    const ans1: f64 =
      57568490574.0 +
      y *
        (-13362590354.0 +
          y *
            (651619640.7 +
              y * (-11214424.18 + y * (77392.33017 + y * -184.9052456))))
    const ans2: f64 =
      57568490411.0 +
      y *
        (1029532985.0 +
          y * (9494680.718 + y * (59272.64853 + y * (267.8532712 + y * 1.0))))
    return ans1 / ans2
  } else {
    const z: f64 = 8.0 / x
    const y: f64 = z * z
    const xx: f64 = x - 0.785398164
    const ans1: f64 =
      1.0 +
      y *
        (-0.001098628627 +
          y *
            (0.00002734510407 +
              y * (-0.000002073370639 + y * 0.0000002093887211)))
    const ans2: f64 =
      -0.01562499995 +
      y *
        (0.0001430488765 +
          y *
            (-0.000006911147651 +
              y * (0.0000007621095161 - y * 0.0000000934935152)))
    return (
      Math.sqrt(0.636619772 / x) *
      (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2)
    )
  }
}

/**
 * Compute the Bessel function J1(x)
 * @param x - Input value
 * @returns J1(x)
 */
export function besselJ1(x: f64): f64 {
  const sign: f64 = x < 0.0 ? -1.0 : 1.0
  x = Math.abs(x)

  if (x < 8.0) {
    const y: f64 = x * x
    const ans1: f64 =
      x *
      (72362614232.0 +
        y *
          (-7895059235.0 +
            y *
              (242396853.1 +
                y * (-2972611.439 + y * (15704.4826 + y * -30.16036606)))))
    const ans2: f64 =
      144725228442.0 +
      y *
        (2300535178.0 +
          y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y * 1.0))))
    return (sign * ans1) / ans2
  } else {
    const z: f64 = 8.0 / x
    const y: f64 = z * z
    const xx: f64 = x - 2.356194491
    const ans1: f64 =
      1.0 +
      y *
        (0.00183105 +
          y *
            (-0.00003516396496 +
              y * (0.000002457520174 - y * 0.0000002404127372)))
    const ans2: f64 =
      0.04687499995 +
      y *
        (-0.0002002690873 +
          y *
            (0.000008449199096 +
              y * (-0.0000008820898866 + y * 0.0000001057874125)))
    return (
      sign *
      Math.sqrt(0.636619772 / x) *
      (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2)
    )
  }
}

/**
 * Compute the Bessel function Y0(x)
 * @param x - Input value (x > 0)
 * @returns Y0(x)
 */
export function besselY0(x: f64): f64 {
  if (x <= 0.0) return f64.NaN

  if (x < 8.0) {
    const y: f64 = x * x
    const ans1: f64 =
      -2957821389.0 +
      y *
        (7062834065.0 +
          y *
            (-512359803.6 +
              y * (10879881.29 + y * (-86327.92757 + y * 228.4622733))))
    const ans2: f64 =
      40076544269.0 +
      y *
        (745249964.8 +
          y * (7189466.438 + y * (47447.2647 + y * (226.1030244 + y * 1.0))))
    return ans1 / ans2 + 0.636619772 * besselJ0(x) * Math.log(x)
  } else {
    const z: f64 = 8.0 / x
    const y: f64 = z * z
    const xx: f64 = x - 0.785398164
    const ans1: f64 =
      1.0 +
      y *
        (-0.001098628627 +
          y *
            (0.00002734510407 +
              y * (-0.000002073370639 + y * 0.0000002093887211)))
    const ans2: f64 =
      -0.01562499995 +
      y *
        (0.0001430488765 +
          y *
            (-0.000006911147651 +
              y * (0.0000007621095161 - y * 0.0000000934935152)))
    return (
      Math.sqrt(0.636619772 / x) *
      (Math.sin(xx) * ans1 + z * Math.cos(xx) * ans2)
    )
  }
}

/**
 * Compute the Bessel function Y1(x)
 * @param x - Input value (x > 0)
 * @returns Y1(x)
 */
export function besselY1(x: f64): f64 {
  if (x <= 0.0) return f64.NaN

  if (x < 8.0) {
    const y: f64 = x * x
    const ans1: f64 =
      x *
      (-4900604943000.0 +
        y *
          (1275274390000.0 +
            y *
              (-51534381390.0 +
                y * (734926455.1 + y * (-4237922.726 + y * 8511.937935)))))
    const ans2: f64 =
      24909857380000.0 +
      y *
        (424441966400.0 +
          y *
            (3733650367.0 +
              y *
                (22459040.02 + y * (102042.605 + y * (354.9632885 + y * 1.0)))))
    return ans1 / ans2 + 0.636619772 * (besselJ1(x) * Math.log(x) - 1.0 / x)
  } else {
    const z: f64 = 8.0 / x
    const y: f64 = z * z
    const xx: f64 = x - 2.356194491
    const ans1: f64 =
      1.0 +
      y *
        (0.00183105 +
          y *
            (-0.00003516396496 +
              y * (0.000002457520174 - y * 0.0000002404127372)))
    const ans2: f64 =
      0.04687499995 +
      y *
        (-0.0002002690873 +
          y *
            (0.000008449199096 +
              y * (-0.0000008820898866 + y * 0.0000001057874125)))
    return (
      Math.sqrt(0.636619772 / x) *
      (Math.sin(xx) * ans1 + z * Math.cos(xx) * ans2)
    )
  }
}
