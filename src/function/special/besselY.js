/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'besselY'
const dependencies = ['typed']

export const createBesselY = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the Bessel function of the second kind Y_n(x).
     *
     * Syntax:
     *
     *    math.besselY(n, x)
     *
     * Examples:
     *
     *    math.besselY(0, 1)    // returns 0.08825696421567696
     *    math.besselY(1, 2.5)  // returns 0.14591813796678973
     *    math.besselY(0, 0)    // returns -Infinity
     *
     * See also:
     *
     *    besselJ, besselI, besselK, gamma
     *
     * @param {number} n   The order (non-negative integer)
     * @param {number} x   The argument (must be > 0)
     * @return {number}    The Bessel function value Y_n(x)
     */
    return typed(name, {
      'number, number': function (n, x) {
        if (!Number.isInteger(n)) {
          throw new TypeError('besselY: order n must be an integer, got ' + n)
        }
        if (x < 0) {
          return NaN
        }
        if (x === 0) return -Infinity
        const nAbs = Math.abs(n)
        const sign = (n < 0 && n % 2 !== 0) ? -1 : 1
        if (nAbs === 0) return _besselY0(x)
        if (nAbs === 1) return sign * _besselY1(x)
        return sign * _besselYn(nAbs, x)
      }
    })

    // Rational approximation for Y0(x) — Abramowitz & Stegun 9.4
    function _besselY0 (x) {
      if (x < 8) {
        const y = x * x
        const r1 = -2957821389.0 + y * (7062834065.0 + y * (-512359803.6 +
          y * (10879881.29 + y * (-86327.92757 + y * 228.4622733))))
        const r2 = 40076544269.0 + y * (745249964.8 + y * (7189466.438 +
          y * (47447.26470 + y * (226.1030244 + y * 1.0))))
        return r1 / r2 + 0.636619772 * _besselJ0(x) * Math.log(x)
      }
      const z = 8.0 / x
      const y = z * z
      const xx = x - 0.785398164
      const p0 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 +
        y * (-0.2073370639e-5 + y * 0.2093887211e-6)))
      const q0 = -0.1562499995e-1 + y * (0.1430488765e-3 +
        y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934935152e-7)))
      return Math.sqrt(0.636619772 / x) * (p0 * Math.sin(xx) + z * q0 * Math.cos(xx))
    }

    // Rational approximation for Y1(x)
    function _besselY1 (x) {
      if (x < 8) {
        const y = x * x
        const r1 = x * (-0.4900604943e13 + y * (0.1275274390e13 + y * (-0.5153438139e11 +
          y * (0.7349264551e9 + y * (-0.4237922726e7 + y * 0.8511937935e4)))))
        const r2 = 0.2499580570e14 + y * (0.4244419664e12 + y * (0.3733650367e10 +
          y * (0.2245904002e8 + y * (0.1020426050e6 + y * (0.3549632885e3 + y)))))
        return r1 / r2 + 0.636619772 * (_besselJ1(x) * Math.log(x) - 1.0 / x)
      }
      const z = 8.0 / x
      const y = z * z
      const xx = x - 2.356194491
      const p1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 +
        y * (0.2457520174e-5 + y * (-0.240337019e-6))))
      const q1 = 0.04687499995 + y * (-0.2002690873e-3 +
        y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)))
      return Math.sqrt(0.636619772 / x) * (p1 * Math.sin(xx) + z * q1 * Math.cos(xx))
    }

    // J0 helper needed inside Y0 for log term
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

    // J1 helper needed inside Y1 for log term
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

    // Forward recurrence for Y_n(x), n >= 2
    function _besselYn (n, x) {
      let bym = _besselY0(x)
      let by = _besselY1(x)
      for (let j = 1; j < n; j++) {
        const byp = (2 * j / x) * by - bym
        bym = by
        by = byp
      }
      return by
    }
  }
)
