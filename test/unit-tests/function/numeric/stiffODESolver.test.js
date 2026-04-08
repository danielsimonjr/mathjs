import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as allFactories from '../../../../src/factoriesAny.js'

const math = create(allFactories)

describe('stiffODESolver', function () {
  describe('basic structure', function () {
    it('should return object with t and y arrays', function () {
      const f = (t, y) => [-10 * y[0]]
      const result = math.stiffODESolver(f, [0, 1], [1])
      assert.ok(result.t)
      assert.ok(result.y)
      assert.ok(Array.isArray(result.t))
      assert.ok(Array.isArray(result.y))
    })

    it('should start at t0 with y0', function () {
      const f = (t, y) => [-10 * y[0]]
      const result = math.stiffODESolver(f, [0, 1], [1])
      assert.strictEqual(result.t[0], 0)
      assert.strictEqual(result.y[0][0], 1)
    })

    it('should end at tf', function () {
      const f = (t, y) => [-10 * y[0]]
      const result = math.stiffODESolver(f, [0, 1], [1])
      const lastT = result.t[result.t.length - 1]
      assert.ok(Math.abs(lastT - 1) < 1e-10)
    })
  })

  describe('stiff exponential decay y\'=-1000*y', function () {
    // y = exp(-1000*t), very stiff: explicit methods need h < 0.002
    const f = (t, y) => [-1000 * y[0]]
    const y0 = [1]

    it('should solve stiff ODE with BDF1 without excessively many steps', function () {
      // With explicit methods, you'd need ~50000 steps for t in [0,0.1]
      // BDF1 with nSteps=100 should be sufficient
      const result = math.stiffODESolver(f, [0, 0.01], y0, { order: 1, nSteps: 100 })
      assert.ok(result.t.length <= 200, `should not need too many steps, got ${result.t.length}`)

      const yFinal = result.y[result.y.length - 1]
      const expected = Math.exp(-1000 * 0.01) // exp(-10)
      assert.ok(
        Math.abs(yFinal[0] - expected) < 0.001,
        `y(0.01) should be ~${expected.toExponential(3)}, got ${yFinal[0].toExponential(3)}`
      )
    })

    it('should solve with BDF2 and be more accurate', function () {
      const result = math.stiffODESolver(f, [0, 0.01], y0, { order: 2, nSteps: 100 })
      const yFinal = result.y[result.y.length - 1]
      const expected = Math.exp(-1000 * 0.01)
      assert.ok(
        Math.abs(yFinal[0] - expected) < 0.001,
        `y(0.01) BDF2 should be ~${expected.toExponential(3)}, got ${yFinal[0].toExponential(3)}`
      )
    })
  })

  describe('Robertson chemical kinetics (classic stiff test)', function () {
    // y1' = -0.04*y1 + 1e4*y2*y3
    // y2' =  0.04*y1 - 1e4*y2*y3 - 3e7*y2^2
    // y3' =  3e7*y2^2
    const robertson = (t, y) => [
      -0.04 * y[0] + 1e4 * y[1] * y[2],
      0.04 * y[0] - 1e4 * y[1] * y[2] - 3e7 * y[1] * y[1],
      3e7 * y[1] * y[1]
    ]
    const y0 = [1, 0, 0]

    it('should conserve mass (y1+y2+y3 ≈ 1)', function () {
      const result = math.stiffODESolver(robertson, [0, 1e-4], y0, {
        order: 1,
        nSteps: 200,
        tol: 1e-6
      })
      // Check conservation at final time
      const yFinal = result.y[result.y.length - 1]
      const sum = yFinal[0] + yFinal[1] + yFinal[2]
      assert.ok(
        Math.abs(sum - 1) < 0.01,
        `mass conservation: y1+y2+y3 = ${sum}, expected ~1`
      )
    })
  })

  describe('two-dimensional stiff system', function () {
    // y1' = -100*y1 + 99*y2
    // y2' = -y2
    // Exact: y2(t)=exp(-t), y1(t)=(y1_0 - y2_0)*exp(-100t) + y2_0*exp(-t)
    const f = (t, y) => [-100 * y[0] + 99 * y[1], -y[1]]

    it('should track the slow mode correctly', function () {
      const y0 = [1, 1]
      // At t=0.1, y2≈exp(-0.1)≈0.905, fast mode decays quickly
      const result = math.stiffODESolver(f, [0, 0.1], y0, { order: 2, nSteps: 500 })
      const yFinal = result.y[result.y.length - 1]
      const y2expected = Math.exp(-0.1)
      assert.ok(
        Math.abs(yFinal[1] - y2expected) < 0.01,
        `y2(0.1) should be ~${y2expected.toFixed(4)}, got ${yFinal[1].toFixed(4)}`
      )
    })
  })

  describe('input validation', function () {
    it('should throw on invalid tSpan', function () {
      assert.throws(
        () => math.stiffODESolver(t => [t], [0], [1]),
        /tSpan/
      )
    })

    it('should throw on empty y0', function () {
      assert.throws(
        () => math.stiffODESolver(t => [], [0, 1], []),
        /y0/
      )
    })

    it('should throw on invalid order', function () {
      assert.throws(
        () => math.stiffODESolver(t => [t], [0, 1], [0], { order: 3 }),
        /order/
      )
    })
  })
})
