import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createCovariance } from '../../../../src/function/statistics/covariance.js'

const math = create({ ...all, createCovariance })

describe('covariance', function () {
  it('should compute sample covariance for a known dataset', function () {
    // cov([1,2,3,4,5], [2,4,5,4,5]) = 1.5
    const result = math.covariance([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])
    assert(Math.abs(result - 1.5) < 1e-10)
  })

  it('should return negative covariance for inversely related data', function () {
    const result = math.covariance([1, 2, 3], [3, 2, 1])
    assert(Math.abs(result - (-1)) < 1e-10)
  })

  it('should return zero covariance for independent data', function () {
    const result = math.covariance([1, 2, 3, 4], [5, 5, 5, 5])
    assert(Math.abs(result) < 1e-10)
  })

  it('should equal variance when x and y are the same', function () {
    const data = [1, 2, 3, 4, 5]
    const cov = math.covariance(data, data)
    // Variance([1,2,3,4,5]) = 2.5
    assert(Math.abs(cov - 2.5) < 1e-10)
  })

  it('should accept matrices', function () {
    const x = math.matrix([1, 2, 3, 4, 5])
    const y = math.matrix([2, 4, 5, 4, 5])
    const result = math.covariance(x, y)
    assert(Math.abs(result - 1.5) < 1e-10)
  })

  it('should throw when arrays have different lengths', function () {
    assert.throws(() => math.covariance([1, 2, 3], [1, 2]), /same length/)
  })

  it('should throw when arrays have fewer than 2 elements', function () {
    assert.throws(() => math.covariance([1], [1]), /at least 2/)
  })
})
