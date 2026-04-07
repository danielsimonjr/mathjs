import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const loess = math.loess

describe('loess', function () {
  it('should return an array of same length as input', function () {
    const x = [1, 2, 3, 4, 5]
    const y = [1, 4, 9, 16, 25]
    const result = loess(x, y)
    assert.strictEqual(result.length, 5)
  })

  it('should smooth noisy data (output values are finite)', function () {
    const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const y = [2, 4, 5, 4, 5, 7, 8, 9, 10, 12]
    const result = loess(x, y)
    assert.strictEqual(result.length, 10)
    for (const v of result) {
      assert(isFinite(v))
    }
  })

  it('should fit a linear function well', function () {
    const x = [1, 2, 3, 4, 5]
    const y = [2, 4, 6, 8, 10]  // y = 2x
    const result = loess(x, y, 1.0)
    for (let i = 0; i < x.length; i++) {
      assert(Math.abs(result[i] - y[i]) < 0.5)
    }
  })

  it('should accept a custom span parameter', function () {
    const x = [1, 2, 3, 4, 5]
    const y = [1, 4, 9, 16, 25]
    const result1 = loess(x, y, 0.5)
    const result2 = loess(x, y, 0.9)
    assert.strictEqual(result1.length, 5)
    assert.strictEqual(result2.length, 5)
  })

  it('should throw for mismatched x and y lengths', function () {
    assert.throws(function () {
      loess([1, 2, 3], [1, 2])
    }, /same length/)
  })

  it('should throw for invalid span', function () {
    assert.throws(function () {
      loess([1, 2, 3], [1, 2, 3], 0)
    }, /span/)
    assert.throws(function () {
      loess([1, 2, 3], [1, 2, 3], 1.5)
    }, /span/)
  })

  it('should work with span=1.0 (all points)', function () {
    const x = [1, 2, 3, 4, 5]
    const y = [1, 2, 3, 4, 5]
    const result = loess(x, y, 1.0)
    assert.strictEqual(result.length, 5)
    for (const v of result) {
      assert(isFinite(v))
    }
  })
})
