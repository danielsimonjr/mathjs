import { factory } from '../../utils/factory.js'

const name = 'minkowskiDistance'
const dependencies = ['typed']

export const createMinkowskiDistance = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Calculates the Minkowski distance (Lp distance) between two points in
   * N-dimensional space. The Minkowski distance generalizes the Euclidean
   * distance (p=2), Manhattan distance (p=1), and Chebyshev distance (p=Infinity).
   *
   * Syntax:
   *
   *    math.minkowskiDistance(a, b, p)
   *
   * Examples:
   *
   *    math.minkowskiDistance([0, 0], [3, 4], 2)         // Returns 5 (Euclidean)
   *    math.minkowskiDistance([0, 0], [3, 4], 1)         // Returns 7 (Manhattan)
   *    math.minkowskiDistance([0, 0], [3, 4], Infinity)  // Returns 4 (Chebyshev)
   *
   * @param {Array}  a    First point as an array of coordinates
   * @param {Array}  b    Second point as an array of coordinates
   * @param {number} p    The order of the Minkowski distance (p >= 1)
   * @return {number}     The Minkowski distance between points a and b
   */
  return typed(name, {
    'Array, Array, number': function (a, b, p) {
      if (a.length !== b.length) {
        throw new TypeError('Vectors must have equal length')
      }
      if (a.length === 0) {
        throw new TypeError('Vectors must not be empty')
      }
      if (p < 1) {
        throw new TypeError('Order p must be >= 1')
      }
      if (!isFinite(p)) {
        // Chebyshev distance for p = Infinity
        let maxDiff = 0
        for (let i = 0; i < a.length; i++) {
          const diff = Math.abs(a[i] - b[i])
          if (diff > maxDiff) {
            maxDiff = diff
          }
        }
        return maxDiff
      }
      let sum = 0
      for (let i = 0; i < a.length; i++) {
        sum += Math.pow(Math.abs(a[i] - b[i]), p)
      }
      return Math.pow(sum, 1 / p)
    }
  })
})
