/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'besselK'
const dependencies = ['typed']

export const createBesselK = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the modified Bessel function of the second kind K_n(x).
     *
     * Syntax:
     *
     *    math.besselK(n, x)
     *
     * Examples:
     *
     *    math.besselK(0, 1)    // returns 0.4210244382407083
     *    math.besselK(1, 1)    // returns 0.6019072301972346
     *    math.besselK(0, 0)    // returns Infinity
     *
     * See also:
     *
     *    besselJ, besselY, besselI, gamma
     *
     * @param {number} n   The order (non-negative integer)
     * @param {number} x   The argument (must be > 0)
     * @return {number}    The modified Bessel function value K_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n)) {
          throw new TypeError('besselK: order n must be an integer, got ' + n)
        }
        if (x <= 0) {
          if (x === 0) return Infinity
          return NaN
        }
        const nAbs = Math.abs(n)
        // K_{-n}(x) = K_n(x)
        if (nAbs === 0) return _besselK0(x)
        if (nAbs === 1) return _besselK1(x)
        return _besselKn(nAbs, x)
      }
    })

    // Polynomial approximation for K0(x) — Abramowitz & Stegun 9.8
    function _besselK0 (x) {
      if (x <= 2.0) {
        const y = (x * x) / 4.0
        return (-Math.log(x / 2.0) * _besselI0(x)) + (-0.57721566 + y * (0.42278420 +
          y * (0.23069756 + y * (0.03488590 + y * (0.00262698 +
          y * (0.00010750 + y * 0.0000074))))))
      }
      const y = 2.0 / x
      return (Math.exp(-x) / Math.sqrt(x)) * (1.25331414 + y * (-0.07832358 +
        y * (0.02189568 + y * (-0.01062446 + y * (0.00587872 +
        y * (-0.00251540 + y * 0.00053208))))))
    }

    // Polynomial approximation for K1(x) — Abramowitz & Stegun 9.8
    function _besselK1 (x) {
      if (x <= 2.0) {
        const y = (x * x) / 4.0
        return (Math.log(x / 2.0) * _besselI1(x)) + (1.0 / x) * (1.0 + y * (0.15443144 +
          y * (-0.67278579 + y * (-0.18156897 + y * (-0.01919402 +
          y * (-0.00110404 + y * (-0.00004686)))))))
      }
      const y = 2.0 / x
      return (Math.exp(-x) / Math.sqrt(x)) * (1.25331414 + y * (0.23498619 +
        y * (-0.03655620 + y * (0.01504268 + y * (-0.00780353 +
        y * (0.00325614 + y * (-0.00068245)))))))
    }

    // I0 helper needed by K0
    function _besselI0 (x) {
      const ax = Math.abs(x)
      if (ax <= 3.75) {
        const y = (x / 3.75) * (x / 3.75)
        return 1.0 + y * (3.5156229 + y * (3.0899424 + y * (1.2067492 +
          y * (0.2659732 + y * (0.0360768 + y * 0.0045813)))))
      }
      const y = 3.75 / ax
      return (Math.exp(ax) / Math.sqrt(ax)) * (0.39894228 + y * (0.01328592 +
        y * (0.00225319 + y * (-0.00157565 + y * (0.00916281 + y * (-0.02057706 +
        y * (0.02635537 + y * (-0.01647633 + y * 0.00392377))))))))
    }

    // I1 helper needed by K1
    function _besselI1 (x) {
      const ax = Math.abs(x)
      let ans
      if (ax <= 3.75) {
        const y = (x / 3.75) * (x / 3.75)
        ans = ax * (0.5 + y * (0.87890594 + y * (0.51498869 + y * (0.15084934 +
          y * (0.02658733 + y * (0.00301532 + y * 0.00032411))))))
      } else {
        const y = 3.75 / ax
        ans = (Math.exp(ax) / Math.sqrt(ax)) * (0.39894228 + y * (-0.03988024 +
          y * (-0.00362018 + y * (0.00163801 + y * (-0.01031555 + y * (0.02282967 +
          y * (-0.02895312 + y * (0.01787654 + y * (-0.00420059)))))))))
      }
      return x < 0 ? -ans : ans
    }

    // Forward recurrence for K_n(x), n >= 2
    function _besselKn (n, x) {
      let bkm = _besselK0(x)
      let bk = _besselK1(x)
      for (let j = 1; j < n; j++) {
        const bkp = bkm + (2 * j / x) * bk
        bkm = bk
        bk = bkp
      }
      return bk
    }
  }
)
