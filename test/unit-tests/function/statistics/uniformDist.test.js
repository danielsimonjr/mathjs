import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createUniformDist } from '../../../../src/function/statistics/uniformDist.js'

const math = create({ ...all, createUniformDist })

describe('uniformDist', function () {
  it('should create a uniform distribution on [0, 1]', function () {
    const d = math.uniformDist(0, 1)
    assert.strictEqual(d.pdf(0.5), 1)
    assert.strictEqual(d.cdf(0.5), 0.5)
    assert.strictEqual(d.icdf(0.5), 0.5)
  })

  it('should have correct mean and variance for [0, 1]', function () {
    const d = math.uniformDist(0, 1)
    assert.strictEqual(d.mean, 0.5)
    assert(Math.abs(d.variance - 1 / 12) < 1e-15)
  })

  it('should have correct mean and variance for [2, 6]', function () {
    const d = math.uniformDist(2, 6)
    assert.strictEqual(d.mean, 4)
    assert(Math.abs(d.variance - 16 / 12) < 1e-15)
  })

  it('should return pdf = 0 outside [a, b]', function () {
    const d = math.uniformDist(1, 3)
    assert.strictEqual(d.pdf(0), 0)
    assert.strictEqual(d.pdf(4), 0)
  })

  it('should return correct pdf inside [a, b]', function () {
    const d = math.uniformDist(0, 4)
    assert.strictEqual(d.pdf(2), 0.25)
  })

  it('should clamp cdf to [0, 1]', function () {
    const d = math.uniformDist(0, 1)
    assert.strictEqual(d.cdf(-1), 0)
    assert.strictEqual(d.cdf(2), 1)
  })

  it('should compute icdf correctly', function () {
    const d = math.uniformDist(2, 8)
    assert(Math.abs(d.icdf(0) - 2) < 1e-15)
    assert(Math.abs(d.icdf(1) - 8) < 1e-15)
    assert(Math.abs(d.icdf(0.25) - 3.5) < 1e-15)
  })

  it('should throw when b <= a', function () {
    assert.throws(() => math.uniformDist(5, 5), /greater than/)
    assert.throws(() => math.uniformDist(5, 3), /greater than/)
  })

  it('should throw for icdf with p outside [0, 1]', function () {
    const d = math.uniformDist(0, 1)
    assert.throws(() => d.icdf(-0.1), /\[0, 1\]/)
    assert.throws(() => d.icdf(1.1), /\[0, 1\]/)
  })
})
