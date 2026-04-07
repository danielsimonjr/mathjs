import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMovingAverage } from '../../../../src/function/statistics/movingAverage.js'

const math = create({ ...all, createMovingAverage })

describe('movingAverage', function () {
  it('should compute moving average with window 3', function () {
    const result = math.movingAverage([1, 2, 3, 4, 5], 3)
    assert.deepStrictEqual(result, [2, 3, 4])
  })

  it('should compute moving average with window 2', function () {
    const result = math.movingAverage([10, 20, 30, 40], 2)
    assert.deepStrictEqual(result, [15, 25, 35])
  })

  it('should return a single element when window equals array length', function () {
    const result = math.movingAverage([1, 2, 3, 4, 5], 5)
    assert(Math.abs(result[0] - 3) < 1e-10)
    assert.strictEqual(result.length, 1)
  })

  it('should return original array when window is 1', function () {
    const result = math.movingAverage([5, 10, 15], 1)
    assert.deepStrictEqual(result, [5, 10, 15])
  })

  it('should accept a matrix', function () {
    const m = math.matrix([1, 2, 3, 4, 5])
    const result = math.movingAverage(m, 3)
    assert.deepStrictEqual(result, [2, 3, 4])
  })

  it('should throw when window is larger than array', function () {
    assert.throws(() => math.movingAverage([1, 2, 3], 5), /cannot exceed/)
  })

  it('should throw when window is not a positive integer', function () {
    assert.throws(() => math.movingAverage([1, 2, 3], 0), /positive integer/)
    assert.throws(() => math.movingAverage([1, 2, 3], 1.5), /positive integer/)
  })
})
