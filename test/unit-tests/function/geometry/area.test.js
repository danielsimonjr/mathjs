import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createArea } from '../../../../src/function/geometry/area.js'

const math = create({ ...all, createArea })

describe('area', function () {
  it('should calculate the area of a rectangle', function () {
    assert.strictEqual(math.area([[0, 0], [4, 0], [4, 3], [0, 3]]), 12)
    assert.strictEqual(math.area([[0, 0], [5, 0], [5, 2], [0, 2]]), 10)
  })

  it('should calculate the area of a triangle', function () {
    assert.strictEqual(math.area([[0, 0], [3, 0], [0, 4]]), 6)
    assert.strictEqual(math.area([[0, 0], [4, 0], [2, 3]]), 6)
  })

  it('should calculate the area of a unit square', function () {
    assert.strictEqual(math.area([[0, 0], [1, 0], [1, 1], [0, 1]]), 1)
  })

  it('should return the same area for clockwise and counterclockwise vertex order', function () {
    const ccw = math.area([[0, 0], [4, 0], [4, 3], [0, 3]])
    const cw = math.area([[0, 0], [0, 3], [4, 3], [4, 0]])
    assert.strictEqual(ccw, cw)
  })

  it('should handle a degenerate polygon (collinear points) returning 0', function () {
    assert.strictEqual(math.area([[0, 0], [1, 1], [2, 2]]), 0)
  })

  it('should work with non-integer coordinates', function () {
    const result = math.area([[0, 0], [1.5, 0], [1.5, 2], [0, 2]])
    assert.ok(Math.abs(result - 3) < 1e-10)
  })

  it('should throw an error for fewer than 3 vertices', function () {
    assert.throws(function () { math.area([[0, 0], [1, 1]]) }, TypeError)
    assert.throws(function () { math.area([[0, 0]]) }, TypeError)
    assert.throws(function () { math.area([]) }, TypeError)
  })

  it('should throw an error for non-2D vertices', function () {
    assert.throws(function () { math.area([[0, 0, 0], [1, 0, 0], [1, 1, 0]]) }, TypeError)
  })

  it('should throw an error for non-array input', function () {
    assert.throws(function () { math.area(42) }, TypeError)
  })
})
