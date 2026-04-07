import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('gammainc', function () {
  it('should return 0 for x = 0', function () {
    assert.strictEqual(math.gammainc(1, 0), 0)
  })

  it('should return 1 for x = Infinity', function () {
    assert.strictEqual(math.gammainc(1, Infinity), 1)
  })

  it('should compute P(1, 1) = 1 - 1/e', function () {
    const expected = 1 - Math.exp(-1)
    assert(Math.abs(math.gammainc(1, 1) - expected) < 1e-14)
  })

  it('should compute P(2, 1) accurately', function () {
    // P(2, 1) = 1 - 2*e^(-1) = 1 - 2/e
    const expected = 1 - 2 * Math.exp(-1)
    assert(Math.abs(math.gammainc(2, 1) - expected) < 1e-14)
  })

  it('should be monotonically increasing in x', function () {
    assert(math.gammainc(2, 1) < math.gammainc(2, 2))
    assert(math.gammainc(2, 2) < math.gammainc(2, 5))
  })

  it('should be in range [0, 1]', function () {
    for (let a = 0.5; a <= 5; a += 0.5) {
      for (let x = 0.1; x <= 10; x += 0.5) {
        const p = math.gammainc(a, x)
        assert(p >= 0 && p <= 1, `P(${a}, ${x}) = ${p} out of range`)
      }
    }
  })

  it('should complement gammaincp', function () {
    const a = 3, x = 2
    const p = math.gammainc(a, x)
    const q = math.gammaincp(a, x)
    assert(Math.abs(p + q - 1) < 1e-13)
  })

  it('should throw for non-positive a', function () {
    assert.throws(() => math.gammainc(0, 1), /RangeError/)
    assert.throws(() => math.gammainc(-1, 1), /RangeError/)
  })

  it('should throw for negative x', function () {
    assert.throws(() => math.gammainc(1, -1), /RangeError/)
  })
})
