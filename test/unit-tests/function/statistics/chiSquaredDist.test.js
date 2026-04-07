import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createChiSquaredDist } from '../../../../src/function/statistics/chiSquaredDist.js'

const math = create({ ...all, createChiSquaredDist })

describe('chiSquaredDist', function () {
  it('should create a chi-squared distribution', function () {
    const d = math.chiSquaredDist(3)
    assert.strictEqual(d.mean, 3)
    assert.strictEqual(d.variance, 6)
  })

  it('should return 0 for x <= 0', function () {
    const d = math.chiSquaredDist(3)
    assert.strictEqual(d.pdf(0), 0)
    assert.strictEqual(d.pdf(-1), 0)
    assert.strictEqual(d.cdf(0), 0)
  })

  it('should compute pdf for chi-squared(1) at x=1', function () {
    // pdf of chi-sq(1) at x=1 = (1/(sqrt(2*pi))) * exp(-0.5) = ~0.2419707...
    const d = math.chiSquaredDist(1)
    const expected = 0.24197072451914337
    assert(Math.abs(d.pdf(1) - expected) < 1e-6)
  })

  it('should compute cdf(3.84) ≈ 0.95 for chi-squared(1)', function () {
    const d = math.chiSquaredDist(1)
    assert(Math.abs(d.cdf(3.841) - 0.95) < 0.001)
  })

  it('should compute cdf(7.815) ≈ 0.95 for chi-squared(3)', function () {
    const d = math.chiSquaredDist(3)
    assert(Math.abs(d.cdf(7.815) - 0.95) < 0.001)
  })

  it('should have total probability of 1 (cdf approaches 1 for large x)', function () {
    const d = math.chiSquaredDist(5)
    assert(d.cdf(100) > 0.9999)
  })

  it('should throw for non-positive or non-integer df', function () {
    assert.throws(() => math.chiSquaredDist(0), /positive integer/)
    assert.throws(() => math.chiSquaredDist(-1), /positive integer/)
    assert.throws(() => math.chiSquaredDist(2.5), /positive integer/)
  })
})
