import { factory } from '../../utils/factory.js'

const name = 'prime'
const dependencies = ['typed']

export const createPrime = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Return the nth prime number (1-indexed).
   *
   * Generates primes using a sieve of Eratosthenes with an estimated
   * upper bound, then returns the nth prime.
   *
   * Syntax:
   *
   *   math.prime(n)
   *
   * Examples:
   *
   *    math.prime(1)    // returns 2
   *    math.prime(5)    // returns 11
   *    math.prime(25)   // returns 97
   *    math.prime(100)  // returns 541
   *
   * See also:
   *
   *    primePi, nextPrime, primeFactors
   *
   * @param {number} n   Positive integer (1-indexed)
   * @return {number}    The nth prime number
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 1) {
        throw new TypeError(
          'Positive integer value expected in function prime'
        )
      }

      // Upper bound estimate: n*(ln(n) + ln(ln(n))) for n >= 6
      // Use a safe minimum to handle small n
      let limit
      if (n < 6) {
        limit = 15
      } else {
        const lnn = Math.log(n)
        const lnlnn = Math.log(lnn)
        limit = Math.ceil(n * (lnn + lnlnn)) + 10
      }

      // Sieve of Eratosthenes
      const sieve = new Uint8Array(limit + 1).fill(1)
      sieve[0] = 0
      sieve[1] = 0

      for (let p = 2; p * p <= limit; p++) {
        if (sieve[p] === 1) {
          for (let multiple = p * p; multiple <= limit; multiple += p) {
            sieve[multiple] = 0
          }
        }
      }

      let count = 0
      for (let i = 2; i <= limit; i++) {
        if (sieve[i] === 1) {
          count++
          if (count === n) return i
        }
      }

      // Fallback: extend sieve (should rarely happen due to estimate)
      throw new Error('prime: internal sieve limit too small, please report this')
    }
  })
})
