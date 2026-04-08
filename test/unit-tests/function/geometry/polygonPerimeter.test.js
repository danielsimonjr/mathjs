import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createPolygonPerimeter } from '../../../../src/function/geometry/polygonPerimeter.js'

const math = create({ ...all, createPolygonPerimeter })

describe('polygonPerimeter', function () {
  it('should compute perimeter of a rectangle', function () {
    // 3-4-3-4 rectangle: perimeter = 14
    const p = math.polygonPerimeter([[0, 0], [3, 0], [3, 4], [0, 4]])
    assert.ok(Math.abs(p - 14) < 1e-10)
  })

  it('should compute perimeter of a unit square', function () {
    const p = math.polygonPerimeter([[0, 0], [1, 0], [1, 1], [0, 1]])
    assert.ok(Math.abs(p - 4) < 1e-10)
  })

  it('should compute perimeter of a right triangle', function () {
    // 3-4-5 triangle: perimeter = 12
    const p = math.polygonPerimeter([[0, 0], [3, 0], [0, 4]])
    assert.ok(Math.abs(p - 12) < 1e-10)
  })

  it('should compute perimeter of an equilateral triangle (approx)', function () {
    const s = 1
    const h = Math.sqrt(3) / 2
    const p = math.polygonPerimeter([[0, 0], [s, 0], [s / 2, h]])
    assert.ok(Math.abs(p - 3) < 1e-10)
  })

  it('should work for a regular hexagon (approx)', function () {
    const pts = []
    for (let i = 0; i < 6; i++) {
      pts.push([Math.cos((Math.PI / 3) * i), Math.sin((Math.PI / 3) * i)])
    }
    const p = math.polygonPerimeter(pts)
    // Side length ≈ 1, so perimeter ≈ 6
    assert.ok(Math.abs(p - 6) < 1e-10)
  })

  it('should handle a degenerate line (2 points)', function () {
    // Back and forth: 2 * sqrt(3^2 + 4^2) = 10
    const p = math.polygonPerimeter([[0, 0], [3, 4]])
    assert.ok(Math.abs(p - 10) < 1e-10)
  })

  it('should throw for fewer than 2 vertices', function () {
    assert.throws(function () { math.polygonPerimeter([[0, 0]]) }, TypeError)
  })

  it('should throw for non-2D points', function () {
    assert.throws(function () { math.polygonPerimeter([[0, 0, 0], [1, 0, 0], [0, 1, 0]]) }, TypeError)
  })

  it('should throw for non-array input', function () {
    assert.throws(function () { math.polygonPerimeter(42) }, TypeError)
  })

  it('should throw for non-numeric coordinates', function () {
    assert.throws(function () { math.polygonPerimeter([['a', 0], [1, 0], [0, 1]]) }, TypeError)
  })
})
