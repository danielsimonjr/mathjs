import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('gammaincp', function () {
  it('should return 1 for x = 0', function () {
    assert.strictEqual(math.gammaincp(1, 0), 1)
  })

  it('should return 0 for x = Infinity', function () {
    assert.strictEqual(math.gammaincp(1, Infinity), 0)
  })

  it('should compute Q(1, 1) = 1/e', function () {
    const expected = Math.exp(-1)
    assert(Math.abs(math.gammaincp(1, 1) - expected) < 1e-14)
  })

  it('should compute Q(2, 1) accurately', function () {
    // Q(2, 1) = 2/e
    const expected = 2 * Math.exp(-1)
    assert(Math.abs(math.gammaincp(2, 1) - expected) < 1e-14)
  })

  it('should be monotonically decreasing in x', function () {
    assert(math.gammaincp(2, 1) > math.gammaincp(2, 2))
    assert(math.gammaincp(2, 2) > math.gammaincp(2, 5))
  })

  it('should be in range [0, 1]', function () {
    for (let a = 0.5; a <= 5; a += 0.5) {
      for (let x = 0.1; x <= 10; x += 0.5) {
        const q = math.gammaincp(a, x)
        assert(q >= 0 && q <= 1, `Q(${a}, ${x}) = ${q} out of range`)
      }
    }
  })

  it('should complement gammainc', function () {
    const a = 2.5, x = 3
    const p = math.gammainc(a, x)
    const q = math.gammaincp(a, x)
    assert(Math.abs(p + q - 1) < 1e-13)
  })

  it('should throw for non-positive a', function () {
    assert.throws(() => math.gammaincp(0, 1), /RangeError/)
  })

  it('should throw for negative x', function () {
    assert.throws(() => math.gammaincp(1, -1), /RangeError/)
  })
})
