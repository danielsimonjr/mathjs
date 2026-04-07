import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLinreg } from '../../../../src/function/statistics/linreg.js'

const math = create({ ...all, createLinreg })

describe('linreg', function () {
  it('should compute slope and intercept for a known dataset', function () {
    const result = math.linreg([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])
    assert(Math.abs(result.slope - 0.6) < 1e-10)
    assert(Math.abs(result.intercept - 2.2) < 1e-10)
  })

  it('should compute r and r2', function () {
    const result = math.linreg([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])
    assert(Math.abs(result.r2 - result.r * result.r) < 1e-10)
    // r should be between -1 and 1
    assert(Math.abs(result.r) <= 1)
  })

  it('should predict correctly', function () {
    const result = math.linreg([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])
    assert(Math.abs(result.predict(6) - (result.slope * 6 + result.intercept)) < 1e-10)
  })

  it('should return perfect r=1 for a perfectly linear dataset', function () {
    const result = math.linreg([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])
    assert(Math.abs(result.r - 1) < 1e-10)
    assert(Math.abs(result.slope - 2) < 1e-10)
    assert(Math.abs(result.intercept - 0) < 1e-10)
  })

  it('should return r=-1 for a perfectly inverse-linear dataset', function () {
    const result = math.linreg([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])
    assert(Math.abs(result.r - (-1)) < 1e-10)
    assert(Math.abs(result.slope - (-2)) < 1e-10)
  })

  it('should accept matrices', function () {
    const x = math.matrix([1, 2, 3, 4, 5])
    const y = math.matrix([2, 4, 6, 8, 10])
    const result = math.linreg(x, y)
    assert(Math.abs(result.slope - 2) < 1e-10)
  })

  it('should throw when arrays have different lengths', function () {
    assert.throws(() => math.linreg([1, 2, 3], [1, 2]), /same length/)
  })

  it('should throw when arrays have fewer than 2 elements', function () {
    assert.throws(() => math.linreg([1], [2]), /at least 2/)
  })

  it('should throw when all x values are identical', function () {
    assert.throws(() => math.linreg([3, 3, 3], [1, 2, 3]), /identical/)
  })
})
