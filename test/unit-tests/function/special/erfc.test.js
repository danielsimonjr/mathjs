import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('erfc', function () {
  it('should compute erfc(0) = 1', function () {
    assert.strictEqual(math.erfc(0), 1)
  })

  it('should compute erfc(Infinity) = 0', function () {
    assert.strictEqual(math.erfc(Infinity), 0)
  })

  it('should compute erfc(-Infinity) = 2', function () {
    assert.strictEqual(math.erfc(-Infinity), 2)
  })

  it('should compute erfc(1) accurately', function () {
    assert(Math.abs(math.erfc(1) - 0.15729920705028513) < 1e-12)
  })

  it('should compute erfc(-1) = 2 - erfc(1)', function () {
    assert(Math.abs(math.erfc(-1) - (2 - math.erfc(1))) < 1e-14)
  })

  it('should satisfy erfc(x) + erf(x) = 1 for small x', function () {
    const x = 0.3
    assert(Math.abs(math.erfc(x) + math.erf(x) - 1) < 1e-14)
  })

  it('should satisfy erfc(x) + erf(x) = 1 for moderate x', function () {
    const x = 2.0
    assert(Math.abs(math.erfc(x) + math.erf(x) - 1) < 1e-14)
  })

  it('should satisfy erfc(x) + erf(x) = 1 for large x', function () {
    const x = 5.0
    // For large x, erf(x) ~ 1 and erfc(x) ~ 0, but sum should still be 1
    assert(Math.abs(math.erfc(x) + math.erf(x) - 1) < 1e-14)
  })

  it('should be accurate for large x (no catastrophic cancellation)', function () {
    // erfc(10) is very small; erf.js would lose precision with 1 - erf(10)
    const result = math.erfc(10)
    assert(result > 0)
    assert(result < 1e-44) // erfc(10) ~ 2.09e-45
  })

  it('should be monotonically decreasing', function () {
    assert(math.erfc(0) > math.erfc(1))
    assert(math.erfc(1) > math.erfc(2))
    assert(math.erfc(2) > math.erfc(3))
  })
})
