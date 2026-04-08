import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createShapiroWilkTest } from '../../../../src/function/statistics/shapiroWilkTest.js'

const math = create({ ...all, createShapiroWilkTest })

describe('shapiroWilkTest', function () {
  it('should return W and pValue', function () {
    const result = math.shapiroWilkTest([2.1, 2.3, 1.9, 2.0, 2.2])
    assert.strictEqual(typeof result.W, 'number')
    assert.strictEqual(typeof result.pValue, 'number')
  })

  it('should return W close to 1 for near-normal data', function () {
    const result = math.shapiroWilkTest([2.1, 2.3, 1.9, 2.0, 2.2, 2.05, 1.95, 2.15])
    assert(result.W > 0.9, `expected W close to 1 for normal data, got ${result.W}`)
  })

  it('should return high pValue for normal-like data', function () {
    // Perfectly spaced normal-like data
    const sample = [-2, -1, -0.5, 0, 0.5, 1, 2]
    const result = math.shapiroWilkTest(sample)
    assert(result.pValue > 0.05, `expected large pValue for normal sample, got ${result.pValue}`)
  })

  it('should return low W for clearly skewed data', function () {
    const result = math.shapiroWilkTest([1, 4, 9, 16, 25, 36, 49, 64])
    assert(result.W < 0.95, `expected lower W for skewed data, got ${result.W}`)
  })

  it('should return low pValue for clearly non-normal data', function () {
    // Powers of 2: strongly right-skewed, W ≈ 0.689 (far below 5% critical value of 0.842)
    const result = math.shapiroWilkTest([1, 2, 4, 8, 16, 32, 64, 128, 256, 512])
    assert(result.pValue < 0.05, `expected small pValue for non-normal data, got ${result.pValue}`)
  })

  it('should have W in (0, 1]', function () {
    const result = math.shapiroWilkTest([1, 2, 3, 4, 5])
    assert(result.W > 0 && result.W <= 1, `W=${result.W} should be in (0,1]`)
  })

  it('should have pValue in [0, 1]', function () {
    const result = math.shapiroWilkTest([1, 2, 3, 4, 5])
    assert(result.pValue >= 0 && result.pValue <= 1)
  })

  it('should return W=1 for all-identical values', function () {
    const result = math.shapiroWilkTest([5, 5, 5, 5, 5])
    assert(result.W === 1, `expected W=1 for constant data, got ${result.W}`)
  })

  it('should throw for fewer than 3 elements', function () {
    assert.throws(() => math.shapiroWilkTest([1, 2]), /at least 3/)
  })

  it('should throw for more than 5000 elements', function () {
    const big = new Array(5001).fill(1)
    assert.throws(() => math.shapiroWilkTest(big), /5000/)
  })

  it('should handle n=3 (minimum sample size)', function () {
    const result = math.shapiroWilkTest([1, 2, 3])
    assert.strictEqual(typeof result.W, 'number')
    assert.strictEqual(typeof result.pValue, 'number')
    assert(result.W > 0 && result.W <= 1)
    assert(result.pValue >= 0 && result.pValue <= 1)
  })

  it('should handle large normal sample', function () {
    // 50-element approximately normal sample
    const sample = [
      -2.1, -1.8, -1.6, -1.4, -1.2, -1.1, -0.9, -0.8, -0.7, -0.6,
      -0.5, -0.4, -0.3, -0.2, -0.1, 0.0, 0.1, 0.2, 0.3, 0.4,
      0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.4, 1.6, 1.8
    ]
    const result = math.shapiroWilkTest(sample)
    assert(result.W > 0.9, `expected high W for normal sample, got ${result.W}`)
  })
})
