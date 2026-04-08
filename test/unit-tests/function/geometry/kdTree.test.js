import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createKdTree } from '../../../../src/function/geometry/kdTree.js'

const math = create({ ...all, createKdTree })

describe('kdTree', function () {
  const points = [
    [0, 0], [1, 0], [0, 1], [1, 1],
    [2, 0], [2, 1], [0, 2], [1, 2], [2, 2], [0.5, 0.5]
  ]

  it('should return an object with nearest and rangeSearch methods', function () {
    const tree = math.kdTree(points)
    assert.ok(tree && typeof tree === 'object')
    assert.ok(typeof tree.nearest === 'function')
    assert.ok(typeof tree.rangeSearch === 'function')
  })

  it('nearest should find the closest point', function () {
    const tree = math.kdTree(points)
    const result = tree.nearest([0.4, 0.4], 1)
    assert.strictEqual(result.length, 1)
    const closest = result[0][0]
    // [0.5, 0.5] is the closest point to [0.4, 0.4]
    assert.ok(Math.abs(closest[0] - 0.5) < 1e-10)
    assert.ok(Math.abs(closest[1] - 0.5) < 1e-10)
  })

  it('nearest should find k nearest points', function () {
    const tree = math.kdTree(points)
    const result = tree.nearest([0, 0], 3)
    assert.strictEqual(result.length, 3)
    // First result should be [0,0] itself
    assert.ok(result[0][1] < 1e-10) // dist = 0
    // Results should be sorted by distance
    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i][1] >= result[i - 1][1])
    }
  })

  it('nearest result format should be [[point, dist], ...]', function () {
    const tree = math.kdTree(points)
    const result = tree.nearest([0, 0], 2)
    result.forEach(function (r) {
      assert.ok(Array.isArray(r))
      assert.strictEqual(r.length, 2)
      assert.ok(Array.isArray(r[0])) // point
      assert.ok(typeof r[1] === 'number') // distance
      assert.ok(r[1] >= 0)
    })
  })

  it('rangeSearch should return all points within radius', function () {
    const tree = math.kdTree(points)
    const result = tree.rangeSearch([0, 0], 1.1)
    // [0,0], [1,0], [0,1], [0.5,0.5] are all within ~1.1 of [0,0]
    assert.ok(result.length >= 4)
    result.forEach(function (p) {
      const dx = p[0]
      const dy = p[1]
      assert.ok(Math.sqrt(dx * dx + dy * dy) <= 1.1 + 1e-10)
    })
  })

  it('rangeSearch should return empty array if no points within radius', function () {
    const tree = math.kdTree(points)
    const result = tree.rangeSearch([10, 10], 0.1)
    assert.strictEqual(result.length, 0)
  })

  it('should work with 1D points', function () {
    const pts1d = [[0], [1], [2], [3], [4]]
    const tree = math.kdTree(pts1d)
    const result = tree.nearest([2.1], 1)
    assert.ok(Math.abs(result[0][0][0] - 2) < 1e-10)
  })

  it('should throw for empty points array', function () {
    assert.throws(function () { math.kdTree([]) }, TypeError)
  })

  it('should throw for non-array input', function () {
    assert.throws(function () { math.kdTree(42) }, TypeError)
  })

  it('nearest should throw for mismatched dimension', function () {
    const tree = math.kdTree([[0, 0], [1, 1]])
    assert.throws(function () { tree.nearest([0, 0, 0], 1) }, TypeError)
  })

  it('rangeSearch should throw for negative radius', function () {
    const tree = math.kdTree([[0, 0], [1, 1]])
    assert.throws(function () { tree.rangeSearch([0, 0], -1) }, TypeError)
  })
})
