/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'digamma'
const dependencies = ['typed']

export const createDigamma = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the digamma (psi) function, the logarithmic derivative of the gamma function.
     *
     * psi(x) = d/dx ln(Gamma(x)) = Gamma'(x) / Gamma(x)
     *
     * Syntax:
     *
     *    math.digamma(x)
     *
     * Examples:
     *
     *    math.digamma(1)    // returns -0.5772156649015329 (= -EulerMascheroni)
     *    math.digamma(2)    // returns 0.4227843350984671 (= 1 - EulerMascheroni)
     *    math.digamma(0.5)  // returns -1.9635100260214235
     *
     * See also:
     *
     *    gamma, beta, gammainc
     *
     * @param {number} x   The argument
     * @return {number}    The digamma function value psi(x)
     */
    return typed(name, {
      number: function (x) {
        if (Number.isInteger(x) && x <= 0) {
          return NaN // Poles at non-positive integers
        }
        // Reflection formula for x < 0
        if (x < 0) {
          return _digamma(1 - x) + Math.PI / Math.tan(Math.PI * x)
        }
        return _digamma(x)
      }
    })

    function _digamma (x) {
      // For small x, use recurrence to shift x >= 10 for asymptotic series
      // (threshold 6 gives only ~9 digit accuracy; 10 gives ~14 digits)
      let result = 0
      while (x < 10) {
        result -= 1 / x
        x += 1
      }
      // Asymptotic series for x >= 6:
      // psi(x) ~ ln(x) - 1/(2x) - B2/(2x^2) + B4/(4x^4) - B6/(6x^6) + ...
      // Bernoulli: B2=1/6, B4=-1/30, B6=1/42, B8=-1/30, B10=5/66
      const xInv = 1 / x
      const xInv2 = xInv * xInv
      result += Math.log(x) - 0.5 * xInv
      result -= xInv2 * (
        1 / 12 +
        xInv2 * (-1 / 120 +
        xInv2 * (1 / 252 +
        xInv2 * (-1 / 240 +
        xInv2 * (1 / 132))))
      )
      return result
    }
  }
)
