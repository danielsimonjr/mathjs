/* eslint-disable no-loss-of-precision */

import { factory } from '../../utils/factory.js'

const name = 'erfi'
const dependencies = ['typed']

export const createErfi = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute the imaginary error function erfi(x).
     *
     * erfi(x) = -i * erf(ix) = (2 / sqrt(pi)) * integral from 0 to x of exp(t^2) dt
     *
     * Note: erfi(x) is unbounded as x -> infinity (unlike erf which is bounded by 1).
     *
     * Syntax:
     *
     *    math.erfi(x)
     *
     * Examples:
     *
     *    math.erfi(0)    // returns 0
     *    math.erfi(1)    // returns 1.6504257587975429
     *    math.erfi(-1)   // returns -1.6504257587975429
     *    math.erfi(0.5)  // returns 0.6149520863941107
     *
     * See also:
     *
     *    erf, erfc, fresnelS
     *
     * @param {number} x   A real number
     * @return {number}    The imaginary error function value erfi(x)
     */
    return typed(name, {
      number: function (x) {
        if (x === 0) return 0
        if (!isFinite(x)) return x > 0 ? Infinity : -Infinity

        const ax = Math.abs(x)
        let result

        if (ax <= 2) {
          // Taylor series: erfi(x) = (2/sqrt(pi)) * sum_{n=0}^inf x^(2n+1) / (n! * (2n+1))
          result = _erfiSeries(ax)
        } else {
          // Asymptotic / continued fraction approximation for large x
          result = _erfiAsymptotic(ax)
        }

        return x < 0 ? -result : result
      }
    })

    // Taylor series expansion of erfi(x) for |x| <= 2
    function _erfiSeries (x) {
      const TWO_OVER_SQRTPI = 1.1283791670955126 // 2/sqrt(pi)
      const x2 = x * x
      let term = x
      let sum = x
      let n = 0
      const MAXIT = 100
      const EPS = 1e-15

      while (n < MAXIT) {
        n++
        term *= x2 / n
        const addend = term / (2 * n + 1)
        sum += addend
        if (Math.abs(addend) < Math.abs(sum) * EPS) break
      }
      return TWO_OVER_SQRTPI * sum
    }

    // Asymptotic approximation for large x via Dawson's function relationship
    // For x > 2, use the relation with the Dawson function or direct asymptotic:
    // erfi(x) ~ (e^(x^2) / (x * sqrt(pi))) * (1 + sum of corrections)
    function _erfiAsymptotic (x) {
      const x2 = x * x
      const SQRTPI = 1.7724538509055159
      // Asymptotic series: erfi(x) ~ exp(x^2)/(x*sqrt(pi)) * (1 + 1/(2x^2) + 3/(4x^4) + ...)
      // This is divergent but useful for large x; use only first few terms
      const xi2 = 1 / x2
      let series = 1
      let term = 1
      let prevSum = 0
      for (let k = 1; k <= 20; k++) {
        term *= (2 * k - 1) * xi2 / 2
        const newSum = series + term
        if (Math.abs(term) > Math.abs(series)) {
          // Asymptotic series starts diverging — stop
          series = (series + prevSum) / 2
          break
        }
        prevSum = series
        series = newSum
      }
      return Math.exp(x2) * series / (x * SQRTPI)
    }
  }
)
