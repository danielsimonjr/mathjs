import { factory } from '../../utils/factory.js'

const name = 'polyder'
const dependencies = ['typed']

export const createPolyder = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the derivative of a polynomial given its coefficients.
   *
   * Coefficients are stored in ascending order of degree:
   * coeffs = [c0, c1, c2, ...] represents p(x) = c0 + c1*x + c2*x^2 + ...
   * The derivative is p'(x) = c1 + 2*c2*x + 3*c3*x^2 + ...
   *
   * Syntax:
   *
   *   math.polyder(coeffs)
   *
   * Examples:
   *
   *    math.polyder([1, 2, 3])    // returns [2, 6]  (d/dx of 1+2x+3x^2 = 2+6x)
   *    math.polyder([5])          // returns []       (constant -> zero polynomial)
   *    math.polyder([0, 0, 1])    // returns [0, 2]  (d/dx of x^2 = 2x)
   *
   * See also:
   *
   *    polyval, polymul, polyadd
   *
   * @param {number[]} coeffs  Coefficient array [c0, c1, ..., cn] (ascending degree)
   * @return {number[]}        Derivative coefficients [c1, 2*c2, ..., n*cn]
   */
  return typed(name, {
    Array: function (coeffs) {
      if (coeffs.length <= 1) return []
      const result = new Array(coeffs.length - 1)
      for (let i = 1; i < coeffs.length; i++) {
        result[i - 1] = i * coeffs[i]
      }
      return result
    }
  })
})
