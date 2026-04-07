/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'gammainc'
const dependencies = ['typed']

export const createGammainc = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the regularized lower incomplete gamma function P(a, x).
     *
     * P(a, x) = gamma(a, x) / Gamma(a)
     *         = (1 / Gamma(a)) * integral from 0 to x of t^(a-1) * e^(-t) dt
     *
     * Uses series expansion for x < a+1, continued fraction for x >= a+1.
     *
     * Syntax:
     *
     *    math.gammainc(a, x)
     *
     * Examples:
     *
     *    math.gammainc(1, 0)    // returns 0
     *    math.gammainc(1, 1)    // returns 0.6321205588285578 (= 1 - 1/e)
     *    math.gammainc(2, 1)    // returns 0.2642411176571153
     *
     * See also:
     *
     *    gammaincp, gamma, betainc
     *
     * @param {number} a   The shape parameter (positive)
     * @param {number} x   The upper limit (non-negative)
     * @return {number}    The regularized lower incomplete gamma P(a, x)
     */
    return typed(name, {
      'number, number': function (a, x) {
        if (a <= 0) {
          throw new RangeError('gammainc: a must be positive, got ' + a)
        }
        if (x < 0) {
          throw new RangeError('gammainc: x must be non-negative, got ' + x)
        }
        if (x === 0) return 0
        if (x === Infinity) return 1

        if (x < a + 1) {
          return _gammaSeries(a, x)
        } else {
          return 1 - _gammaCF(a, x)
        }
      }
    })

    // Series expansion for P(a, x) — converges for x < a+1
    function _gammaSeries (a, x) {
      const MAXIT = 200
      const EPS = 3e-15

      const lga = _lgamma(a)
      let ap = a
      let sum = 1.0 / a
      let del = sum

      for (let n = 1; n <= MAXIT; n++) {
        ap += 1
        del *= x / ap
        sum += del
        if (Math.abs(del) < Math.abs(sum) * EPS) break
      }
      return sum * Math.exp(-x + a * Math.log(x) - lga)
    }

    // Continued fraction for Q(a, x) = 1 - P(a, x) — converges for x >= a+1
    function _gammaCF (a, x) {
      const MAXIT = 200
      const EPS = 3e-15
      const FPMIN = 1e-300

      const lga = _lgamma(a)
      let b = x + 1 - a
      let c = 1 / FPMIN
      let d = 1 / b
      let h = d

      for (let i = 1; i <= MAXIT; i++) {
        const an = -i * (i - a)
        b += 2
        d = an * d + b
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = b + an / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        const del = d * c
        h *= del
        if (Math.abs(del - 1) < EPS) break
      }
      return Math.exp(-x + a * Math.log(x) - lga) * h
    }

    // Log-gamma using Lanczos approximation
    function _lgamma (x) {
      if (x < 0.5) {
        return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - _lgamma(1 - x)
      }
      const g = 7
      const c = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
      ]
      let xr = x - 1
      let sum = c[0]
      for (let i = 1; i < g + 2; i++) sum += c[i] / (xr + i)
      const t = xr + g + 0.5
      return 0.5 * Math.log(2 * Math.PI) + (xr + 0.5) * Math.log(t) - t + Math.log(sum)
    }
  }
)
