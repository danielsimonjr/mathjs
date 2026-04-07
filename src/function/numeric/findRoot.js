import { factory } from '../../utils/factory.js'

const name = 'findRoot'
const dependencies = ['typed']

export const createFindRoot = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find a root of a function f(x) = 0.
     *
     * When given two numbers (a, b), uses Brent's method (guaranteed convergence
     * when f(a) and f(b) have opposite signs). When given one number (x0), uses
     * Newton's method with numerical derivative.
     *
     * Syntax:
     *
     *    math.findRoot(f, x0)
     *    math.findRoot(f, a, b)
     *    math.findRoot(f, x0, options)
     *
     * Examples:
     *
     *    math.findRoot(x => x*x - 4, 1)        // 2
     *    math.findRoot(Math.cos, 1, 2)          // pi/2
     *    math.findRoot(x => x*x - 2, 1, { tol: 1e-14 })
     *
     * See also:
     *
     *    nintegrate, solveODE, derivative
     *
     * @param {Function} f    The function to find the root of
     * @param {number} x0     Initial guess (Newton) or lower bound (Brent)
     * @param {number} [x1]   Upper bound (Brent only)
     * @param {Object} [options]  Options: tol (1e-12), maxIter (100)
     * @return {number}       The root x where f(x) ≈ 0
     */
    return typed(name, {
      'function, number': function (f, x0) {
        return _newton(f, x0, 1e-12, 100)
      },
      'function, number, number': function (f, a, b) {
        return _brent(f, a, b, 1e-12, 100)
      },
      'function, number, Object': function (f, x0, options) {
        return _newton(f, x0, options.tol !== undefined ? options.tol : 1e-12, options.maxIter !== undefined ? options.maxIter : 100)
      },
      'function, number, number, Object': function (f, a, b, options) {
        return _brent(f, a, b, options.tol !== undefined ? options.tol : 1e-12, options.maxIter !== undefined ? options.maxIter : 100)
      }
    })

    function _newton (f, x0, tol, maxIter) {
      let x = x0
      const h = 1e-8
      for (let i = 0; i < maxIter; i++) {
        const fx = f(x)
        if (Math.abs(fx) < tol) return x
        const fpx = (f(x + h) - f(x - h)) / (2 * h)
        if (Math.abs(fpx) < 1e-15) {
          throw new Error('findRoot: derivative near zero, cannot converge')
        }
        x = x - fx / fpx
        if (!isFinite(x)) {
          throw new Error('findRoot: diverged to non-finite value')
        }
      }
      throw new Error('findRoot: did not converge after ' + maxIter + ' iterations')
    }

    function _brent (f, a, b, tol, maxIter) {
      let fa = f(a)
      let fb = f(b)
      if (fa * fb > 0) {
        throw new Error('findRoot: f(a) and f(b) must have opposite signs for Brent\'s method')
      }
      if (Math.abs(fa) < Math.abs(fb)) {
        let tmp = a; a = b; b = tmp
        tmp = fa; fa = fb; fb = tmp
      }
      let c = a
      let fc = fa
      let d = b - a
      let e = d
      for (let i = 0; i < maxIter; i++) {
        if (Math.abs(fb) < tol) return b
        if (Math.abs(b - a) < tol) return b

        let s
        if (fa !== fc && fb !== fc) {
          // Inverse quadratic interpolation
          s = a * fb * fc / ((fa - fb) * (fa - fc)) +
              b * fa * fc / ((fb - fa) * (fb - fc)) +
              c * fa * fb / ((fc - fa) * (fc - fb))
        } else {
          // Secant method
          s = b - fb * (b - a) / (fb - fa)
        }

        // Bisection fallback conditions
        const cond1 = (s - b) * (s - (3 * a + b) / 4) > 0
        const cond2 = Math.abs(s - b) >= Math.abs(e) / 2
        if (cond1 || cond2) {
          s = (a + b) / 2
          e = b - a
        } else {
          e = d
        }

        d = b - s
        c = b
        fc = fb
        const fs = f(s)
        if (fa * fs < 0) { b = s; fb = fs } else { a = s; fa = fs }

        if (Math.abs(fa) < Math.abs(fb)) {
          let tmp = a; a = b; b = tmp
          tmp = fa; fa = fb; fb = tmp
        }
      }
      return b
    }
  }
)
