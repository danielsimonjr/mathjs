import { factory } from '../../utils/factory.js'

const name = 'carmichaelLambda'
const dependencies = ['typed']

export const createCarmichaelLambda = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Carmichael function lambda(n): the smallest positive integer m
   * such that a^m ≡ 1 (mod n) for all integers a coprime to n.
   *
   * Defined using prime power factorization:
   *   - lambda(1) = 1
   *   - lambda(2) = 1, lambda(4) = 2
   *   - lambda(2^k) = 2^(k-2) for k >= 3
   *   - lambda(p^k) = p^(k-1) * (p-1) for odd prime p
   *   - lambda(n) = lcm of lambda over all prime power factors
   *
   * Syntax:
   *
   *   math.carmichaelLambda(n)
   *
   * Examples:
   *
   *    math.carmichaelLambda(1)    // returns 1
   *    math.carmichaelLambda(8)    // returns 2
   *    math.carmichaelLambda(12)   // returns 2
   *    math.carmichaelLambda(15)   // returns 4
   *
   * See also:
   *
   *    eulerPhi, moebiusMu, primeFactors
   *
   * @param {number} n   Positive integer
   * @return {number}    lambda(n)
   */
  return typed(name, {
    number: function (n) {
      if (!Number.isInteger(n) || n < 1) {
        throw new TypeError(
          'Positive integer value expected in function carmichaelLambda'
        )
      }

      if (n === 1) return 1

      // Helper: gcd
      const gcd = function (a, b) {
        while (b !== 0) {
          const t = b
          b = a % b
          a = t
        }
        return a
      }

      // Helper: lcm
      const lcm = function (a, b) {
        return (a / gcd(a, b)) * b
      }

      // Helper: lambda for a prime power p^k
      const lambdaPrimePower = function (p, k) {
        if (p === 2) {
          if (k === 1) return 1
          if (k === 2) return 2
          // k >= 3: lambda(2^k) = 2^(k-2)
          return Math.pow(2, k - 2)
        }
        // Odd prime: lambda(p^k) = p^(k-1) * (p-1)
        return Math.pow(p, k - 1) * (p - 1)
      }

      let result = 1
      let remaining = n

      // Factor out 2
      if (remaining % 2 === 0) {
        let k = 0
        while (remaining % 2 === 0) {
          k++
          remaining = remaining / 2
        }
        result = lcm(result, lambdaPrimePower(2, k))
      }

      // Factor out odd primes
      for (let p = 3; p * p <= remaining; p += 2) {
        if (remaining % p === 0) {
          let k = 0
          while (remaining % p === 0) {
            k++
            remaining = remaining / p
          }
          result = lcm(result, lambdaPrimePower(p, k))
        }
      }

      // Remaining prime factor
      if (remaining > 1) {
        result = lcm(result, lambdaPrimePower(remaining, 1))
      }

      return result
    }
  })
})
