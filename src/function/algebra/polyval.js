import { factory } from '../../utils/factory.js'

const name = 'polyval'
const dependencies = ['typed']

export const createPolyval = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Evaluate a polynomial at a given value using Horner's method.
   *
   * Coefficients are stored in ascending order of degree:
   * coeffs = [c0, c1, c2, ...] represents p(x) = c0 + c1*x + c2*x^2 + ...
   *
   * Syntax:
   *
   *   math.polyval(coeffs, x)
   *
   * Examples:
   *
   *    math.polyval([1, 2, 3], 2)   // returns 17  (1 + 2*2 + 3*4)
   *    math.polyval([1, 0, -1], 3)  // returns 8   (1 + 0*3 + (-1)*9 = -8... wait: 1 - 9 = -8)
   *    math.polyval([5], 100)        // returns 5   (constant polynomial)
   *    math.polyval([], 10)          // returns 0   (zero polynomial)
   *
   * See also:
   *
   *    polyder, polymul, polyadd, polyfit
   *
   * @param {number[]} coeffs  Coefficient array [c0, c1, ..., cn] (ascending degree)
   * @param {number}   x       Value at which to evaluate the polynomial
   * @return {number}          p(x)
   */
  return typed(name, {
    'Array, number': function (coeffs, x) {
      if (coeffs.length === 0) return 0
      // Horner's method: process from highest degree down
      let result = coeffs[coeffs.length - 1]
      for (let i = coeffs.length - 2; i >= 0; i--) {
        result = result * x + coeffs[i]
      }
      return result
    }
  })
})
