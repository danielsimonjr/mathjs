import { factory } from '../../utils/factory.js'

const name = 'binomialDist'
const dependencies = ['typed']

export const createBinomialDist = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Create a binomial distribution object with parameters n (trials) and p (success probability).
     * The binomial distribution models the number of successes in n independent trials.
     *
     * Returns an object with pmf, cdf, mean, and variance.
     *
     * Syntax:
     *
     *     math.binomialDist(n, p)
     *
     * Examples:
     *
     *     const d = math.binomialDist(10, 0.5)
     *     d.pmf(5)    // returns 0.2460937... (P(X = 5))
     *     d.cdf(5)    // returns 0.6230468... (P(X <= 5))
     *     d.mean      // returns 5
     *     d.variance  // returns 2.5
     *
     * See also:
     *
     *     poissonDist, normalDist
     *
     * @param {number} n   Number of trials (positive integer)
     * @param {number} p   Probability of success (in [0, 1])
     * @return {Object}    Distribution object with pmf, cdf, mean, variance
     */
    return typed(name, {
      'number, number': function (n, p) {
        if (!Number.isInteger(n) || n < 1) {
          throw new Error('binomialDist: n must be a positive integer')
        }
        if (p < 0 || p > 1) {
          throw new Error('binomialDist: p must be in [0, 1]')
        }

        /**
         * Log probability of k successes: log(C(n,k)) + k*log(p) + (n-k)*log(1-p)
         * Handles the degenerate cases p=0 and p=1 carefully.
         */
        function logPmf (k) {
          if (k < 0 || k > n) return -Infinity
          if (p === 0) return k === 0 ? 0 : -Infinity
          if (p === 1) return k === n ? 0 : -Infinity
          return logBinomCoeff(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)
        }

        return {
          pmf: function (k) {
            k = Math.floor(k)
            const lp = logPmf(k)
            return lp === -Infinity ? 0 : Math.exp(lp)
          },
          cdf: function (k) {
            k = Math.floor(k)
            if (k < 0) return 0
            if (k >= n) return 1
            let sum = 0
            for (let i = 0; i <= k; i++) {
              const lp = logPmf(i)
              if (lp !== -Infinity) sum += Math.exp(lp)
            }
            return Math.min(sum, 1)
          },
          mean: n * p,
          variance: n * p * (1 - p)
        }
      }
    })

    /**
     * Compute log of binomial coefficient C(n, k) using log-gamma
     * @param {number} n
     * @param {number} k
     * @return {number}
     */
    function logBinomCoeff (n, k) {
      return logFactorial(n) - logFactorial(k) - logFactorial(n - k)
    }

    /**
     * Compute log(k!) for non-negative integer k
     * @param {number} k
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
