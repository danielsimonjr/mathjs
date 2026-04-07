import { factory } from '../../utils/factory.js'

const name = 'area'
const dependencies = ['typed']

export const createArea = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Calculates the area of a polygon given its vertices using the shoelace formula
   * (also known as Gauss's area formula). The vertices should be provided in order
   * (either clockwise or counterclockwise). Returns the unsigned (absolute) area.
   *
   * Syntax:
   *
   *    math.area(vertices)
   *
   * Examples:
   *
   *    math.area([[0,0], [4,0], [4,3], [0,3]])     // Returns 12 (rectangle)
   *    math.area([[0,0], [3,0], [0,4]])             // Returns 6 (triangle)
   *    math.area([[0,0], [1,0], [1,1], [0,1]])      // Returns 1 (unit square)
   *
   * @param {Array} vertices    Array of 2D points [[x0,y0],[x1,y1],...]
   * @return {number}           The area of the polygon
   */
  return typed(name, {
    Array: function (vertices) {
      if (!Array.isArray(vertices) || vertices.length < 3) {
        throw new TypeError('Argument must be an array of at least 3 vertices')
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
      let sum = 0
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        sum += vertices[i][0] * vertices[j][1]
        sum -= vertices[j][0] * vertices[i][1]
      }
      return Math.abs(sum) / 2
    }
  })
})
