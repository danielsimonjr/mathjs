/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'erfc'
const dependencies = ['typed']

export const createErfc = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the complementary error function erfc(x) = 1 - erf(x).
     *
     * Computed directly for large x to avoid catastrophic cancellation.
     * Uses rational Chebyshev approximations (Cody's algorithm).
     *
     * Syntax:
     *
     *    math.erfc(x)
     *
     * Examples:
     *
     *    math.erfc(0)      // returns 1
     *    math.erfc(1)      // returns 0.15729920705028513
     *    math.erfc(-1)     // returns 1.8427007929497148
     *    math.erfc(Infinity)  // returns 0
     *
     * See also:
     *
     *    erf, erfi, gamma
     *
     * @param {number} x   A real number
     * @return {number}    The complementary error function value erfc(x)
     */
    return typed(name, {
      number: function (x) {
        const ax = Math.abs(x)
        if (ax >= 27) return x >= 0 ? 0 : 2
        if (ax <= 0.5) {
          // Use 1 - erf(x) directly; cancellation is not severe here
          return 1 - _erf1(x)
        }
        if (ax <= 4.0) {
          const result = _erfc2(ax)
          return x >= 0 ? result : 2 - result
        }
        const result = _erfc3(ax)
        return x >= 0 ? result : 2 - result
      }
    })

    // erf for small x (|x| <= 0.5) — rational approximation
    function _erf1 (x) {
      const THRESH = 0.46875
      if (Math.abs(x) > THRESH) {
        // Should not normally reach here in this code path, but guard
        return x >= 0 ? 1 - _erfc2(Math.abs(x)) : -(1 - _erfc2(Math.abs(x)))
      }
      const y = x * x
      let xnum = P1[4] * y
      let xden = y
      for (let i = 0; i < 3; i++) {
        xnum = (xnum + P1[i]) * y
        xden = (xden + Q1[i]) * y
      }
      return x * (xnum + P1[3]) / (xden + Q1[3])
    }

    // erfc for 0.5 < x <= 4 — rational approximation
    function _erfc2 (y) {
      let xnum = P2[8] * y
      let xden = y
      for (let i = 0; i < 7; i++) {
        xnum = (xnum + P2[i]) * y
        xden = (xden + Q2[i]) * y
      }
      const result = (xnum + P2[7]) / (xden + Q2[7])
      const ysq = Math.floor(y * 16) / 16
      const del = (y - ysq) * (y + ysq)
      return Math.exp(-ysq * ysq) * Math.exp(-del) * result
    }

    // erfc for x > 4 — rational approximation
    function _erfc3 (y) {
      let ysq = 1 / (y * y)
      let xnum = P3[5] * ysq
      let xden = ysq
      for (let i = 0; i < 4; i++) {
        xnum = (xnum + P3[i]) * ysq
        xden = (xden + Q3[i]) * ysq
      }
      let result = ysq * (xnum + P3[4]) / (xden + Q3[4])
      result = (SQRPI - result) / y
      ysq = Math.floor(y * 16) / 16
      const del = (y - ysq) * (y + ysq)
      return Math.exp(-ysq * ysq) * Math.exp(-del) * result
    }
  }
)

const SQRPI = 5.6418958354775628695e-1

// Coefficients for erf(x), |x| <= 0.46875
const P1 = [
  3.16112374387056560e0, 1.13864154151050156e2,
  3.77485237685302021e2, 3.20937758913846947e3,
  1.85777706184603153e-1
]
const Q1 = [
  2.36012909523441209e1, 2.44024637934444173e2,
  1.28261652607737228e3, 2.84423683343917062e3
]

// Coefficients for erfc(x), 0.46875 <= x <= 4
const P2 = [
  5.64188496988670089e-1, 8.88314979438837594e0,
  6.61191906371416295e1, 2.98635138197400131e2,
  8.81952221241769090e2, 1.71204761263407058e3,
  2.05107837782607147e3, 1.23033935479799725e3,
  2.15311535474403846e-8
]
const Q2 = [
  1.57449261107098347e1, 1.17693950891312499e2,
  5.37181101862009858e2, 1.62138957456669019e3,
  3.29079923573345963e3, 4.36261909014324716e3,
  3.43936767414372164e3, 1.23033935480374942e3
]

// Coefficients for erfc(x), x > 4
const P3 = [
  3.05326634961232344e-1, 3.60344899949804439e-1,
  1.25781726111229246e-1, 1.60837851487422766e-2,
  6.58749161529837803e-4, 1.63153871373020978e-2
]
const Q3 = [
  2.56852019228982242e0, 1.87295284992346047e0,
  5.27905102951428412e-1, 6.05183413124413191e-2,
  2.33520497626869185e-3
]
