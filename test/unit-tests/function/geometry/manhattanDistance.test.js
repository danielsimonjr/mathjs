import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createManhattanDistance } from '../../../../src/function/geometry/manhattanDistance.js'

const math = create({ ...all, createManhattanDistance })

describe('manhattanDistance', function () {
  it('should calculate the Manhattan distance between two 2D points', function () {
    assert.strictEqual(math.manhattanDistance([0, 0], [3, 4]), 7)
    assert.strictEqual(math.manhattanDistance([0, 0], [0, 0]), 0)
    assert.strictEqual(math.manhattanDistance([1, 1], [4, 5]), 7)
    assert.strictEqual(math.manhattanDistance([-1, -1], [1, 1]), 4)
  })

  it('should calculate the Manhattan distance between two 3D points', function () {
    assert.strictEqual(math.manhattanDistance([1, 2, 3], [4, 6, 8]), 12)
    assert.strictEqual(math.manhattanDistance([0, 0, 0], [1, 1, 1]), 3)
  })

  it('should calculate the Manhattan distance in N dimensions', function () {
    assert.strictEqual(math.manhattanDistance([1, 2, 3, 4], [5, 6, 7, 8]), 16)
  })

  it('should handle negative coordinates', function () {
    assert.strictEqual(math.manhattanDistance([-3, -4], [0, 0]), 7)
    assert.strictEqual(math.manhattanDistance([-1, -2], [1, 2]), 6)
  })

  it('should throw an error for vectors of different lengths', function () {
    assert.throws(function () { math.manhattanDistance([1, 2], [1, 2, 3]) }, TypeError)
  })

  it('should throw an error for empty vectors', function () {
    assert.throws(function () { math.manhattanDistance([], []) }, TypeError)
  })

  it('should throw an error for non-array input', function () {
    assert.throws(function () { math.manhattanDistance(1, 2) }, TypeError)
  })
})
