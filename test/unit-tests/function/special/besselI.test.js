import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('besselI', function () {
  it('should compute I_0(0) = 1', function () {
    assert.strictEqual(math.besselI(0, 0), 1)
  })

  it('should compute I_1(0) = 0', function () {
    assert.strictEqual(math.besselI(1, 0), 0)
  })

  it('should compute I_2(0) = 0', function () {
    assert.strictEqual(math.besselI(2, 0), 0)
  })

  it('should compute I_0(1) accurately', function () {
    assert(Math.abs(math.besselI(0, 1) - 1.2660658777520082) < 1e-7)
  })

  it('should compute I_1(1) accurately', function () {
    assert(Math.abs(math.besselI(1, 1) - 0.5651591039924851) < 1e-7)
  })

  it('should compute I_0 for large argument', function () {
    // I_0(5) is known
    assert(Math.abs(math.besselI(0, 5) - 27.239871823604446) < 1e-6)
  })

  it('should compute I_1 for large argument', function () {
    assert(Math.abs(math.besselI(1, 5) - 24.33564214245052) < 1e-6)
  })

  it('should compute I_2(3) accurately', function () {
    assert(Math.abs(math.besselI(2, 3) - 2.2452125369212265) < 1e-6)
  })

  it('should satisfy I_{-n}(x) = I_n(x)', function () {
    assert(Math.abs(math.besselI(-2, 2) - math.besselI(2, 2)) < 1e-15)
  })

  it('should throw for non-integer order', function () {
    assert.throws(() => math.besselI(0.5, 1), /TypeError/)
  })

  it('should be positive for all real x (I_0)', function () {
    assert(math.besselI(0, -3) > 0)
    assert(math.besselI(0, 3) > 0)
  })
})
