import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createAnova } from '../../../../src/function/statistics/anova.js'

const math = create({ ...all, createAnova })

describe('anova', function () {
  it('should return F, pValue, dfBetween, dfWithin', function () {
    const result = math.anova([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    assert.strictEqual(typeof result.F, 'number')
    assert.strictEqual(typeof result.pValue, 'number')
    assert.strictEqual(typeof result.dfBetween, 'number')
    assert.strictEqual(typeof result.dfWithin, 'number')
  })

  it('should return small pValue for groups with very different means', function () {
    const result = math.anova([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    assert(result.pValue < 0.01, `expected small p-value, got ${result.pValue}`)
    assert(result.F > 1, `expected F > 1, got ${result.F}`)
  })

  it('should return large pValue for groups with identical means', function () {
    const result = math.anova([[2, 3, 4], [2, 3, 4]])
    assert(result.pValue > 0.5, `expected large p-value, got ${result.pValue}`)
  })

  it('should have correct degrees of freedom', function () {
    const groups = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const result = math.anova(groups)
    assert.strictEqual(result.dfBetween, 2) // k - 1 = 3 - 1
    assert.strictEqual(result.dfWithin, 6)  // N - k = 9 - 3
  })

  it('should have pValue in [0, 1]', function () {
    const result = math.anova([[1, 2], [3, 4], [5, 6]])
    assert(result.pValue >= 0 && result.pValue <= 1, `pValue=${result.pValue} not in [0,1]`)
  })

  it('should have F >= 0', function () {
    const result = math.anova([[1, 2, 3], [4, 5, 6]])
    assert(result.F >= 0, `F=${result.F} should be non-negative`)
  })

  it('should throw for fewer than 2 groups', function () {
    assert.throws(() => math.anova([[1, 2, 3]]), /at least 2 groups/)
  })

  it('should throw for empty groups', function () {
    assert.throws(() => math.anova([[], [1, 2]]), /non-empty/)
  })

  it('should handle groups of different sizes', function () {
    const result = math.anova([[1, 2], [4, 5, 6], [7]])
    assert.strictEqual(typeof result.F, 'number')
    assert(result.dfWithin > 0)
  })

  it('should verify F statistic formula for simple case', function () {
    // Three groups of 3 each: [1,2,3], [4,5,6], [7,8,9]
    // Grand mean = 5, group means = 2, 5, 8
    // SSB = 3*((2-5)^2 + (5-5)^2 + (8-5)^2) = 3*(9+0+9) = 54
    // SSW = sum of ((1-2)^2+(2-2)^2+(3-2)^2 + (4-5)^2+...) = 2+2 = 6
    // MSB = 54/2 = 27, MSW = 6/6 = 1
    // F = 27
    const result = math.anova([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    assert(Math.abs(result.F - 27) < 1e-10, `expected F=27, got ${result.F}`)
  })
})
