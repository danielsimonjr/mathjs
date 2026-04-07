/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'ellipticE'
const dependencies = ['typed']

export const createEllipticE = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the complete elliptic integral of the second kind E(m).
     *
     * E(m) = integral from 0 to pi/2 of sqrt(1 - m*sin^2(theta)) d(theta)
     *
     * where m is the parameter (note: m = k^2 where k is the modulus).
     * Uses the Arithmetic-Geometric Mean (AGM) algorithm with correction sum.
     *
     * Syntax:
     *
     *    math.ellipticE(m)
     *
     * Examples:
     *
     *    math.ellipticE(0)    // returns 1.5707963267948966 (= pi/2)
     *    math.ellipticE(0.5)  // returns 1.3506438810476755
     *    math.ellipticE(1)    // returns 1
     *
     * See also:
     *
     *    ellipticK
     *
     * @param {number} m   The parameter, 0 <= m <= 1
     * @return {number}    The complete elliptic integral E(m)
     */
    return typed(name, {
      number: function (m) {
        if (m < 0 || m > 1) {
          throw new RangeError('ellipticE: m must be in [0, 1], got ' + m)
        }

        if (m === 0) return Math.PI / 2
        if (m === 1) return 1

        // AGM algorithm for E(m).
        // Formula: E(m) = K(m) * (1 - (1/2) * sum_{n=0}^{inf} 2^n * c_n^2)
        // where c_0 = sqrt(m) (the modulus k), a_0 = 1, b_0 = sqrt(1-m),
        // and c_{n+1} = (a_n - b_n) / 2 for n >= 0.
        // K(m) = pi / (2 * a_final).
        const k = Math.sqrt(m)
        let a = 1
        let b = Math.sqrt(1 - m)   // = sqrt(1 - k^2) = k'
        let power = 1              // 2^n, starts at 2^0 = 1
        let corrSum = power * k * k // first term: 2^0 * c_0^2 = k^2 = m

        const MAX_ITER = 100
        const TOL = 1e-15

        for (let i = 0; i < MAX_ITER; i++) {
          const aNew = (a + b) / 2
          const bNew = Math.sqrt(a * b)
          const c = (a - b) / 2
          power *= 2                // 2^(n+1)
          corrSum += power * c * c
          a = aNew
          b = bNew
          if (Math.abs(a - b) <= TOL * a) {
            break
          }
        }

        const K = Math.PI / (2 * a)
        return K * (1 - corrSum / 2)
      }
    })
  }
)
