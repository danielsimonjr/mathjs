import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as allFactories from '../../../../src/factoriesAny.js'

const math = create(allFactories)

describe('solveODESystem', function () {
  describe('harmonic oscillator y\'\'=-y as 2 first-order ODEs', function () {
    // y1' = y2, y2' = -y1  =>  y1(t)=cos(t), y2(t)=-sin(t)  for y0=[1,0]
    const f = (t, y) => [y[1], -y[0]]
    const tSpan = [0, 2 * Math.PI]
    const y0 = [1, 0]

    it('should return an object with t and y arrays', function () {
      const result = math.solveODESystem(f, tSpan, y0)
      assert.ok(result.t, 'result should have t')
      assert.ok(result.y, 'result should have y')
      assert.ok(Array.isArray(result.t), 't should be an array')
      assert.ok(Array.isArray(result.y), 'y should be an array')
    })

    it('should start at t0 with y0', function () {
      const result = math.solveODESystem(f, tSpan, y0)
      assert.strictEqual(result.t[0], 0)
      assert.strictEqual(result.y[0][0], 1)
      assert.strictEqual(result.y[0][1], 0)
    })

    it('should end at tf', function () {
      const result = math.solveODESystem(f, tSpan, y0)
      const tf = result.t[result.t.length - 1]
      assert.ok(Math.abs(tf - 2 * Math.PI) < 1e-10, `tf should be 2*pi, got ${tf}`)
    })

    it('should solve harmonic oscillator with RK45 to tolerance 1e-4', function () {
      const result = math.solveODESystem(f, tSpan, y0, { method: 'RK45', tol: 1e-6 })
      const yFinal = result.y[result.y.length - 1]
      // y1(2*pi) = 1, y2(2*pi) = 0
      assert.ok(Math.abs(yFinal[0] - 1) < 1e-3, `y1(2*pi) should be ~1, got ${yFinal[0]}`)
      assert.ok(Math.abs(yFinal[1] - 0) < 1e-3, `y2(2*pi) should be ~0, got ${yFinal[1]}`)
    })

    it('should solve with RK4 method', function () {
      const result = math.solveODESystem(f, [0, Math.PI], y0, { method: 'RK4', nSteps: 2000 })
      const yFinal = result.y[result.y.length - 1]
      // y1(pi) = -1, y2(pi) = 0
      assert.ok(Math.abs(yFinal[0] - (-1)) < 0.01, `y1(pi) should be ~-1, got ${yFinal[0]}`)
    })
  })

  describe('Lotka-Volterra system', function () {
    // Predator-prey: x'=a*x-b*x*y, y'=-c*y+d*x*y
    const a = 1.5
    const b = 1.0
    const c = 3.0
    const d = 1.0
    const lv = (t, y) => [
      a * y[0] - b * y[0] * y[1],
      -c * y[1] + d * y[0] * y[1]
    ]

    it('should solve Lotka-Volterra and return positive populations', function () {
      const result = math.solveODESystem(lv, [0, 5], [10, 5], { method: 'RK45', tol: 1e-6 })
      // Populations should remain positive
      for (const y of result.y) {
        assert.ok(y[0] > 0, `prey population should stay positive, got ${y[0]}`)
        assert.ok(y[1] > 0, `predator population should stay positive, got ${y[1]}`)
      }
    })
  })

  describe('input validation', function () {
    it('should throw on invalid tSpan', function () {
      assert.throws(() => math.solveODESystem(t => [t], [0], [1]), /tSpan/)
    })

    it('should throw on invalid y0', function () {
      assert.throws(() => math.solveODESystem(t => [t], [0, 1], []), /y0/)
    })

    it('should throw on unknown method', function () {
      assert.throws(
        () => math.solveODESystem(t => [t], [0, 1], [0], { method: 'UNKNOWN' }),
        /method/
      )
    })
  })

  describe('default options', function () {
    it('should work without options argument', function () {
      const f = (t, y) => [y[1], -y[0]]
      const result = math.solveODESystem(f, [0, 1], [1, 0])
      assert.ok(result.t.length > 1)
    })
  })
})
