import { factory } from '../../utils/factory.js'

const name = 'gradient'
const dependencies = ['typed']

export const createGradient = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the numerical gradient of a scalar function at a given point
   * using central differences.
   *
   * grad[i] = (f(x + h*e_i) - f(x - h*e_i)) / (2*h)
   *
   * Syntax:
   *
   *    math.gradient(f, x)
   *    math.gradient(f, x, h)
   *
   * Examples:
   *
   *    f(x, y) = x^2 + y^2
   *    math.gradient(f, [1, 1])         // approximately [2, 2]
   *    math.gradient(f, [1, 1], 1e-5)   // approximately [2, 2]
   *
   * See also:
   *
   *    hessian, derivative, nintegrate
   *
   * @param {Function} f   A function taking an array and returning a number
   * @param {Array} x      The point at which to evaluate the gradient
   * @param {number} [h]   Step size (default: 1e-7)
   * @return {Array}       The gradient vector at x
   */
  return typed(name, {
    'function, Array': function (f, x) {
      return _gradient(f, x, 1e-7)
    },
    'function, Array, number': function (f, x, h) {
      return _gradient(f, x, h)
    }
  })

  function _gradient (f, x, h) {
    const n = x.length
    const grad = new Array(n)
    const xp = x.slice()
    const xm = x.slice()

    for (let i = 0; i < n; i++) {
      xp[i] = x[i] + h
      xm[i] = x[i] - h
      grad[i] = (f(xp) - f(xm)) / (2 * h)
      xp[i] = x[i]
      xm[i] = x[i]
    }

    return grad
  }
})
