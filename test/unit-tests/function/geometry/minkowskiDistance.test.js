import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMinkowskiDistance } from '../../../../src/function/geometry/minkowskiDistance.js'

const math = create({ ...all, createMinkowskiDistance })

describe('minkowskiDistance', function () {
  it('should calculate Euclidean distance when p=2', function () {
    assert.strictEqual(math.minkowskiDistance([0, 0], [3, 4], 2), 5)
    assert.strictEqual(math.minkowskiDistance([0, 0], [0, 0], 2), 0)
    assert.strictEqual(math.minkowskiDistance([1, 1], [4, 5], 2), 5)
  })

  it('should calculate Manhattan distance when p=1', function () {
    assert.strictEqual(math.minkowskiDistance([0, 0], [3, 4], 1), 7)
    assert.strictEqual(math.minkowskiDistance([1, 2], [4, 6], 1), 7)
  })

  it('should calculate Chebyshev distance when p=Infinity', function () {
    assert.strictEqual(math.minkowskiDistance([0, 0], [3, 4], Infinity), 4)
    assert.strictEqual(math.minkowskiDistance([1, 2, 3], [4, 6, 5], Infinity), 4)
  })

  it('should handle arbitrary p values', function () {
    const result = math.minkowskiDistance([0, 0], [3, 4], 3)
    assert.ok(Math.abs(result - Math.pow(Math.pow(3, 3) + Math.pow(4, 3), 1 / 3)) < 1e-10)
  })

  it('should work in 3D', function () {
    assert.strictEqual(math.minkowskiDistance([0, 0, 0], [3, 4, 0], 2), 5)
  })

  it('should throw an error for p < 1', function () {
    assert.throws(function () { math.minkowskiDistance([0, 0], [1, 1], 0.5) }, TypeError)
  })

  it('should throw an error for vectors of different lengths', function () {
    assert.throws(function () { math.minkowskiDistance([1, 2], [1, 2, 3], 2) }, TypeError)
  })

  it('should throw an error for empty vectors', function () {
    assert.throws(function () { math.minkowskiDistance([], [], 2) }, TypeError)
  })

  it('should throw an error for non-array input', function () {
    assert.throws(function () { math.minkowskiDistance(1, 2, 2) }, TypeError)
  })
})
