import { factory } from '../../utils/factory.js'

const name = 'solveBVP'
const dependencies = ['typed']

export const createSolveBVP = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Solve a boundary value problem (BVP) for an ODE system.
   *
   * Uses the shooting method: guess initial conditions, integrate forward,
   * then adjust the free initial conditions to satisfy the boundary conditions.
   *
   * Syntax:
   *
   *     math.solveBVP(f, bc, tSpan, yGuess)
   *     math.solveBVP(f, bc, tSpan, yGuess, options)
   *
   * Examples:
   *
   *     f(t, y) = [y[1], -y[0]]
   *     bc(ya, yb) = [ya[0], yb[0]]
   *     math.solveBVP(f, bc, [0, 3.14159], [0, 1])
   *
   * See also:
   *
   *     solveODE, solveODESystem
   *
   * @param {function} f        ODE right-hand side f(t, y) -> array
   * @param {function} bc       Boundary condition residual bc(ya, yb) -> array (should be zero)
   * @param {Array}    tSpan    [t0, tf]
   * @param {Array}    yGuess   Initial guess for the solution at t0
   * @param {Object}   [options] Optional: {tol, maxIter, shootingTol, nSteps}
   * @return {Object}  {t: number[], y: number[][]}
   */

  function _rk4Step (f, t, y, h) {
    const k1 = f(t, y)
    const k2 = f(t + h / 2, _addVec(y, _scaleVec(k1, h / 2)))
    const k3 = f(t + h / 2, _addVec(y, _scaleVec(k2, h / 2)))
    const k4 = f(t + h, _addVec(y, _scaleVec(k3, h)))
    const dy = k1.map((_, i) => (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
    return _addVec(y, dy)
  }

  function _integrate (f, tSpan, y0, nSteps) {
    const t0 = tSpan[0]
    const tf = tSpan[1]
    const h = (tf - t0) / nSteps
    const tArr = [t0]
    const yArr = [y0.slice()]
    let yCur = y0.slice()
    let tCur = t0

    for (let i = 0; i < nSteps; i++) {
      yCur = _rk4Step(f, tCur, yCur, h)
      tCur = t0 + (i + 1) * h
      tArr.push(tCur)
      yArr.push(yCur.slice())
    }

    return { t: tArr, y: yArr }
  }

  function _addVec (a, b) {
    return a.map((v, i) => v + b[i])
  }

  function _scaleVec (v, s) {
    return v.map(x => x * s)
  }

  function _norm (v) {
    return Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  }

  function _solveBVP (f, bc, tSpan, yGuess, options) {
    const tol = options.tol || 1e-8
    const shootingTol = options.shootingTol || 1e-8
    const maxIter = options.maxIter || 100
    const nSteps = options.nSteps || 200
    const h = options.perturbation || 1e-6

    // Determine which components are free (not pinned by boundary conditions)
    // Strategy: treat all components at t0 as free, iterate to satisfy bc

    // Evaluate bc at initial guess to find number of equations
    const testResult = _integrate(f, tSpan, yGuess.slice(), nSteps)
    const ya0 = testResult.y[0]
    const yb0 = testResult.y[testResult.y.length - 1]
    const testResidual = bc(ya0, yb0)
    const m = testResidual.length // number of boundary conditions

    // We solve for m free parameters using Newton's method
    // Free parameters are the first m components of y0 (the rest come from yGuess)
    let freeVals = yGuess.slice(0, m)
    const fixedVals = yGuess.slice(m)

    function evalResidual (free) {
      const y0 = [...free, ...fixedVals]
      const res = _integrate(f, tSpan, y0, nSteps)
      const ya = res.y[0]
      const yb = res.y[res.y.length - 1]
      return bc(ya, yb)
    }

    for (let iter = 0; iter < maxIter; iter++) {
      const r = evalResidual(freeVals)
      const rNorm = _norm(r)

      if (rNorm < shootingTol) break

      // Build Jacobian by finite differences
      const J = []
      for (let j = 0; j < m; j++) {
        const freePlus = freeVals.slice()
        freePlus[j] += h
        const rPlus = evalResidual(freePlus)
        const col = rPlus.map((rp, k) => (rp - r[k]) / h)
        J.push(col)
      }

      // Solve J * delta = -r  (J is m x m, stored column-major, solve with Gaussian elim)
      const delta = _solveLinear(J, r.map(x => -x))
      freeVals = freeVals.map((v, i) => v + delta[i])

      if (iter === maxIter - 1 && _norm(evalResidual(freeVals)) > tol) {
        throw new Error('solveBVP: shooting method did not converge. Try a better initial guess.')
      }
    }

    const finalY0 = [...freeVals, ...fixedVals]
    return _integrate(f, tSpan, finalY0, nSteps)
  }

  function _solveLinear (Jcols, b) {
    // Solve J*x = b where Jcols[j] is the j-th column of J
    const m = b.length
    // Build row-major augmented matrix
    const A = []
    for (let i = 0; i < m; i++) {
      const row = []
      for (let j = 0; j < m; j++) {
        row.push(Jcols[j][i])
      }
      row.push(b[i])
      A.push(row)
    }

    // Gaussian elimination with partial pivoting
    for (let col = 0; col < m; col++) {
      // Find pivot
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

    // Back substitution
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

  return typed(name, {
    'function, function, Array, Array': (f, bc, tSpan, yGuess) =>
      _solveBVP(f, bc, tSpan, yGuess, {}),
    'function, function, Array, Array, Object': (f, bc, tSpan, yGuess, options) =>
      _solveBVP(f, bc, tSpan, yGuess, options)
  })
})
