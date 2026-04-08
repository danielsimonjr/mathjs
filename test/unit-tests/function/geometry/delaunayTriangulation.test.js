import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDelaunayTriangulation } from '../../../../src/function/geometry/delaunayTriangulation.js'

const math = create({ ...all, createDelaunayTriangulation })

describe('delaunayTriangulation', function () {
  it('should triangulate a square into 2 triangles', function () {
    const tris = math.delaunayTriangulation([[0, 0], [1, 0], [1, 1], [0, 1]])
    assert.strictEqual(tris.length, 2)
    // Each triangle is 3 indices
    tris.forEach(function (t) {
      assert.strictEqual(t.length, 3)
      t.forEach(function (idx) {
        assert.ok(idx >= 0 && idx <= 3)
      })
    })
    // All 4 point indices appear
    const used = new Set(tris.flat())
    assert.strictEqual(used.size, 4)
  })

  it('should triangulate a triangle into 1 triangle', function () {
    const tris = math.delaunayTriangulation([[0, 0], [2, 0], [1, 2]])
    assert.strictEqual(tris.length, 1)
    const used = new Set(tris.flat())
    assert.strictEqual(used.size, 3)
  })

  it('should triangulate 5 points', function () {
    const points = [[0, 0], [2, 0], [2, 2], [0, 2], [1, 1]]
    const tris = math.delaunayTriangulation(points)
    assert.ok(tris.length >= 2)
    tris.forEach(function (t) {
      assert.strictEqual(t.length, 3)
      t.forEach(function (idx) {
        assert.ok(idx >= 0 && idx < points.length)
      })
    })
  })

  it('should return indices into the original points array', function () {
    const points = [[0, 0], [3, 0], [1.5, 2]]
    const tris = math.delaunayTriangulation(points)
    tris.forEach(function (t) {
      // Each index is valid
      t.forEach(function (idx) {
        assert.ok(Number.isInteger(idx))
        assert.ok(idx >= 0 && idx < points.length)
      })
      // No duplicate indices within a triangle
      const s = new Set(t)
      assert.strictEqual(s.size, 3)
    })
  })

  it('should throw for fewer than 3 points', function () {
    assert.throws(function () { math.delaunayTriangulation([[0, 0], [1, 0]]) }, TypeError)
  })

  it('should throw for non-2D points', function () {
    assert.throws(function () { math.delaunayTriangulation([[0, 0, 0], [1, 0, 0], [0, 1, 0]]) }, TypeError)
  })

  it('should throw for non-array input', function () {
    assert.throws(function () { math.delaunayTriangulation(42) }, TypeError)
  })

  it('should throw for non-numeric coordinates', function () {
    assert.throws(function () { math.delaunayTriangulation([['a', 0], [1, 0], [0, 1]]) }, TypeError)
  })
})
