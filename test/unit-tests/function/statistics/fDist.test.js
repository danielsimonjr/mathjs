import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createFDist } from '../../../../src/function/statistics/fDist.js'

const math = create({ ...all, createFDist })

describe('fDist', function () {
  it('should have correct mean for fDist(5, 10)', function () {
    const d = math.fDist(5, 10)
    // mean = df2 / (df2 - 2) = 10 / 8 = 1.25
    assert.strictEqual(d.mean, 10 / 8)
  })

  it('mean should be NaN when df2 <= 2', function () {
    const d = math.fDist(5, 2)
    assert(isNaN(d.mean))
    const d2 = math.fDist(5, 1)
    assert(isNaN(d2.mean))
  })

  it('variance should be NaN when df2 <= 4', function () {
    const d = math.fDist(5, 4)
    assert(isNaN(d.variance))
  })

  it('pdf should be 0 for x <= 0', function () {
    const d = math.fDist(5, 10)
    assert.strictEqual(d.pdf(0), 0)
    assert.strictEqual(d.pdf(-1), 0)
  })

  it('cdf should be 0 for x <= 0', function () {
    const d = math.fDist(5, 10)
    assert.strictEqual(d.cdf(0), 0)
    assert.strictEqual(d.cdf(-1), 0)
  })

  it('cdf should approach 1 for large x', function () {
    const d = math.fDist(5, 10)
    assert(d.cdf(1000) > 0.9999)
  })

  it('cdf(1) for fDist(1, 1) should be ~0.5', function () {
    // F(1,1) is symmetric around 1 in log-scale; cdf(1) = 0.5
    const d = math.fDist(1, 1)
    assert(Math.abs(d.cdf(1) - 0.5) < 0.01)
  })

  it('should compute variance correctly for fDist(5, 10)', function () {
    const d = math.fDist(5, 10)
    // variance = 2 * df2^2 * (df1 + df2 - 2) / (df1 * (df2-2)^2 * (df2-4))
    const expected = (2 * 100 * 13) / (5 * 64 * 6)
    assert(Math.abs(d.variance - expected) < 1e-10)
  })

  it('should throw when df1 is not positive', function () {
    assert.throws(() => math.fDist(0, 10), /positive/)
    assert.throws(() => math.fDist(-1, 10), /positive/)
  })

  it('should throw when df2 is not positive', function () {
    assert.throws(() => math.fDist(5, 0), /positive/)
    assert.throws(() => math.fDist(5, -1), /positive/)
  })
})
