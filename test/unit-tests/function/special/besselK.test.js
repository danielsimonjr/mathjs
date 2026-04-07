import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('besselK', function () {
  it('should return Infinity for x = 0', function () {
    assert.strictEqual(math.besselK(0, 0), Infinity)
  })

  it('should compute K_0(1) accurately', function () {
    assert(Math.abs(math.besselK(0, 1) - 0.4210244382407083) < 1e-7)
  })

  it('should compute K_1(1) accurately', function () {
    assert(Math.abs(math.besselK(1, 1) - 0.6019072301972346) < 1e-7)
  })

  it('should compute K_0(2) accurately', function () {
    assert(Math.abs(math.besselK(0, 2) - 0.11389387274953344) < 1e-7)
  })

  it('should compute K_1(2) accurately', function () {
    assert(Math.abs(math.besselK(1, 2) - 0.13986588181652243) < 1e-7)
  })

  it('should compute K_2(1) accurately', function () {
    assert(Math.abs(math.besselK(2, 1) - 1.6248388986351774) < 1e-7)
  })

  it('should be positive and decreasing for x > 0', function () {
    assert(math.besselK(0, 0.5) > math.besselK(0, 1))
    assert(math.besselK(0, 1) > math.besselK(0, 2))
  })

  it('should return NaN for negative x', function () {
    assert(isNaN(math.besselK(0, -1)))
  })

  it('should satisfy K_{-n}(x) = K_n(x)', function () {
    assert(Math.abs(math.besselK(-2, 2) - math.besselK(2, 2)) < 1e-15)
  })

  it('should throw for non-integer order', function () {
    assert.throws(() => math.besselK(0.5, 1), /TypeError/)
  })
})
