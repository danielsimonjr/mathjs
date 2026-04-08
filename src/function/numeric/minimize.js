import { factory } from '../../utils/factory.js'

const name = 'minimize'
const dependencies = ['typed']

export const createMinimize = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Find a local minimum of a function using the Nelder-Mead simplex method.
     * Works for any dimension and does not require derivatives.
     *
     * Syntax:
     *
     *    math.minimize(f, x0)
     *    math.minimize(f, x0, options)
     *
     * Examples:
     *
     *    f(x, y) = (x - 1)^2 + (y - 2)^2
     *    minimize(f, [0, 0])
     *    minimize(f, [0, 0], {tol: 1e-10, maxIter: 2000})
     *
     * See also:
     *
     *    maximize, globalMinimize, leastSquares
     *
     * @param {Function} f         Objective function taking an array of numbers, returning a number
     * @param {Array}    x0        Initial guess (array of numbers)
     * @param {Object}   [options] Options: tol (1e-8), maxIter (1000)
     * @return {Object}  Result with properties: x (array), fval (number), iterations (number), converged (boolean)
     */
    return typed(name, {
      'function, Array': function (f, x0) {
        return _nelderMead(f, x0, 1e-8, 1000)
      },
      'function, Array, Object': function (f, x0, options) {
        const tol = options.tol !== undefined ? options.tol : 1e-8
        const maxIter = options.maxIter !== undefined ? options.maxIter : 1000
        return _nelderMead(f, x0, tol, maxIter)
      }
    })

    function _nelderMead (f, x0, tol, maxIter) {
      const n = x0.length
      // Reflection, expansion, contraction, shrink coefficients
      const alpha = 1.0
      const gamma = 2.0
      const rho = 0.5
      const sigma = 0.5

      // Build initial simplex: n+1 vertices
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
        // Sort simplex by function value
        simplex.sort((a, b) => a.f - b.f)

        // Check convergence: range of function values AND simplex diameter
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

        // Compute centroid of all but worst
        const xo = new Array(n).fill(0)
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            xo[j] += simplex[i].x[j]
          }
        }
        for (let j = 0; j < n; j++) xo[j] /= n

        // Reflection
        const xr = xo.map((v, j) => v + alpha * (v - simplex[n].x[j]))
        const fr = f(xr)

        if (fr < simplex[0].f) {
          // Expansion
          const xe = xo.map((v, j) => v + gamma * (xr[j] - v))
          const fe = f(xe)
          if (fe < fr) {
            simplex[n] = { x: xe, f: fe }
          } else {
            simplex[n] = { x: xr, f: fr }
          }
        } else if (fr < simplex[n - 1].f) {
          // Accept reflection
          simplex[n] = { x: xr, f: fr }
        } else {
          // Contraction
          if (fr < simplex[n].f) {
            // Outside contraction
            const xc = xo.map((v, j) => v + rho * (xr[j] - v))
            const fc = f(xc)
            if (fc <= fr) {
              simplex[n] = { x: xc, f: fc }
            } else {
              // Shrink
              for (let i = 1; i <= n; i++) {
                const xs = simplex[0].x.map((v, j) => v + sigma * (simplex[i].x[j] - v))
                simplex[i] = { x: xs, f: f(xs) }
              }
            }
          } else {
            // Inside contraction
            const xc = xo.map((v, j) => v + rho * (simplex[n].x[j] - v))
            const fc = f(xc)
            if (fc < simplex[n].f) {
              simplex[n] = { x: xc, f: fc }
            } else {
              // Shrink
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
