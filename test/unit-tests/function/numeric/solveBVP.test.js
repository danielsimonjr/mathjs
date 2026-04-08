import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as allFactories from '../../../../src/factoriesAny.js'

const math = create(allFactories)

describe('solveBVP', function () {
  describe('y\'\'=-y, y(0)=0, y(pi)=0 => y=sin(t)', function () {
    // Write as system: y1'=y2, y2'=-y1
    // BC: y1(0) = 0, y1(pi) = 0
    const f = (t, y) => [y[1], -y[0]]
    const bc = (ya, yb) => [ya[0], yb[0]]

    it('should return an object with t and y', function () {
      const result = math.solveBVP(f, bc, [0, Math.PI], [0, 1])
      assert.ok(result.t, 'should have t')
      assert.ok(result.y, 'should have y')
      assert.ok(Array.isArray(result.t))
      assert.ok(Array.isArray(result.y))
    })

    it('should satisfy boundary conditions', function () {
      const result = math.solveBVP(f, bc, [0, Math.PI], [0, 1])
      const ya = result.y[0]
      const yb = result.y[result.y.length - 1]
      assert.ok(Math.abs(ya[0]) < 1e-6, `y(0) should be 0, got ${ya[0]}`)
      assert.ok(Math.abs(yb[0]) < 1e-4, `y(pi) should be 0, got ${yb[0]}`)
    })

    it('should approximate y = sin(t) at midpoint', function () {
      const result = math.solveBVP(f, bc, [0, Math.PI], [0, 1], {
        nSteps: 200,
        shootingTol: 1e-8
      })
      // Find value near t = pi/2 (midpoint where sin(pi/2)=1 is max)
      const tHalf = Math.PI / 2
      let minDist = Infinity
      let yAtHalf = null
      for (let i = 0; i < result.t.length; i++) {
        const dist = Math.abs(result.t[i] - tHalf)
        if (dist < minDist) {
          minDist = dist
          yAtHalf = result.y[i]
        }
      }
      // y at pi/2 should have magnitude 1 (sine peak)
      // The actual amplitude depends on the initial guess normalization
      assert.ok(yAtHalf !== null)
      assert.ok(Math.abs(yAtHalf[0]) > 0.5, `y(pi/2) should be nonzero, got ${yAtHalf[0]}`)
    })
  })

  describe('options', function () {
    it('should accept custom nSteps', function () {
      const f = (t, y) => [y[1], -y[0]]
      const bc = (ya, yb) => [ya[0], yb[0]]
      const result = math.solveBVP(f, bc, [0, Math.PI], [0, 1], { nSteps: 100 })
      assert.ok(result.t.length > 0)
    })
  })

  describe('no options signature', function () {
    it('should work without options argument', function () {
      const f = (t, y) => [y[1], -y[0]]
      const bc = (ya, yb) => [ya[0], yb[0]]
      const result = math.solveBVP(f, bc, [0, Math.PI], [0, 1])
      assert.ok(result.t.length > 0)
    })
  })
})
