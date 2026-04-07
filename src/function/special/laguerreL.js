import { factory } from '../../utils/factory.js'

const name = 'laguerreL'
const dependencies = ['typed']

export const createLaguerreL = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Evaluate the Laguerre polynomial L_n(x).
     *
     * Uses the three-term recurrence relation:
     *   L_0(x) = 1
     *   L_1(x) = 1 - x
     *   (n+1)*L_{n+1}(x) = (2n+1-x)*L_n(x) - n*L_{n-1}(x)
     *
     * Syntax:
     *
     *    math.laguerreL(n, x)
     *
     * Examples:
     *
     *    math.laguerreL(0, 1)   // returns 1
     *    math.laguerreL(1, 1)   // returns 0
     *    math.laguerreL(2, 1)   // returns -0.5
     *    math.laguerreL(3, 1)   // returns -0.16666666666666666
     *
     * See also:
     *
     *    chebyshevT, hermiteH, legendreP
     *
     * @param {number} n   The degree, a non-negative integer
     * @param {number} x   The argument
     * @return {number}    The value of the Laguerre polynomial L_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n) || n < 0) {
          throw new TypeError('laguerreL: n must be a non-negative integer, got ' + n)
        }

        if (n === 0) return 1
        if (n === 1) return 1 - x

        let lPrev = 1     // L_0
        let lCurr = 1 - x // L_1

        for (let k = 1; k < n; k++) {
          const lNext = ((2 * k + 1 - x) * lCurr - k * lPrev) / (k + 1)
          lPrev = lCurr
          lCurr = lNext
        }

        return lCurr
      }
    })
  }
)
