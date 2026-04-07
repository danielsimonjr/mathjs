import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createExponentialDist } from '../../../../src/function/statistics/exponentialDist.js'

const math = create({ ...all, createExponentialDist })

describe('exponentialDist', function () {
  it('should create a distribution object', function () {
    const d = math.exponentialDist(2)
    assert.strictEqual(typeof d.pdf, 'function')
    assert.strictEqual(typeof d.cdf, 'function')
    assert.strictEqual(typeof d.icdf, 'function')
    assert.strictEqual(typeof d.mean, 'number')
    assert.strictEqual(typeof d.variance, 'number')
  })

  it('should compute mean and variance correctly', function () {
    const d = math.exponentialDist(2)
    assert.strictEqual(d.mean, 0.5)
    assert.strictEqual(d.variance, 0.25)
  })

  it('should compute pdf correctly', function () {
    const d = math.exponentialDist(1)
    // pdf(0) = lambda * exp(0) = 1
    assert(Math.abs(d.pdf(0) - 1) < 1e-12)
    // pdf(1) = 1 * exp(-1)
    assert(Math.abs(d.pdf(1) - Math.exp(-1)) < 1e-12)
    // pdf(-1) = 0
    assert.strictEqual(d.pdf(-1), 0)
  })

  it('should compute cdf correctly', function () {
    const d = math.exponentialDist(1)
    assert.strictEqual(d.cdf(0), 0)
    assert(Math.abs(d.cdf(1) - (1 - Math.exp(-1))) < 1e-12)
    assert.strictEqual(d.cdf(-5), 0)
  })

  it('should compute icdf (quantile) correctly', function () {
    const d = math.exponentialDist(1)
    // icdf(0) = 0
    assert.strictEqual(d.icdf(0), 0)
    // icdf(1 - exp(-1)) ≈ 1 (inverse of cdf(1))
    assert(Math.abs(d.icdf(1 - Math.exp(-1)) - 1) < 1e-12)
    // icdf(1) = Infinity
    assert.strictEqual(d.icdf(1), Infinity)
  })

  it('cdf and icdf should be inverses', function () {
    const d = math.exponentialDist(3)
    const ps = [0.1, 0.25, 0.5, 0.75, 0.9]
    for (const p of ps) {
      assert(Math.abs(d.cdf(d.icdf(p)) - p) < 1e-10)
    }
  })

  it('should throw for non-positive lambda', function () {
    assert.throws(() => math.exponentialDist(0), /must be positive/)
    assert.throws(() => math.exponentialDist(-1), /must be positive/)
  })

  it('should throw if icdf p is out of range', function () {
    const d = math.exponentialDist(1)
    assert.throws(() => d.icdf(-0.1), /must be in \[0, 1\]/)
    assert.throws(() => d.icdf(1.1), /must be in \[0, 1\]/)
  })
})
