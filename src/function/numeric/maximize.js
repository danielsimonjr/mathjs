import { factory } from '../../utils/factory.js'

const name = 'maximize'
const dependencies = ['typed']

export const createMaximize = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find a local maximum of a function by negating it and applying the
     * Nelder-Mead simplex minimization. Works for any dimension and does
     * not require derivatives.
     *
     * Syntax:
     *
     *    math.maximize(f, x0)
     *    math.maximize(f, x0, options)
     *
     * Examples:
     *
     *    g(v) = -(v[1] - 3)^2 - (v[2] + 1)^2 + 10
     *    maximize(g, [0, 0])
     *    maximize(g, [0, 0], {tol: 1e-10})
     *
     * See also:
     *
     *    minimize, globalMinimize
     *
     * @param {Function} f         Objective function taking an array of numbers, returning a number
     * @param {Array}    x0        Initial guess (array of numbers)
     * @param {Object}   [options] Options: tol (1e-8), maxIter (1000)
     * @return {Object}  Result with properties: x (array), fval (number), iterations (number), converged (boolean)
     */
    return typed(name, {
      'function, Array': function (f, x0) {
        const negF = function (x) { return -f(x) }
        const result = _nelderMead(negF, x0, 1e-8, 1000)
        return {
          x: result.x,
          fval: -result.fval,
          iterations: result.iterations,
          converged: result.converged
        }
      },
      'function, Array, Object': function (f, x0, options) {
        const tol = options.tol !== undefined ? options.tol : 1e-8
        const maxIter = options.maxIter !== undefined ? options.maxIter : 1000
        const negF = function (x) { return -f(x) }
        const result = _nelderMead(negF, x0, tol, maxIter)
        return {
          x: result.x,
          fval: -result.fval,
          iterations: result.iterations,
          converged: result.converged
        }
      }
    })

    function _nelderMead (f, x0, tol, maxIter) {
      const n = x0.length
      const alpha = 1.0
      const gamma = 2.0
      const rho = 0.5
      const sigma = 0.5

      const simplex = []
      for (let i = 0; i <= n; i++) {
        const vertex = x0.slice()
        if (i > 0) {
          vertex[i - 1] += Math.abs(x0[i - 1]) > 1e-10 ? 0.05 * Math.abs(x0[i - 1]) : 1.0
        }
        simplex.push({ x: vertex, f: f(vertex) })
      }

      let iter = 0
      let converged = false

      for (iter = 0; iter < maxIter; iter++) {
        simplex.sort((a, b) => a.f - b.f)

        const fRange = simplex[n].f - simplex[0].f
        if (Math.abs(fRange) < tol) {
          // Also verify the simplex has contracted to a small region
          let maxDist = 0
          for (let i = 1; i <= n; i++) {
            let dist = 0
            for (let j = 0; j < n; j++) {
              const d = simplex[i].x[j] - simplex[0].x[j]
              dist += d * d
            }
            maxDist = Math.max(maxDist, Math.sqrt(dist))
          }
          if (maxDist < Math.sqrt(tol) + 1e-15) {
            converged = true
            break
          }
        }

        const xo = new Array(n).fill(0)
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            xo[j] += simplex[i].x[j]
          }
        }
        for (let j = 0; j < n; j++) xo[j] /= n

        const xr = xo.map((v, j) => v + alpha * (v - simplex[n].x[j]))
        const fr = f(xr)

        if (fr < simplex[0].f) {
          const xe = xo.map((v, j) => v + gamma * (xr[j] - v))
          const fe = f(xe)
          if (fe < fr) {
            simplex[n] = { x: xe, f: fe }
          } else {
            simplex[n] = { x: xr, f: fr }
          }
        } else if (fr < simplex[n - 1].f) {
          simplex[n] = { x: xr, f: fr }
        } else {
          if (fr < simplex[n].f) {
            const xc = xo.map((v, j) => v + rho * (xr[j] - v))
            const fc = f(xc)
            if (fc <= fr) {
              simplex[n] = { x: xc, f: fc }
            } else {
              for (let i = 1; i <= n; i++) {
                const xs = simplex[0].x.map((v, j) => v + sigma * (simplex[i].x[j] - v))
                simplex[i] = { x: xs, f: f(xs) }
              }
            }
          } else {
            const xc = xo.map((v, j) => v + rho * (simplex[n].x[j] - v))
            const fc = f(xc)
            if (fc < simplex[n].f) {
              simplex[n] = { x: xc, f: fc }
            } else {
              for (let i = 1; i <= n; i++) {
                const xs = simplex[0].x.map((v, j) => v + sigma * (simplex[i].x[j] - v))
                simplex[i] = { x: xs, f: f(xs) }
              }
            }
          }
        }
      }

      simplex.sort((a, b) => a.f - b.f)
      return {
        x: simplex[0].x,
        fval: simplex[0].f,
        iterations: iter,
        converged
      }
    }
  }
)
