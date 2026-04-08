import { factory } from '../../utils/factory.js'

const name = 'solvePDE'
const dependencies = ['typed']

export const createSolvePDE = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Solve a 1D PDE using the method of lines.
   *
   * Discretizes the spatial domain into a grid, then solves the resulting
   * system of ODEs in time using RK4. Supports heat equation, wave equation,
   * and advection equation patterns via the user-supplied function f.
   *
   * The spatial function f receives (t, u, x, dx) where:
   *   - t: current time
   *   - u: array of u values at grid points
   *   - x: array of spatial grid points
   *   - dx: spatial step size
   * and should return du/dt at each interior point.
   *
   * Boundary conditions are applied by the f function (f should return 0 at boundaries).
   *
   * Syntax:
   *
   *     math.solvePDE(f, xSpan, tSpan, u0)
   *     math.solvePDE(f, xSpan, tSpan, u0, options)
   *
   * Examples:
   *
   *     u0(x) = sin(pi * x)
   *     f(t, u, x, dx) = map(range(0, size(u)[0]), i => i == 0 or i == size(u)[0]-1 ? 0 : (u[i+1] - 2*u[i] + u[i-1]) / (dx^2))
   *     math.solvePDE(f, [0, 1], [0, 0.1], u0)
   *
   * See also:
   *
   *     solveODE, solveODESystem, odeAdaptiveStep
   *
   * @param {function} f        PDE function f(t, u, x, dx) -> array of du/dt
   * @param {Array}    xSpan    [x0, xf]
   * @param {Array}    tSpan    [t0, tf]
   * @param {function|Array} u0 Initial condition: function u0(x) or array of values
   * @param {Object}   [options] Optional: {nx, nt, nSteps}
   * @return {Object}  {x: number[], t: number[], u: number[][]}
   */

  function _addVec (a, b) {
    return a.map((v, i) => v + b[i])
  }

  function _scaleVec (v, s) {
    return v.map(x => x * s)
  }

  function _rk4Step (f, t, u, h, x, dx) {
    const k1 = f(t, u, x, dx)
    const k2 = f(t + h / 2, _addVec(u, _scaleVec(k1, h / 2)), x, dx)
    const k3 = f(t + h / 2, _addVec(u, _scaleVec(k2, h / 2)), x, dx)
    const k4 = f(t + h, _addVec(u, _scaleVec(k3, h)), x, dx)
    const du = u.map((_, i) => (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
    return _addVec(u, du)
  }

  function _solvePDE (f, xSpan, tSpan, u0, options) {
    const x0 = xSpan[0]
    const xf = xSpan[1]
    const t0 = tSpan[0]
    const tf = tSpan[1]
    const nx = options.nx || 50
    const nSteps = options.nSteps || (options.nt || 100)

    const dx = (xf - x0) / (nx - 1)
    const dt = (tf - t0) / nSteps

    // Build spatial grid
    const x = []
    for (let i = 0; i < nx; i++) {
      x.push(x0 + i * dx)
    }

    // Initialize u from function or array
    let uCur
    if (typeof u0 === 'function') {
      uCur = x.map(xi => u0(xi))
    } else if (Array.isArray(u0)) {
      if (u0.length !== nx) {
        throw new Error(`solvePDE: u0 array length (${u0.length}) must match nx (${nx})`)
      }
      uCur = u0.slice()
    } else {
      throw new Error('solvePDE: u0 must be a function or array')
    }

    const tArr = [t0]
    const uArr = [uCur.slice()]
    let tCur = t0

    for (let step = 0; step < nSteps; step++) {
      uCur = _rk4Step(f, tCur, uCur, dt, x, dx)
      tCur = t0 + (step + 1) * dt
      tArr.push(tCur)
      uArr.push(uCur.slice())
    }

    return { x, t: tArr, u: uArr }
  }

  return typed(name, {
    'function, Array, Array, function': (f, xSpan, tSpan, u0) =>
      _solvePDE(f, xSpan, tSpan, u0, {}),
    'function, Array, Array, function, Object': (f, xSpan, tSpan, u0, options) =>
      _solvePDE(f, xSpan, tSpan, u0, options),
    'function, Array, Array, Array': (f, xSpan, tSpan, u0) =>
      _solvePDE(f, xSpan, tSpan, u0, {}),
    'function, Array, Array, Array, Object': (f, xSpan, tSpan, u0, options) =>
      _solvePDE(f, xSpan, tSpan, u0, options)
  })
})
