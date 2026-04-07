import { factory } from '../../utils/factory.js'

const name = 'convexHull'
const dependencies = ['typed']

export const createConvexHull = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Computes the convex hull of a set of 2D points using Andrew's monotone chain
   * algorithm. Returns the points forming the convex hull in counterclockwise order.
   *
   * Syntax:
   *
   *    math.convexHull(points)
   *
   * Examples:
   *
   *    math.convexHull([[0,0],[1,1],[2,0],[1,2],[1,0.5]])
   *    // Returns [[0,0],[2,0],[1,2]]
   *
   *    math.convexHull([[0,0],[1,0],[1,1],[0,1]])
   *    // Returns [[0,0],[1,0],[1,1],[0,1]]
   *
   * @param {Array} points    Array of 2D points [[x0,y0],[x1,y1],...]
   * @return {Array}          Array of 2D points forming the convex hull in CCW order
   */
  return typed(name, {
    Array: function (points) {
      if (!Array.isArray(points) || points.length < 1) {
        throw new TypeError('Argument must be a non-empty array of points')
      }
      for (let i = 0; i < points.length; i++) {
        if (!Array.isArray(points[i]) || points[i].length !== 2) {
          throw new TypeError('Each point must be a 2D coordinate [x, y]')
        }
        if (typeof points[i][0] !== 'number' || typeof points[i][1] !== 'number') {
          throw new TypeError('Point coordinates must be numbers')
        }
      }

      if (points.length === 1) {
        return [points[0].slice()]
      }
      if (points.length === 2) {
        return [points[0].slice(), points[1].slice()]
      }

      // Sort points lexicographically by (x, y)
      const sorted = points.slice().sort(function (a, b) {
        return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]
      })

      // Cross product of vectors OA and OB
      const cross = function (O, A, B) {
        return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0])
      }

      // Build lower hull
      const lower = []
      for (let i = 0; i < sorted.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0) {
          lower.pop()
        }
        lower.push(sorted[i].slice())
      }

      // Build upper hull
      const upper = []
      for (let i = sorted.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <= 0) {
          upper.pop()
        }
        upper.push(sorted[i].slice())
      }

      // Remove last point of each half because it's repeated at the start of the other half
      lower.pop()
      upper.pop()

      return lower.concat(upper)
    }
  })
})
