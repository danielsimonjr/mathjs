import { factory } from '../../utils/factory.js'

const name = 'chiSquaredDist'
const dependencies = ['typed']

export const createChiSquaredDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a chi-squared distribution object with k degrees of freedom.
     * The chi-squared distribution is commonly used in hypothesis testing
     * and confidence interval estimation for variance.
     *
     * Returns an object with pdf, cdf, mean, and variance.
     *
     * Syntax:
     *
     *     math.chiSquaredDist(k)
     *
     * Examples:
     *
     *     const d = math.chiSquaredDist(3)
     *     d.pdf(1)    // returns 0.2196...
     *     d.cdf(3.84) // returns ~0.95 (for k=1, p-value threshold)
     *     d.mean      // returns 3
     *     d.variance  // returns 6
     *
     * See also:
     *
     *     tDist, normalDist
     *
     * @param {number} k   Degrees of freedom (must be a positive integer)
     * @return {Object}    Distribution object with pdf, cdf, mean, variance
     */
    return typed(name, {
      number: function (k) {
        if (k <= 0 || !Number.isInteger(k)) {
          throw new Error('chiSquaredDist: k must be a positive integer')
        }

        // Normalization: 1 / (2^(k/2) * Gamma(k/2))
        const logNorm = -(k / 2) * Math.log(2) - logGamma(k / 2)

        return {
          pdf: function (x) {
            if (x <= 0) return 0
            return Math.exp(logNorm + (k / 2 - 1) * Math.log(x) - x / 2)
          },
          cdf: function (x) {
            if (x <= 0) return 0
            return regularizedIncompleteGamma(k / 2, x / 2)
          },
          mean: k,
          variance: 2 * k
        }
      }
    })

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

    /**
     * Regularized lower incomplete gamma function P(a, x)
     * Uses series expansion for x < a+1, continued fraction otherwise
     * @param {number} a
     * @param {number} x
     * @return {number}
     */
    function regularizedIncompleteGamma (a, x) {
      if (x < 0) return 0
      if (x === 0) return 0

      if (x < a + 1) {
        // Series expansion
        return gammaSeries(a, x)
      } else {
        // Continued fraction (upper gamma) => P = 1 - Q
        return 1 - gammaCF(a, x)
      }
    }

    /**
     * Series representation of regularized lower incomplete gamma
     * @param {number} a
     * @param {number} x
     * @return {number}
     */
    function gammaSeries (a, x) {
      const MAXIT = 200
      const EPS = 3e-14

      const logGammaA = logGamma(a)
      let ap = a
      let sum = 1 / a
      let del = sum

      for (let n = 1; n <= MAXIT; n++) {
        ap += 1
        del *= x / ap
        sum += del
        if (Math.abs(del) < Math.abs(sum) * EPS) break
      }

      return sum * Math.exp(-x + a * Math.log(x) - logGammaA)
    }

    /**
     * Continued fraction representation of regularized upper incomplete gamma Q(a, x)
     * @param {number} a
     * @param {number} x
     * @return {number}
     */
    function gammaCF (a, x) {
      const MAXIT = 200
      const EPS = 3e-14
      const FPMIN = 1e-300

      const logGammaA = logGamma(a)
      let b = x + 1 - a
      let c = 1 / FPMIN
      let d = 1 / b
      let h = d

      for (let i = 1; i <= MAXIT; i++) {
        const an = -i * (i - a)
        b += 2
        d = an * d + b
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = b + an / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        const del = d * c
        h *= del
        if (Math.abs(del - 1) < EPS) break
      }

      return Math.exp(-x + a * Math.log(x) - logGammaA) * h
    }
  }
)
