import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createWeibullDist } from '../../../../src/function/statistics/weibullDist.js'
import { createExponentialDist } from '../../../../src/function/statistics/exponentialDist.js'

const math = create({ ...all, createWeibullDist, createExponentialDist })

describe('weibullDist', function () {
  it('should create a distribution object', function () {
    const d = math.weibullDist(2, 1)
    assert.strictEqual(typeof d.pdf, 'function')
    assert.strictEqual(typeof d.cdf, 'function')
    assert.strictEqual(typeof d.mean, 'number')
    assert.strictEqual(typeof d.variance, 'number')
  })

  it('should match exponentialDist when k=1 (pdf)', function () {
    const lambda = 1
    const w = math.weibullDist(1, lambda)
    const e = math.exponentialDist(1 / lambda)
    const xs = [0.1, 0.5, 1, 2, 5]
    for (const x of xs) {
      assert(Math.abs(w.pdf(x) - e.pdf(x)) < 1e-10,
        `pdf mismatch at x=${x}: weibull=${w.pdf(x)}, exp=${e.pdf(x)}`)
    }
  })

  it('should match exponentialDist when k=1 (cdf)', function () {
    const lambda = 2
    const w = math.weibullDist(1, lambda)
    const e = math.exponentialDist(1 / lambda)
    const xs = [0.1, 0.5, 1, 2, 5]
    for (const x of xs) {
      assert(Math.abs(w.cdf(x) - e.cdf(x)) < 1e-10,
        `cdf mismatch at x=${x}: weibull=${w.cdf(x)}, exp=${e.cdf(x)}`)
    }
  })

  it('should compute pdf correctly for k=2, lambda=1', function () {
    const d = math.weibullDist(2, 1)
    // pdf(1) = (2/1) * (1/1)^1 * exp(-1) = 2 * exp(-1)
    assert(Math.abs(d.pdf(1) - 2 * Math.exp(-1)) < 1e-12)
    assert.strictEqual(d.pdf(-1), 0)
  })

  it('should compute cdf correctly for k=2, lambda=1', function () {
    const d = math.weibullDist(2, 1)
    // cdf(1) = 1 - exp(-1)
    assert(Math.abs(d.cdf(1) - (1 - Math.exp(-1))) < 1e-12)
    assert.strictEqual(d.cdf(0), 0)
    assert.strictEqual(d.cdf(-5), 0)
  })

  it('should compute mean and variance correctly', function () {
    // k=1, lambda=1: mean=Gamma(2)=1, variance=Gamma(3)-Gamma(2)^2 = 2-1=1
    const d = math.weibullDist(1, 1)
    assert(Math.abs(d.mean - 1) < 1e-10)
    assert(Math.abs(d.variance - 1) < 1e-10)
  })

  it('should throw for invalid parameters', function () {
    assert.throws(() => math.weibullDist(0, 1), /k must be positive/)
    assert.throws(() => math.weibullDist(-1, 1), /k must be positive/)
    assert.throws(() => math.weibullDist(1, 0), /lambda must be positive/)
    assert.throws(() => math.weibullDist(1, -2), /lambda must be positive/)
  })
})
