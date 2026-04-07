import { factory } from '../../utils/factory.js'

const name = 'eulerPhi'
const dependencies = ['typed']

export const createEulerPhi = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute Euler's totient function phi(n): the count of integers
   * in the range [1, n] that are coprime to n.
   *
   * The result is computed via the product formula:
   *   phi(n) = n * product( (1 - 1/p) for each distinct prime p | n )
   *
   * Syntax:
   *
   *   math.eulerPhi(n)
   *
   * Examples:
   *
   *    math.eulerPhi(1)   // returns 1
   *    math.eulerPhi(6)   // returns 2
   *    math.eulerPhi(12)  // returns 4
   *    math.eulerPhi(7)   // returns 6  (7 is prime: phi(p) = p-1)
   *
   * See also:
   *
   *    gcd, primeFactors
   *
   * @param {number} n   Positive integer
   * @return {number}    phi(n)
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 1) {
        throw new TypeError(
          'Positive integer value expected in function eulerPhi'
        )
      }

      let result = n
      let remaining = n

      // Extract factor 2
      if (remaining % 2 === 0) {
        result -= result / 2
        while (remaining % 2 === 0) {
          remaining = remaining / 2
        }
      }

      // Trial division by odd numbers
      for (let p = 3; p * p <= remaining; p += 2) {
        if (remaining % p === 0) {
          result -= result / p
          while (remaining % p === 0) {
            remaining = remaining / p
          }
        }
      }

      // If remaining > 1, it is a prime factor
      if (remaining > 1) {
        result -= result / remaining
      }

      return result
    }
  })
})
