/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'harmonicNumber'
const dependencies = ['typed']

export const createHarmonicNumber = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    // Euler-Mascheroni constant
    const EULER_GAMMA = 0.5772156649015329

    /**
     * Compute the n-th harmonic number H_n.
     *
     * H_n = 1 + 1/2 + 1/3 + ... + 1/n
     *
     * For small n: direct summation.
     * For large n (n > 50): asymptotic approximation
     *   H_n ~ ln(n) + gamma + 1/(2n) - 1/(12n^2) + 1/(120n^4)
     *
     * Syntax:
     *
     *    math.harmonicNumber(n)
     *
     * Examples:
     *
     *    math.harmonicNumber(1)   // returns 1
     *    math.harmonicNumber(5)   // returns 2.283333333333333
     *    math.harmonicNumber(10)  // returns 2.9289682539682538
     *
     * See also:
     *
     *    combinations, factorial
     *
     * @param {number} n   A positive integer
     * @return {number}    The n-th harmonic number H_n
     */
    return typed(name, {
      number: function (n) {
        if (!Number.isInteger(n) || n < 1) {
          throw new TypeError('harmonicNumber: n must be a positive integer, got ' + n)
        }

        if (n <= 50) {
          // Direct summation for small n
          let sum = 0
          for (let k = 1; k <= n; k++) {
            sum += 1 / k
          }
          return sum
        } else {
          // Asymptotic expansion for large n
          const n2 = n * n
          return Math.log(n) + EULER_GAMMA + 1 / (2 * n) - 1 / (12 * n2) + 1 / (120 * n2 * n2)
        }
      }
    })
  }
)
