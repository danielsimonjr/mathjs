import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('besselY', function () {
  it('should return -Infinity for x = 0', function () {
    assert.strictEqual(math.besselY(0, 0), -Infinity)
  })

  it('should compute Y_0(1) accurately', function () {
    assert(Math.abs(math.besselY(0, 1) - 0.08825696421567695) < 1e-7)
  })

  it('should compute Y_1(1) accurately', function () {
    assert(Math.abs(math.besselY(1, 1) - (-0.7812128213002889)) < 1e-9)
  })

  it('should compute Y_0(10) for large argument', function () {
    assert(Math.abs(math.besselY(0, 10) - 0.05567116728359939) < 1e-8)
  })

  it('should compute Y_1(10) for large argument', function () {
    assert(Math.abs(math.besselY(1, 10) - 0.24901542420695388) < 1e-8)
  })

  it('should compute Y_2(3) accurately', function () {
    // Y_2(3) ≈ -0.16040039348492366 (verified against scipy.special.yv)
    assert(Math.abs(math.besselY(2, 3) - (-0.16040039348492366)) < 1e-7)
  })

  it('should return NaN for negative x', function () {
    assert(isNaN(math.besselY(0, -1)))
  })

  it('should throw for non-integer order', function () {
    assert.throws(() => math.besselY(0.5, 1), /TypeError/)
  })

  it('should compute Y_n for higher orders using recurrence', function () {
    const y0 = math.besselY(0, 2)
    const y1 = math.besselY(1, 2)
    const y2computed = (2 / 2) * y1 - y0
    assert(Math.abs(math.besselY(2, 2) - y2computed) < 1e-12)
  })
})
