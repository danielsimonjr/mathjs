/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'betainc'
const dependencies = ['typed']

export const createBetainc = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the regularized incomplete beta function I_x(a, b).
     *
     * I_x(a, b) = B(x; a, b) / B(a, b)
     *
     * where B(x; a, b) = integral from 0 to x of t^(a-1) * (1-t)^(b-1) dt
     *
     * Uses continued fraction expansion (Lentz's method) for numerical stability.
     *
     * Syntax:
     *
     *    math.betainc(x, a, b)
     *
     * Examples:
     *
     *    math.betainc(0, 2, 3)    // returns 0
     *    math.betainc(1, 2, 3)    // returns 1
     *    math.betainc(0.5, 2, 3)  // returns 0.6875
     *
     * See also:
     *
     *    beta, gammainc, gamma
     *
     * @param {number} x   The upper limit (must be in [0, 1])
     * @param {number} a   First shape parameter (positive)
     * @param {number} b   Second shape parameter (positive)
     * @return {number}    The regularized incomplete beta function value I_x(a, b)
     */
    return typed(name, {
      'number, number, number': function (x, a, b) {
        if (x < 0 || x > 1) {
          throw new RangeError('betainc: x must be in [0, 1], got ' + x)
        }
        if (a <= 0) {
          throw new RangeError('betainc: a must be positive, got ' + a)
        }
        if (b <= 0) {
          throw new RangeError('betainc: b must be positive, got ' + b)
        }
        if (x === 0) return 0
        if (x === 1) return 1

        // Use continued fraction representation directly or via symmetry
        // For numerical stability, use CF when x < (a+1)/(a+b+2), otherwise use symmetry
        const lbeta = _lgamma(a) + _lgamma(b) - _lgamma(a + b)
        const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a

        if (x < (a + 1) / (a + b + 2)) {
          return front * _betacf(x, a, b)
        } else {
          // Use symmetry: I_x(a,b) = 1 - I_{1-x}(b,a)
          const frontSym = Math.exp(Math.log(1 - x) * b + Math.log(x) * a - lbeta) / b
          return 1 - frontSym * _betacf(1 - x, b, a)
        }
      }
    })

    // Continued fraction for incomplete beta (Lentz's method)
    function _betacf (x, a, b) {
      const MAXIT = 200
      const EPS = 3e-15
      const FPMIN = 1e-300

      const qab = a + b
      const qap = a + 1
      const qam = a - 1
      let c = 1
      let d = 1 - qab * x / qap
      if (Math.abs(d) < FPMIN) d = FPMIN
      d = 1 / d
      let h = d

      for (let m = 1; m <= MAXIT; m++) {
        const m2 = 2 * m
        // Even step
        let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        h *= d * c
        // Odd step
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1 + aa * d
        if (Math.abs(d) < FPMIN) d = FPMIN
        c = 1 + aa / c
        if (Math.abs(c) < FPMIN) c = FPMIN
        d = 1 / d
        const del = d * c
        h *= del
        if (Math.abs(del - 1) < EPS) break
      }
      return h
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
