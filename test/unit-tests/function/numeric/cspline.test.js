import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('cspline', function () {
  it('should return an object with evaluate and coefficients', function () {
    const s = math.cspline([0, 1, 2], [0, 1, 0])
    assert.strictEqual(typeof s.evaluate, 'function')
    assert(Array.isArray(s.coefficients))
  })

  it('should exactly reproduce data points', function () {
    const xs = [0, 1, 2, 3]
    const ys = [0, 1, 4, 9]
    const s = math.cspline(xs, ys)
    for (let i = 0; i < xs.length; i++) {
      assert(Math.abs(s.evaluate(xs[i]) - ys[i]) < 1e-9, 'should match y[' + i + ']')
    }
  })

  it('should produce smooth values between data points', function () {
    const s = math.cspline([0, 1, 2], [0, 1, 0])
    const v = s.evaluate(0.5)
    assert(v > 0 && v < 1, 'evaluate(0.5) should be between 0 and 1, got ' + v)
  })

  it('should interpolate a linear function exactly', function () {
    const s = math.cspline([0, 1, 2, 3], [0, 1, 2, 3])
    assert(Math.abs(s.evaluate(0.5) - 0.5) < 1e-9)
    assert(Math.abs(s.evaluate(1.5) - 1.5) < 1e-9)
    assert(Math.abs(s.evaluate(2.5) - 2.5) < 1e-9)
  })

  it('should have n-1 coefficient segments', function () {
    const s = math.cspline([0, 1, 2, 3], [0, 1, 4, 9])
    assert.strictEqual(s.coefficients.length, 3)
  })

  it('should throw for t outside range', function () {
    const s = math.cspline([0, 1, 2], [0, 1, 0])
    assert.throws(() => s.evaluate(-0.1), /outside the range/)
    assert.throws(() => s.evaluate(2.1), /outside the range/)
  })

  it('should throw if x and y have different lengths', function () {
    assert.throws(() => math.cspline([0, 1], [0, 1, 2]), /same length/)
  })

  it('should throw if fewer than 2 points', function () {
    assert.throws(() => math.cspline([0], [1]), /at least 2/)
  })

  it('should throw if x values are not strictly increasing', function () {
    assert.throws(() => math.cspline([0, 2, 1], [0, 1, 2]), /strictly increasing/)
  })
})
