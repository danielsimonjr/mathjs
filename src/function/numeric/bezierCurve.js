import { factory } from '../../utils/factory.js'

const name = 'bezierCurve'
const dependencies = ['typed']

export const createBezierCurve = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Evaluate a Bezier curve at parameter t using De Casteljau's algorithm.
     *
     * Works for any degree (linear, quadratic, cubic, …) and for 2D or 3D
     * control points.
     *
     * Syntax:
     *
     *    math.bezierCurve(controlPoints, t)
     *
     * Examples:
     *
     *    math.bezierCurve([[0,0],[1,1],[2,0]], 0.5)       // [1, 0.5]
     *    math.bezierCurve([[0,0],[0,1],[1,1],[1,0]], 0.5) // [0.5, 0.75]
     *
     * See also:
     *
     *    interpolate, cspline
     *
     * @param {Array}  controlPoints  Array of [x,y] or [x,y,z] control points
     * @param {number|Array} t        Parameter value(s) in [0, 1]
     * @return {Array}                Point on the curve at parameter t,
     *                                or array of points if t is an array
     */
    return typed(name, {
      'Array, number': function (controlPoints, t) {
        return _deCasteljau(controlPoints, t)
      },
      'Array, Array': function (controlPoints, tValues) {
        return tValues.map(t => _deCasteljau(controlPoints, t))
      }
    })

    function _deCasteljau (points, t) {
      if (t < 0 || t > 1) {
        throw new Error('bezierCurve: t must be in [0, 1], got ' + t)
      }
      if (points.length === 0) {
        throw new Error('bezierCurve: controlPoints must not be empty')
      }

      // Work on a mutable copy
      let pts = points.map(p => p.slice())

      const n = pts.length
      for (let r = 1; r < n; r++) {
        for (let i = 0; i < n - r; i++) {
          const dim = pts[i].length
          const next = []
          for (let d = 0; d < dim; d++) {
            next.push((1 - t) * pts[i][d] + t * pts[i + 1][d])
          }
          pts[i] = next
        }
      }
      return pts[0]
    }
  }
)
