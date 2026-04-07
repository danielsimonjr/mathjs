import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('betainc', function () {
  it('should return 0 for x = 0', function () {
    assert.strictEqual(math.betainc(0, 2, 3), 0)
  })

  it('should return 1 for x = 1', function () {
    assert.strictEqual(math.betainc(1, 2, 3), 1)
  })

  it('should compute betainc(0.5, 2, 3) = 11/16 = 0.6875', function () {
    assert(Math.abs(math.betainc(0.5, 2, 3) - 0.6875) < 1e-13)
  })

  it('should compute betainc(0.5, 1, 1) = 0.5', function () {
    assert(Math.abs(math.betainc(0.5, 1, 1) - 0.5) < 1e-14)
  })

  it('should satisfy betainc(x, a, b) + betainc(1-x, b, a) = 1', function () {
    const x = 0.3, a = 2.5, b = 3.5
    const sum = math.betainc(x, a, b) + math.betainc(1 - x, b, a)
    assert(Math.abs(sum - 1) < 1e-14)
  })

  it('should be monotonically increasing in x', function () {
    const a = 2, b = 3
    assert(math.betainc(0.3, a, b) < math.betainc(0.5, a, b))
    assert(math.betainc(0.5, a, b) < math.betainc(0.8, a, b))
  })

  it('should throw for x outside [0, 1]', function () {
    assert.throws(() => math.betainc(-0.1, 2, 3), /RangeError/)
    assert.throws(() => math.betainc(1.1, 2, 3), /RangeError/)
  })

  it('should throw for non-positive a or b', function () {
    assert.throws(() => math.betainc(0.5, 0, 3), /RangeError/)
    assert.throws(() => math.betainc(0.5, 2, 0), /RangeError/)
  })

  it('should compute betainc for small a, b', function () {
    const result = math.betainc(0.25, 0.5, 0.5)
    assert(result >= 0 && result <= 1)
  })
})
