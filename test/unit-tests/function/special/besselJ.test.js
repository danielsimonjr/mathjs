import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('besselJ', function () {
  it('should compute J_0(0) = 1', function () {
    assert.strictEqual(math.besselJ(0, 0), 1)
  })

  it('should compute J_1(0) = 0', function () {
    assert.strictEqual(math.besselJ(1, 0), 0)
  })

  it('should compute J_2(0) = 0', function () {
    assert.strictEqual(math.besselJ(2, 0), 0)
  })

  it('should compute J_0(1) accurately', function () {
    assert(Math.abs(math.besselJ(0, 1) - 0.7651976865579666) < 1e-8)
  })

  it('should compute J_1(1) accurately', function () {
    assert(Math.abs(math.besselJ(1, 1) - 0.4400505857449335) < 1e-10)
  })

  it('should compute J_0 for large argument', function () {
    // J_0(10) is known
    assert(Math.abs(math.besselJ(0, 10) - (-0.2459357644513483)) < 1e-8)
  })

  it('should compute J_1 for large argument', function () {
    // J_1(10) is known
    assert(Math.abs(math.besselJ(1, 10) - 0.04347274616886144) < 1e-8)
  })

  it('should compute J_2(3) accurately', function () {
    assert(Math.abs(math.besselJ(2, 3) - 0.4860912605858911) < 1e-8)
  })

  it('should compute J_5(5) accurately', function () {
    assert(Math.abs(math.besselJ(5, 5) - 0.2611405461201587) < 1e-7)
  })

  it('should handle negative x: J_0(-x) = J_0(x)', function () {
    assert(Math.abs(math.besselJ(0, -1) - math.besselJ(0, 1)) < 1e-15)
  })

  it('should handle negative x: J_1(-x) = -J_1(x)', function () {
    assert(Math.abs(math.besselJ(1, -1) + math.besselJ(1, 1)) < 1e-15)
  })

  it('should handle negative n with even order: J_{-2}(x) = J_2(x)', function () {
    assert(Math.abs(math.besselJ(-2, 2) - math.besselJ(2, 2)) < 1e-15)
  })

  it('should handle negative n with odd order: J_{-1}(x) = -J_1(x)', function () {
    assert(Math.abs(math.besselJ(-1, 2) + math.besselJ(1, 2)) < 1e-15)
  })

  it('should throw for non-integer order', function () {
    assert.throws(() => math.besselJ(0.5, 1), /TypeError/)
  })
})
