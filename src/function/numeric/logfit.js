import { factory } from '../../utils/factory.js'

const name = 'logfit'
const dependencies = ['typed']

export const createLogfit = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Fit a logarithmic model  y = a + b * ln(x)  to data using linear
     * regression with the substitution u = ln(x).
     *
     * All x values must be strictly positive.
     *
     * Syntax:
     *
     *    math.logfit(x, y)
     *
     * Examples:
     *
     *    math.logfit([1, 2, 4, 8], [0, 1, 2, 3])   // { a: ~0, b: ~1.44, predict: f }
     *
     * See also:
     *
     *    expfit, powerfit, polyfit, curvefit
     *
     * @param {Array} x  Array of x-coordinates (all must be > 0)
     * @param {Array} y  Array of y-coordinates
     * @return {Object}  Object with `a`, `b`, and `predict(x)` method
     */
    return typed(name, {
      'Array, Array': function (x, y) {
        return _logfit(x, y)
      }
    })

    function _logfit (x, y) {
      const n = x.length
      if (n !== y.length) throw new Error('logfit: x and y must have the same length')
      if (n < 2) throw new Error('logfit: at least 2 data points are required')

      for (let i = 0; i < n; i++) {
        if (x[i] <= 0) throw new Error('logfit: all x values must be strictly positive')
      }

      const lnx = x.map(xi => Math.log(xi))
      const reg = _linearRegression(lnx, y)
      const a = reg.a
      const b = reg.b

      return {
        a,
        b,
        predict: function (xv) { return a + b * Math.log(xv) }
      }
    }

    function _linearRegression (x, y) {
      const n = x.length
      let sx = 0; let sy = 0; let sxx = 0; let sxy = 0
      for (let i = 0; i < n; i++) {
        sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; sxy += x[i] * y[i]
      }
      const denom = n * sxx - sx * sx
      if (Math.abs(denom) < 1e-14) throw new Error('logfit: degenerate x data (all x values identical?)')
      const b = (n * sxy - sx * sy) / denom
      const a = (sy - b * sx) / n
      return { a, b }
    }
  }
)
