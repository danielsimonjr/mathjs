import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createKurtosis } from '../../../../src/function/statistics/kurtosis.js'

const math = create({ ...all, createKurtosis })

describe('kurtosis', function () {
  it('should compute excess kurtosis for a known dataset', function () {
    // [2, 4, 4, 4, 5, 5, 7, 9] — sample excess kurtosis
    const result = math.kurtosis([2, 4, 4, 4, 5, 5, 7, 9])
    assert(Math.abs(result - 0.940625) < 1e-5)
  })

  it('should return negative kurtosis for a uniform-like distribution', function () {
    const result = math.kurtosis([1, 2, 3, 4, 5])
    assert(result < 0)
  })

  it('should return positive kurtosis for a peaked distribution', function () {
    // Data concentrated around the mean with heavy tails
    const result = math.kurtosis([0, 0, 0, 0, 0, 0, 10, -10, 20, -20])
    assert(result > 0)
  })

  it('should accept a matrix and return same result as array', function () {
    const arr = [2, 4, 4, 4, 5, 5, 7, 9]
    const m = math.matrix(arr)
    const fromArr = math.kurtosis(arr)
    const fromMat = math.kurtosis(m)
    assert(Math.abs(fromArr - fromMat) < 1e-15)
  })

  it('should throw for fewer than 4 data points', function () {
    assert.throws(() => math.kurtosis([1, 2, 3]), /at least 4/)
  })

  it('should throw when standard deviation is zero', function () {
    assert.throws(() => math.kurtosis([5, 5, 5, 5, 5]), /undefined/)
  })
})
