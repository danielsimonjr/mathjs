import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('powerfit', function () {
  it('should fit y = x^2 with a~1, b~2', function () {
    const result = math.powerfit([1, 2, 3, 4], [1, 4, 9, 16])
    assert(Math.abs(result.a - 1) < 1e-9, 'a should be ~1')
    assert(Math.abs(result.b - 2) < 1e-9, 'b should be ~2')
  })

  it('should fit y = 3*x^0.5', function () {
    const xs = [1, 4, 9, 16]
    const ys = xs.map(x => 3 * Math.sqrt(x))
    const result = math.powerfit(xs, ys)
    assert(Math.abs(result.a - 3) < 1e-9, 'a should be ~3')
    assert(Math.abs(result.b - 0.5) < 1e-9, 'b should be ~0.5')
  })

  it('should return a predict function', function () {
    const result = math.powerfit([1, 2, 3, 4], [1, 4, 9, 16])
    assert.strictEqual(typeof result.predict, 'function')
    assert(Math.abs(result.predict(1) - 1) < 1e-9)
    assert(Math.abs(result.predict(2) - 4) < 1e-9)
    assert(Math.abs(result.predict(3) - 9) < 1e-9)
  })

  it('should throw if x contains non-positive values', function () {
    assert.throws(() => math.powerfit([0, 1, 2], [1, 2, 4]), /strictly positive/)
    assert.throws(() => math.powerfit([-1, 1, 2], [1, 2, 4]), /strictly positive/)
  })

  it('should throw if y contains non-positive values', function () {
    assert.throws(() => math.powerfit([1, 2, 3], [1, 0, 4]), /strictly positive/)
  })

  it('should throw if x and y have different lengths', function () {
    assert.throws(() => math.powerfit([1, 2], [1, 2, 3]), /same length/)
  })

  it('should throw if fewer than 2 data points', function () {
    assert.throws(() => math.powerfit([1], [1]), /at least 2/)
  })
})
