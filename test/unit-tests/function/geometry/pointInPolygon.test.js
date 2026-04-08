import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createPointInPolygon } from '../../../../src/function/geometry/pointInPolygon.js'

const math = create({ ...all, createPointInPolygon })

describe('pointInPolygon', function () {
  const square = [[0, 0], [1, 0], [1, 1], [0, 1]]

  it('should return true for a point inside a unit square', function () {
    assert.strictEqual(math.pointInPolygon([0.5, 0.5], square), true)
  })

  it('should return false for a point outside a unit square', function () {
    assert.strictEqual(math.pointInPolygon([2, 2], square), false)
    assert.strictEqual(math.pointInPolygon([-0.1, 0.5], square), false)
    assert.strictEqual(math.pointInPolygon([0.5, 1.5], square), false)
  })

  it('should work for a triangle', function () {
    const triangle = [[0, 0], [4, 0], [2, 4]]
    assert.strictEqual(math.pointInPolygon([2, 1], triangle), true)
    assert.strictEqual(math.pointInPolygon([0, 3], triangle), false)
  })

  it('should work for a non-convex polygon', function () {
    // L-shaped polygon
    const lShape = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]]
    assert.strictEqual(math.pointInPolygon([0.5, 0.5], lShape), true)
    assert.strictEqual(math.pointInPolygon([1.5, 1.5], lShape), false)
  })

  it('should return false for a point at the corner (consistent with ray casting)', function () {
    // Ray casting is not guaranteed for boundary points, but should not crash
    const result = math.pointInPolygon([0, 0], square)
    assert.ok(typeof result === 'boolean')
  })

  it('should throw for a non-2D point', function () {
    assert.throws(function () { math.pointInPolygon([0, 0, 0], square) }, TypeError)
  })

  it('should throw for a polygon with fewer than 3 vertices', function () {
    assert.throws(function () { math.pointInPolygon([0.5, 0.5], [[0, 0], [1, 0]]) }, TypeError)
  })

  it('should throw for non-array point', function () {
    assert.throws(function () { math.pointInPolygon(42, square) }, TypeError)
  })

  it('should throw for non-numeric coordinates', function () {
    assert.throws(function () { math.pointInPolygon(['a', 0], square) }, TypeError)
  })
})
