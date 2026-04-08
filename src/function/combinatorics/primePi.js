import { factory } from '../../utils/factory.js'

const name = 'primePi'
const dependencies = ['typed']

export const createPrimePi = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the prime counting function pi(n): the number of primes
   * less than or equal to n.
   *
   * Uses a sieve of Eratosthenes to count primes up to n.
   *
   * Syntax:
   *
   *   math.primePi(n)
   *
   * Examples:
   *
   *    math.primePi(10)    // returns 4  (primes: 2, 3, 5, 7)
   *    math.primePi(100)   // returns 25
   *    math.primePi(1000)  // returns 168
   *
   * See also:
   *
   *    prime, primeFactors, nextPrime
   *
   * @param {number} n   Non-negative integer
   * @return {number}    Number of primes <= n
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 0) {
        throw new TypeError(
          'Non-negative integer value expected in function primePi'
        )
      }

      if (n < 2) return 0

      // Sieve of Eratosthenes
      const sieve = new Uint8Array(n + 1).fill(1)
      sieve[0] = 0
      sieve[1] = 0

      for (let p = 2; p * p <= n; p++) {
        if (sieve[p] === 1) {
          for (let multiple = p * p; multiple <= n; multiple += p) {
            sieve[multiple] = 0
          }
        }
      }

      let count = 0
      for (let i = 2; i <= n; i++) {
        if (sieve[i] === 1) count++
      }

      return count
    }
  })
})
