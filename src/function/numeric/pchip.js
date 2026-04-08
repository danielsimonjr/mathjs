import { factory } from '../../utils/factory.js'

const name = 'pchip'
const dependencies = ['typed']

export const createPchip = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Compute a Piecewise Cubic Hermite Interpolating Polynomial (PCHIP).
     *
     * Unlike natural cubic splines, PCHIP preserves monotonicity: the
     * interpolant is monotone on each interval where the data is monotone.
     * This avoids spurious oscillations near steep gradients.
     *
     * Slopes are computed using the Fritsch-Carlson method.
     *
     * Syntax:
     *
     *    math.pchip(x, y)
     *
     * Examples:
     *
     *    const p = math.pchip([0, 1, 2, 3], [0, 1, 0, 1])
     *    p.evaluate(0.5)
     *    p.evaluate(1.5)
     *
     * See also:
     *
     *    cspline, interpolate
     *
     * @param {Array} x  Strictly increasing x-coordinates
     * @param {Array} y  y-coordinates (same length as x)
     * @return {Object}  Object with `evaluate(t)` method
     */
    return typed(name, {
      'Array, Array': function (x, y) {
        return _buildPchip(x, y)
      }
    })

    function _buildPchip (xs, ys) {
      const n = xs.length

      if (n !== ys.length) {
        throw new Error('pchip: x and y must have the same length')
      }
      if (n < 2) {
        throw new Error('pchip: at least 2 data points are required')
      }

      // Interval widths and slopes
      const h = new Array(n - 1)
      const delta = new Array(n - 1)
      for (let i = 0; i < n - 1; i++) {
        h[i] = xs[i + 1] - xs[i]
        if (h[i] <= 0) {
          throw new Error('pchip: x values must be strictly increasing')
        }
        delta[i] = (ys[i + 1] - ys[i]) / h[i]
      }

      // Compute endpoint and interior slopes (Fritsch-Carlson)
      const d = new Array(n)

      // Endpoint slopes: one-sided finite differences
      // For n=2 (only 2 points), fall back to linear slope
      if (n === 2) {
        d[0] = delta[0]
        d[1] = delta[0]
      } else {
        d[0] = _endpointSlope(h[0], h[1], delta[0], delta[1])
        d[n - 1] = _endpointSlope(h[n - 2], h[n - 3], delta[n - 2], delta[n - 3])
      }

      // Interior slopes
      for (let i = 1; i < n - 1; i++) {
        if (delta[i - 1] * delta[i] <= 0) {
          // Local extremum or flat segment: zero slope to preserve monotonicity
          d[i] = 0
        } else {
          // Weighted harmonic mean (Fritsch-Carlson)
          const w1 = 2 * h[i] + h[i - 1]
          const w2 = h[i] + 2 * h[i - 1]
          d[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i])
        }
      }

      // Re-check endpoint slopes for monotonicity
      _constrainEndpoint(d, 0, delta, h)
      _constrainEndpoint(d, n - 1, delta, h)

      return {
        evaluate: function (t) {
          if (t < xs[0] || t > xs[n - 1]) {
            throw new Error(
              'pchip.evaluate: t=' + t + ' is outside the range [' + xs[0] + ', ' + xs[n - 1] + ']'
            )
          }
          // Binary search for interval
          let lo = 0
          let hi = n - 2
          while (lo < hi) {
            const mid = (lo + hi) >> 1
            if (t > xs[mid + 1]) { lo = mid + 1 } else { hi = mid }
          }
          const i = lo
          const dx = t - xs[i]
          const hh = h[i]

          // Hermite basis
          const t1 = dx / hh
          const t2 = t1 * t1
          const t3 = t2 * t1
          const h00 = 2 * t3 - 3 * t2 + 1
          const h10 = t3 - 2 * t2 + t1
          const h01 = -2 * t3 + 3 * t2
          const h11 = t3 - t2

          return h00 * ys[i] + h10 * hh * d[i] + h01 * ys[i + 1] + h11 * hh * d[i + 1]
        }
      }
    }

    function _endpointSlope (h0, h1, delta0, delta1) {
      // Non-centered, shape-preserving formula (Fritsch and Carlson, 1980)
      const d = ((2 * h0 + h1) * delta0 - h0 * delta1) / (h0 + h1)
      // Ensure same sign as delta0
      if (d * delta0 <= 0) return 0
      // Limit magnitude
      if (Math.abs(d) > 3 * Math.abs(delta0)) return 3 * delta0
      return d
    }

    function _constrainEndpoint (d, i, delta, h) {
      const k = i === 0 ? 0 : delta.length - 1
      if (delta[k] === 0) {
        d[i] = 0
        return
      }
      const alpha = d[i] / delta[k]
      if (alpha < 0) {
        d[i] = 0
      } else if (alpha > 3) {
        d[i] = 3 * delta[k]
      }
    }
  }
)
