/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'fresnelS'
const dependencies = ['typed']

export const createFresnelS = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the Fresnel sine integral S(x).
     *
     * S(x) = integral from 0 to x of sin(pi * t^2 / 2) dt
     *
     * Syntax:
     *
     *    math.fresnelS(x)
     *
     * Examples:
     *
     *    math.fresnelS(0)    // returns 0
     *    math.fresnelS(1)    // returns 0.4382591473235709
     *    math.fresnelS(-1)   // returns -0.4382591473235709
     *
     * See also:
     *
     *    erf, erfi, erfc
     *
     * @param {number} x   A real number
     * @return {number}    The Fresnel sine integral S(x)
     */
    return typed(name, {
      number: function (x) {
        if (x === 0) return 0
        if (!isFinite(x)) return x > 0 ? 0.5 : -0.5

        const ax = Math.abs(x)
        let result

        if (ax < 1.6) {
          result = _fresnelSTaylor(ax)
        } else {
          result = _fresnelSAsymptotic(ax)
        }

        return x < 0 ? -result : result
      }
    })

    // Taylor series for S(x):
    // S(x) = sum_{n=0}^inf (-1)^n * (pi/2)^(2n+1) * x^(4n+3) / (n! * (2n+1)! / n! ...)
    // Written as: S(x) = (pi/2) * sum_{n=0}^inf (-1)^n * ((pi/2)^2)^n * x^(4n+3) / (n! * (2n+1) * ... )
    // Standard form: S(x) = sum_{n=0}^inf (-1)^n * (pi/2)^(2n+1) * x^(4n+3) / ((2n+1)! * (4n+3))
    // where a_n = (pi/2)^(2n+1) * x^(4n+3) / (2n+1)!
    // and a_{n+1}/a_n = (pi/2)^2 * x^4 / ((2n+2)(2n+3))
    function _fresnelSTaylor (x) {
      const PIOVER2 = Math.PI / 2
      const p2 = PIOVER2 * PIOVER2
      const x2 = x * x
      const x4 = x2 * x2
      // a_0 = (pi/2) * x^3; term_0 = a_0 / 3
      let a = PIOVER2 * x * x2
      let sum = a / 3
      const EPS = 1e-15
      const MAXIT = 100

      for (let n = 0; n < MAXIT; n++) {
        // a_{n+1} = a_n * (pi/2)^2 * x^4 / ((2n+2)(2n+3))
        a = a * p2 * x4 / ((2 * n + 2) * (2 * n + 3))
        // term_{n+1} = (-1)^(n+1) * a_{n+1} / (4(n+1)+3)
        const term = (n % 2 === 0 ? -1 : 1) * a / (4 * (n + 1) + 3)
        sum += term
        if (Math.abs(term) < Math.abs(sum) * EPS) break
      }
      return sum
    }

    // Asymptotic approximation for large x using auxiliary functions f(x) and g(x)
    // S(x) ~ 0.5 - f(x)*cos(pi*x^2/2) - g(x)*sin(pi*x^2/2)
    // where f(x) ~ 1/(pi*x), g(x) ~ 1/(pi^2*x^3) for large x
    function _fresnelSAsymptotic (x) {
      const pix2over2 = Math.PI * x * x / 2

      // Compute auxiliary functions using asymptotic series
      // f(x) = (1/(pi*x)) * sum_{k=0}^{} (-1)^k * (4k+1)!! / (pi*x^2)^(2k) / ...
      // Use the simple relation based on Abramowitz & Stegun 7.3.20-21
      // For the auxiliary functions:
      // f ~ 1/(pi*x) and g ~ 1/(pi^2*x^3) to leading order, with corrections
      const xi = 1 / (Math.PI * x * x) // small parameter
      const piX = Math.PI * x

      // f(x) rational approximation (A&S table 7.3 style, for x >= 1.6)
      const t = xi * xi // t = 1/(pi*x^2)^2
      const f = (1 / piX) * (1 + t * (-1 / 2 + t * (9 / 8 + t * (-75 / 16))))
      const g = (xi / piX) * (1 + t * (-3 / 2 + t * (45 / 8 + t * (-525 / 16))))

      return 0.5 - f * Math.cos(pix2over2) - g * Math.sin(pix2over2)
    }
  }
)
