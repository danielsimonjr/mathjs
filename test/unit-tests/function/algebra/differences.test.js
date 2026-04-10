import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDifferences } from '../../../../src/function/algebra/differences.js'

const math = create({ ...all, createDifferences })

describe('differences', function () {
  it('should compute first differences of [1, 4, 9, 16, 25]', function () {
    const result = math.differences([1, 4, 9, 16, 25])
    assert.deepStrictEqual(result, [3, 5, 7, 9])
  })

  it('should compute second differences of [1, 4, 9, 16, 25]', function () {
    const result = math.differences([1, 4, 9, 16, 25], 2)
    assert.deepStrictEqual(result, [2, 2, 2])
  })

  it('should compute third differences of [1, 4, 9, 16, 25]', function () {
    const result = math.differences([1, 4, 9, 16, 25], 3)
    assert.deepStrictEqual(result, [0, 0])
  })

  it('should return a copy with order 0', function () {
    const seq = [1, 2, 3]
    const result = math.differences(seq, 0)
    assert.deepStrictEqual(result, [1, 2, 3])
    // Ensure it's a copy
    assert.notStrictEqual(result, seq)
  })

  it('should return empty array for order >= length', function () {
    const result = math.differences([1, 2], 2)
    assert.deepStrictEqual(result, [])
  })

  it('should compute first differences of geometric sequence', function () {
    const result = math.differences([1, 2, 4, 8, 16])
    assert.deepStrictEqual(result, [1, 2, 4, 8])
  })

  it('should throw for non-integer order', function () {
    assert.throws(function () {
      math.differences([1, 2, 3], 1.5)
    }, /non-negative integer/)
  })

  it('should throw for negative order', function () {
    assert.throws(function () {
      math.differences([1, 2, 3], -1)
    }, /non-negative integer/)
  })

  it('should handle a single-element array', function () {
    const result = math.differences([5])
    assert.deepStrictEqual(result, [])
  })

  it('should handle two-element array', function () {
    const result = math.differences([3, 7])
    assert.deepStrictEqual(result, [4])
  })
})
