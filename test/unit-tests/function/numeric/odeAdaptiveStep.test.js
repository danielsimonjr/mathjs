import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as allFactories from '../../../../src/factoriesAny.js'

const math = create(allFactories)

describe('odeAdaptiveStep', function () {
  describe('scalar ODE y\'=y => y=exp(t)', function () {
    const f = (t, y) => y
    const tSpan = [0, 2]
    const y0 = 1 // scalar

    it('should return object with t and y', function () {
      const result = math.odeAdaptiveStep(f, tSpan, y0)
      assert.ok(result.t)
      assert.ok(result.y)
    })

    it('should start at t0=0 with y0=1', function () {
      const result = math.odeAdaptiveStep(f, tSpan, y0)
      assert.strictEqual(result.t[0], 0)
    })

    it('should end at tf=2', function () {
      const result = math.odeAdaptiveStep(f, tSpan, y0)
      const lastT = result.t[result.t.length - 1]
      assert.ok(Math.abs(lastT - 2) < 1e-10)
    })
  })

  describe('harmonic oscillator as system', function () {
    // y1'=y2, y2'=-y1, y0=[1,0] => y1(t)=cos(t)
    const f = (t, y) => [y[1], -y[0]]

    it('should solve accurately with tight tolerance', function () {
      const result = math.odeAdaptiveStep(f, [0, Math.PI], [1, 0], { tol: 1e-8 })
      const yFinal = result.y[result.y.length - 1]
      // y1(pi) = -1
      assert.ok(Math.abs(yFinal[0] - (-1)) < 1e-5,
        `y1(pi) should be ~-1, got ${yFinal[0]}`)
    })

    it('should use fewer steps with loose tolerance', function () {
      const looseTol = math.odeAdaptiveStep(f, [0, Math.PI], [1, 0], { tol: 1e-3 })
      const tightTol = math.odeAdaptiveStep(f, [0, Math.PI], [1, 0], { tol: 1e-8 })
      assert.ok(
        looseTol.t.length < tightTol.t.length,
        'loose tolerance should take fewer steps'
      )
    })
  })

  describe('exponential growth y\'=2t => y=t^2+1', function () {
    // f returns array matching y0 array
    const f = (t, y) => [2 * t]
    const y0 = [1]

    it('should approximate y=t^2+1 at t=3', function () {
      const result = math.odeAdaptiveStep(f, [0, 3], y0, { tol: 1e-6 })
      const yFinal = result.y[result.y.length - 1]
      // y(3) = 9 + 1 = 10
      assert.ok(Math.abs(yFinal[0] - 10) < 0.01, `y(3) should be ~10, got ${yFinal[0]}`)
    })
  })

  describe('step size control', function () {
    it('should respect maxStep option', function () {
      const f = (t, y) => [y[1], -y[0]]
      const result = math.odeAdaptiveStep(f, [0, 1], [1, 0], { maxStep: 0.05 })
      // With maxStep=0.05 and tSpan=[0,1], we need at least 20 steps
      assert.ok(result.t.length >= 20, `should have >=20 steps with maxStep=0.05, got ${result.t.length}`)
    })
  })

  describe('input validation', function () {
    it('should throw on invalid tSpan', function () {
      assert.throws(() => math.odeAdaptiveStep(t => t, [0], [1]), /tSpan/)
    })
  })
})
