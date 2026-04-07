import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLogNormalDist } from '../../../../src/function/statistics/logNormalDist.js'

const math = create({ ...all, createLogNormalDist })

describe('logNormalDist', function () {
  it('should have correct mean for logNormalDist(0, 1)', function () {
    const d = math.logNormalDist(0, 1)
    // mean = exp(0 + 1/2) = exp(0.5) ≈ 1.6487212707
    assert(Math.abs(d.mean - Math.exp(0.5)) < 1e-10)
  })

  it('should have correct variance for logNormalDist(0, 1)', function () {
    const d = math.logNormalDist(0, 1)
    // variance = (exp(1) - 1) * exp(1) ≈ 4.6708...
    const expected = (Math.exp(1) - 1) * Math.exp(1)
    assert(Math.abs(d.variance - expected) < 1e-10)
  })

  it('cdf(1) = 0.5 for logNormalDist(0, sigma)', function () {
    const d = math.logNormalDist(0, 1)
    assert(Math.abs(d.cdf(1) - 0.5) < 1e-6)
  })

  it('icdf(0.5) = exp(mu) for logNormalDist(mu, sigma)', function () {
    const d = math.logNormalDist(2, 1)
    assert(Math.abs(d.icdf(0.5) - Math.exp(2)) < 1e-6)
  })

  it('icdf should be inverse of cdf', function () {
    const d = math.logNormalDist(0, 1)
    const p = 0.75
    const x = d.icdf(p)
    assert(Math.abs(d.cdf(x) - p) < 1e-5)
  })

  it('pdf should be 0 for x <= 0', function () {
    const d = math.logNormalDist(0, 1)
    assert.strictEqual(d.pdf(0), 0)
    assert.strictEqual(d.pdf(-1), 0)
  })

  it('cdf should be 0 for x <= 0', function () {
    const d = math.logNormalDist(0, 1)
    assert.strictEqual(d.cdf(0), 0)
    assert.strictEqual(d.cdf(-1), 0)
  })

  it('pdf at x=1 for logNormalDist(0, 1) should equal standard normal pdf at 0', function () {
    const d = math.logNormalDist(0, 1)
    // pdf(1) = phi(0) / 1 = 1/sqrt(2*pi)
    assert(Math.abs(d.pdf(1) - 1 / Math.sqrt(2 * Math.PI)) < 1e-10)
  })

  it('should throw when sigma is not positive', function () {
    assert.throws(() => math.logNormalDist(0, 0), /positive/)
    assert.throws(() => math.logNormalDist(0, -1), /positive/)
  })

  it('should throw for icdf with p outside (0, 1)', function () {
    const d = math.logNormalDist(0, 1)
    assert.throws(() => d.icdf(0), /\(0, 1\)/)
    assert.throws(() => d.icdf(1), /\(0, 1\)/)
  })
})
