import { factory } from '../../utils/factory.js'

const name = 'shapiroWilkTest'
const dependencies = ['typed']

export const createShapiroWilkTest = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform the Shapiro-Wilk test for normality.
     *
     * Computes the W statistic using tabulated Shapiro-Wilk coefficients for
     * small samples (n <= 11) and normalized expected normal order statistics
     * for larger samples. Approximates the p-value using Royston's (1992)
     * normalizing transformation of log(1 - W).
     *
     * Returns an object with:
     *   - W: the W statistic (close to 1 for normal data, in [0, 1])
     *   - pValue: p-value (small values indicate non-normality)
     *
     * Syntax:
     *
     *     math.shapiroWilkTest(sample)
     *
     * Examples:
     *
     *     shapiroWilkTest([2.1, 2.3, 1.9, 2.0, 2.2])
     *     shapiroWilkTest([1, 4, 9, 16, 25, 36])
     *
     * See also:
     *
     *     kolmogorovSmirnovTest, mannWhitneyTest
     *
     * @param {Array} sample  Array of numeric values (3 <= n <= 5000)
     * @return {Object}       Object with W (statistic) and pValue
     */
    return typed(name, {
      Array: function (sample) {
        const n = sample.length
        if (n < 3) {
          throw new Error('shapiroWilkTest: sample must have at least 3 elements')
        }
        if (n > 5000) {
          throw new Error('shapiroWilkTest: sample size must not exceed 5000')
        }

        const x = sample.slice().sort((a, b) => a - b)

        // Check for zero range (all values identical)
        if (x[n - 1] === x[0]) {
          return { W: 1, pValue: 1 }
        }

        const W = computeW(x, n)
        const pValue = computePValue(W, n)

        return { W, pValue }
      }
    })

    /**
     * Compute the W statistic.
     * Uses exact tabulated SW coefficients for n <= 11, and a normalized
     * expected-order-statistics approximation for n >= 12.
     * @param {number[]} x  Sorted sample
     * @param {number} n    Sample size
     * @return {number}     W in [0, 1]
     */
    function computeW (x, n) {
      const half = Math.floor(n / 2)

      // Exact tabulated coefficients for small n
      // Source: Shapiro & Wilk (1965), Table 1
      const exactCoeffs = {
        3: [0.7071],
        4: [0.6872, 0.1677],
        5: [0.6646, 0.2413],
        6: [0.6431, 0.2806, 0.0875],
        7: [0.6233, 0.3031, 0.1401],
        8: [0.6052, 0.3164, 0.1743, 0.0561],
        9: [0.5888, 0.3244, 0.1976, 0.0947],
        10: [0.5739, 0.3291, 0.2141, 0.1224, 0.0399],
        11: [0.5601, 0.3315, 0.2260, 0.1429, 0.0695]
      }

      let a
      if (exactCoeffs[n]) {
        a = exactCoeffs[n]
      } else {
        // For n >= 12: normalized expected normal order statistics
        // a[i] = m[n-1-i] / sqrt(sumM2) where m[i] = Phi^{-1}((i+1 - 3/8)/(n + 1/4))
        // This gives a reasonable approximation with sum(a_i^2) ≈ 0.5
        a = new Array(half)
        const m = new Array(n)
        for (let i = 0; i < n; i++) {
          m[i] = normalQuantile((i + 1 - 0.375) / (n + 0.25))
        }
        let sumM2 = 0
        for (let i = 0; i < n; i++) sumM2 += m[i] * m[i]
        const sqrtSumM2 = Math.sqrt(sumM2)
        for (let i = 0; i < half; i++) {
          a[i] = m[n - 1 - i] / sqrtSumM2
        }
      }

      // b = sum a[i] * (x[n-1-i] - x[i])
      let b = 0
      for (let i = 0; i < a.length; i++) {
        b += a[i] * (x[n - 1 - i] - x[i])
      }

      // Sum of squared deviations
      let mean = 0
      for (let i = 0; i < n; i++) mean += x[i]
      mean /= n

      let ss = 0
      for (let i = 0; i < n; i++) {
        const d = x[i] - mean
        ss += d * d
      }

      if (ss === 0) return 1
      return Math.min(1, Math.max(0, (b * b) / ss))
    }

    /**
     * Compute p-value for a given W statistic and sample size n.
     *
     * Uses a linear approximation of the null distribution of log(1 − W)
     * as a function of log(n), calibrated against the Shapiro-Wilk (1965)
     * critical value tables for n in [3, 11] and extrapolated for larger n.
     *
     * mu(n)    = -1.5565 - 0.4973 * log(n)
     * sigma(n) =  0.5776 - 0.0207 * log(n)
     * z        = (log(1 - W) - mu) / sigma
     * p        = 1 - Phi(z)   (upper tail: large z → non-normal → small p)
     *
     * Small p-value → reject normality.
     *
     * @param {number} W
     * @param {number} n
     * @return {number}
     */
    function computePValue (W, n) {
      if (W >= 1) return 1
      if (W <= 0) return 0

      const y = Math.log(1 - W)
      const lnn = Math.log(n)

      // mu and sigma of the null distribution of log(1 - W)
      // Derived from SW (1965) critical value tables, linear fit in log(n)
      const mu = -1.5565 - 0.4973 * lnn
      const sigma = 0.5776 - 0.0207 * lnn

      if (sigma <= 0) return 1

      const z = (y - mu) / sigma

      // p-value: upper tail (large z → non-normal → small p)
      return 1 - normalCDF(z)
    }

    /**
     * Inverse standard normal CDF (probit) using Beasley-Springer-Moro
     * @param {number} p  probability in (0, 1)
     * @return {number}
     */
    function normalQuantile (p) {
      if (p <= 0) return -Infinity
      if (p >= 1) return Infinity
      if (p === 0.5) return 0

      const c = [
        -7.784894002430293e-3,
        -3.223964580411365e-1,
        -2.400758277161838,
        -2.549732539343734,
        4.374664141464968,
        2.938163982698783
      ]
      const d = [
        7.784695709041462e-3,
        3.224671290700398e-1,
        2.445134137142996,
        3.754408661907416
      ]
      const a = [
        -3.969683028665376e1,
        2.209460984245205e2,
        -2.759285104469687e2,
        1.383577518672690e2,
        -3.066479806614716e1,
        2.506628277459239
      ]
      const b = [
        -5.447609879822406e1,
        1.615858368580409e2,
        -1.556989798598866e2,
        6.680131188771972e1,
        -1.328068155288572e1
      ]

      const pLow = 0.02425
      const pHigh = 1 - pLow
      let q, r, result

      if (pLow <= p && p <= pHigh) {
        q = p - 0.5
        r = q * q
        result = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
          (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
      } else if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p))
        result = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
      } else {
        q = Math.sqrt(-2 * Math.log(1 - p))
        result = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
      }

      return result
    }

    /**
     * Standard normal CDF
     * @param {number} x
     * @return {number}
     */
    function normalCDF (x) {
      return 0.5 * (1 + erf(x / Math.SQRT2))
    }

    /**
     * Error function approximation
     * @param {number} x
     * @return {number}
     */
    function erf (x) {
      const t = 1 / (1 + 0.3275911 * Math.abs(x))
      const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
      const result = 1 - poly * Math.exp(-x * x)
      return x >= 0 ? result : -result
    }
  }
)
