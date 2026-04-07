import { factory } from '../../utils/factory.js'

const name = 'exponentialDist'
const dependencies = ['typed']

export const createExponentialDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create an exponential distribution object with rate parameter lambda.
     * The exponential distribution models the time between events in a Poisson process.
     *
     * Returns an object with pdf(x), cdf(x), icdf(p), mean, and variance.
     *
     * Syntax:
     *
     *     math.exponentialDist(lambda)
     *
     * Examples:
     *
     *     const d = math.exponentialDist(2)
     *     d.pdf(1)    // returns 0.2706...
     *     d.cdf(1)    // returns 0.8646...
     *     d.icdf(0.5) // returns 0.3465... (median)
     *     d.mean      // returns 0.5
     *     d.variance  // returns 0.25
     *
     * See also:
     *
     *     weibullDist, poissonDist, normalDist
     *
     * @param {number} lambda   Rate parameter (must be positive)
     * @return {Object}         Distribution object with pdf, cdf, icdf, mean, variance
     */
    return typed(name, {
      number: function (lambda) {
        if (lambda <= 0) {
          throw new Error('exponentialDist: lambda must be positive')
        }

        return {
          pdf: function (x) {
            if (x < 0) return 0
            return lambda * Math.exp(-lambda * x)
          },
          cdf: function (x) {
            if (x < 0) return 0
            return 1 - Math.exp(-lambda * x)
          },
          icdf: function (p) {
            if (p < 0 || p > 1) {
              throw new Error('exponentialDist: p must be in [0, 1]')
            }
            if (p === 0) return 0
            if (p === 1) return Infinity
            return -Math.log(1 - p) / lambda
          },
          mean: 1 / lambda,
          variance: 1 / (lambda * lambda)
        }
      }
    })
  }
)
