import { factory } from '../../utils/factory.js'

const name = 'loess'
const dependencies = ['typed']

export const createLoess = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute locally weighted scatterplot smoothing (LOESS/LOWESS).
   *
   * For each point x_i, fits a weighted linear regression using
   * neighboring data points. The tricube weight function is used:
   *   w(d) = (1 - |d|^3)^3  for |d| < 1, else 0
   * where d = (x_i - x_j) / (max distance to span neighbors).
   *
   * Syntax:
   *
   *    math.loess(x, y)
   *    math.loess(x, y, span)
   *
   * Examples:
   *
   *    math.loess([1, 2, 3, 4, 5], [1, 4, 9, 16, 25])
   *    math.loess([1, 2, 3, 4, 5], [1, 4, 9, 16, 25], 0.6)
   *
   * See also:
   *
   *    polyfit, curvefit, interpolate
   *
   * @param {Array} x      Array of x-coordinates (must be sorted ascending)
   * @param {Array} y      Array of y-coordinates (same length as x)
   * @param {number} [span]  Fraction of data to use per local fit (default: 0.75)
   * @return {Array}       Array of smoothed y values
   */
  return typed(name, {
    'Array, Array': function (x, y) {
      return _loess(x, y, 0.75)
    },
    'Array, Array, number': function (x, y, span) {
      return _loess(x, y, span)
    }
  })

  function _loess (x, y, span) {
    const n = x.length
    if (n !== y.length) {
      throw new Error('loess: x and y must have the same length')
    }
    if (span <= 0 || span > 1) {
      throw new Error('loess: span must be in the range (0, 1]')
    }

    const k = Math.max(2, Math.floor(span * n))
    const smoothed = new Array(n)

    for (let i = 0; i < n; i++) {
      // Two-pointer expansion to find k nearest neighbors in sorted x — O(k) per point
      const neighborIndices = [i]
      let lo = i - 1
      let hi = i + 1
      while (neighborIndices.length < k) {
        const distLo = lo >= 0 ? x[i] - x[lo] : Infinity
        const distHi = hi < n ? x[hi] - x[i] : Infinity
        if (distLo <= distHi) {
          neighborIndices.push(lo)
          lo--
        } else {
          neighborIndices.push(hi)
          hi++
        }
      }

      const maxDist = Math.max.apply(null, neighborIndices.map(function (j) { return Math.abs(x[i] - x[j]) }))

      // Compute tricube weights
      let sumW = 0
      let sumWx = 0
      let sumWy = 0
      let sumWxx = 0
      let sumWxy = 0

      for (let ni = 0; ni < neighborIndices.length; ni++) {
        const j = neighborIndices[ni]
        const dist = Math.abs(x[i] - x[j])
        const u = maxDist > 0 ? dist / maxDist : 0
        const w = Math.pow(1 - Math.pow(u, 3), 3)
        sumW += w
        sumWx += w * x[j]
        sumWy += w * y[j]
        sumWxx += w * x[j] * x[j]
        sumWxy += w * x[j] * y[j]
      }

      // Weighted linear regression: y = a + b*x
      const denom = sumW * sumWxx - sumWx * sumWx
      if (Math.abs(denom) < 1e-14) {
        // Degenerate case — use weighted mean
        smoothed[i] = sumW > 0 ? sumWy / sumW : y[i]
      } else {
        const b = (sumW * sumWxy - sumWx * sumWy) / denom
        const a = (sumWy - b * sumWx) / sumW
        smoothed[i] = a + b * x[i]
      }
    }

    return smoothed
  }
})
