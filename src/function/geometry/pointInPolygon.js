import { factory } from '../../utils/factory.js'

const name = 'pointInPolygon'
const dependencies = ['typed']

export const createPointInPolygon = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Tests whether a 2D point lies inside a polygon using the ray casting
   * algorithm. A horizontal ray is cast from the point to the right, and
   * the number of edge crossings is counted. An odd count means the point
   * is inside.
   *
   * Syntax:
   *
   *    math.pointInPolygon(point, polygon)
   *
   * Examples:
   *
   *    math.pointInPolygon([0.5, 0.5], [[0,0],[1,0],[1,1],[0,1]])
   *    // Returns true
   *
   *    math.pointInPolygon([2, 2], [[0,0],[1,0],[1,1],[0,1]])
   *    // Returns false
   *
   * @param {Array} point     2D point [x, y]
   * @param {Array} polygon   Array of 2D vertices [[x0,y0],[x1,y1],...]
   * @return {boolean}        true if point is inside the polygon
   */
  return typed(name, {
    'Array, Array': function (point, polygon) {
      if (!Array.isArray(point) || point.length !== 2) {
        throw new TypeError('point must be a 2D coordinate [x, y]')
      }
      if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
        throw new TypeError('Point coordinates must be numbers')
      }
      if (!Array.isArray(polygon) || polygon.length < 3) {
        throw new TypeError('polygon must be an array of at least 3 vertices')
      }
      for (let i = 0; i < polygon.length; i++) {
        if (!Array.isArray(polygon[i]) || polygon[i].length !== 2) {
          throw new TypeError('Each polygon vertex must be a 2D coordinate [x, y]')
        }
        if (typeof polygon[i][0] !== 'number' || typeof polygon[i][1] !== 'number') {
          throw new TypeError('Polygon vertex coordinates must be numbers')
        }
      }

      const px = point[0]
      const py = point[1]
      const n = polygon.length
      let inside = false

      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = polygon[i][0]
        const yi = polygon[i][1]
        const xj = polygon[j][0]
        const yj = polygon[j][1]

        // Check if horizontal ray from (px, py) to the right crosses edge (j -> i)
        const intersects = ((yi > py) !== (yj > py)) &&
          (px < (xj - xi) * (py - yi) / (yj - yi) + xi)

        if (intersects) inside = !inside
      }

      return inside
    }
  })
})
