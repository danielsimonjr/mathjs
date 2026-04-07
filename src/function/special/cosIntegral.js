/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'cosIntegral'
const dependencies = ['typed']

export const createCosIntegral = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    // Euler-Mascheroni constant
    const EULER_GAMMA = 0.5772156649015329

    /**
     * Compute the cosine integral Ci(x).
     *
     * Ci(x) = gamma + ln(x) + integral from 0 to x of (cos(t)-1)/t dt  (for x > 0)
     *
     * where gamma is the Euler-Mascheroni constant (~0.5772).
     *
     * Syntax:
     *
     *    math.cosIntegral(x)
     *
     * Examples:
     *
     *    math.cosIntegral(1)  // returns 0.3374039229009681
     *    math.cosIntegral(2)  // returns 0.42298082877486476
     *
     * See also:
     *
     *    sinIntegral, expIntegralEi
     *
     * @param {number} x   A positive real number
     * @return {number}    The cosine integral Ci(x)
     */
    return typed(name, {
      number: function (x) {
        if (x <= 0) {
          throw new Error('cosIntegral: x must be positive, got ' + x)
        }
        if (!isFinite(x)) return 0

        if (x <= 25) {
          return _ciTaylor(x)
        } else {
          return _ciAsymptotic(x)
        }
      }
    })

    // Taylor series with Kahan compensated summation:
    // Ci(x) = gamma + ln(x) + sum_{n=1}^inf (-1)^n * x^(2n) / (2n * (2n)!)
    // Recurrence: a_n = a_{n-1} * (-x^2) / ((2n-1) * 2n), term_n = a_n / (2n)
    function _ciTaylor (x) {
      const x2 = x * x
      let an = -x2 / 2 // a_1 = -x^2/2
      let sum = an / 2 // term_1 = a_1 / 2 = -x^2/4
      let compensation = 0
      const MAXIT = 500

      for (let n = 2; n < MAXIT; n++) {
        an *= -x2 / ((2 * n - 1) * (2 * n))
        const contrib = an / (2 * n)
        // Kahan summation
        const y = contrib - compensation
        const t = sum + y
        compensation = (t - sum) - y
        sum = t
        if (Math.abs(contrib) < Math.abs(sum) * 1e-15 && n > 5) break
      }

      return EULER_GAMMA + Math.log(x) + sum
    }

    // Asymptotic expansion for large x (x > 25):
    // Ci(x) ~ f(x)*sin(x) - g(x)*cos(x)
    // where f(x)*x = sum_{n=0}^N (-1)^n * (2n)! / x^(2n)  (stopped at smallest term)
    //       g(x)*x^2 = sum_{n=0}^N (-1)^n * (2n+1)! / x^(2n)
    function _ciAsymptotic (x) {
      const x2 = x * x
      let fTerm = 1
      let gTerm = 1
      let f = fTerm
      let g = gTerm

      for (let n = 1; n < 100; n++) {
        const prevF = fTerm
        fTerm *= -(2 * n - 1) * (2 * n) / x2
        if (Math.abs(fTerm) >= Math.abs(prevF)) break
        f += fTerm

        const prevG = gTerm
        gTerm *= -(2 * n) * (2 * n + 1) / x2
        if (Math.abs(gTerm) >= Math.abs(prevG)) break
        g += gTerm
      }

      return (f / x) * Math.sin(x) - (g / x2) * Math.cos(x)
    }
  }
)
