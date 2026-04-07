import { factory } from '../../utils/factory.js'

const name = 'manhattanDistance'
const dependencies = ['typed']

export const createManhattanDistance = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Calculates the Manhattan distance (L1 distance / taxicab distance) between
   * two points in N-dimensional space. The Manhattan distance is the sum of the
   * absolute differences of their coordinates.
   *
   * Syntax:
   *
   *    math.manhattanDistance(a, b)
   *
   * Examples:
   *
   *    math.manhattanDistance([0, 0], [3, 4])   // Returns 7
   *    math.manhattanDistance([1, 2, 3], [4, 6, 8])  // Returns 12
   *
   * @param {Array} a    First point as an array of coordinates
   * @param {Array} b    Second point as an array of coordinates
   * @return {number}    The Manhattan distance between points a and b
   */
  return typed(name, {
    'Array, Array': function (a, b) {
      if (a.length !== b.length) {
        throw new TypeError('Vectors must have equal length')
      }
      if (a.length === 0) {
        throw new TypeError('Vectors must not be empty')
      }
      let sum = 0
      for (let i = 0; i < a.length; i++) {
        sum += Math.abs(a[i] - b[i])
      }
      return sum
    }
  })
})
