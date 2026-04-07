/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'ellipticK'
const dependencies = ['typed']

export const createEllipticK = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the complete elliptic integral of the first kind K(m).
     *
     * K(m) = integral from 0 to pi/2 of 1/sqrt(1 - m*sin^2(theta)) d(theta)
     *
     * where m is the parameter (note: m = k^2 where k is the modulus).
     * Uses the Arithmetic-Geometric Mean (AGM) algorithm for fast convergence.
     *
     * Syntax:
     *
     *    math.ellipticK(m)
     *
     * Examples:
     *
     *    math.ellipticK(0)    // returns 1.5707963267948966 (= pi/2)
     *    math.ellipticK(0.5)  // returns 1.8540746773013719
     *    math.ellipticK(0.9)  // returns 2.280549138422771
     *
     * See also:
     *
     *    ellipticE
     *
     * @param {number} m   The parameter, 0 <= m < 1
     * @return {number}    The complete elliptic integral K(m)
     */
    return typed(name, {
      number: function (m) {
        if (m < 0 || m >= 1) {
          throw new RangeError('ellipticK: m must be in [0, 1), got ' + m)
        }

        if (m === 0) return Math.PI / 2

        // AGM algorithm
        let a = 1
        let b = Math.sqrt(1 - m)

        const MAX_ITER = 100
        const TOL = 1e-15

        for (let i = 0; i < MAX_ITER; i++) {
          const aNew = (a + b) / 2
          const bNew = Math.sqrt(a * b)
          if (Math.abs(aNew - bNew) <= TOL * aNew) {
            a = aNew
            break
          }
          a = aNew
          b = bNew
        }

        return Math.PI / (2 * a)
      }
    })
  }
)
