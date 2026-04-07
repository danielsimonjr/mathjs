/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'legendreP'
const dependencies = ['typed']

export const createLegendreP = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Evaluate the Legendre polynomial P_n(x).
     *
     * Uses Bonnet's recurrence relation:
     *   (n+1) * P_{n+1}(x) = (2n+1) * x * P_n(x) - n * P_{n-1}(x)
     * with P_0(x) = 1 and P_1(x) = x.
     *
     * Syntax:
     *
     *    math.legendreP(n, x)
     *
     * Examples:
     *
     *    math.legendreP(0, 0.5)   // returns 1
     *    math.legendreP(1, 0.5)   // returns 0.5
     *    math.legendreP(2, 0.5)   // returns -0.125
     *    math.legendreP(3, 0.5)   // returns -0.4375
     *
     * See also:
     *
     *    erf
     *
     * @param {number} n   The degree, a non-negative integer
     * @param {number} x   The argument, typically in [-1, 1]
     * @return {number}    The value of the Legendre polynomial P_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n) || n < 0) {
          throw new TypeError('legendreP: n must be a non-negative integer, got ' + n)
        }

        if (n === 0) return 1
        if (n === 1) return x

        let pPrev = 1  // P_0
        let pCurr = x  // P_1

        for (let k = 1; k < n; k++) {
          const pNext = ((2 * k + 1) * x * pCurr - k * pPrev) / (k + 1)
          pPrev = pCurr
          pCurr = pNext
        }

        return pCurr
      }
    })
  }
)
