/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'beta'
const dependencies = ['typed']

export const createBeta = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the Beta function B(a, b).
     *
     * B(a, b) = Gamma(a) * Gamma(b) / Gamma(a + b)
     *         = exp(lgamma(a) + lgamma(b) - lgamma(a + b))
     *
     * Syntax:
     *
     *    math.beta(a, b)
     *
     * Examples:
     *
     *    math.beta(1, 1)      // returns 1
     *    math.beta(2, 3)      // returns 0.08333333333333333 (= 1/12)
     *    math.beta(0.5, 0.5)  // returns Math.PI (~3.14159...)
     *
     * See also:
     *
     *    gamma, betainc, gammainc
     *
     * @param {number} a   First parameter (positive)
     * @param {number} b   Second parameter (positive)
     * @return {number}    The Beta function value B(a, b)
     */
    return typed(name, {
      'number, number': function (a, b) {
        if (a <= 0 || b <= 0) {
          if (Number.isInteger(a) && a <= 0) return Infinity
          if (Number.isInteger(b) && b <= 0) return Infinity
        }
        return Math.exp(_lgamma(a) + _lgamma(b) - _lgamma(a + b))
      }
    })

    // Log-gamma function using Lanczos approximation
    function _lgamma (x) {
      if (x <= 0) {
        if (Number.isInteger(x)) return Infinity
        // Reflection formula: lgamma(x) = log(pi) - lgamma(1-x) - log(|sin(pi*x)|)
        return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - _lgamma(1 - x)
      }
      if (x < 0.5) {
        // Reflection
        return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - _lgamma(1 - x)
      }
      // Lanczos coefficients (g=7, n=9)
      const g = 7
      const c = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
      ]
      let xr = x - 1
      let sum = c[0]
      for (let i = 1; i < g + 2; i++) {
        sum += c[i] / (xr + i)
      }
      const t = xr + g + 0.5
      return 0.5 * Math.log(2 * Math.PI) + (xr + 0.5) * Math.log(t) - t + Math.log(sum)
    }
  }
)
