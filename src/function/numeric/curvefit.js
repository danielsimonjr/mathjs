import { factory } from '../../utils/factory.js'

const name = 'curvefit'
const dependencies = ['typed']

export const createCurvefit = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }) => {
    /**
     * Fit a parametric model function to data using the Levenberg-Marquardt algorithm.
     *
     * Minimizes the sum of squared residuals: sum((f(xdata[i], params) - ydata[i])^2)
     *
     * Syntax:
     *
     *    math.curvefit(f, params0, xdata, ydata)
     *    math.curvefit(f, params0, xdata, ydata, options)
     *
     * Examples:
     *
     *    // Fit y = a * exp(b * x)
     *    const model = (x, p) => p[0] * Math.exp(p[1] * x)
     *    const result = math.curvefit(model, [1, 0.1], [0, 1, 2], [1, 2.7, 7.4])
     *    // result.params ~ [1, 1]
     *
     * See also:
     *
     *    linsolve, nintegrate, interpolate
     *
     * @param {Function} f         Model function f(x, params) -> number
     * @param {Array} params0      Initial parameter guess (1D array)
     * @param {Array} xdata        Input data (1D array)
     * @param {Array} ydata        Output data (1D array)
     * @param {Object} [options]   Options: tol (1e-8), maxIter (200), lambda (0.01)
     * @return {Object}            { params, residuals, iterations }
     */
    return typed(name, {
      'function, Array, Array, Array': function (f, params0, xdata, ydata) {
        return _levenbergMarquardt(f, params0, xdata, ydata, {})
      },
      'function, Array, Array, Array, Object': function (f, params0, xdata, ydata, options) {
        return _levenbergMarquardt(f, params0, xdata, ydata, options)
      }
    })

    function _levenbergMarquardt (f, params0, xdata, ydata, options) {
      const tol = options.tol !== undefined ? options.tol : 1e-8
      const maxIter = options.maxIter !== undefined ? options.maxIter : 200
      let lambda = options.lambda !== undefined ? options.lambda : 0.01
      const eps = 1e-7 // step for numerical Jacobian

      if (xdata.length !== ydata.length) {
        throw new Error('curvefit: xdata and ydata must have the same length')
      }

      const m = xdata.length // number of data points
      const n = params0.length // number of parameters
      let params = [...params0]

      for (let iter = 0; iter < maxIter; iter++) {
        // Compute residuals r[i] = f(xdata[i], params) - ydata[i]
        const r = xdata.map((x, i) => f(x, params) - ydata[i])
        const ssr = r.reduce((s, ri) => s + ri * ri, 0)

        // Compute Jacobian J[i][j] = df/dparam_j at xdata[i]
        const J = Array.from({ length: m }, () => new Array(n).fill(0))
        for (let j = 0; j < n; j++) {
          const pPlus = [...params]
          pPlus[j] += eps
          for (let i = 0; i < m; i++) {
            J[i][j] = (f(xdata[i], pPlus) - f(xdata[i], params)) / eps
          }
        }

        // Compute J^T J and J^T r
        const JTJ = Array.from({ length: n }, () => new Array(n).fill(0))
        const JTr = new Array(n).fill(0)

        for (let j = 0; j < n; j++) {
          for (let k = 0; k < n; k++) {
            for (let i = 0; i < m; i++) {
              JTJ[j][k] += J[i][j] * J[i][k]
            }
          }
          for (let i = 0; i < m; i++) {
            JTr[j] += J[i][j] * r[i]
          }
        }

        // Add damping: (J^T J + lambda * diag(J^T J)) * delta = -J^T r
        const A = JTJ.map((row, j) => row.map((v, k) => j === k ? v + lambda * (v + 1e-10) : v))
        const b = JTr.map(v => -v)

        let delta
        try {
          delta = _solveSystem(A, b)
        } catch (e) {
          // If singular, increase damping
          lambda *= 10
          continue
        }

        const paramsNew = params.map((p, j) => p + delta[j])
        const rNew = xdata.map((x, i) => f(x, paramsNew) - ydata[i])
        const ssrNew = rNew.reduce((s, ri) => s + ri * ri, 0)

        if (ssrNew < ssr) {
          // Accept step, decrease damping
          params = paramsNew
          lambda = Math.max(lambda / 10, 1e-15)

          // Check convergence
          const stepNorm = Math.sqrt(delta.reduce((s, d) => s + d * d, 0))
          if (stepNorm < tol) {
            return {
              params,
              residuals: rNew,
              iterations: iter + 1,
              converged: true
            }
          }
        } else {
          // Reject step, increase damping
          lambda = Math.min(lambda * 10, 1e15)
        }
      }

      const r = xdata.map((x, i) => f(x, params) - ydata[i])
      return {
        params,
        residuals: r,
        iterations: maxIter,
        converged: false
      }
    }

    function _solveSystem (A, b) {
      const n = A.length
      const aug = A.map((row, i) => [...row, b[i]])

      for (let col = 0; col < n; col++) {
        let maxRow = col
        let maxVal = Math.abs(aug[col][col])
        for (let row = col + 1; row < n; row++) {
          if (Math.abs(aug[row][col]) > maxVal) {
            maxVal = Math.abs(aug[row][col])
            maxRow = row
          }
        }
        if (maxVal < 1e-15) throw new Error('singular')

        if (maxRow !== col) {
          const tmp = aug[col]; aug[col] = aug[maxRow]; aug[maxRow] = tmp
        }

        for (let row = col + 1; row < n; row++) {
          const factor = aug[row][col] / aug[col][col]
          for (let k = col; k <= n; k++) {
            aug[row][k] -= factor * aug[col][k]
          }
        }
      }

      const x = new Array(n).fill(0)
      for (let i = n - 1; i >= 0; i--) {
        x[i] = aug[i][n]
        for (let j = i + 1; j < n; j++) {
          x[i] -= aug[i][j] * x[j]
        }
        x[i] /= aug[i][i]
      }
      return x
    }
  }
)
