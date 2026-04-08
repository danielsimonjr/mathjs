import { factory } from '../../utils/factory.js'

const name = 'stiffODESolver'
const dependencies = ['typed']

export const createStiffODESolver = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Solve a stiff ODE system using the Backward Differentiation Formula (BDF) method.
   *
   * BDF methods are A-stable (or A(alpha)-stable) implicit methods suited for
   * stiff ODEs where explicit methods would require extremely small step sizes.
   * Supports BDF order 1 (implicit Euler) and order 2.
   *
   * At each step, Newton iteration solves the implicit nonlinear system.
   * The Jacobian is approximated by finite differences.
   *
   * Syntax:
   *
   *     math.stiffODESolver(f, tSpan, y0)
   *     math.stiffODESolver(f, tSpan, y0, options)
   *
   * Examples:
   *
   *     f(t, y) = [y[1], -1000 * (y[0]^2 - 1) * y[1] - y[0]]
   *     math.stiffODESolver(f, [0, 3000], [2, 0], {order: 2, tol: 1e-6})
   *
   * See also:
   *
   *     solveODE, solveODESystem, odeAdaptiveStep
   *
   * @param {function} f        ODE function f(t, y) -> array
   * @param {Array}    tSpan    [t0, tf]
   * @param {Array}    y0       Initial state array
   * @param {Object}   [options] Optional: {order, tol, maxStep, minStep, maxIter, newtonMaxIter, h}
   * @return {Object}  {t: number[], y: number[][]}
   */

  function _norm (v) {
    if (!Array.isArray(v)) return Math.abs(v)
    return Math.sqrt(v.reduce((s, x) => s + x * x, 0)) / Math.sqrt(v.length)
  }

  function _addVec (a, b) {
    return a.map((v, i) => v + b[i])
  }

  function _jacobian (f, t, y, fy, h) {
    const n = y.length
    const J = []
    for (let j = 0; j < n; j++) {
      const yp = y.slice()
      yp[j] += h
      const fyp = f(t, yp)
      J.push(fyp.map((fp, i) => (fp - fy[i]) / h))
    }
    return J // J[j][i] = df_i/dy_j
  }

  function _solveLinear (Jcols, b) {
    const m = b.length
    const A = []
    for (let i = 0; i < m; i++) {
      const row = []
      for (let j = 0; j < m; j++) {
        row.push(Jcols[j][i])
      }
      row.push(b[i])
      A.push(row)
    }

    for (let col = 0; col < m; col++) {
      let maxVal = Math.abs(A[col][col])
      let maxRow = col
      for (let row = col + 1; row < m; row++) {
        if (Math.abs(A[row][col]) > maxVal) {
          maxVal = Math.abs(A[row][col])
          maxRow = row
        }
      }
      const tmp = A[col]
      A[col] = A[maxRow]
      A[maxRow] = tmp

      if (Math.abs(A[col][col]) < 1e-14) continue

      for (let row = col + 1; row < m; row++) {
        const factor = A[row][col] / A[col][col]
        for (let k = col; k <= m; k++) {
          A[row][k] -= factor * A[col][k]
        }
      }
    }

    const x = new Array(m).fill(0)
    for (let i = m - 1; i >= 0; i--) {
      x[i] = A[i][m]
      for (let j = i + 1; j < m; j++) {
        x[i] -= A[i][j] * x[j]
      }
      x[i] /= A[i][i] || 1e-14
    }

    return x
  }

  function _bdf1Step (f, t, yPrev, h, tol, newtonMaxIter) {
    // BDF1 (implicit Euler): y_n - y_{n-1} - h * f(t_n, y_n) = 0
    const tNext = t + h
    const n = yPrev.length
    const jh = Math.sqrt(Number.EPSILON) * Math.max(1, _norm(yPrev))

    let yN = yPrev.slice() // initial guess = previous step

    for (let iter = 0; iter < newtonMaxIter; iter++) {
      const fy = f(tNext, yN)
      // Residual: G(y) = y - y_prev - h * f(t+h, y)
      const G = yN.map((v, i) => v - yPrev[i] - h * fy[i])

      if (_norm(G) < tol * (1 + _norm(yN))) break

      // Jacobian of G: I - h * J_f
      const Jf = _jacobian(f, tNext, yN, fy, jh)
      // Build I - h*Jf as column vectors for _solveLinear
      const JGcols = []
      for (let j = 0; j < n; j++) {
        const col = []
        for (let i = 0; i < n; i++) {
          col.push((i === j ? 1 : 0) - h * Jf[j][i])
        }
        JGcols.push(col)
      }

      const delta = _solveLinear(JGcols, G.map(x => -x))
      yN = _addVec(yN, delta)
    }

    return yN
  }

  function _bdf2Step (f, t, yPrev1, yPrev2, h, tol, newtonMaxIter) {
    // BDF2: (3/2)*y_n - 2*y_{n-1} + (1/2)*y_{n-2} - h * f(t_n, y_n) = 0
    const tNext = t + h
    const n = yPrev1.length
    const jh = Math.sqrt(Number.EPSILON) * Math.max(1, _norm(yPrev1))

    // Initial guess: linear extrapolation
    let yN = yPrev1.map((v, i) => 2 * v - yPrev2[i])

    for (let iter = 0; iter < newtonMaxIter; iter++) {
      const fy = f(tNext, yN)
      // Residual: G(y) = (3/2)*y - 2*y_{n-1} + (1/2)*y_{n-2} - h*f
      const G = yN.map((v, i) =>
        1.5 * v - 2 * yPrev1[i] + 0.5 * yPrev2[i] - h * fy[i]
      )

      if (_norm(G) < tol * (1 + _norm(yN))) break

      // Jacobian: (3/2)*I - h * J_f
      const Jf = _jacobian(f, tNext, yN, fy, jh)
      const JGcols = []
      for (let j = 0; j < n; j++) {
        const col = []
        for (let i = 0; i < n; i++) {
          col.push((i === j ? 1.5 : 0) - h * Jf[j][i])
        }
        JGcols.push(col)
      }

      const delta = _solveLinear(JGcols, G.map(x => -x))
      yN = _addVec(yN, delta)
    }

    return yN
  }

  function _solve (f, tSpan, y0, options) {
    if (!Array.isArray(tSpan) || tSpan.length < 2) {
      throw new Error('stiffODESolver: tSpan must be [t0, tf]')
    }
    if (!Array.isArray(y0) || y0.length === 0) {
      throw new Error('stiffODESolver: y0 must be a non-empty array')
    }

    const t0 = tSpan[0]
    const tf = tSpan[tSpan.length - 1]
    const order = options.order || 2
    const tol = options.tol || 1e-6
    const newtonMaxIter = options.newtonMaxIter || 50
    const nSteps = options.nSteps || 500
    const maxStep = options.maxStep || (tf - t0)
    const minStep = options.minStep || 1e-12

    if (order !== 1 && order !== 2) {
      throw new Error('stiffODESolver: order must be 1 or 2')
    }

    let h = (tf - t0) / nSteps
    h = Math.min(h, maxStep)
    h = Math.max(h, minStep)

    const tArr = [t0]
    const yArr = [y0.slice()]
    let tCur = t0

    // Start with BDF1 for the first step (needed to bootstrap BDF2)
    let yPrev1 = y0.slice()
    let yPrev2 = null

    // First step always BDF1
    const y1 = _bdf1Step(f, tCur, yPrev1, h, tol, newtonMaxIter)
    tCur += h
    tArr.push(tCur)
    yArr.push(y1.slice())
    yPrev2 = yPrev1
    yPrev1 = y1

    while (tCur < tf - minStep / 2) {
      const hStep = Math.min(h, tf - tCur)

      let yNext
      if (order === 1 || yPrev2 === null) {
        yNext = _bdf1Step(f, tCur, yPrev1, hStep, tol, newtonMaxIter)
      } else {
        yNext = _bdf2Step(f, tCur, yPrev1, yPrev2, hStep, tol, newtonMaxIter)
      }

      tCur += hStep
      tArr.push(tCur)
      yArr.push(yNext.slice())
      yPrev2 = yPrev1
      yPrev1 = yNext
    }

    return { t: tArr, y: yArr }
  }

  return typed(name, {
    'function, Array, Array': (f, tSpan, y0) => _solve(f, tSpan, y0, {}),
    'function, Array, Array, Object': (f, tSpan, y0, options) => _solve(f, tSpan, y0, options)
  })
})
