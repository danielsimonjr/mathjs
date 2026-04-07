import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createChebyshevDistance } from '../../../../src/function/geometry/chebyshevDistance.js'

const math = create({ ...all, createChebyshevDistance })

describe('chebyshevDistance', function () {
  it('should calculate the Chebyshev distance between two 2D points', function () {
    assert.strictEqual(math.chebyshevDistance([0, 0], [3, 4]), 4)
    assert.strictEqual(math.chebyshevDistance([0, 0], [0, 0]), 0)
    assert.strictEqual(math.chebyshevDistance([1, 1], [4, 5]), 4)
    assert.strictEqual(math.chebyshevDistance([-1, -1], [1, 1]), 2)
  })

  it('should calculate the Chebyshev distance between two 3D points', function () {
    assert.strictEqual(math.chebyshevDistance([1, 2, 3], [4, 6, 5]), 4)
    assert.strictEqual(math.chebyshevDistance([0, 0, 0], [1, 2, 3]), 3)
  })

  it('should return max absolute difference for N dimensions', function () {
    assert.strictEqual(math.chebyshevDistance([1, 2, 3, 10], [5, 6, 7, 11]), 4)
  })

  it('should handle negative coordinates', function () {
    assert.strictEqual(math.chebyshevDistance([-3, -4], [0, 0]), 4)
    assert.strictEqual(math.chebyshevDistance([-5, -1], [1, 2]), 6)
  })

  it('should throw an error for vectors of different lengths', function () {
    assert.throws(function () { math.chebyshevDistance([1, 2], [1, 2, 3]) }, TypeError)
  })

  it('should throw an error for empty vectors', function () {
    assert.throws(function () { math.chebyshevDistance([], []) }, TypeError)
  })

  it('should throw an error for non-array input', function () {
    assert.throws(function () { math.chebyshevDistance(1, 2) }, TypeError)
  })
})
