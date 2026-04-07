import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('logfit', function () {
  it('should fit y = ln(x) with a~0, b~1', function () {
    // y = 0 + 1*ln(x) → points: (1,0),(e,1),(e^2,2)
    const xs = [1, Math.E, Math.E * Math.E, Math.E * Math.E * Math.E]
    const ys = [0, 1, 2, 3]
    const result = math.logfit(xs, ys)
    assert(Math.abs(result.a) < 1e-9, 'a should be ~0')
    assert(Math.abs(result.b - 1) < 1e-9, 'b should be ~1')
  })

  it('should fit y = 2 + 3*ln(x)', function () {
    const xs = [1, 2, 4, 8]
    const ys = xs.map(x => 2 + 3 * Math.log(x))
    const result = math.logfit(xs, ys)
    assert(Math.abs(result.a - 2) < 1e-9, 'a should be ~2')
    assert(Math.abs(result.b - 3) < 1e-9, 'b should be ~3')
  })

  it('should return a predict function', function () {
    const xs = [1, Math.E, Math.E * Math.E]
    const ys = [0, 1, 2]
    const result = math.logfit(xs, ys)
    assert.strictEqual(typeof result.predict, 'function')
    assert(Math.abs(result.predict(1) - 0) < 1e-9)
    assert(Math.abs(result.predict(Math.E) - 1) < 1e-9)
  })

  it('should throw if x contains non-positive values', function () {
    assert.throws(() => math.logfit([0, 1, 2], [1, 2, 3]), /strictly positive/)
    assert.throws(() => math.logfit([-1, 1, 2], [1, 2, 3]), /strictly positive/)
  })

  it('should throw if x and y have different lengths', function () {
    assert.throws(() => math.logfit([1, 2], [1, 2, 3]), /same length/)
  })

  it('should throw if fewer than 2 data points', function () {
    assert.throws(() => math.logfit([1], [1]), /at least 2/)
  })
})
