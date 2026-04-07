import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createPoissonDist } from '../../../../src/function/statistics/poissonDist.js'

const math = create({ ...all, createPoissonDist })

describe('poissonDist', function () {
  it('should create a Poisson distribution', function () {
    const d = math.poissonDist(3)
    assert.strictEqual(d.mean, 3)
    assert.strictEqual(d.variance, 3)
  })

  it('should compute pmf correctly', function () {
    const d = math.poissonDist(3)
    // P(X=3) = e^-3 * 3^3 / 3! = e^-3 * 4.5
    const expected = Math.exp(-3) * 27 / 6
    assert(Math.abs(d.pmf(3) - expected) < 1e-10)
  })

  it('should compute pmf(0) correctly', function () {
    const d = math.poissonDist(2)
    // P(X=0) = e^-2
    assert(Math.abs(d.pmf(0) - Math.exp(-2)) < 1e-10)
  })

  it('should return 0 for negative k', function () {
    const d = math.poissonDist(3)
    assert.strictEqual(d.pmf(-1), 0)
    assert.strictEqual(d.cdf(-1), 0)
  })

  it('should compute cdf as cumulative sum of pmf', function () {
    const d = math.poissonDist(3)
    const cdf4 = d.cdf(4)
    const manualSum = d.pmf(0) + d.pmf(1) + d.pmf(2) + d.pmf(3) + d.pmf(4)
    assert(Math.abs(cdf4 - manualSum) < 1e-10)
  })

  it('should floor non-integer k in pmf and cdf', function () {
    const d = math.poissonDist(3)
    assert(Math.abs(d.pmf(3.7) - d.pmf(3)) < 1e-15)
    assert(Math.abs(d.cdf(3.7) - d.cdf(3)) < 1e-15)
  })

  it('should throw for non-positive lambda', function () {
    assert.throws(() => math.poissonDist(0), /positive/)
    assert.throws(() => math.poissonDist(-1), /positive/)
  })

  it('should handle large lambda', function () {
    const d = math.poissonDist(100)
    assert.strictEqual(d.mean, 100)
    // pmf should be a valid probability
    const p = d.pmf(100)
    assert(p > 0 && p < 1)
  })
})
