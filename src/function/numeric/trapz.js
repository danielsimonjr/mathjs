import { factory } from '../../utils/factory.js'

const name = 'trapz'
const dependencies = ['typed']

export const createTrapz = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Numerically integrate data using the trapezoidal rule.
     *
     * Syntax:
     *
     *    math.trapz(y, x)
     *    math.trapz(y, dx)
     *
     * Examples:
     *
     *    math.trapz([0, 1, 4, 9], [0, 1, 2, 3])   // 9.5
     *    math.trapz([0, 1, 4, 9], 1)               // 9.5
     *
     * See also:
     *
     *    nintegrate, simpsons
     *
     * @param {Array} y      Array of function values
     * @param {Array|number} x  Array of x coordinates, or scalar step size dx
     * @return {number}      The numerical integral
     */
    return typed(name, {
      'Array, Array': function (y, x) {
        if (y.length !== x.length) {
          throw new Error('trapz: y and x must have the same length')
        }
        if (y.length < 2) {
          throw new Error('trapz: y and x must have at least 2 elements')
        }
        return _trapzArrays(y, x)
      },
      'Array, number': function (y, dx) {
        if (y.length < 2) {
          throw new Error('trapz: y must have at least 2 elements')
        }
        return _trapzScalar(y, dx)
      }
    })

    function _trapzArrays (y, x) {
      let sum = 0
      for (let i = 0; i < y.length - 1; i++) {
        sum += (x[i + 1] - x[i]) * (y[i] + y[i + 1]) / 2
      }
      return sum
    }

    function _trapzScalar (y, dx) {
      let sum = 0
      for (let i = 0; i < y.length - 1; i++) {
        sum += dx * (y[i] + y[i + 1]) / 2
      }
      return sum
    }
  }
)
