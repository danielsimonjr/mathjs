import { factory } from '../../utils/factory.js'

const name = 'polygonPerimeter'
const dependencies = ['typed']

export const createPolygonPerimeter = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Calculates the perimeter of a polygon by summing the Euclidean distances
   * between consecutive vertices (including the closing edge from the last
   * vertex back to the first).
   *
   * Syntax:
   *
   *    math.polygonPerimeter(vertices)
   *
   * Examples:
   *
   *    math.polygonPerimeter([[0,0],[3,0],[3,4],[0,4]])
   *    // Returns 14 (3 + 4 + 3 + 4)
   *
   *    math.polygonPerimeter([[0,0],[1,0],[0.5, 0.866]])
   *    // Returns approximately 3 (equilateral triangle with side 1)
   *
   * @param {Array} vertices    Array of 2D points [[x0,y0],[x1,y1],...]
   * @return {number}           The perimeter of the polygon
   */
  return typed(name, {
    Array: function (vertices) {
      if (!Array.isArray(vertices) || vertices.length < 2) {
        throw new TypeError('Argument must be an array of at least 2 vertices')
      }
      for (let i = 0; i < vertices.length; i++) {
        if (!Array.isArray(vertices[i]) || vertices[i].length !== 2) {
          throw new TypeError('Each vertex must be a 2D point [x, y]')
        }
        if (typeof vertices[i][0] !== 'number' || typeof vertices[i][1] !== 'number') {
          throw new TypeError('Vertex coordinates must be numbers')
        }
      }

      const n = vertices.length
      let perimeter = 0
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        const dx = vertices[j][0] - vertices[i][0]
        const dy = vertices[j][1] - vertices[i][1]
        perimeter += Math.sqrt(dx * dx + dy * dy)
      }
      return perimeter
    }
  })
})
