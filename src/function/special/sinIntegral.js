/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'sinIntegral'
const dependencies = ['typed']

export const createSinIntegral = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the sine integral Si(x).
     *
     * Si(x) = integral from 0 to x of sin(t)/t dt
     *
     * Syntax:
     *
     *    math.sinIntegral(x)
     *
     * Examples:
     *
     *    math.sinIntegral(0)        // returns 0
     *    math.sinIntegral(1)        // returns 0.9460830703671831
     *    math.sinIntegral(Infinity) // returns 1.5707963267948966 (pi/2)
     *
     * See also:
     *
     *    cosIntegral, expIntegralEi
     *
     * @param {number} x   A real number
     * @return {number}    The sine integral Si(x)
     */
    return typed(name, {
      number: function (x) {
        if (x === 0) return 0
        if (!isFinite(x)) return x > 0 ? Math.PI / 2 : -Math.PI / 2

        const ax = Math.abs(x)
        let result

        if (ax <= 25) {
          result = _siTaylor(ax)
        } else {
          result = _siAsymptotic(ax)
        }

        return x < 0 ? -result : result
      }
    })

    // Taylor series with Kahan compensated summation to reduce cancellation error:
    // Si(x) = sum_{n=0}^inf (-1)^n * x^(2n+1) / ((2n+1) * (2n+1)!)
    function _siTaylor (x) {
      const x2 = x * x
      let term = x
      let sum = x
      let compensation = 0
      const MAXIT = 500

      for (let n = 1; n < MAXIT; n++) {
        term *= -x2 / ((2 * n) * (2 * n + 1))
        const contrib = term / (2 * n + 1)
        // Kahan summation
        const y = contrib - compensation
        const t = sum + y
        compensation = (t - sum) - y
        sum = t
        if (Math.abs(contrib) < Math.abs(sum) * 1e-15 && n > 5) break
      }
      return sum
    }

    // Asymptotic expansion for large x (x > 25):
    // Si(x) ~ pi/2 - f(x)*cos(x) - g(x)*sin(x)
    // where f(x)*x = sum_{n=0}^N (-1)^n * (2n)! / x^(2n)  (stopped at smallest term)
    //       g(x)*x^2 = sum_{n=0}^N (-1)^n * (2n+1)! / x^(2n)
    function _siAsymptotic (x) {
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

      return Math.PI / 2 - (f / x) * Math.cos(x) - (g / x2) * Math.sin(x)
    }
  }
)
