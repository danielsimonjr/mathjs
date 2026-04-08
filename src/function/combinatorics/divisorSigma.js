import { factory } from '../../utils/factory.js'

const name = 'divisorSigma'
const dependencies = ['typed']

export const createDivisorSigma = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the divisor function sigma_k(n): the sum of the k-th powers
   * of all positive divisors of n.
   *
   * Special cases:
   *   - k = 0: number of divisors (tau function)
   *   - k = 1: sum of divisors
   *
   * Syntax:
   *
   *   math.divisorSigma(k, n)
   *
   * Examples:
   *
   *    math.divisorSigma(0, 12)   // returns 6  (divisors: 1,2,3,4,6,12)
   *    math.divisorSigma(1, 12)   // returns 28 (1+2+3+4+6+12)
   *    math.divisorSigma(1, 6)    // returns 12 (1+2+3+6, perfect number)
   *    math.divisorSigma(2, 6)    // returns 50 (1+4+9+36)
   *
   * See also:
   *
   *    divisors, eulerPhi, moebiusMu
   *
   * @param {number} k   Non-negative integer exponent
   * @param {number} n   Positive integer
   * @return {number}    sigma_k(n)
   */
  return typed(name, {
    'number, number': function (k, n) {
      if (!Number.isInteger(k) || k < 0) {
        throw new TypeError(
          'Non-negative integer value expected for k in function divisorSigma'
        )
      }
      if (!Number.isInteger(n) || n < 1) {
        throw new TypeError(
          'Positive integer value expected for n in function divisorSigma'
        )
      }

      let sigma = 0
      const limit = Math.sqrt(n)

      for (let d = 1; d <= limit; d++) {
        if (n % d === 0) {
          sigma += k === 0 ? 1 : Math.pow(d, k)
          if (d !== n / d) {
            sigma += k === 0 ? 1 : Math.pow(n / d, k)
          }
        }
      }

      return sigma
    }
  })
})
