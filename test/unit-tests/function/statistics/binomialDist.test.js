import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createBinomialDist } from '../../../../src/function/statistics/binomialDist.js'

const math = create({ ...all, createBinomialDist })

describe('binomialDist', function () {
  it('should create a binomial distribution', function () {
    const d = math.binomialDist(10, 0.5)
    assert.strictEqual(d.mean, 5)
    assert.strictEqual(d.variance, 2.5)
  })

  it('should compute pmf(5) for n=10, p=0.5', function () {
    const d = math.binomialDist(10, 0.5)
    // C(10,5) * 0.5^10 = 252 / 1024
    const expected = 252 / 1024
    assert(Math.abs(d.pmf(5) - expected) < 1e-10)
  })

  it('should return 0 for k outside [0, n]', function () {
    const d = math.binomialDist(10, 0.5)
    assert.strictEqual(d.pmf(-1), 0)
    assert.strictEqual(d.pmf(11), 0)
  })

  it('should compute cdf(5) as sum of pmf(0..5)', function () {
    const d = math.binomialDist(10, 0.5)
    let manualSum = 0
    for (let k = 0; k <= 5; k++) manualSum += d.pmf(k)
    assert(Math.abs(d.cdf(5) - manualSum) < 1e-10)
  })

  it('should return 1 for cdf >= n', function () {
    const d = math.binomialDist(10, 0.5)
    assert(Math.abs(d.cdf(10) - 1) < 1e-10)
    assert(Math.abs(d.cdf(20) - 1) < 1e-10)
  })

  it('should work with p=0', function () {
    const d = math.binomialDist(5, 0)
    assert(Math.abs(d.pmf(0) - 1) < 1e-10)
    assert.strictEqual(d.pmf(1), 0)
  })

  it('should work with p=1', function () {
    const d = math.binomialDist(5, 1)
    assert(Math.abs(d.pmf(5) - 1) < 1e-10)
    assert.strictEqual(d.pmf(0), 0)
  })

  it('should throw for invalid n', function () {
    assert.throws(() => math.binomialDist(0, 0.5), /positive integer/)
    assert.throws(() => math.binomialDist(1.5, 0.5), /positive integer/)
  })

  it('should throw for p outside [0, 1]', function () {
    assert.throws(() => math.binomialDist(10, -0.1), /\[0, 1\]/)
    assert.throws(() => math.binomialDist(10, 1.1), /\[0, 1\]/)
  })
})
