import { factory } from '../../utils/factory.js'

const name = 'interpolate'
const dependencies = ['typed']

export const createInterpolate = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Interpolate a value at a given point x using a set of data points.
     *
     * Methods:
     * - 'linear' (default): piecewise linear interpolation
     * - 'lagrange': polynomial interpolation through all points
     * - 'cubic': natural cubic spline interpolation
     *
     * Syntax:
     *
     *    math.interpolate(points, x)
     *    math.interpolate(points, x, method)
     *
     * Examples:
     *
     *    math.interpolate([[0,0],[1,1],[2,4]], 0.5)             // 0.5
     *    math.interpolate([[0,0],[1,1],[2,4]], 1.5, 'lagrange') // 2.25
     *    math.interpolate([[0,0],[1,1],[2,4]], 1.5, 'cubic')    // ~2.25
     *
     * See also:
     *
     *    nintegrate, curvefit
     *
     * @param {Array} points  Array of [x, y] pairs, sorted by x
     * @param {number} x      The x value to interpolate at
     * @param {string} [method]  Interpolation method: 'linear', 'lagrange', 'cubic'
     * @return {number}       The interpolated y value
     */
    return typed(name, {
      'Array, number': function (points, x) {
        return _linear(points, x)
      },
      'Array, number, string': function (points, x, method) {
        switch (method) {
          case 'linear': return _linear(points, x)
          case 'lagrange': return _lagrange(points, x)
          case 'cubic': return _cubicSpline(points, x)
          default: throw new Error('interpolate: unknown method "' + method + '". Use "linear", "lagrange", or "cubic"')
        }
      }
    })

    function _linear (points, x) {
      const xs = points.map(p => p[0])
      const ys = points.map(p => p[1])
      const n = xs.length

      if (x < xs[0] || x > xs[n - 1]) {
        throw new Error('interpolate: x value ' + x + ' is outside the range [' + xs[0] + ', ' + xs[n - 1] + ']')
      }

      // Find the surrounding interval
      for (let i = 0; i < n - 1; i++) {
        if (x >= xs[i] && x <= xs[i + 1]) {
          const t = (x - xs[i]) / (xs[i + 1] - xs[i])
          return ys[i] + t * (ys[i + 1] - ys[i])
        }
      }
      return ys[n - 1]
    }

    function _lagrange (points, x) {
      const n = points.length
      let result = 0

      for (let i = 0; i < n; i++) {
        let term = points[i][1]
        for (let j = 0; j < n; j++) {
          if (j !== i) {
            term *= (x - points[j][0]) / (points[i][0] - points[j][0])
          }
        }
        result += term
      }

      return result
    }

    function _cubicSpline (points, x) {
      const n = points.length
      const xs = points.map(p => p[0])
      const ys = points.map(p => p[1])

      if (x < xs[0] || x > xs[n - 1]) {
        throw new Error('interpolate: x value ' + x + ' is outside the range [' + xs[0] + ', ' + xs[n - 1] + ']')
      }

      // Compute natural cubic spline coefficients
      const h = new Array(n - 1)
      for (let i = 0; i < n - 1; i++) {
        h[i] = xs[i + 1] - xs[i]
      }

      // Set up tridiagonal system for second derivatives
      const alpha = new Array(n).fill(0)
      for (let i = 1; i < n - 1; i++) {
        alpha[i] = (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1])
      }

      const l = new Array(n).fill(0)
      const mu = new Array(n).fill(0)
      const z = new Array(n).fill(0)
      l[0] = 1

      for (let i = 1; i < n - 1; i++) {
        l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1]
        mu[i] = h[i] / l[i]
        z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i]
      }

      l[n - 1] = 1
      const c = new Array(n).fill(0)
      const b = new Array(n).fill(0)
      const d = new Array(n).fill(0)

      for (let j = n - 2; j >= 0; j--) {
        c[j] = z[j] - mu[j] * c[j + 1]
        b[j] = (ys[j + 1] - ys[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3
        d[j] = (c[j + 1] - c[j]) / (3 * h[j])
      }

      // Find the interval and evaluate
      let idx = 0
      for (let i = 0; i < n - 1; i++) {
        if (x >= xs[i] && x <= xs[i + 1]) {
          idx = i
          break
        }
      }

      const dx = x - xs[idx]
      return ys[idx] + b[idx] * dx + c[idx] * dx * dx + d[idx] * dx * dx * dx
    }
  }
)
