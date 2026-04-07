import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const EULER_MASCHERONI = 0.5772156649015329

describe('digamma', function () {
  it('should compute digamma(1) = -gamma_EM', function () {
    assert(Math.abs(math.digamma(1) - (-EULER_MASCHERONI)) < 1e-12)
  })

  it('should compute digamma(2) = 1 - gamma_EM', function () {
    const expected = 1 - EULER_MASCHERONI
    assert(Math.abs(math.digamma(2) - expected) < 1e-12)
  })

  it('should satisfy digamma(n+1) = digamma(n) + 1/n', function () {
    for (let n = 1; n <= 5; n++) {
      const diff = math.digamma(n + 1) - math.digamma(n)
      assert(Math.abs(diff - 1 / n) < 1e-12, `digamma(${n+1}) - digamma(${n}) should be 1/${n}`)
    }
  })

  it('should compute digamma(0.5) accurately', function () {
    // psi(0.5) = -gamma_EM - 2*ln(2)
    const expected = -EULER_MASCHERONI - 2 * Math.log(2)
    assert(Math.abs(math.digamma(0.5) - expected) < 1e-12)
  })

  it('should compute digamma for large x (asymptotic regime)', function () {
    // For large x, psi(x) ~ ln(x) - 1/(2x) - 1/(12x^2) + ...
    // The leading approximation ln(x) - 1/(2x) has error ~1/(12x^2) ~ 8e-6 for x=100
    const x = 100
    const approx = Math.log(x) - 1 / (2 * x)
    assert(Math.abs(math.digamma(x) - approx) < 1e-4)
  })

  it('should use reflection formula for negative non-integer x', function () {
    // psi(1-x) - psi(x) = pi*cot(pi*x)
    const x = 0.3
    const diff = math.digamma(1 - x) - math.digamma(x)
    const expected = Math.PI / Math.tan(Math.PI * x)
    assert(Math.abs(diff - expected) < 1e-12)
  })

  it('should return NaN for non-positive integers', function () {
    assert(isNaN(math.digamma(0)))
    assert(isNaN(math.digamma(-1)))
    assert(isNaN(math.digamma(-2)))
  })

  it('should compute digamma(10) accurately', function () {
    // digamma(10) = H_9 - gamma_EM where H_9 = 1 + 1/2 + ... + 1/9
    const H9 = 1 + 1 / 2 + 1 / 3 + 1 / 4 + 1 / 5 + 1 / 6 + 1 / 7 + 1 / 8 + 1 / 9
    const expected = H9 - EULER_MASCHERONI
    assert(Math.abs(math.digamma(10) - expected) < 1e-12)
  })
})
