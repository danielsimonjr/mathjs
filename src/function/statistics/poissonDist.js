import { factory } from '../../utils/factory.js'

const name = 'poissonDist'
const dependencies = ['typed']

export const createPoissonDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a Poisson distribution object with given rate parameter lambda.
     * The Poisson distribution models the number of events in a fixed interval.
     *
     * Returns an object with pmf, cdf, mean, and variance.
     *
     * Syntax:
     *
     *     math.poissonDist(lambda)
     *
     * Examples:
     *
     *     const d = math.poissonDist(3)
     *     d.pmf(3)    // returns 0.2240418... (P(X = 3))
     *     d.cdf(4)    // returns 0.8152632... (P(X <= 4))
     *     d.mean      // returns 3
     *     d.variance  // returns 3
     *
     * See also:
     *
     *     binomialDist, normalDist
     *
     * @param {number} lambda   Rate parameter (must be positive)
     * @return {Object}         Distribution object with pmf, cdf, mean, variance
     */
    return typed(name, {
      number: function (lambda) {
        if (lambda <= 0) {
          throw new Error('poissonDist: lambda must be positive')
        }

        return {
          pmf: function (k) {
            k = Math.floor(k)
            if (k < 0) return 0
            return Math.exp(k * Math.log(lambda) - lambda - logFactorial(k))
          },
          cdf: function (k) {
            k = Math.floor(k)
            if (k < 0) return 0
            let sum = 0
            for (let i = 0; i <= k; i++) {
              sum += Math.exp(i * Math.log(lambda) - lambda - logFactorial(i))
            }
            return Math.min(sum, 1)
          },
          mean: lambda,
          variance: lambda
        }
      }
    })

    /**
     * Compute log(k!) using Stirling's approximation for large k
     * @param {number} k   non-negative integer
     * @return {number}
     */
    function logFactorial (k) {
      if (k <= 1) return 0
      if (k <= 20) {
        let result = 0
        for (let i = 2; i <= k; i++) result += Math.log(i)
        return result
      }
      // Stirling's approximation
      return k * Math.log(k) - k + 0.5 * Math.log(2 * Math.PI * k)
    }
  }
)
