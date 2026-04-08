import { factory } from '../../utils/factory.js'

const name = 'leastSquares'
const dependencies = ['typed']

export const createLeastSquares = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Solve a nonlinear least squares problem using the Gauss-Newton method
     * with a backtracking line search.
     *
     * Minimizes  sum(r_i(x)^2)  where r(x) is the residual vector.
     *
     * Syntax:
     *
     *    math.leastSquares(f, x0, data)
     *    math.leastSquares(f, x0, data, options)
     *
     * Examples:
     *
     *    f(params, data) = [params[0] * data[0] + params[1] - data[1]]
     *    leastSquares(f, [1, 0], [[1, 2], [2, 4], [3, 6]])
     *
     * See also:
     *
     *    minimize, curvefit
     *
     * @param {Function} f         Residual function: (params: Array, data: any) => Array of residuals
     * @param {Array}    x0        Initial parameter guess
     * @param {any}      data      Data passed to f as second argument
     * @param {Object}   [options] Options: tol (1e-8), maxIter (200), h (1e-7, finite diff step)
     * @return {Object}  Result with properties: x (array), resnorm (number), iterations (number), converged (boolean)
     */
    return typed(name, {
      'function, Array, any': function (f, x0, data) {
        return _gaussNewton(f, x0, data, 1e-8, 200, 1e-7)
      },
      'function, Array, any, Object': function (f, x0, data, options) {
        const tol = options.tol !== undefined ? options.tol : 1e-8
        const maxIter = options.maxIter !== undefined ? options.maxIter : 200
        const h = options.h !== undefined ? options.h : 1e-7
        return _gaussNewton(f, x0, data, tol, maxIter, h)
      }
    })

    function _gaussNewton (f, x0, data, tol, maxIter, h) {
      const n = x0.length
      const x = x0.slice()
      let iter = 0
      let converged = false

      for (iter = 0; iter < maxIter; iter++) {
        const r = f(x, data)
        const m = r.length
        const resnorm = Math.sqrt(r.reduce((s, v) => s + v * v, 0))

        if (resnorm < tol) { converged = true; break }

        // Compute Jacobian J[i][j] = dr_i / dx_j via finite differences
        const J = []
        for (let i = 0; i < m; i++) J.push(new Array(n).fill(0))

        for (let j = 0; j < n; j++) {
          const xph = x.slice()
          xph[j] += h
          const rph = f(xph, data)
          for (let i = 0; i < m; i++) {
            J[i][j] = (rph[i] - r[i]) / h
          }
        }

        // Compute J'J and J'r
        const JtJ = []
        for (let i = 0; i < n; i++) {
          JtJ.push(new Array(n).fill(0))
          for (let j = 0; j < n; j++) {
            for (let k = 0; k < m; k++) JtJ[i][j] += J[k][i] * J[k][j]
          }
        }
        const Jtr = new Array(n).fill(0)
        for (let i = 0; i < n; i++) {
          for (let k = 0; k < m; k++) Jtr[i] += J[k][i] * r[k]
        }

        // Levenberg-Marquardt regularization if J'J is nearly singular
        let lambda = 1e-6
        let step = null
        for (let attempt = 0; attempt < 10; attempt++) {
          const A = JtJ.map((row, i) => {
            const r2 = row.slice()
            r2[i] += lambda
            return r2
          })
          const aug = A.map((row, i) => row.concat([-Jtr[i]]))
          _gaussElim(aug, n)
          const sol = new Array(n).fill(0)
          for (let i = n - 1; i >= 0; i--) {
            let s = aug[i][n]
            for (let j = i + 1; j < n; j++) s -= aug[i][j] * sol[j]
            sol[i] = Math.abs(aug[i][i]) > 1e-20 ? s / aug[i][i] : 0
          }
          step = sol
          // Check step is finite
          if (step.every(isFinite)) break
          lambda *= 10
        }
        if (!step) break

        // Backtracking line search
        let alpha = 1.0
        const cost0 = r.reduce((s, v) => s + v * v, 0)
        for (let ls = 0; ls < 20; ls++) {
          const xnew = x.map((v, i) => v + alpha * step[i])
          const rnew = f(xnew, data)
          const costnew = rnew.reduce((s, v) => s + v * v, 0)
          if (costnew < cost0) break
          alpha *= 0.5
        }

        const dx = step.map(v => v * alpha)
        const dxNorm = Math.sqrt(dx.reduce((s, v) => s + v * v, 0))
        for (let i = 0; i < n; i++) x[i] += dx[i]

        if (dxNorm < tol * (1 + Math.sqrt(x.reduce((s, v) => s + v * v, 0)))) {
          converged = true
          break
        }
      }

      const rFinal = f(x, data)
      const resnorm = Math.sqrt(rFinal.reduce((s, v) => s + v * v, 0))

      return { x, resnorm, iterations: iter, converged }
    }

    function _gaussElim (M, n) {
      for (let col = 0; col < n; col++) {
        let maxRow = col
        let maxVal = Math.abs(M[col][col])
        for (let row = col + 1; row < n; row++) {
          if (Math.abs(M[row][col]) > maxVal) {
            maxVal = Math.abs(M[row][col])
            maxRow = row
          }
        }
        if (maxRow !== col) {
          const tmp = M[col]; M[col] = M[maxRow]; M[maxRow] = tmp
        }
        if (Math.abs(M[col][col]) < 1e-20) continue
        for (let row = col + 1; row < n; row++) {
          const factor = M[row][col] / M[col][col]
          for (let j = col; j <= n; j++) M[row][j] -= factor * M[col][j]
        }
      }
    }
  }
)
