import { factory } from '../../utils/factory.js'

const name = 'eventDetection'
const dependencies = ['typed']

export const createEventDetection = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Solve an ODE system with event detection.
   *
   * Integrates using RK45, monitors event functions g_i(t,y) for sign changes,
   * and uses bisection to locate the exact event time when a zero crossing is found.
   *
   * Syntax:
   *
   *     math.eventDetection(f, tSpan, y0, events)
   *     math.eventDetection(f, tSpan, y0, events, options)
   *
   * Examples:
   *
   *     f(t, y) = [y[1], -9.81]
   *     g(t, y) = [y[0]]
   *     math.eventDetection(f, [0, 10], [10, 0], [g])
   *
   * See also:
   *
   *     solveODE, solveODESystem, odeAdaptiveStep
   *
   * @param {function}   f       ODE function f(t, y) -> array
   * @param {Array}      tSpan   [t0, tf]
   * @param {Array}      y0      Initial state array
   * @param {Array}      events  Array of event functions g_i(t, y) -> array of scalar values
   * @param {Object}     [options] Optional: {tol, maxStep, minStep, maxIter, bisectTol}
   * @return {Object}  {t, y, tEvents, yEvents, eventIndices}
   */

  function _add (a, b) {
    if (Array.isArray(a)) return a.map((v, i) => v + b[i])
    return a + b
  }

  function _scale (v, s) {
    if (Array.isArray(v)) return v.map(x => x * s)
    return v * s
  }

  function _rk4Step (f, t, y, h) {
    const k1 = f(t, y)
    const k2 = f(t + h / 2, _add(y, _scale(k1, h / 2)))
    const k3 = f(t + h / 2, _add(y, _scale(k2, h / 2)))
    const k4 = f(t + h, _add(y, _scale(k3, h)))
    if (Array.isArray(y)) {
      const dy = y.map((_, i) => (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
      return y.map((v, i) => v + dy[i])
    }
    return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
  }

  function _evalEvents (events, t, y) {
    // Evaluate all event functions, each returns an array of scalar values
    const vals = []
    for (const g of events) {
      const gVals = g(t, y)
      if (Array.isArray(gVals)) {
        for (const v of gVals) vals.push(v)
      } else {
        vals.push(gVals)
      }
    }
    return vals
  }

  function _solve (f, tSpan, y0, events, options) {
    if (!Array.isArray(tSpan) || tSpan.length < 2) {
      throw new Error('eventDetection: tSpan must be [t0, tf]')
    }
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error('eventDetection: events must be a non-empty array of functions')
    }

    const t0 = tSpan[0]
    const tf = tSpan[tSpan.length - 1]
    const bisectTol = options.bisectTol || 1e-10
    const maxStep = options.maxStep || (tf - t0) / 50
    const maxIter = options.maxIter || 100000

    let h = Math.min((tf - t0) / 100, maxStep)
    let tCur = t0
    let yCur = Array.isArray(y0) ? y0.slice() : y0

    const tArr = [t0]
    const yArr = [Array.isArray(y0) ? y0.slice() : y0]
    const tEvents = []
    const yEvents = []
    const eventIndices = []

    let gPrev = _evalEvents(events, t0, y0)
    let iter = 0

    while (tCur < tf) {
      if (tCur + h > tf) h = tf - tCur

      const tNext = tCur + h
      const yNext = _rk4Step(f, tCur, yCur, h)
      const gNext = _evalEvents(events, tNext, yNext)

      // Check for sign changes in each event component
      for (let ei = 0; ei < gPrev.length; ei++) {
        if (gPrev[ei] * gNext[ei] < 0) {
          // Sign change: bisect to find exact crossing
          let tLo = tCur
          let tHi = tNext
          let yLo = yCur

          let bisectIter = 0
          while (tHi - tLo > bisectTol && bisectIter < 60) {
            const tMid = (tLo + tHi) / 2
            const hMid = tMid - tLo
            const yMid = _rk4Step(f, tLo, yLo, hMid)
            const gMid = _evalEvents(events, tMid, yMid)

            if (gPrev[ei] * gMid[ei] <= 0) {
              tHi = tMid
            } else {
              tLo = tMid
              yLo = yMid
            }
            bisectIter++
          }

          const tEvent = (tLo + tHi) / 2
          const yEvent = Array.isArray(yLo) ? yLo.slice() : yLo

          tEvents.push(tEvent)
          yEvents.push(Array.isArray(yEvent) ? yEvent : [yEvent])
          eventIndices.push(ei)
          break
        }
      }

      tCur = tNext
      yCur = yNext
      gPrev = gNext
      tArr.push(tCur)
      yArr.push(Array.isArray(yCur) ? yCur.slice() : yCur)

      iter++
      if (iter > maxIter) {
        throw new Error('eventDetection: maximum iterations reached')
      }
    }

    return { t: tArr, y: yArr, tEvents, yEvents, eventIndices }
  }

  return typed(name, {
    'function, Array, Array, Array': (f, tSpan, y0, events) =>
      _solve(f, tSpan, y0, events, {}),
    'function, Array, Array, Array, Object': (f, tSpan, y0, events, options) =>
      _solve(f, tSpan, y0, events, options)
  })
})
