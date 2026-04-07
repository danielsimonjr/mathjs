import { factory } from '../../utils/factory.js'

const name = 'hermiteH'
const dependencies = ['typed']

export const createHermiteH = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Evaluate the physicist's Hermite polynomial H_n(x).
     *
     * Uses the three-term recurrence relation:
     *   H_0(x) = 1
     *   H_1(x) = 2*x
     *   H_{n+1}(x) = 2*x*H_n(x) - 2*n*H_{n-1}(x)
     *
     * Syntax:
     *
     *    math.hermiteH(n, x)
     *
     * Examples:
     *
     *    math.hermiteH(0, 1)   // returns 1
     *    math.hermiteH(1, 1)   // returns 2
     *    math.hermiteH(2, 1)   // returns 2
     *    math.hermiteH(3, 1)   // returns -4
     *
     * See also:
     *
     *    chebyshevT, laguerreL, legendreP
     *
     * @param {number} n   The degree, a non-negative integer
     * @param {number} x   The argument
     * @return {number}    The value of the Hermite polynomial H_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n) || n < 0) {
          throw new TypeError('hermiteH: n must be a non-negative integer, got ' + n)
        }

        if (n === 0) return 1
        if (n === 1) return 2 * x

        let hPrev = 1   // H_0
        let hCurr = 2 * x // H_1

        for (let k = 1; k < n; k++) {
          const hNext = 2 * x * hCurr - 2 * k * hPrev
          hPrev = hCurr
          hCurr = hNext
        }

        return hCurr
      }
    })
  }
)
