import { factory } from '../../utils/factory.js'

const name = 'hessian'
const dependencies = ['typed']

export const createHessian = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the numerical Hessian matrix of a scalar function at a given point
   * using second-order central differences.
   *
   * H[i][j] = (f(x+h*e_i+h*e_j) - f(x+h*e_i-h*e_j)
   *           - f(x-h*e_i+h*e_j) + f(x-h*e_i-h*e_j)) / (4*h^2)
   *
   * Syntax:
   *
   *    math.hessian(f, x)
   *    math.hessian(f, x, h)
   *
   * Examples:
   *
   *    f(x, y) = x^2 + y^2
   *    math.hessian(f, [0, 0])        // approximately [[2, 0], [0, 2]]
   *    math.hessian(f, [0, 0], 1e-4)  // approximately [[2, 0], [0, 2]]
   *
   * See also:
   *
   *    gradient, derivative, nintegrate
   *
   * @param {Function} f   A function taking an array and returning a number
   * @param {Array} x      The point at which to evaluate the Hessian
   * @param {number} [h]   Step size (default: 1e-4)
   * @return {Array}       The n×n Hessian matrix at x (2D array)
   */
  return typed(name, {
    'function, Array': function (f, x) {
      return _hessian(f, x, 1e-4)
    },
    'function, Array, number': function (f, x, h) {
      return _hessian(f, x, h)
    }
  })

  function _hessian (f, x, h) {
    const n = x.length
    const H = []

    for (let i = 0; i < n; i++) {
      H.push(new Array(n).fill(0))
    }

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const xpp = x.slice()
        const xpm = x.slice()
        const xmp = x.slice()
        const xmm = x.slice()

        xpp[i] += h
        xpp[j] += h
        xpm[i] += h
        xpm[j] -= h
        xmp[i] -= h
        xmp[j] += h
        xmm[i] -= h
        xmm[j] -= h

        const val = (f(xpp) - f(xpm) - f(xmp) + f(xmm)) / (4 * h * h)
        H[i][j] = val
        H[j][i] = val
      }
    }

    return H
  }
})
