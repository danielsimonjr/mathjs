/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'besselI'
const dependencies = ['typed']

export const createBesselI = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the modified Bessel function of the first kind I_n(x).
     *
     * Syntax:
     *
     *    math.besselI(n, x)
     *
     * Examples:
     *
     *    math.besselI(0, 0)    // returns 1
     *    math.besselI(0, 1)    // returns 1.2660658777520082
     *    math.besselI(1, 2)    // returns 1.5906368546373291
     *
     * See also:
     *
     *    besselJ, besselY, besselK, gamma
     *
     * @param {number} n   The order (non-negative integer)
     * @param {number} x   The argument
     * @return {number}    The modified Bessel function value I_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n)) {
          throw new TypeError('besselI: order n must be an integer, got ' + n)
        }
        const nAbs = Math.abs(n)
        // I_n(-x) = (-1)^n * I_n(x) for integer n, but I_{-n}(x) = I_n(x)
        // For I: I_{-n}(x) = I_n(x)
        if (x === 0) return nAbs === 0 ? 1 : 0
        if (nAbs === 0) return _besselI0(x)
        if (nAbs === 1) return _besselI1(x)
        return _besselIn(nAbs, x)
      }
    })

    // Polynomial approximation for I0(x) — Abramowitz & Stegun 9.8
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

    // Polynomial approximation for I1(x) — Abramowitz & Stegun 9.8
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

    // Backward recurrence for I_n(x), n >= 2
    function _besselIn (n, x) {
      const BIGNO = 1e10
      const BIGNI = 1e-10
      if (x === 0) return 0
      const ax = Math.abs(x)
      const tox = 2.0 / ax
      let bip = 0
      let bi = 1
      let ans = 0
      const m = 2 * (n + Math.floor(Math.sqrt(40 * n)))

      for (let j = m; j > 0; j--) {
        const bim = bip + j * tox * bi
        bip = bi
        bi = bim
        if (Math.abs(bi) > BIGNO) {
          bi *= BIGNI
          bip *= BIGNI
          ans *= BIGNI
        }
        if (j === n) ans = bip
      }

      ans *= _besselI0(ax) / bi
      return (x < 0 && n % 2 !== 0) ? -ans : ans
    }
  }
)
