import { factory } from '../../utils/factory.js'

const name = 'nextPrime'
const dependencies = ['typed']

export const createNextPrime = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Return the smallest prime number strictly greater than n.
   *
   * Syntax:
   *
   *   math.nextPrime(n)
   *
   * Examples:
   *
   *    math.nextPrime(1)     // returns 2
   *    math.nextPrime(2)     // returns 3
   *    math.nextPrime(10)    // returns 11
   *    math.nextPrime(100)   // returns 101
   *    math.nextPrime(1000)  // returns 1009
   *
   * See also:
   *
   *    isPrime, primeFactors
   *
   * @param {number} n   Non-negative number
   * @return {number}    Smallest prime p such that p > n
   */
  return typed(name, {
    number: function (n) {
      if (!isFinite(n) || n < 0) {
        throw new TypeError(
          'Non-negative finite number expected in function nextPrime'
        )
      }

      // Start from the next integer above n
      let candidate = Math.floor(n) + 1

      // 2 is the only even prime
      if (candidate <= 2) return 2

      // Ensure candidate is odd
      if (candidate % 2 === 0) candidate++

      while (!_isPrime(candidate)) {
        candidate += 2
      }

      return candidate
    }
  })

  /**
   * Check if a positive odd number (>= 3) is prime using trial division.
   */
  function _isPrime (n) {
    if (n < 2) return false
    if (n === 2) return true
    if (n % 2 === 0) return false
    const limit = Math.sqrt(n)
    for (let d = 3; d <= limit; d += 2) {
      if (n % d === 0) return false
    }
    return true
  }
})
