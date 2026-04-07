import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createGammaDist } from '../../../../src/function/statistics/gammaDist.js'
import { createExponentialDist } from '../../../../src/function/statistics/exponentialDist.js'

const math = create({ ...all, createGammaDist, createExponentialDist })

describe('gammaDist', function () {
  it('should have correct mean and variance', function () {
    const d = math.gammaDist(3, 2)
    assert(Math.abs(d.mean - 1.5) < 1e-10)
    assert(Math.abs(d.variance - 0.75) < 1e-10)
  })

  it('pdf should be 0 for x <= 0', function () {
    const d = math.gammaDist(2, 1)
    assert.strictEqual(d.pdf(0), 0)
    assert.strictEqual(d.pdf(-1), 0)
  })

  it('cdf should be 0 for x <= 0', function () {
    const d = math.gammaDist(2, 1)
    assert.strictEqual(d.cdf(0), 0)
    assert.strictEqual(d.cdf(-1), 0)
  })

  it('cdf should approach 1 for large x', function () {
    const d = math.gammaDist(2, 1)
    assert(d.cdf(100) > 0.9999)
  })

  it('Gamma(1, beta) should equal Exp(beta) — pdf identity', function () {
    const beta = 2
    const gamma = math.gammaDist(1, beta)
    const expo = math.exponentialDist(beta)
    const xs = [0.1, 0.5, 1, 2, 3]
    for (const x of xs) {
      assert(Math.abs(gamma.pdf(x) - expo.pdf(x)) < 1e-8,
        `pdf differs at x=${x}: gamma=${gamma.pdf(x)}, expo=${expo.pdf(x)}`)
    }
  })

  it('Gamma(1, beta) should equal Exp(beta) — cdf identity', function () {
    const beta = 2
    const gamma = math.gammaDist(1, beta)
    const expo = math.exponentialDist(beta)
    const xs = [0.1, 0.5, 1, 2, 3]
    for (const x of xs) {
      assert(Math.abs(gamma.cdf(x) - expo.cdf(x)) < 1e-8,
        `cdf differs at x=${x}: gamma=${gamma.cdf(x)}, expo=${expo.cdf(x)}`)
    }
  })

  it('should compute pdf at known values for Gamma(2, 1)', function () {
    const d = math.gammaDist(2, 1)
    // pdf(x) = x * exp(-x) for Gamma(2,1)
    assert(Math.abs(d.pdf(1) - Math.exp(-1)) < 1e-10)
    assert(Math.abs(d.pdf(2) - 2 * Math.exp(-2)) < 1e-10)
  })

  it('should throw when shape k is not positive', function () {
    assert.throws(() => math.gammaDist(0, 1), /positive/)
    assert.throws(() => math.gammaDist(-1, 1), /positive/)
  })

  it('should throw when rate beta is not positive', function () {
    assert.throws(() => math.gammaDist(1, 0), /positive/)
    assert.throws(() => math.gammaDist(1, -1), /positive/)
  })
})
