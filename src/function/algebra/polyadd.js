import { factory } from '../../utils/factory.js'

const name = 'polyadd'
const dependencies = ['typed']

export const createPolyadd = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Add two polynomials element-wise, padding the shorter array with zeros.
   *
   * Coefficients are stored in ascending order of degree:
   * a = [a0, a1, ...], b = [b0, b1, ...] where p(x) = a0 + a1*x + ...
   *
   * Syntax:
   *
   *   math.polyadd(a, b)
   *
   * Examples:
   *
   *    math.polyadd([1, 2], [3, 4, 5])    // returns [4, 6, 5]
   *    math.polyadd([1, 2, 3], [4, 5])    // returns [5, 7, 3]
   *    math.polyadd([1], [])              // returns [1]
   *    math.polyadd([], [])               // returns []
   *
   * See also:
   *
   *    polyval, polyder, polymul
   *
   * @param {number[]} a  First polynomial coefficients [a0, a1, ..., am] (ascending degree)
   * @param {number[]} b  Second polynomial coefficients [b0, b1, ..., bn] (ascending degree)
   * @return {number[]}   Sum polynomial coefficients
   */
  return typed(name, {
    'Array, Array': function (a, b) {
      const len = Math.max(a.length, b.length)
      const result = new Array(len)
      for (let i = 0; i < len; i++) {
        const ai = i < a.length ? a[i] : 0
        const bi = i < b.length ? b[i] : 0
        result[i] = ai + bi
      }
      return result
    }
  })
})
