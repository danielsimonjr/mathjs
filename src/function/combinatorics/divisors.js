import { factory } from '../../utils/factory.js'

const name = 'divisors'
const dependencies = ['typed']

export const createDivisors = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Return a sorted array of all positive divisors of a positive integer n.
   *
   * Syntax:
   *
   *   math.divisors(n)
   *
   * Examples:
   *
   *    math.divisors(1)   // returns [1]
   *    math.divisors(12)  // returns [1, 2, 3, 4, 6, 12]
   *    math.divisors(28)  // returns [1, 2, 4, 7, 14, 28]
   *
   * See also:
   *
   *    gcd, lcm, primeFactors
   *
   * @param {number} n   Positive integer
   * @return {number[]}  Sorted array of all positive divisors of n
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 1) {
        throw new TypeError(
          'Positive integer value expected in function divisors'
        )
      }

      const small = []
      const large = []
      const limit = Math.sqrt(n)

      for (let d = 1; d <= limit; d++) {
        if (n % d === 0) {
          small.push(d)
          if (d !== n / d) {
            large.push(n / d)
          }
        }
      }

      // large is in descending order; reverse it to get ascending
      large.reverse()

      return small.concat(large)
    }
  })
})
