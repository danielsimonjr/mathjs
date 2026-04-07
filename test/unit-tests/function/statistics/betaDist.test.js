import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createBetaDist } from '../../../../src/function/statistics/betaDist.js'

const math = create({ ...all, createBetaDist })

describe('betaDist', function () {
  it('Beta(1,1) should be uniform on [0,1]: pdf = 1', function () {
    const d = math.betaDist(1, 1)
    assert(Math.abs(d.pdf(0.5) - 1) < 1e-10)
    assert(Math.abs(d.pdf(0.1) - 1) < 1e-10)
    assert(Math.abs(d.pdf(0.9) - 1) < 1e-10)
  })

  it('Beta(1,1) cdf should equal x', function () {
    const d = math.betaDist(1, 1)
    assert(Math.abs(d.cdf(0.3) - 0.3) < 1e-8)
    assert(Math.abs(d.cdf(0.7) - 0.7) < 1e-8)
  })

  it('should have correct mean and variance', function () {
    const d = math.betaDist(2, 5)
    const expectedMean = 2 / 7
    const expectedVar = (2 * 5) / (7 * 7 * 8)
    assert(Math.abs(d.mean - expectedMean) < 1e-10)
    assert(Math.abs(d.variance - expectedVar) < 1e-10)
  })

  it('pdf should be 0 outside (0, 1)', function () {
    const d = math.betaDist(2, 3)
    assert.strictEqual(d.pdf(0), 0)
    assert.strictEqual(d.pdf(1), 0)
    assert.strictEqual(d.pdf(-0.1), 0)
    assert.strictEqual(d.pdf(1.1), 0)
  })

  it('cdf should be 0 at x = 0 and 1 at x = 1', function () {
    const d = math.betaDist(2, 3)
    assert.strictEqual(d.cdf(0), 0)
    assert.strictEqual(d.cdf(1), 1)
  })

  it('cdf should be 0.5 at mean for symmetric Beta(2, 2)', function () {
    const d = math.betaDist(2, 2)
    assert(Math.abs(d.cdf(0.5) - 0.5) < 1e-8)
  })

  it('should compute pdf at known value for Beta(2, 5)', function () {
    const d = math.betaDist(2, 5)
    // B(2,5) = 1/30, pdf(0.3) = 0.3 * 0.7^4 / B(2,5) = 30 * 0.3 * 0.7^4
    const expected = 30 * 0.3 * Math.pow(0.7, 4)
    assert(Math.abs(d.pdf(0.3) - expected) < 1e-10)
  })

  it('should throw when alpha is not positive', function () {
    assert.throws(() => math.betaDist(0, 1), /positive/)
    assert.throws(() => math.betaDist(-1, 1), /positive/)
  })

  it('should throw when beta is not positive', function () {
    assert.throws(() => math.betaDist(1, 0), /positive/)
    assert.throws(() => math.betaDist(1, -1), /positive/)
  })
})
