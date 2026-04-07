import { factory } from '../../utils/factory.js'

const name = 'polymul'
const dependencies = ['typed']

export const createPolymul = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Multiply two polynomials by convolving their coefficient arrays.
   *
   * Coefficients are stored in ascending order of degree:
   * a = [a0, a1, ...], b = [b0, b1, ...] where p(x) = a0 + a1*x + ...
   *
   * Syntax:
   *
   *   math.polymul(a, b)
   *
   * Examples:
   *
   *    math.polymul([1, 1], [1, 1])      // returns [1, 2, 1]  ((1+x)^2 = 1+2x+x^2)
   *    math.polymul([1, 2], [3, 4])      // returns [3, 10, 8] (1+2x)(3+4x)=3+10x+8x^2
   *    math.polymul([1], [1, 2, 3])      // returns [1, 2, 3]  (multiply by constant 1)
   *    math.polymul([], [1, 2])          // returns []          (zero times anything)
   *
   * See also:
   *
   *    polyval, polyder, polyadd
   *
   * @param {number[]} a  First polynomial coefficients [a0, a1, ..., am] (ascending degree)
   * @param {number[]} b  Second polynomial coefficients [b0, b1, ..., bn] (ascending degree)
   * @return {number[]}   Product polynomial coefficients (degree m+n)
   */
  return typed(name, {
    'Array, Array': function (a, b) {
      if (a.length === 0 || b.length === 0) return []
      const result = new Array(a.length + b.length - 1).fill(0)
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          result[i + j] += a[i] * b[j]
        }
      }
      return result
    }
  })
})
