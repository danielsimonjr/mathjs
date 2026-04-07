/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'besselJ'
const dependencies = ['typed']

export const createBesselJ = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the Bessel function of the first kind J_n(x).
     *
     * Syntax:
     *
     *    math.besselJ(n, x)
     *
     * Examples:
     *
     *    math.besselJ(0, 1)    // returns 0.7651976865579666
     *    math.besselJ(1, 2.5)  // returns 0.4970941017470477
     *    math.besselJ(0, 0)    // returns 1
     *
     * See also:
     *
     *    besselY, besselI, besselK, gamma, erf
     *
     * @param {number} n   The order (non-negative integer)
     * @param {number} x   The argument
     * @return {number}    The Bessel function value J_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n)) {
          throw new TypeError('besselJ: order n must be an integer, got ' + n)
        }
        const nAbs = Math.abs(n)
        const sign = (n < 0 && n % 2 !== 0) ? -1 : 1
        if (x === 0) return nAbs === 0 ? 1 : 0
        if (nAbs === 0) return _besselJ0(x)
        if (nAbs === 1) return sign * _besselJ1(x)
        return sign * _besselJn(nAbs, x)
      }
    })

    // Rational approximation for J0(x) — Abramowitz & Stegun 9.4
    function _besselJ0 (x) {
      x = Math.abs(x)
      if (x < 8) {
        const y = x * x
        const r1 = 57568490574.0 + y * (-13362590354.0 + y * (651619640.7 +
          y * (-11214424.18 + y * (77392.33017 + y * (-184.9052456)))))
        const r2 = 57568490411.0 + y * (1029532985.0 + y * (9494680.718 +
          y * (59272.64853 + y * (267.8532712 + y * 1.0))))
        return r1 / r2
      }
      const z = 8.0 / x
      const y = z * z
      const xx = x - 0.785398164
      const p0 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 +
        y * (-0.2073370639e-5 + y * 0.2093887211e-6)))
      const q0 = -0.1562499995e-1 + y * (0.1430488765e-3 +
        y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)))
      return Math.sqrt(0.636619772 / x) * (p0 * Math.cos(xx) - z * q0 * Math.sin(xx))
    }

    // Rational approximation for J1(x)
    function _besselJ1 (x) {
      const xSign = x < 0 ? -1 : 1
      x = Math.abs(x)
      if (x < 8) {
        const y = x * x
        const r1 = x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1 +
          y * (-2972611.439 + y * (15704.48260 + y * (-30.16036606))))))
        const r2 = 144725228442.0 + y * (2300535178.0 + y * (18583304.74 +
          y * (99447.43394 + y * (376.9991397 + y * 1.0))))
        return xSign * r1 / r2
      }
      const z = 8.0 / x
      const y = z * z
      const xx = x - 2.356194491
      const p1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 +
        y * (0.2457520174e-5 + y * (-0.240337019e-6))))
      const q1 = 0.04687499995 + y * (-0.2002690873e-3 +
        y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)))
      return xSign * Math.sqrt(0.636619772 / x) * (p1 * Math.cos(xx) - z * q1 * Math.sin(xx))
    }

    // Miller's backward recurrence for J_n(x), n >= 2
    function _besselJn (n, x) {
      const ACC = 160
      const BIGNO = 1e10
      const BIGNI = 1e-10

      const ax = Math.abs(x)
      if (ax === 0) return 0

      if (ax > n) {
        // Forward recurrence (stable when x > n)
        let bjm = _besselJ0(ax)
        let bj = _besselJ1(ax)
        for (let j = 1; j < n; j++) {
          const bjp = (2 * j / ax) * bj - bjm
          bjm = bj
          bj = bjp
        }
        return (x < 0 && n % 2 !== 0) ? -bj : bj
      }

      // Backward recurrence (Miller's algorithm, stable when x < n)
      const m = 2 * Math.floor((n + Math.floor(Math.sqrt(ACC * n))) / 2)
      let jsum = false
      let bjp = 0
      let bj = 1
      let sum = 0
      let ans = 0

      for (let j = m; j > 0; j--) {
        const bjm = (2 * j / ax) * bj - bjp
        bjp = bj
        bj = bjm
        if (Math.abs(bj) > BIGNO) {
          bj *= BIGNI
          bjp *= BIGNI
          ans *= BIGNI
          sum *= BIGNI
        }
        if (jsum) sum += bj
        jsum = !jsum
        if (j === n) ans = bjp
      }

      sum = 2 * sum - bj
      ans /= sum
      return (x < 0 && n % 2 !== 0) ? -ans : ans
    }
  }
)
