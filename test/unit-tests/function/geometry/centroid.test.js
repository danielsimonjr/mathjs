import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createCentroid } from '../../../../src/function/geometry/centroid.js'

const math = create({ ...all, createCentroid })

describe('centroid', function () {
  it('should compute centroid of a rectangle', function () {
    // 4x3 rectangle: centroid at (2, 1.5)
    const c = math.centroid([[0, 0], [4, 0], [4, 3], [0, 3]])
    assert.ok(Math.abs(c[0] - 2) < 1e-10)
    assert.ok(Math.abs(c[1] - 1.5) < 1e-10)
  })

  it('should compute centroid of a triangle', function () {
    // Equilateral-ish: centroid = average of vertices = (3, 1)
    const c = math.centroid([[0, 0], [6, 0], [3, 3]])
    assert.ok(Math.abs(c[0] - 3) < 1e-10)
    assert.ok(Math.abs(c[1] - 1) < 1e-10)
  })

  it('should compute centroid of a unit square', function () {
    const c = math.centroid([[0, 0], [1, 0], [1, 1], [0, 1]])
    assert.ok(Math.abs(c[0] - 0.5) < 1e-10)
    assert.ok(Math.abs(c[1] - 0.5) < 1e-10)
  })

  it('should compute centroid of a right triangle', function () {
    // Vertices (0,0),(3,0),(0,3): centroid = (1,1)
    const c = math.centroid([[0, 0], [3, 0], [0, 3]])
    assert.ok(Math.abs(c[0] - 1) < 1e-10)
    assert.ok(Math.abs(c[1] - 1) < 1e-10)
  })

  it('should compute centroid of a point cloud (arithmetic mean for 1 or 2 points)', function () {
    const c = math.centroid([[0, 0], [2, 4]])
    assert.ok(Math.abs(c[0] - 1) < 1e-10)
    assert.ok(Math.abs(c[1] - 2) < 1e-10)
  })

  it('should compute centroid of a single point', function () {
    const c = math.centroid([[3, 7]])
    assert.ok(Math.abs(c[0] - 3) < 1e-10)
    assert.ok(Math.abs(c[1] - 7) < 1e-10)
  })

  it('should fall back to arithmetic mean for collinear points', function () {
    const c = math.centroid([[0, 0], [1, 0], [2, 0]])
    assert.ok(Math.abs(c[0] - 1) < 1e-10)
    assert.ok(Math.abs(c[1] - 0) < 1e-10)
  })

  it('should be order-independent for symmetric shapes', function () {
    // Reversing vertex order of a rectangle should give same centroid
    const c1 = math.centroid([[0, 0], [4, 0], [4, 3], [0, 3]])
    const c2 = math.centroid([[0, 3], [4, 3], [4, 0], [0, 0]])
    assert.ok(Math.abs(c1[0] - c2[0]) < 1e-10)
    assert.ok(Math.abs(c1[1] - c2[1]) < 1e-10)
  })

  it('should throw for an empty array', function () {
    assert.throws(function () { math.centroid([]) }, TypeError)
  })

  it('should throw for non-2D points', function () {
    assert.throws(function () { math.centroid([[0, 0, 0], [1, 0, 0], [0, 1, 0]]) }, TypeError)
  })

  it('should throw for non-array input', function () {
    assert.throws(function () { math.centroid(42) }, TypeError)
  })

  it('should throw for non-numeric coordinates', function () {
    assert.throws(function () { math.centroid([['a', 0], [1, 0], [0, 1]]) }, TypeError)
  })
})
