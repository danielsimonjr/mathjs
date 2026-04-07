import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createConvexHull } from '../../../../src/function/geometry/convexHull.js'

const math = create({ ...all, createConvexHull })

describe('convexHull', function () {
  it('should compute the convex hull of a simple triangle', function () {
    const hull = math.convexHull([[0, 0], [3, 0], [0, 4]])
    assert.strictEqual(hull.length, 3)
    assert.ok(hull.some(p => p[0] === 0 && p[1] === 0))
    assert.ok(hull.some(p => p[0] === 3 && p[1] === 0))
    assert.ok(hull.some(p => p[0] === 0 && p[1] === 4))
  })

  it('should exclude interior points', function () {
    // Interior point [1, 0.5] should not be in the hull
    const hull = math.convexHull([[0, 0], [1, 1], [2, 0], [1, 2], [1, 0.5]])
    assert.strictEqual(hull.length, 3)
    assert.ok(hull.every(p => !(p[0] === 1 && p[1] === 0.5)))
    assert.ok(hull.some(p => p[0] === 0 && p[1] === 0))
    assert.ok(hull.some(p => p[0] === 2 && p[1] === 0))
    assert.ok(hull.some(p => p[0] === 1 && p[1] === 2))
  })

  it('should compute the convex hull of a square', function () {
    const hull = math.convexHull([[0, 0], [1, 0], [1, 1], [0, 1]])
    assert.strictEqual(hull.length, 4)
    assert.ok(hull.some(p => p[0] === 0 && p[1] === 0))
    assert.ok(hull.some(p => p[0] === 1 && p[1] === 0))
    assert.ok(hull.some(p => p[0] === 1 && p[1] === 1))
    assert.ok(hull.some(p => p[0] === 0 && p[1] === 1))
  })

  it('should handle a single point', function () {
    const hull = math.convexHull([[3, 4]])
    assert.strictEqual(hull.length, 1)
    assert.deepStrictEqual(hull[0], [3, 4])
  })

  it('should handle two points', function () {
    const hull = math.convexHull([[0, 0], [1, 1]])
    assert.strictEqual(hull.length, 2)
  })

  it('should handle collinear points', function () {
    // Middle collinear point is excluded by monotone chain
    const hull = math.convexHull([[0, 0], [1, 0], [2, 0]])
    assert.strictEqual(hull.length, 2)
    assert.ok(hull.some(p => p[0] === 0 && p[1] === 0))
    assert.ok(hull.some(p => p[0] === 2 && p[1] === 0))
  })

  it('should throw an error for empty input', function () {
    assert.throws(function () { math.convexHull([]) }, TypeError)
  })

  it('should throw an error for non-2D points', function () {
    assert.throws(function () { math.convexHull([[0, 0, 0], [1, 0, 0], [1, 1, 0]]) }, TypeError)
  })

  it('should throw an error for non-array input', function () {
    assert.throws(function () { math.convexHull(42) }, TypeError)
  })
})
