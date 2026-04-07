import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createNormalDist } from '../../../../src/function/statistics/normalDist.js'

const math = create({ ...all, createNormalDist })

describe('normalDist', function () {
  it('should create a standard normal distribution', function () {
    const d = math.normalDist(0, 1)
    assert(Math.abs(d.pdf(0) - 0.3989422804014327) < 1e-10)
  })

  it('should have correct mean and variance', function () {
    const d = math.normalDist(2, 3)
    assert.strictEqual(d.mean, 2)
    assert.strictEqual(d.variance, 9)
  })

  it('should compute pdf symmetrically', function () {
    const d = math.normalDist(0, 1)
    assert(Math.abs(d.pdf(1) - d.pdf(-1)) < 1e-15)
  })

  it('should compute cdf at 0 for standard normal', function () {
    const d = math.normalDist(0, 1)
    assert(Math.abs(d.cdf(0) - 0.5) < 1e-6)
  })

  it('should compute cdf(1.96) ≈ 0.975 for standard normal', function () {
    const d = math.normalDist(0, 1)
    assert(Math.abs(d.cdf(1.96) - 0.975) < 0.001)
  })

  it('should compute icdf as inverse of cdf', function () {
    const d = math.normalDist(0, 1)
    const p = 0.975
    const x = d.icdf(p)
    assert(Math.abs(d.cdf(x) - p) < 1e-5)
  })

  it('should compute icdf(0.5) = mean', function () {
    const d = math.normalDist(5, 2)
    assert(Math.abs(d.icdf(0.5) - 5) < 1e-6)
  })

  it('should throw when sigma is not positive', function () {
    assert.throws(() => math.normalDist(0, 0), /positive/)
    assert.throws(() => math.normalDist(0, -1), /positive/)
  })

  it('should throw for icdf with p outside (0, 1)', function () {
    const d = math.normalDist(0, 1)
    assert.throws(() => d.icdf(0), /\(0, 1\)/)
    assert.throws(() => d.icdf(1), /\(0, 1\)/)
  })
})
