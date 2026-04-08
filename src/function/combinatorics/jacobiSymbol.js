import { factory } from '../../utils/factory.js'

const name = 'jacobiSymbol'
const dependencies = ['typed']

export const createJacobiSymbol = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Jacobi symbol (a/n), a generalization of the Legendre symbol
   * using the law of quadratic reciprocity.
   *
   * The Jacobi symbol is defined for odd positive integers n >= 1.
   * It returns 0, 1, or -1.
   *
   * Syntax:
   *
   *   math.jacobiSymbol(a, n)
   *
   * Examples:
   *
   *    math.jacobiSymbol(1, 1)    // returns 1
   *    math.jacobiSymbol(2, 7)    // returns 1
   *    math.jacobiSymbol(3, 5)    // returns -1
   *    math.jacobiSymbol(5, 21)   // returns 1
   *    math.jacobiSymbol(0, 5)    // returns 0
   *
   * See also:
   *
   *    eulerPhi, moebiusMu, primeFactors
   *
   * @param {number} a   Integer
   * @param {number} n   Odd positive integer >= 1
   * @return {number}    Jacobi symbol (a/n): 0, 1, or -1
   */
  return typed(name, {
    'number, number': function (a, n) {
      if (!Number.isInteger(a)) {
        throw new TypeError(
          'Integer value expected for a in function jacobiSymbol'
        )
      }
      if (!Number.isInteger(n) || n < 1 || n % 2 === 0) {
        throw new TypeError(
          'Odd positive integer value expected for n in function jacobiSymbol'
        )
      }

      // Reduce a mod n into [0, n)
      a = ((a % n) + n) % n

      let result = 1

      while (a !== 0) {
        // Factor out all 2s from a
        while (a % 2 === 0) {
          a = a / 2
          // (2/n) = (-1)^((n^2 - 1)/8)
          // This is -1 iff n ≡ 3 or 5 (mod 8)
          const nMod8 = n % 8
          if (nMod8 === 3 || nMod8 === 5) {
            result = -result
          }
        }

        // Now a is odd; apply quadratic reciprocity
        // (a/n) * (n/a) = (-1)^((a-1)/2 * (n-1)/2)
        // swap a and n
        const tmp = a
        a = n
        n = tmp

        if (a % 4 === 3 && n % 4 === 3) {
          result = -result
        }

        a = a % n
      }

      return n === 1 ? result : 0
    }
  })
})
