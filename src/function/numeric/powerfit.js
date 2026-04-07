import { factory } from '../../utils/factory.js'

const name = 'powerfit'
const dependencies = ['typed']

export const createPowerfit = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Fit a power-law model  y = a * x^b  to data using linear regression on
     * the doubly log-transformed data: ln(y) = ln(a) + b*ln(x).
     *
     * All x and y values must be strictly positive.
     *
     * Syntax:
     *
     *    math.powerfit(x, y)
     *
     * Examples:
     *
     *    math.powerfit([1, 2, 3, 4], [1, 4, 9, 16])   // { a: ~1, b: ~2, predict: f }
     *
     * See also:
     *
     *    expfit, logfit, polyfit, curvefit
     *
     * @param {Array} x  Array of x-coordinates (all must be > 0)
     * @param {Array} y  Array of y-coordinates (all must be > 0)
     * @return {Object}  Object with `a`, `b`, and `predict(x)` method
     */
    return typed(name, {
      'Array, Array': function (x, y) {
        return _powerfit(x, y)
      }
    })

    function _powerfit (x, y) {
      const n = x.length
      if (n !== y.length) throw new Error('powerfit: x and y must have the same length')
      if (n < 2) throw new Error('powerfit: at least 2 data points are required')

      for (let i = 0; i < n; i++) {
        if (x[i] <= 0) throw new Error('powerfit: all x values must be strictly positive')
        if (y[i] <= 0) throw new Error('powerfit: all y values must be strictly positive')
      }

      const lnx = x.map(xi => Math.log(xi))
      const lny = y.map(yi => Math.log(yi))
      const reg = _linearRegression(lnx, lny)
      const a = Math.exp(reg.a)
      const b = reg.b

      return {
        a,
        b,
        predict: function (xv) { return a * Math.pow(xv, b) }
      }
    }

    function _linearRegression (x, y) {
      const n = x.length
      let sx = 0; let sy = 0; let sxx = 0; let sxy = 0
      for (let i = 0; i < n; i++) {
        sx += x[i]; sy += y[i]; sxx += x[i] * x[i]; sxy += x[i] * y[i]
      }
      const denom = n * sxx - sx * sx
      if (Math.abs(denom) < 1e-14) throw new Error('powerfit: degenerate x data (all x values identical?)')
      const b = (n * sxy - sx * sy) / denom
      const a = (sy - b * sx) / n
      return { a, b }
    }
  }
)
