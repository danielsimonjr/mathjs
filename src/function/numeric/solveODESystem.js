import { factory } from '../../utils/factory.js'

const name = 'solveODESystem'
const dependencies = ['typed']

export const createSolveODESystem = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Solve a system of coupled ordinary differential equations (ODEs).
   *
   * Uses RK4 (fixed step) or adaptive RK45 (Dormand-Prince) depending on options.
   *
   * Syntax:
   *
   *     math.solveODESystem(f, tSpan, y0)
   *     math.solveODESystem(f, tSpan, y0, options)
   *
   * Examples:
   *
   *     f(t, y) = [y[1], -y[0]]
   *     math.solveODESystem(f, [0, 6.28], [1, 0])
   *     math.solveODESystem(f, [0, 6.28], [1, 0], {method: "RK45", tol: 1e-6})
   *
   * See also:
   *
   *     solveODE, odeAdaptiveStep
   *
   * @param {function} f       The function f(t, y) returning array dy/dt
   * @param {Array}    tSpan   [t0, tf] or array of output times
   * @param {Array}    y0      Initial state array
   * @param {Object}   [options]  Optional: {method, tol, maxStep, minStep, maxIter}
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

  function _rk45Step (f, t, y, h) {
    // Dormand-Prince coefficients
    const c2 = 1 / 5
    const c3 = 3 / 10
    const c4 = 4 / 5
    const c5 = 8 / 9

    const a21 = 1 / 5
    const a31 = 3 / 40
    const a32 = 9 / 40
    const a41 = 44 / 45
    const a42 = -56 / 15
    const a43 = 32 / 9
    const a51 = 19372 / 6561
    const a52 = -25360 / 2187
    const a53 = 64448 / 6561
    const a54 = -212 / 729
    const a61 = 9017 / 3168
    const a62 = -355 / 33
    const a63 = 46732 / 5247
    const a64 = 49 / 176
    const a65 = -5103 / 18656

    const b1 = 35 / 384
    const b3 = 500 / 1113
    const b4 = 125 / 192
    const b5 = -2187 / 6784
    const b6 = 11 / 84

    const e1 = 71 / 57600
    const e3 = -71 / 16695
    const e4 = 71 / 1920
    const e5 = -17253 / 339200
    const e6 = 22 / 525
    const e7 = -1 / 40

    const k1 = f(t, y)
    const k2 = f(t + c2 * h, _addVec(y, _scaleVec(k1, a21 * h)))
    const k3 = f(t + c3 * h, _addVec(y, _addVec(_scaleVec(k1, a31 * h), _scaleVec(k2, a32 * h))))
    const k4 = f(t + c4 * h, _addVec(y, _addVec(_addVec(_scaleVec(k1, a41 * h), _scaleVec(k2, a42 * h)), _scaleVec(k3, a43 * h))))
    const k5 = f(t + c5 * h, _addVec(y, _addVec(_addVec(_addVec(_scaleVec(k1, a51 * h), _scaleVec(k2, a52 * h)), _scaleVec(k3, a53 * h)), _scaleVec(k4, a54 * h))))
    const k6 = f(t + h, _addVec(y, _addVec(_addVec(_addVec(_addVec(_scaleVec(k1, a61 * h), _scaleVec(k2, a62 * h)), _scaleVec(k3, a63 * h)), _scaleVec(k4, a64 * h)), _scaleVec(k5, a65 * h))))

    const yNext = y.map((_, i) => y[i] + h * (b1 * k1[i] + b3 * k3[i] + b4 * k4[i] + b5 * k5[i] + b6 * k6[i]))

    const k7 = f(t + h, yNext)

    const err = y.map((_, i) => Math.abs(h * (e1 * k1[i] + e3 * k3[i] + e4 * k4[i] + e5 * k5[i] + e6 * k6[i] + e7 * k7[i])))
    const errNorm = Math.max(...err.map(Math.abs)) || 1e-10

    return { yNext, errNorm }
  }

  function _addVec (a, b) {
    return a.map((v, i) => v + b[i])
  }

  function _scaleVec (v, s) {
    return v.map(x => x * s)
  }

  function _solveRK4 (f, tSpan, y0, options) {
    const t0 = tSpan[0]
    const tf = tSpan[tSpan.length - 1]
    const nSteps = options.nSteps || 1000
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

  function _solveRK45 (f, tSpan, y0, options) {
    const t0 = tSpan[0]
    const tf = tSpan[tSpan.length - 1]
    const tol = options.tol || 1e-6
    const maxStep = options.maxStep || (tf - t0)
    const minStep = options.minStep || 1e-12
    const maxIter = options.maxIter || 100000

    let h = (tf - t0) / 100
    let tCur = t0
    let yCur = y0.slice()

    const tArr = [t0]
    const yArr = [y0.slice()]
    let iter = 0

    while (tCur < tf) {
      if (tCur + h > tf) h = tf - tCur

      const { yNext, errNorm } = _rk45Step(f, tCur, yCur, h)

      if (errNorm <= tol) {
        tCur += h
        yCur = yNext
        tArr.push(tCur)
        yArr.push(yCur.slice())
      }

      const scale = 0.9 * Math.pow(tol / errNorm, 1 / 5)
      h = h * Math.min(5, Math.max(0.2, scale))
      h = Math.min(h, maxStep)
      h = Math.max(h, minStep)

      iter++
      if (iter > maxIter) {
        throw new Error('solveODESystem: maximum iterations reached')
      }
    }

    return { t: tArr, y: yArr }
  }

  function _solve (f, tSpan, y0, options) {
    if (!Array.isArray(tSpan) || tSpan.length < 2) {
      throw new Error('solveODESystem: tSpan must be an array [t0, tf]')
    }
    if (!Array.isArray(y0) || y0.length === 0) {
      throw new Error('solveODESystem: y0 must be a non-empty array')
    }
    if (typeof f !== 'function') {
      throw new Error('solveODESystem: f must be a function')
    }

    const method = (options.method || 'RK45').toUpperCase()

    if (method === 'RK4') {
      return _solveRK4(f, tSpan, y0, options)
    } else if (method === 'RK45') {
      return _solveRK45(f, tSpan, y0, options)
    } else {
      throw new Error(`solveODESystem: unknown method "${method}". Use "RK4" or "RK45"`)
    }
  }

  return typed(name, {
    'function, Array, Array': (f, tSpan, y0) => _solve(f, tSpan, y0, {}),
    'function, Array, Array, Object': (f, tSpan, y0, options) => _solve(f, tSpan, y0, options)
  })
})
