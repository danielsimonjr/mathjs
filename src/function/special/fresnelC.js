/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'fresnelC'
const dependencies = ['typed']

export const createFresnelC = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the Fresnel cosine integral C(x).
     *
     * C(x) = integral from 0 to x of cos(pi * t^2 / 2) dt
     *
     * Syntax:
     *
     *    math.fresnelC(x)
     *
     * Examples:
     *
     *    math.fresnelC(0)    // returns 0
     *    math.fresnelC(1)    // returns 0.7798934003768228
     *    math.fresnelC(-1)   // returns -0.7798934003768228
     *
     * See also:
     *
     *    fresnelS, erf, erfi, erfc
     *
     * @param {number} x   A real number
     * @return {number}    The Fresnel cosine integral C(x)
     */
    return typed(name, {
      number: function (x) {
        if (x === 0) return 0
        if (!isFinite(x)) return x > 0 ? 0.5 : -0.5

        const ax = Math.abs(x)
        let result

        if (ax <= 5) {
          result = _fresnelCTaylor(ax)
        } else {
          result = _fresnelCAsymptotic(ax)
        }

        return x < 0 ? -result : result
      }
    })

    // Taylor series for C(x) with Kahan compensated summation:
    // C(x) = sum_{n=0}^inf (-1)^n * (pi/2)^(2n) * x^(4n+1) / ((2n)! * (4n+1))
    // Recurrence: a_{n+1} = a_n * (pi/2)^2 * x^4 / ((2n+1)(2n+2))
    function _fresnelCTaylor (x) {
      const PIOVER2 = Math.PI / 2
      const p2 = PIOVER2 * PIOVER2
      const x2 = x * x
      const x4 = x2 * x2
      let a = x
      let sum = a // term at n=0: x^1 / 1
      let compensation = 0
      const EPS = 1e-15
      const MAXIT = 500

      for (let n = 0; n < MAXIT; n++) {
        // a_{n+1} = a_n * (pi/2)^2 * x^4 / ((2n+1)(2n+2))
        a = a * p2 * x4 / ((2 * n + 1) * (2 * n + 2))
        // term_{n+1} = (-1)^(n+1) * a_{n+1} / (4(n+1)+1)
        const term = (n % 2 === 0 ? -1 : 1) * a / (4 * (n + 1) + 1)
        // Kahan summation
        const y = term - compensation
        const t = sum + y
        compensation = (t - sum) - y
        sum = t
        if (Math.abs(term) < Math.abs(sum) * EPS && n > 5) break
      }
      return sum
    }

    // Asymptotic approximation for large x (x > 5) using auxiliary functions f(x) and g(x)
    // C(x) ~ 0.5 + f(x)*sin(pi*x^2/2) - g(x)*cos(pi*x^2/2)
    // where f(x) ~ 1/(pi*x), g(x) ~ 1/(pi^2*x^3) for large x
    function _fresnelCAsymptotic (x) {
      const pix2over2 = Math.PI * x * x / 2

      // Compute auxiliary functions using asymptotic series
      const xi = 1 / (Math.PI * x * x) // small parameter
      const piX = Math.PI * x

      // f(x) and g(x) rational approximation (A&S 7.3 style)
      const t = xi * xi
      const f = (1 / piX) * (1 + t * (-1 / 2 + t * (9 / 8 + t * (-75 / 16))))
      const g = (xi / piX) * (1 + t * (-3 / 2 + t * (45 / 8 + t * (-525 / 16))))

      return 0.5 + f * Math.sin(pix2over2) - g * Math.cos(pix2over2)
    }
  }
)
