import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { createPchip } from '../../../../src/function/numeric/pchip.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...all, createPchip })

describe('pchip', function () {
  it('should return an object with an evaluate method', function () {
    const p = math.pchip([0, 1, 2], [0, 1, 0])
    assert.strictEqual(typeof p.evaluate, 'function')
  })

  it('should exactly reproduce data points', function () {
    const xs = [0, 1, 2, 3]
    const ys = [0, 1, 0, 1]
    const p = math.pchip(xs, ys)
    for (let i = 0; i < xs.length; i++) {
      assert(Math.abs(p.evaluate(xs[i]) - ys[i]) < 1e-10, 'should match y[' + i + ']')
    }
  })

  it('should preserve monotonicity on a monotone dataset', function () {
    // Monotone increasing data — PCHIP must stay monotone between points
    const p = math.pchip([0, 1, 2, 3], [0, 1, 2, 3])
    const v0 = p.evaluate(0.5)
    const v1 = p.evaluate(1.5)
    const v2 = p.evaluate(2.5)
    assert(v0 > 0 && v0 < 1, 'value at 0.5 should be between 0 and 1')
    assert(v1 > 1 && v1 < 2, 'value at 1.5 should be between 1 and 2')
    assert(v2 > 2 && v2 < 3, 'value at 2.5 should be between 2 and 3')
  })

  it('should interpolate a linear function exactly', function () {
    const p = math.pchip([0, 1, 2, 3], [0, 2, 4, 6])
    assert(Math.abs(p.evaluate(0.5) - 1) < 1e-9, 'linear function at 0.5')
    assert(Math.abs(p.evaluate(1.5) - 3) < 1e-9, 'linear function at 1.5')
    assert(Math.abs(p.evaluate(2.5) - 5) < 1e-9, 'linear function at 2.5')
  })

  it('should not overshoot on step-like data (monotonicity preservation)', function () {
    // Classic PCHIP test: step-like data where cubic spline oscillates
    const p = math.pchip([0, 1, 2, 3, 4], [0, 0, 1, 1, 1])
    // Values must stay within [0, 1]
    for (let t = 0; t <= 4; t += 0.1) {
      const v = p.evaluate(t)
      assert(v >= -1e-10 && v <= 1 + 1e-10, 'value at t=' + t + ' should be in [0,1], got ' + v)
    }
  })

  it('should handle two points (linear interpolation)', function () {
    const p = math.pchip([0, 1], [0, 1])
    assert(Math.abs(p.evaluate(0.5) - 0.5) < 1e-9)
  })

  it('should throw for t outside range', function () {
    const p = math.pchip([0, 1, 2], [0, 1, 0])
    assert.throws(() => p.evaluate(-0.1), /outside the range/)
    assert.throws(() => p.evaluate(2.1), /outside the range/)
  })

  it('should throw if x and y have different lengths', function () {
    assert.throws(() => math.pchip([0, 1], [0, 1, 2]), /same length/)
  })

  it('should throw if fewer than 2 points', function () {
    assert.throws(() => math.pchip([0], [1]), /at least 2/)
  })

  it('should throw if x is not strictly increasing', function () {
    assert.throws(() => math.pchip([0, 2, 1], [0, 1, 2]), /strictly increasing/)
  })

  it('should handle flat data without oscillation', function () {
    const p = math.pchip([0, 1, 2, 3], [5, 5, 5, 5])
    assert(Math.abs(p.evaluate(0.5) - 5) < 1e-9)
    assert(Math.abs(p.evaluate(1.5) - 5) < 1e-9)
  })
})
