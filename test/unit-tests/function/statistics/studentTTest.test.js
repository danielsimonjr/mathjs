import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createStudentTTest } from '../../../../src/function/statistics/studentTTest.js'

const math = create({ ...all, createStudentTTest })

describe('studentTTest', function () {
  it('should return t, df, and pValue', function () {
    const result = math.studentTTest([1, 2, 3], [4, 5, 6])
    assert.strictEqual(typeof result.t, 'number')
    assert.strictEqual(typeof result.df, 'number')
    assert.strictEqual(typeof result.pValue, 'number')
  })

  it('should return t≈0 and pValue≈1 for identical samples', function () {
    const s = [1, 2, 3, 4, 5]
    const result = math.studentTTest(s, s.slice())
    assert(Math.abs(result.t) < 1e-10, `expected t≈0, got ${result.t}`)
    assert(Math.abs(result.pValue - 1) < 1e-6, `expected pValue≈1, got ${result.pValue}`)
  })

  it('should return small pValue for very different samples', function () {
    const s1 = [1, 2, 3, 4, 5]
    const s2 = [100, 101, 102, 103, 104]
    const result = math.studentTTest(s1, s2)
    assert(result.pValue < 0.001, `expected small p-value, got ${result.pValue}`)
    assert(result.t < 0, `expected negative t-statistic, got ${result.t}`)
  })

  it('should produce symmetric result when samples are swapped', function () {
    const s1 = [1, 2, 3, 4, 5]
    const s2 = [6, 7, 8, 9, 10]
    const r1 = math.studentTTest(s1, s2)
    const r2 = math.studentTTest(s2, s1)
    assert(Math.abs(r1.t + r2.t) < 1e-10, 't should negate when samples swapped')
    assert(Math.abs(r1.pValue - r2.pValue) < 1e-10, 'p-value should be same when samples swapped')
    assert(Math.abs(r1.df - r2.df) < 1e-10, 'df should be same when samples swapped')
  })

  it('should have pValue in [0, 1]', function () {
    const r = math.studentTTest([1, 2, 3], [2, 3, 4])
    assert(r.pValue >= 0 && r.pValue <= 1, `pValue=${r.pValue} not in [0,1]`)
  })

  it('should have positive degrees of freedom', function () {
    const r = math.studentTTest([1, 2, 3], [2, 3, 4])
    assert(r.df > 0, `df=${r.df} should be positive`)
  })

  it('should throw if sample has fewer than 2 elements', function () {
    assert.throws(() => math.studentTTest([1], [2, 3]), /sample1 must have at least 2/)
    assert.throws(() => math.studentTTest([1, 2], [3]), /sample2 must have at least 2/)
  })

  it('should handle samples of different sizes', function () {
    const r = math.studentTTest([1, 2, 3], [4, 5, 6, 7, 8])
    assert.strictEqual(typeof r.t, 'number')
    assert(r.df > 0)
    assert(r.pValue >= 0 && r.pValue <= 1)
  })

  it('Welch t-statistic formula check', function () {
    const s1 = [2, 4, 6]
    const s2 = [1, 3, 5]
    const mean1 = 4
    const mean2 = 3
    const var1 = 4 // sample variance
    const var2 = 4
    const n1 = 3
    const n2 = 3
    const se = Math.sqrt(var1 / n1 + var2 / n2)
    const expectedT = (mean1 - mean2) / se
    const result = math.studentTTest(s1, s2)
    assert(Math.abs(result.t - expectedT) < 1e-10, `expected t=${expectedT}, got ${result.t}`)
  })
})
