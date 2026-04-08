import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMannWhitneyTest } from '../../../../src/function/statistics/mannWhitneyTest.js'

const math = create({ ...all, createMannWhitneyTest })

describe('mannWhitneyTest', function () {
  it('should return U and pValue', function () {
    const result = math.mannWhitneyTest([1, 2, 3], [4, 5, 6])
    assert.strictEqual(typeof result.U, 'number')
    assert.strictEqual(typeof result.pValue, 'number')
  })

  it('should return U=0 for completely separated samples (sample1 all lower)', function () {
    const result = math.mannWhitneyTest([1, 2, 3], [4, 5, 6])
    assert.strictEqual(result.U, 0, `expected U=0, got ${result.U}`)
  })

  it('should return small pValue for clearly different distributions', function () {
    const s1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    const s2 = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
    const result = math.mannWhitneyTest(s1, s2)
    assert(result.pValue < 0.01, `expected small p-value, got ${result.pValue}`)
  })

  it('should return large pValue for samples from the same distribution', function () {
    const s = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const s1 = s.filter((_, i) => i % 2 === 0)
    const s2 = s.filter((_, i) => i % 2 === 1)
    const result = math.mannWhitneyTest(s1, s2)
    assert(result.pValue > 0.3, `expected large p-value, got ${result.pValue}`)
  })

  it('should have pValue in [0, 1]', function () {
    const result = math.mannWhitneyTest([1, 2, 3], [2, 3, 4])
    assert(result.pValue >= 0 && result.pValue <= 1)
  })

  it('should have U >= 0', function () {
    const result = math.mannWhitneyTest([1, 2, 3], [4, 5, 6])
    assert(result.U >= 0, `U=${result.U} should be non-negative`)
  })

  it('should have U <= n1*n2', function () {
    const n1 = 4
    const n2 = 5
    const result = math.mannWhitneyTest([1, 2, 3, 4], [3, 4, 5, 6, 7])
    assert(result.U <= n1 * n2, `U=${result.U} should not exceed n1*n2=${n1 * n2}`)
  })

  it('should be symmetric: same pValue when samples swapped', function () {
    const s1 = [1, 2, 3, 4, 5]
    const s2 = [6, 7, 8, 9, 10]
    const r1 = math.mannWhitneyTest(s1, s2)
    const r2 = math.mannWhitneyTest(s2, s1)
    assert(Math.abs(r1.pValue - r2.pValue) < 1e-10, `pValues should be equal when swapped`)
    assert(Math.abs(r1.U - r2.U) < 1e-10, `U should be equal (min) when swapped`)
  })

  it('should handle ties correctly', function () {
    const result = math.mannWhitneyTest([1, 2, 2, 3], [2, 2, 3, 4])
    assert.strictEqual(typeof result.U, 'number')
    assert(result.pValue >= 0 && result.pValue <= 1)
  })

  it('should throw for empty sample1', function () {
    assert.throws(() => math.mannWhitneyTest([], [1, 2, 3]), /non-empty/)
  })

  it('should throw for empty sample2', function () {
    assert.throws(() => math.mannWhitneyTest([1, 2, 3], []), /non-empty/)
  })
})
