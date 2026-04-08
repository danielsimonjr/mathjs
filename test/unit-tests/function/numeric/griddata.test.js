import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { createGriddata } from '../../../../src/function/numeric/griddata.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...all, createGriddata })

describe('griddata', function () {
  it('should return an array of interpolated values', function () {
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 4]
    const xi = [[0.5], [1.5]]
    const result = math.griddata(pts, vals, xi)
    assert(Array.isArray(result), 'result should be an array')
    assert.strictEqual(result.length, 2, 'result length should match xi length')
  })

  it('should reproduce exact values at training points (nearest)', function () {
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 4]
    const xi = [[0], [1], [2]]
    const result = math.griddata(pts, vals, xi, 'nearest')
    for (let i = 0; i < vals.length; i++) {
      assert.strictEqual(result[i], vals[i])
    }
  })

  it('should use nearest neighbor correctly', function () {
    const pts = [[0], [1], [2]]
    const vals = [10, 20, 30]
    // Query at 0.4 — nearest is 0, query at 0.6 — nearest is 1
    const result = math.griddata(pts, vals, [[0.4], [0.6]], 'nearest')
    assert.strictEqual(result[0], 10)
    assert.strictEqual(result[1], 20)
  })

  it('should interpolate linearly (IDW) between two points', function () {
    const pts = [[0], [2]]
    const vals = [0, 2]
    // At x=1, equal distance to both: should return average = 1
    const result = math.griddata(pts, vals, [[1]], 'linear')
    assert(Math.abs(result[0] - 1) < 1e-9, 'IDW should return average at midpoint, got ' + result[0])
  })

  it('should use default method (linear) when not specified', function () {
    const pts = [[0], [2]]
    const vals = [0, 4]
    const result = math.griddata(pts, vals, [[1]])
    assert(typeof result[0] === 'number')
  })

  it('should handle 2D scattered data', function () {
    const pts = [[0, 0], [2, 0], [0, 2], [2, 2]]
    const vals = [0, 2, 2, 4]
    // Query at center [1,1]: should get ~2 by IDW
    const result = math.griddata(pts, vals, [[1, 1]], 'linear')
    assert(Math.abs(result[0] - 2) < 0.1, 'center interpolation should be near 2, got ' + result[0])
  })

  it('should reproduce exact values at training points (linear)', function () {
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 4]
    const result = math.griddata(pts, vals, [[0], [1], [2]], 'linear')
    for (let i = 0; i < vals.length; i++) {
      assert(Math.abs(result[i] - vals[i]) < 1e-10)
    }
  })

  it('should handle natural method', function () {
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 4]
    const result = math.griddata(pts, vals, [[1]], 'natural')
    assert(Math.abs(result[0] - 1) < 1e-10)
  })

  it('should throw for unknown method', function () {
    assert.throws(
      () => math.griddata([[0], [1]], [0, 1], [[0.5]], 'cubic'),
      /unknown method/
    )
  })

  it('should throw if points and values have different lengths', function () {
    assert.throws(
      () => math.griddata([[0], [1]], [0, 1, 2], [[0.5]]),
      /same length/
    )
  })

  it('should throw for empty points array', function () {
    assert.throws(
      () => math.griddata([], [], [[0.5]]),
      /at least one/
    )
  })
})
