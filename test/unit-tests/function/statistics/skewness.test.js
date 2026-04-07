import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createSkewness } from '../../../../src/function/statistics/skewness.js'

const math = create({ ...all, createSkewness })

describe('skewness', function () {
  it('should return 0 for a symmetric dataset', function () {
    // Perfectly symmetric data has zero skewness
    const result = math.skewness([2, 4, 6, 8, 10])
    assert(Math.abs(result) < 1e-10)
  })

  it('should return positive skewness for right-skewed data', function () {
    const result = math.skewness([1, 2, 3, 4, 100])
    assert(result > 0)
  })

  it('should return negative skewness for left-skewed data', function () {
    const result = math.skewness([1, 98, 99, 100, 101])
    assert(result < 0)
  })

  it('should compute skewness for a known dataset', function () {
    // [2, 4, 4, 4, 5, 5, 7, 9] — adjusted Fisher-Pearson result
    const result = math.skewness([2, 4, 4, 4, 5, 5, 7, 9])
    assert(Math.abs(result - 0.8184875533567996) < 1e-8)
  })

  it('should accept a matrix and return same result as array', function () {
    const arr = [2, 4, 6, 8, 10]
    const m = math.matrix(arr)
    const fromArr = math.skewness(arr)
    const fromMat = math.skewness(m)
    assert(Math.abs(fromArr - fromMat) < 1e-15)
  })

  it('should throw for fewer than 3 data points', function () {
    assert.throws(() => math.skewness([1, 2]), /at least 3/)
  })

  it('should throw when standard deviation is zero', function () {
    assert.throws(() => math.skewness([5, 5, 5, 5]), /undefined/)
  })
})
