import { factory } from '../../utils/factory.js'

const name = 'moebiusMu'
const dependencies = ['typed']

export const createMoebiusMu = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Mobius function mu(n).
   *
   * - mu(1) = 1
   * - mu(n) = 0 if n has a squared prime factor
   * - mu(n) = (-1)^k if n is a product of k distinct primes
   *
   * Syntax:
   *
   *   math.moebiusMu(n)
   *
   * Examples:
   *
   *    math.moebiusMu(1)    // returns 1
   *    math.moebiusMu(2)    // returns -1   (2 is prime, k=1)
   *    math.moebiusMu(6)    // returns 1    (6 = 2*3, k=2)
   *    math.moebiusMu(4)    // returns 0    (4 = 2^2, has squared factor)
   *    math.moebiusMu(30)   // returns -1   (30 = 2*3*5, k=3)
   *
   * See also:
   *
   *    primeFactors, eulerPhi, divisors
   *
   * @param {number} n  Positive integer >= 1
   * @return {number}   mu(n): 0, 1, or -1
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 1) {
        throw new TypeError('Positive integer value expected in function moebiusMu')
      }

      if (n === 1) return 1

      // Factor n and check for squared prime factors
      let remaining = n
      let distinctPrimeCount = 0

      // Check factor 2
      if (remaining % 2 === 0) {
        distinctPrimeCount++
        remaining = remaining / 2
        if (remaining % 2 === 0) return 0 // squared factor
      }

      // Check odd factors
      for (let d = 3; d * d <= remaining; d += 2) {
        if (remaining % d === 0) {
          distinctPrimeCount++
          remaining = remaining / d
          if (remaining % d === 0) return 0 // squared factor
        }
      }

      // remaining > 1 means it is a prime factor
      if (remaining > 1) {
        distinctPrimeCount++
      }

      return distinctPrimeCount % 2 === 0 ? 1 : -1
    }
  })
})
