import { factory } from '../../utils/factory.js'

const name = 'chebyshevDistance'
const dependencies = ['typed']

export const createChebyshevDistance = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Calculates the Chebyshev distance (L-infinity distance / chessboard distance)
   * between two points in N-dimensional space. The Chebyshev distance is the
   * maximum of the absolute differences of their coordinates.
   *
   * Syntax:
   *
   *    math.chebyshevDistance(a, b)
   *
   * Examples:
   *
   *    math.chebyshevDistance([0, 0], [3, 4])   // Returns 4
   *    math.chebyshevDistance([1, 2, 3], [4, 6, 5])  // Returns 4
   *
   * @param {Array} a    First point as an array of coordinates
   * @param {Array} b    Second point as an array of coordinates
   * @return {number}    The Chebyshev distance between points a and b
   */
  return typed(name, {
    'Array, Array': function (a, b) {
      if (a.length !== b.length) {
        throw new TypeError('Vectors must have equal length')
      }
      if (a.length === 0) {
        throw new TypeError('Vectors must not be empty')
      }
      let maxDiff = 0
      for (let i = 0; i < a.length; i++) {
        const diff = Math.abs(a[i] - b[i])
        if (diff > maxDiff) {
          maxDiff = diff
        }
      }
      return maxDiff
    }
  })
})
