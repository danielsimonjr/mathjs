import { factory } from '../../utils/factory.js'

const name = 'expfit'
const dependencies = ['typed']

export const createExpfit = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Fit an exponential model  y = a * exp(b * x)  to data using linear
     * regression on the log-transformed data: ln(y) = ln(a) + b*x.
     *
     * All y values must be strictly positive.
     *
     * Syntax:
     *
     *    math.expfit(x, y)
     *
     * Examples:
     *
     *    math.expfit([0, 1, 2], [1, 2.718, 7.389])   // { a: ~1, b: ~1, predict: f }
     *
     * See also:
     *
     *    powerfit, logfit, polyfit, curvefit
     *
     * @param {Array} x  Array of x-coordinates
     * @param {Array} y  Array of y-coordinates (all must be > 0)
     * @return {Object}  Object with `a`, `b`, and `predict(x)` method
     */
    return typed(name, {
      'Array, Array': function (x, y) {
        return _expfit(x, y)
      }
    })

    function _expfit (x, y) {
      const n = x.length
      if (n !== y.length) throw new Error('expfit: x and y must have the same length')
      if (n < 2) throw new Error('expfit: at least 2 data points are required')

      for (let i = 0; i < n; i++) {
        if (y[i] <= 0) throw new Error('expfit: all y values must be strictly positive')
      }

      const lny = y.map(yi => Math.log(yi))
      const reg = _linearRegression(x, lny)
      const a = Math.exp(reg.a)
      const b = reg.b

      return {
        a,
        b,
        predict: function (xv) { return a * Math.exp(b * xv) }
      }
    }

    function _linearRegression (x, y) {
      const n = x.length
      let sx = 0; let sy = 0; let sxx = 0; let sxy = 0
      for (let i = 0; i < n; i++) {
        sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; sxy += x[i] * y[i]
      }
      const denom = n * sxx - sx * sx
      if (Math.abs(denom) < 1e-14) throw new Error('expfit: degenerate x data (all x values identical?)')
      const b = (n * sxy - sx * sy) / denom
      const a = (sy - b * sx) / n
      return { a, b }
    }
  }
)
