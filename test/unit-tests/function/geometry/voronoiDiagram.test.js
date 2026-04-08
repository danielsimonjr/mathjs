import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createVoronoiDiagram } from '../../../../src/function/geometry/voronoiDiagram.js'

const math = create({ ...all, createVoronoiDiagram })

describe('voronoiDiagram', function () {
  it('should return vertices and cells for a triangle of points', function () {
    const result = math.voronoiDiagram([[0, 0], [1, 0], [0.5, 1]])
    assert.ok(result && typeof result === 'object')
    assert.ok(Array.isArray(result.vertices))
    assert.ok(Array.isArray(result.cells))
    assert.strictEqual(result.cells.length, 3)
  })

  it('should return one cell per input point', function () {
    const points = [[0, 0], [2, 0], [2, 2], [0, 2]]
    const result = math.voronoiDiagram(points)
    assert.strictEqual(result.cells.length, points.length)
  })

  it('should have vertices as 2D arrays', function () {
    const result = math.voronoiDiagram([[0, 0], [1, 0], [0.5, 1]])
    result.vertices.forEach(function (v) {
      assert.ok(Array.isArray(v))
      assert.strictEqual(v.length, 2)
      assert.ok(typeof v[0] === 'number')
      assert.ok(typeof v[1] === 'number')
    })
  })

  it('should accept an optional bounds parameter', function () {
    const points = [[0, 0], [1, 0], [0.5, 1]]
    const result = math.voronoiDiagram(points, [-5, -5, 5, 5])
    assert.ok(Array.isArray(result.vertices))
    assert.strictEqual(result.cells.length, 3)
  })

  it('should throw for fewer than 2 points', function () {
    assert.throws(function () { math.voronoiDiagram([[0, 0]]) }, TypeError)
  })

  it('should throw for non-2D points', function () {
    assert.throws(function () { math.voronoiDiagram([[0, 0, 0], [1, 0, 0]]) }, TypeError)
  })

  it('should throw for invalid bounds', function () {
    assert.throws(function () {
      math.voronoiDiagram([[0, 0], [1, 0], [0.5, 1]], [0, 0, 1])
    }, TypeError)
  })

  it('should throw for non-array input', function () {
    assert.throws(function () { math.voronoiDiagram(42) }, TypeError)
  })
})
