import { factory } from '../../utils/factory.js'

const name = 'studentTTest'
const dependencies = ['typed']

export const createStudentTTest = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Perform a two-sample Welch's t-test (unequal variances).
     *
     * Tests whether the means of two independent samples are significantly different.
     * Uses the Welch-Satterthwaite approximation for degrees of freedom.
     *
     * Returns an object with:
     *   - t: the t-statistic
     *   - df: degrees of freedom (Welch-Satterthwaite)
     *   - pValue: two-tailed p-value
     *
     * Syntax:
     *
     *     math.studentTTest(sample1, sample2)
     *
     * Examples:
     *
     *     studentTTest([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])
     *     studentTTest([1, 2, 3], [10, 11, 12])
     *
     * See also:
     *
     *     mean, variance, std
     *
     * @param {Array} sample1   First sample (array of numbers)
     * @param {Array} sample2   Second sample (array of numbers)
     * @return {Object}         Object with t, df, pValue
     */
    return typed(name, {
      'Array, Array': function (sample1, sample2) {
        if (sample1.length < 2) {
          throw new Error('studentTTest: sample1 must have at least 2 elements')
        }
        if (sample2.length < 2) {
          throw new Error('studentTTest: sample2 must have at least 2 elements')
        }

        const n1 = sample1.length
        const n2 = sample2.length

        const mean1 = sampleMean(sample1)
        const mean2 = sampleMean(sample2)

        const var1 = sampleVariance(sample1, mean1)
        const var2 = sampleVariance(sample2, mean2)

        const se = Math.sqrt(var1 / n1 + var2 / n2)

        if (se === 0) {
          if (mean1 === mean2) {
            return { t: 0, df: n1 + n2 - 2, pValue: 1 }
          }
          // Means differ but zero variance — infinite t-statistic
          return { t: mean1 > mean2 ? Infinity : -Infinity, df: n1 + n2 - 2, pValue: 0 }
        }

        const t = (mean1 - mean2) / se

        // Welch-Satterthwaite degrees of freedom
        const v1 = var1 / n1
        const v2 = var2 / n2
        const df = Math.pow(v1 + v2, 2) /
          (Math.pow(v1, 2) / (n1 - 1) + Math.pow(v2, 2) / (n2 - 1))

        // Two-tailed p-value using regularized incomplete beta function
        // p = 2 * I(df/(df + t^2), df/2, 0.5)
        const x = df / (df + t * t)
        const pValue = incompleteBeta(x, df / 2, 0.5)

        return { t, df, pValue }
      }
    })

    /**
     * Compute sample mean
     * @param {Array} arr
     * @return {number}
     */
    function sampleMean (arr) {
      let sum = 0
      for (let i = 0; i < arr.length; i++) sum += arr[i]
      return sum / arr.length
    }

    /**
     * Compute sample variance (unbiased, divided by n-1)
     * @param {Array} arr
     * @param {number} mean
     * @return {number}
     */
    function sampleVariance (arr, mean) {
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        const d = arr[i] - mean
        sum += d * d
      }
      return sum / (arr.length - 1)
    }

    /**
     * Regularized incomplete beta function I_x(a, b) using continued fraction.
     * Used to compute the two-tailed p-value of the t-distribution.
     * @param {number} x
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    function incompleteBeta (x, a, b) {
      if (x < 0 || x > 1) return 0
      if (x === 0) return 0
      if (x === 1) return 1

      const lbeta = logBeta(a, b)

      if (x < (a + 1) / (a + b + 2)) {
        return Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) *
          betaCF(x, a, b) / a
      } else {
        return 1 - Math.exp(b * Math.log(1 - x) + a * Math.log(x) - lbeta) *
          betaCF(1 - x, b, a) / b
      }
    }

    /**
     * Continued fraction expansion of the incomplete beta function
     * @param {number} x
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    function betaCF (x, a, b) {
      const MAXIT = 200
      const EPS = 3e-14
      const FPMIN = 1e-300

      const qab = a + b
      const qap = a + 1
      const qam = a - 1

      let c = 1
      let d = 1 - qab * x / qap
      if (Math.abs(d) < FPMIN) d = FPMIN
      d = 1 / d
      let h = d

      for (let m = 1; m <= MAXIT; m++) {
        const m2 = 2 * m
        // Even step
        let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        h *= d * c
        // Odd step
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        const del = d * c
        h *= del
        if (Math.abs(del - 1) < EPS) break
      }
      return h
    }

    /**
     * Log of the beta function B(a, b) = Gamma(a)*Gamma(b)/Gamma(a+b)
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    function logBeta (a, b) {
      return logGamma(a) + logGamma(b) - logGamma(a + b)
    }

    /**
     * Log of the gamma function using Lanczos approximation
     * @param {number} z
     * @return {number}
     */
    function logGamma (z) {
      if (z < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
      }

      z -= 1
      const g = 7
      const c = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
      ]

      let x = c[0]
      for (let i = 1; i < g + 2; i++) {
        x += c[i] / (z + i)
      }

      const t = z + g + 0.5
      return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
    }
  }
)
