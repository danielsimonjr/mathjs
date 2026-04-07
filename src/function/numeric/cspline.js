import { factory } from '../../utils/factory.js'

const name = 'cspline'
const dependencies = ['typed']

export const createCspline = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute a natural cubic spline through a set of data points and return
     * an evaluator object.
     *
     * Natural boundary conditions: S''(x0) = S''(xn) = 0.
     * Uses the Thomas algorithm to solve the tridiagonal system for second
     * derivatives.
     *
     * Syntax:
     *
     *    math.cspline(x, y)
     *
     * Examples:
     *
     *    const s = math.cspline([0, 1, 2], [0, 1, 0])
     *    s.evaluate(0.5)   // smooth value between 0 and 1
     *    s.evaluate(1.5)   // smooth value between 1 and 0
     *
     * See also:
     *
     *    interpolate, polyfit
     *
     * @param {Array} x  Array of x-coordinates (strictly increasing)
     * @param {Array} y  Array of y-coordinates (same length as x)
     * @return {Object}  Object with `evaluate(t)` method and `coefficients` array
     */
    return typed(name, {
      'Array, Array': function (x, y) {
        return _buildSpline(x, y)
      }
    })

    function _buildSpline (xs, ys) {
      const n = xs.length

      if (n !== ys.length) {
        throw new Error('cspline: x and y must have the same length')
      }
      if (n < 2) {
        throw new Error('cspline: at least 2 points are required')
      }

      // Interval widths
      const h = new Array(n - 1)
      for (let i = 0; i < n - 1; i++) {
        h[i] = xs[i + 1] - xs[i]
        if (h[i] <= 0) throw new Error('cspline: x values must be strictly increasing')
      }

      // Right-hand side of the tridiagonal system
      const rhs = new Array(n).fill(0)
      for (let i = 1; i < n - 1; i++) {
        rhs[i] = 3 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1])
      }

      // Thomas algorithm (natural BCs: m[0] = m[n-1] = 0)
      const diag = new Array(n).fill(2) // main diagonal multiplied by h
      const upper = new Array(n - 1)
      const lower = new Array(n - 1)
      for (let i = 0; i < n - 1; i++) {
        upper[i] = h[i]
        lower[i] = h[i]
      }

      // Build full tridiagonal for interior nodes (natural BCs: m[0]=m[n-1]=0)
      // System size: (n-2) interior nodes
      const size = n - 2
      const m = new Array(n).fill(0)

      if (size > 0) {
        const diagI = new Array(size)
        const rhsI = new Array(size)
        for (let i = 0; i < size; i++) {
          diagI[i] = 2 * (h[i] + h[i + 1])
          rhsI[i] = rhs[i + 1]
        }

        const c = new Array(size - 1)
        for (let i = 0; i < size - 1; i++) c[i] = h[i + 1]

        // Forward sweep
        for (let i = 1; i < size; i++) {
          const factor = h[i] / diagI[i - 1]
          diagI[i] -= factor * c[i - 1]
          rhsI[i] -= factor * rhsI[i - 1]
        }

        // Back substitution
        const sol = new Array(size)
        sol[size - 1] = rhsI[size - 1] / diagI[size - 1]
        for (let i = size - 2; i >= 0; i--) {
          sol[i] = (rhsI[i] - c[i] * sol[i + 1]) / diagI[i]
        }

        for (let i = 0; i < size; i++) m[i + 1] = sol[i]
      }

      // Compute spline coefficients for each interval [xs[i], xs[i+1]]
      // S_i(x) = a_i + b_i*(x-xs[i]) + c_i*(x-xs[i])^2 + d_i*(x-xs[i])^3
      const coeffs = []
      for (let i = 0; i < n - 1; i++) {
        const a = ys[i]
        const b = (ys[i + 1] - ys[i]) / h[i] - h[i] * (2 * m[i] + m[i + 1]) / 3
        const c = m[i]
        const d = (m[i + 1] - m[i]) / (3 * h[i])
        coeffs.push({ a, b, c, d, x0: xs[i] })
      }

      return {
        evaluate: function (t) {
          if (t < xs[0] || t > xs[n - 1]) {
            throw new Error('cspline.evaluate: t=' + t + ' is outside the range [' + xs[0] + ', ' + xs[n - 1] + ']')
          }
          // Binary search for interval — O(log n)
          let lo = 0
          let hi = n - 2
          while (lo < hi) {
            const mid = (lo + hi) >> 1
            if (t > xs[mid + 1]) { lo = mid + 1 } else { hi = mid }
          }
          const idx = lo
          const { a, b, c, d, x0 } = coeffs[idx]
          const dx = t - x0
          return a + b * dx + c * dx * dx + d * dx * dx * dx
        },
        coefficients: coeffs
      }
    }
  }
)
