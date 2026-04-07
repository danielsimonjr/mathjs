/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'expIntegralEi'
const dependencies = ['typed']

export const createExpIntegralEi = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    // Euler-Mascheroni constant
    const EULER_GAMMA = 0.5772156649015329

    /**
     * Compute the exponential integral Ei(x).
     *
     * Ei(x) = -P.V. integral from -x to infinity of e^(-t)/t dt
     *       = P.V. integral from -infinity to x of e^t/t dt
     *
     * For x != 0 (real). Uses:
     *  - Power series for |x| <= 40: Ei(x) = gamma + ln|x| + sum(x^n / (n * n!), n=1..)
     *  - Asymptotic series for x > 40: Ei(x) ~ (e^x/x) * sum(n!/x^n, n=0..)
     *
     * Syntax:
     *
     *    math.expIntegralEi(x)
     *
     * Examples:
     *
     *    math.expIntegralEi(1)   // returns 1.8951178163559368
     *    math.expIntegralEi(2)   // returns 4.954234356001891
     *    math.expIntegralEi(-1)  // returns -0.21938393439552029
     *
     * See also:
     *
     *    erf
     *
     * @param {number} x   A nonzero real number
     * @return {number}    The exponential integral Ei(x)
     */
    return typed(name, {
      number: function (x) {
        if (x === 0) {
          return -Infinity
        }

        if (x > 40) {
          return _asymptotic(x)
        }

        return _powerSeries(x)
      }
    })

    // Power series: Ei(x) = gamma + ln|x| + sum_{n=1}^{inf} x^n / (n * n!)
    function _powerSeries (x) {
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

    // Asymptotic series (valid for large positive x):
    // Ei(x) ~ (e^x / x) * sum_{n=0}^{N} n! / x^n
    function _asymptotic (x) {
      const MAX_TERMS = 60
      const TOL = 1e-15

      let term = 1
      let sum = 1
      for (let n = 1; n < MAX_TERMS; n++) {
        term *= n / x
        if (Math.abs(term) < TOL * Math.abs(sum)) break
        // Divergent for small x — stop when terms grow
        if (Math.abs(term) > Math.abs(sum)) break
        sum += term
      }

      return (Math.exp(x) / x) * sum
    }
  }
)
