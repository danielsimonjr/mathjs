/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'logIntegral'
const dependencies = ['typed']

export const createLogIntegral = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    // Euler-Mascheroni constant
    const EULER_GAMMA = 0.5772156649015329

    /**
     * Compute the logarithmic integral li(x).
     *
     * li(x) = integral from 0 to x of 1/ln(t) dt  (for x > 1)
     *
     * Computed via li(x) = Ei(ln(x)), where Ei is the exponential integral.
     *
     * Syntax:
     *
     *    math.logIntegral(x)
     *
     * Examples:
     *
     *    math.logIntegral(2)   // returns 1.0451637801174928
     *    math.logIntegral(10)  // returns 6.165599504787298
     *
     * See also:
     *
     *    expIntegralEi
     *
     * @param {number} x   A real number greater than 1 (or between 0 and 1)
     * @return {number}    The logarithmic integral li(x)
     */
    return typed(name, {
      number: function (x) {
        if (x <= 0) {
          throw new Error('logIntegral: x must be positive, got ' + x)
        }
        if (x === 1) {
          return -Infinity
        }
        if (!isFinite(x)) return Infinity

        // li(x) = Ei(ln(x))
        const t = Math.log(x)
        return _ei(t)
      }
    })

    // Ei(x): exponential integral, computed internally
    // Power series for |x| <= 40, asymptotic for x > 40
    function _ei (x) {
      if (x === 0) return -Infinity
      if (x > 40) return _eiAsymptotic(x)
      return _eiPowerSeries(x)
    }

    function _eiPowerSeries (x) {
      const MAX_ITER = 200
      const TOL = 1e-15

      let term = x
      let sum = x
      for (let n = 2; n < MAX_ITER; n++) {
        term *= x / n
        const contrib = term / n
        sum += contrib
        if (Math.abs(contrib) <= TOL * Math.abs(sum)) break
      }

      return EULER_GAMMA + Math.log(Math.abs(x)) + sum
    }

    function _eiAsymptotic (x) {
      const MAX_TERMS = 60
      const TOL = 1e-15

      let term = 1
      let sum = 1
      for (let n = 1; n < MAX_TERMS; n++) {
        term *= n / x
        if (Math.abs(term) < TOL * Math.abs(sum)) break
        if (Math.abs(term) > Math.abs(sum)) break
        sum += term
      }

      return (Math.exp(x) / x) * sum
    }
  }
)
