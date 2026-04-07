import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createTDist } from '../../../../src/function/statistics/tDist.js'
import { createNormalDist } from '../../../../src/function/statistics/normalDist.js'

const math = create({ ...all, createTDist, createNormalDist })

describe('tDist', function () {
  it('should create a t-distribution', function () {
    const d = math.tDist(10)
    assert.strictEqual(d.mean, 0)
    assert(Math.abs(d.variance - 10 / (10 - 2)) < 1e-10)
  })

  it('should have symmetric pdf', function () {
    const d = math.tDist(5)
    assert(Math.abs(d.pdf(1) - d.pdf(-1)) < 1e-14)
    assert(Math.abs(d.pdf(2) - d.pdf(-2)) < 1e-14)
  })

  it('should have pdf peak at x=0', function () {
    const d = math.tDist(10)
    assert(d.pdf(0) > d.pdf(1))
    assert(d.pdf(0) > d.pdf(-1))
  })

  it('should compute cdf(0) = 0.5 (symmetric)', function () {
    const d = math.tDist(10)
    assert(Math.abs(d.cdf(0) - 0.5) < 1e-6)
  })

  it('should compute cdf for t=2.228, df=10 ≈ 0.975', function () {
    const d = math.tDist(10)
    assert(Math.abs(d.cdf(2.228) - 0.975) < 0.001)
  })

  it('should be approximately normal for large df', function () {
    const t = math.tDist(1000)
    const n = math.normalDist(0, 1)
    // pdf at x=0 should be close to normal
    assert(Math.abs(t.pdf(0) - n.pdf(0)) < 0.001)
  })

  it('should return undefined mean for df <= 1', function () {
    const d = math.tDist(1)
    assert.strictEqual(d.mean, undefined)
  })

  it('should return Infinity variance for df = 2', function () {
    const d = math.tDist(2)
    assert.strictEqual(d.variance, Infinity)
  })

  it('should throw for non-positive df', function () {
    assert.throws(() => math.tDist(0), /positive/)
    assert.throws(() => math.tDist(-1), /positive/)
  })

  it('should compute cdf for negative x', function () {
    const d = math.tDist(10)
    // Symmetry: cdf(-x) = 1 - cdf(x)
    assert(Math.abs(d.cdf(-2.228) - (1 - d.cdf(2.228))) < 1e-6)
  })
})
