import { factory } from '../../utils/factory.js'

const name = 'weibullDist'
const dependencies = ['typed']

export const createWeibullDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a Weibull distribution object with shape parameter k and scale parameter lambda.
     * The Weibull distribution generalizes the exponential distribution and is used in
     * reliability analysis and failure time modeling.
     *
     * When k=1, the Weibull distribution reduces to the exponential distribution with rate 1/lambda.
     *
     * Returns an object with pdf(x), cdf(x), mean, and variance.
     *
     * Syntax:
     *
     *     math.weibullDist(k, lambda)
     *
     * Examples:
     *
     *     const d = math.weibullDist(2, 1)
     *     d.pdf(1)   // returns 0.7357...
     *     d.cdf(1)   // returns 0.6321...
     *     d.mean     // returns 0.8862...
     *     d.variance // returns 0.2146...
     *
     * See also:
     *
     *     exponentialDist, normalDist
     *
     * @param {number} k        Shape parameter (must be positive)
     * @param {number} lambda   Scale parameter (must be positive)
     * @return {Object}         Distribution object with pdf, cdf, mean, variance
     */
    return typed(name, {
      'number, number': function (k, lambda) {
        if (k <= 0) {
          throw new Error('weibullDist: k must be positive')
        }
        if (lambda <= 0) {
          throw new Error('weibullDist: lambda must be positive')
        }

        return {
          pdf: function (x) {
            if (x < 0) return 0
            if (x === 0) {
              return k === 1 ? k / lambda : 0
            }
            const z = x / lambda
            return (k / lambda) * Math.pow(z, k - 1) * Math.exp(-Math.pow(z, k))
          },
          cdf: function (x) {
            if (x < 0) return 0
            return 1 - Math.exp(-Math.pow(x / lambda, k))
          },
          mean: lambda * gammaFunction(1 + 1 / k),
          variance: lambda * lambda * (gammaFunction(1 + 2 / k) - Math.pow(gammaFunction(1 + 1 / k), 2))
        }
      }
    })

    /**
     * Gamma function using Lanczos approximation
     * @param {number} z
     * @return {number}
     */
    function gammaFunction (z) {
      if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gammaFunction(1 - z))
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
      return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
    }
  }
)
