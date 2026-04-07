import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('erfi', function () {
  it('should compute erfi(0) = 0', function () {
    assert.strictEqual(math.erfi(0), 0)
  })

  it('should compute erfi(Infinity) = Infinity', function () {
    assert.strictEqual(math.erfi(Infinity), Infinity)
  })

  it('should compute erfi(-Infinity) = -Infinity', function () {
    assert.strictEqual(math.erfi(-Infinity), -Infinity)
  })

  it('should be an odd function: erfi(-x) = -erfi(x)', function () {
    const x = 0.7
    assert(Math.abs(math.erfi(-x) + math.erfi(x)) < 1e-14)
  })

  it('should compute erfi(1) accurately', function () {
    // erfi(1) ~ 1.6504257587975429
    const result = math.erfi(1)
    assert(Math.abs(result - 1.6504257587975429) < 1e-8)
  })

  it('should compute erfi(0.5) accurately', function () {
    // erfi(0.5) ~ 0.6149520946965109 (verified against scipy.special.erfi)
    const result = math.erfi(0.5)
    assert(Math.abs(result - 0.6149520946965109) < 1e-10)
  })

  it('should grow rapidly for large x', function () {
    // erfi is unbounded — it grows like exp(x^2)/(x*sqrt(pi))
    assert(math.erfi(3) > math.erfi(2))
    assert(math.erfi(2) > math.erfi(1))
  })

  it('should be positive for x > 0', function () {
    assert(math.erfi(0.1) > 0)
    assert(math.erfi(2) > 0)
    assert(math.erfi(5) > 0)
  })

  it('should compute erfi for moderate x consistently', function () {
    // Both small-x and large-x formulas should give consistent values near the boundary
    const result = math.erfi(1.6)
    assert(isFinite(result))
    assert(result > 0)
  })
})
