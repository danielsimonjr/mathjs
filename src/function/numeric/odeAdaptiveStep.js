import { factory } from '../../utils/factory.js'

const name = 'odeAdaptiveStep'
const dependencies = ['typed']

export const createOdeAdaptiveStep = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Solve an ODE system using adaptive step size control (Dormand-Prince RK45).
   *
   * Automatically adjusts step size to keep local error below the specified
   * tolerance. Uses the formula:
   *   h_new = h * min(5, max(0.2, 0.9 * (tol/err)^(1/5)))
   *
   * Syntax:
   *
   *     math.odeAdaptiveStep(f, tSpan, y0)
   *     math.odeAdaptiveStep(f, tSpan, y0, options)
   *
   * Examples:
   *
   *     f(t, y) = [y[1], -y[0]]
   *     math.odeAdaptiveStep(f, [0, 6.28], [1, 0])
   *     math.odeAdaptiveStep(f, [0, 6.28], [1, 0], {tol: 1e-8, maxStep: 0.1})
   *
   * See also:
   *
   *     solveODE, solveODESystem
   *
   * @param {function} f        ODE function f(t, y) -> array (or scalar)
   * @param {Array}    tSpan    [t0, tf]
   * @param {Array|number} y0   Initial values (array for system, number for scalar)
   * @param {Object}   [options] Optional: {tol, maxStep, minStep, maxIter}
   * @return {Object}  {t: number[], y: number[][]}
   */

  // Dormand-Prince RK45 Butcher tableau coefficients
  const DP_A21 = 1 / 5
  const DP_A31 = 3 / 40
  const DP_A32 = 9 / 40
  const DP_A41 = 44 / 45
  const DP_A42 = -56 / 15
  const DP_A43 = 32 / 9
  const DP_A51 = 19372 / 6561
  const DP_A52 = -25360 / 2187
  const DP_A53 = 64448 / 6561
  const DP_A54 = -212 / 729
  const DP_A61 = 9017 / 3168
  const DP_A62 = -355 / 33
  const DP_A63 = 46732 / 5247
  const DP_A64 = 49 / 176
  const DP_A65 = -5103 / 18656
  const DP_B1 = 35 / 384
  const DP_B3 = 500 / 1113
  const DP_B4 = 125 / 192
  const DP_B5 = -2187 / 6784
  const DP_B6 = 11 / 84
  // Error coefficients (difference between 5th and 4th order)
  const DP_E1 = 71 / 57600
  const DP_E3 = -71 / 16695
  const DP_E4 = 71 / 1920
  const DP_E5 = -17253 / 339200
  const DP_E6 = 22 / 525
  const DP_E7 = -1 / 40

  function _add (a, b) {
    if (Array.isArray(a)) return a.map((v, i) => v + b[i])
    return a + b
  }

  function _scale (v, s) {
    if (Array.isArray(v)) return v.map(x => x * s)
    return v * s
  }

  function _errNorm (e) {
    if (Array.isArray(e)) {
      const maxAbs = Math.max(...e.map(Math.abs))
      return maxAbs
    }
    return Math.abs(e)
  }

  function _dp45Step (f, t, y, h) {
    const k1 = f(t, y)
    const k2 = f(t + h / 5, _add(y, _scale(k1, DP_A21 * h)))
    const k3 = f(t + 3 * h / 10, _add(y, _add(_scale(k1, DP_A31 * h), _scale(k2, DP_A32 * h))))
    const k4 = f(t + 4 * h / 5, _add(y, _add(_add(_scale(k1, DP_A41 * h), _scale(k2, DP_A42 * h)), _scale(k3, DP_A43 * h))))
    const k5 = f(t + 8 * h / 9, _add(y, _add(_add(_add(_scale(k1, DP_A51 * h), _scale(k2, DP_A52 * h)), _scale(k3, DP_A53 * h)), _scale(k4, DP_A54 * h))))
    const k6 = f(t + h, _add(y, _add(_add(_add(_add(_scale(k1, DP_A61 * h), _scale(k2, DP_A62 * h)), _scale(k3, DP_A63 * h)), _scale(k4, DP_A64 * h)), _scale(k5, DP_A65 * h))))

    const yNext = _add(y, _add(_add(_add(_add(_scale(k1, DP_B1 * h), _scale(k3, DP_B3 * h)), _scale(k4, DP_B4 * h)), _scale(k5, DP_B5 * h)), _scale(k6, DP_B6 * h)))

    const k7 = f(t + h, yNext)

    // Error estimate
    const errVec = _add(_add(_add(_add(_add(_scale(k1, DP_E1 * h), _scale(k3, DP_E3 * h)), _scale(k4, DP_E4 * h)), _scale(k5, DP_E5 * h)), _scale(k6, DP_E6 * h)), _scale(k7, DP_E7 * h))
    const err = _errNorm(errVec)

    return { yNext, err }
  }

  function _solve (f, tSpan, y0, options) {
    if (!Array.isArray(tSpan) || tSpan.length < 2) {
      throw new Error('odeAdaptiveStep: tSpan must be an array [t0, tf]')
    }

    const t0 = tSpan[0]
    const tf = tSpan[tSpan.length - 1]
    const tol = options.tol || 1e-6
    const maxStep = options.maxStep !== undefined ? options.maxStep : (tf - t0)
    const minStep = options.minStep !== undefined ? options.minStep : 1e-12
    const maxIter = options.maxIter || 100000

    let h = Math.min((tf - t0) / 100, maxStep)
    let tCur = t0
    let yCur = Array.isArray(y0) ? y0.slice() : y0

    const tArr = [t0]
    const yArr = [Array.isArray(y0) ? y0.slice() : [y0]]
    let iter = 0

    while (tCur < tf) {
      if (tCur + h > tf) h = tf - tCur
      if (h < minStep) h = minStep

      const { yNext, err } = _dp45Step(f, tCur, yCur, h)
      const safeErr = Math.max(err, 1e-10)

      if (safeErr <= tol) {
        tCur += h
        yCur = yNext
        tArr.push(tCur)
        yArr.push(Array.isArray(yNext) ? yNext.slice() : [yNext])
      }

      const scale = 0.9 * Math.pow(tol / safeErr, 1 / 5)
      h = h * Math.min(5, Math.max(0.2, scale))
      h = Math.min(h, maxStep)
      h = Math.max(h, minStep)

      iter++
      if (iter > maxIter) {
        throw new Error('odeAdaptiveStep: maximum iterations reached. Try increasing tol or maxIter.')
      }
    }

    return { t: tArr, y: yArr }
  }

  return typed(name, {
    'function, Array, Array': (f, tSpan, y0) => _solve(f, tSpan, y0, {}),
    'function, Array, Array, Object': (f, tSpan, y0, options) => _solve(f, tSpan, y0, options),
    'function, Array, number': (f, tSpan, y0) => _solve(f, tSpan, y0, {}),
    'function, Array, number, Object': (f, tSpan, y0, options) => _solve(f, tSpan, y0, options)
  })
})
