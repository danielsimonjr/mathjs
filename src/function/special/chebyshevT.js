import { factory } from '../../utils/factory.js'

const name = 'chebyshevT'
const dependencies = ['typed']

export const createChebyshevT = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Evaluate the Chebyshev polynomial of the first kind T_n(x).
     *
     * Uses the three-term recurrence relation:
     *   T_0(x) = 1
     *   T_1(x) = x
     *   T_{n+1}(x) = 2*x*T_n(x) - T_{n-1}(x)
     *
     * Syntax:
     *
     *    math.chebyshevT(n, x)
     *
     * Examples:
     *
     *    math.chebyshevT(0, 0.5)   // returns 1
     *    math.chebyshevT(1, 0.5)   // returns 0.5
     *    math.chebyshevT(2, 0.5)   // returns -0.5
     *    math.chebyshevT(3, 0.5)   // returns -1
     *
     * See also:
     *
     *    hermiteH, laguerreL, legendreP
     *
     * @param {number} n   The degree, a non-negative integer
     * @param {number} x   The argument
     * @return {number}    The value of the Chebyshev polynomial T_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n) || n < 0) {
          throw new TypeError('chebyshevT: n must be a non-negative integer, got ' + n)
        }

        if (n === 0) return 1
        if (n === 1) return x

        let tPrev = 1 // T_0
        let tCurr = x // T_1

        for (let k = 1; k < n; k++) {
          const tNext = 2 * x * tCurr - tPrev
          tPrev = tCurr
          tCurr = tNext
        }

        return tCurr
      }
    })
  }
)
