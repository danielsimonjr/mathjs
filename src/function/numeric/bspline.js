import { factory } from '../../utils/factory.js'

const name = 'bspline'
const dependencies = ['typed']

export const createBspline = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Evaluate a B-spline curve at parameter t using De Boor's algorithm.
     *
     * A B-spline is defined by a knot vector, a set of control points, and a
     * polynomial degree. De Boor's algorithm evaluates the curve in O(degree^2)
     * time without computing basis functions explicitly.
     *
     * Syntax:
     *
     *    math.bspline(knots, controlPoints, degree, t)
     *
     * Examples:
     *
     *    math.bspline([0,0,0,1,1,1], [[0,0],[1,1],[2,0]], 2, 0.5)
     *    math.bspline([0,0,1,2,3,3], [[0],[1],[2],[3]], 1, 1.5)
     *
     * See also:
     *
     *    interpolate, cspline, bezierCurve
     *
     * @param {Array}  knots          Knot vector (non-decreasing, length = n+degree+2)
     * @param {Array}  controlPoints  Control points (n+1 points, each a number or array)
     * @param {number} degree         Polynomial degree (positive integer)
     * @param {number} t              Parameter value
     * @return {number|Array}  Point on the B-spline curve
     */
    return typed(name, {
      'Array, Array, number, number': function (knots, controlPoints, degree, t) {
        return _deBoor(knots, controlPoints, degree, t)
      }
    })

    function _deBoor (knots, controlPoints, degree, t) {
      const n = controlPoints.length - 1
      const m = knots.length - 1

      if (m !== n + degree + 1) {
        throw new Error(
          'bspline: knot vector length must equal controlPoints.length + degree + 1, got ' +
          knots.length + ' knots, ' + controlPoints.length + ' control points, degree ' + degree
        )
      }
      if (degree < 1) {
        throw new Error('bspline: degree must be a positive integer')
      }

      // Clamp t to valid domain [knots[degree], knots[n+1]]
      const tMin = knots[degree]
      const tMax = knots[n + 1]
      if (t < tMin - 1e-14 || t > tMax + 1e-14) {
        throw new Error(
          'bspline: t=' + t + ' is outside the valid domain [' + tMin + ', ' + tMax + ']'
        )
      }
      // Clamp to avoid rounding issues at endpoints
      t = Math.max(tMin, Math.min(tMax, t))

      // Special case: t at the right end — use last active knot span
      let k = degree
      if (t === tMax) {
        // Find rightmost knot span
        for (let i = m - 1; i >= degree; i--) {
          if (knots[i] < tMax) {
            k = i
            break
          }
        }
      } else {
        // Find knot span: largest k such that knots[k] <= t < knots[k+1]
        for (let i = degree; i <= n; i++) {
          if (t >= knots[i] && t < knots[i + 1]) {
            k = i
            break
          }
        }
      }

      // Determine if control points are scalar or vector
      const isVector = Array.isArray(controlPoints[0])

      // Initialize De Boor points using ABSOLUTE indices [k-degree .. k]
      // d is an object keyed by absolute control point index
      const d = {}
      for (let j = k - degree; j <= k; j++) {
        if (isVector) {
          d[j] = controlPoints[j].slice()
        } else {
          d[j] = [controlPoints[j]]
        }
      }

      // De Boor recursion using absolute indices
      // For round r, j goes from k down to k-degree+r
      for (let r = 1; r <= degree; r++) {
        for (let j = k; j >= k - degree + r; j--) {
          const denom = knots[j + degree - r + 1] - knots[j]
          const alpha = denom === 0 ? 0 : (t - knots[j]) / denom
          const dim = d[j].length
          for (let c = 0; c < dim; c++) {
            d[j][c] = (1 - alpha) * d[j - 1][c] + alpha * d[j][c]
          }
        }
      }

      if (isVector) {
        return d[k]
      } else {
        return d[k][0]
      }
    }
  }
)
