import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('expfit', function () {
  it('should fit y = exp(x) with a~1, b~1', function () {
    // e^0=1, e^1≈2.71828, e^2≈7.38906
    const result = math.expfit([0, 1, 2], [1, Math.E, Math.E * Math.E])
    assert(Math.abs(result.a - 1) < 1e-9, 'a should be ~1')
    assert(Math.abs(result.b - 1) < 1e-9, 'b should be ~1')
  })

  it('should fit y = 2*exp(0.5*x)', function () {
    const xs = [0, 1, 2, 3, 4]
    const ys = xs.map(x => 2 * Math.exp(0.5 * x))
    const result = math.expfit(xs, ys)
    assert(Math.abs(result.a - 2) < 1e-9, 'a should be ~2')
    assert(Math.abs(result.b - 0.5) < 1e-9, 'b should be ~0.5')
  })

  it('should return a predict function', function () {
    const result = math.expfit([0, 1, 2], [1, Math.E, Math.E * Math.E])
    assert.strictEqual(typeof result.predict, 'function')
    assert(Math.abs(result.predict(0) - 1) < 1e-9)
    assert(Math.abs(result.predict(1) - Math.E) < 1e-9)
  })

  it('should throw if y contains non-positive values', function () {
    assert.throws(() => math.expfit([0, 1, 2], [1, 0, 4]), /strictly positive/)
    assert.throws(() => math.expfit([0, 1, 2], [1, -2, 4]), /strictly positive/)
  })

  it('should throw if x and y have different lengths', function () {
    assert.throws(() => math.expfit([0, 1], [1, 2, 3]), /same length/)
  })

  it('should throw if fewer than 2 data points', function () {
    assert.throws(() => math.expfit([1], [2]), /at least 2/)
  })
})
