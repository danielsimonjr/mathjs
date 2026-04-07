import { factory } from '../../utils/factory.js'

const name = 'uniformDist'
const dependencies = ['typed']

export const createUniformDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a continuous uniform distribution object on the interval [a, b].
     * Returns an object with pdf, cdf, icdf methods and mean, variance properties.
     *
     * Syntax:
     *
     *     math.uniformDist(a, b)
     *
     * Examples:
     *
     *     const d = math.uniformDist(0, 1)
     *     d.pdf(0.5)    // returns 1
     *     d.cdf(0.5)    // returns 0.5
     *     d.icdf(0.5)   // returns 0.5
     *     d.mean        // returns 0.5
     *     d.variance    // returns 0.08333...
     *
     * See also:
     *
     *     normalDist, exponentialDist, gammaDist
     *
     * @param {number} a   Lower bound of the distribution
     * @param {number} b   Upper bound of the distribution (must be > a)
     * @return {Object}    Distribution object with pdf, cdf, icdf, mean, variance
     */
    return typed(name, {
      'number, number': function (a, b) {
        if (b <= a) {
          throw new Error('uniformDist: b must be greater than a')
        }

        const range = b - a

        return {
          pdf: function (x) {
            if (x < a || x > b) return 0
            return 1 / range
          },
          cdf: function (x) {
            if (x <= a) return 0
            if (x >= b) return 1
            return (x - a) / range
          },
          icdf: function (p) {
            if (p < 0 || p > 1) {
              throw new Error('uniformDist icdf: p must be in [0, 1]')
            }
            return a + p * range
          },
          mean: (a + b) / 2,
          variance: (range * range) / 12
        }
      }
    })
  }
)
