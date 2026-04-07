import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('polyfit', function () {
  it('should fit a degree-2 polynomial (x^2)', function () {
    const c = math.polyfit([0, 1, 2, 3], [0, 1, 4, 9], 2)
    assert(Math.abs(c[0]) < 1e-9, 'c0 should be ~0')
    assert(Math.abs(c[1]) < 1e-9, 'c1 should be ~0')
    assert(Math.abs(c[2] - 1) < 1e-9, 'c2 should be ~1')
  })

  it('should fit a degree-1 polynomial (1 + x)', function () {
    const c = math.polyfit([0, 1, 2, 3], [1, 2, 3, 4], 1)
    assert(Math.abs(c[0] - 1) < 1e-9, 'c0 should be ~1')
    assert(Math.abs(c[1] - 1) < 1e-9, 'c1 should be ~1')
  })

  it('should fit a degree-0 polynomial (constant)', function () {
    const c = math.polyfit([0, 1, 2, 3], [5, 5, 5, 5], 0)
    assert.strictEqual(c.length, 1)
    assert(Math.abs(c[0] - 5) < 1e-9, 'c0 should be ~5')
  })

  it('should fit a degree-3 polynomial (x^3)', function () {
    const xs = [0, 1, 2, 3, 4]
    const ys = xs.map(x => x * x * x)
    const c = math.polyfit(xs, ys, 3)
    assert(Math.abs(c[0]) < 1e-6, 'c0 ~ 0')
    assert(Math.abs(c[1]) < 1e-6, 'c1 ~ 0')
    assert(Math.abs(c[2]) < 1e-6, 'c2 ~ 0')
    assert(Math.abs(c[3] - 1) < 1e-6, 'c3 ~ 1')
  })

  it('should return coefficients array of length degree+1', function () {
    const c = math.polyfit([0, 1, 2, 3, 4], [0, 1, 4, 9, 16], 2)
    assert.strictEqual(c.length, 3)
  })

  it('should throw if x and y have different lengths', function () {
    assert.throws(() => math.polyfit([0, 1], [0, 1, 2], 1), /same length/)
  })

  it('should throw if not enough data points for the degree', function () {
    assert.throws(() => math.polyfit([0, 1], [0, 1], 3), /not enough data/)
  })
})
