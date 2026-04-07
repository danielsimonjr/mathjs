import { factory } from '../../utils/factory.js'

const name = 'primeFactors'
const dependencies = ['typed']

export const createPrimeFactors = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the prime factorization of a positive integer n, returning an
   * array of prime factors in ascending order (with repetition).
   *
   * Syntax:
   *
   *   math.primeFactors(n)
   *
   * Examples:
   *
   *    math.primeFactors(1)    // returns []
   *    math.primeFactors(12)   // returns [2, 2, 3]
   *    math.primeFactors(100)  // returns [2, 2, 5, 5]
   *    math.primeFactors(997)  // returns [997]
   *
   * See also:
   *
   *    gcd, lcm, isPrime
   *
   * @param {number} n   Positive integer >= 1
   * @return {number[]}  Array of prime factors with multiplicity, sorted ascending
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 1) {
        throw new TypeError(
          'Positive integer value expected in function primeFactors'
        )
      }

      const factors = []
      let remaining = n

      // Extract factor 2
      while (remaining % 2 === 0) {
        factors.push(2)
        remaining = remaining / 2
      }

      // Trial division by odd numbers up to sqrt(remaining)
      for (let d = 3; d * d <= remaining; d += 2) {
        while (remaining % d === 0) {
          factors.push(d)
          remaining = remaining / d
        }
      }

      // If remaining > 1, it is a prime factor
      if (remaining > 1) {
        factors.push(remaining)
      }

      return factors
    }
  })
})
