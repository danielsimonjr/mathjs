import { factory } from '../../utils/factory.js'

const name = 'centroid'
const dependencies = ['typed']

export const createCentroid = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Computes the centroid (geometric center) of a polygon or point cloud.
   *
   * For a polygon (3 or more vertices forming a closed shape), uses the
   * signed-area weighted formula so that the result is the true area-weighted
   * centroid, not just the average of vertices.
   *
   * For a point cloud (any array of points), returns the arithmetic mean of
   * all coordinates (unweighted average).
   *
   * Syntax:
   *
   *    math.centroid(points)
   *
   * Examples:
   *
   *    math.centroid([[0,0],[4,0],[4,3],[0,3]])
   *    // Returns [2, 1.5]
   *
   *    math.centroid([[0,0],[6,0],[3,3]])
   *    // Returns [3, 1]
   *
   * @param {Array} points    Array of 2D points [[x0,y0],[x1,y1],...]
   * @return {Array}          Centroid as [cx, cy]
   */
  return typed(name, {
    Array: function (points) {
      if (!Array.isArray(points) || points.length === 0) {
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

      const n = points.length

      if (n < 3) {
        // For 1 or 2 points: arithmetic mean
        let sx = 0
        let sy = 0
        for (let i = 0; i < n; i++) {
          sx += points[i][0]
          sy += points[i][1]
        }
        return [sx / n, sy / n]
      }

      // Signed area via shoelace formula
      let area = 0
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]
      }
      area /= 2

      if (Math.abs(area) < 1e-14) {
        // Degenerate polygon (collinear points): fall back to arithmetic mean
        let sx = 0
        let sy = 0
        for (let i = 0; i < n; i++) {
          sx += points[i][0]
          sy += points[i][1]
        }
        return [sx / n, sy / n]
      }

      // Signed-area weighted centroid formula
      let cx = 0
      let cy = 0
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        const cross = points[i][0] * points[j][1] - points[j][0] * points[i][1]
        cx += (points[i][0] + points[j][0]) * cross
        cy += (points[i][1] + points[j][1]) * cross
      }
      const factor = 1 / (6 * area)
      return [cx * factor, cy * factor]
    }
  })
})
