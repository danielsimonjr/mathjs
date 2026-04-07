import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('bezierCurve', function () {
  it('should evaluate quadratic Bezier at t=0.5', function () {
    // Quadratic Bezier: [[0,0],[1,1],[2,0]] at t=0.5 → [1, 0.5]
    const pt = math.bezierCurve([[0, 0], [1, 1], [2, 0]], 0.5)
    assert(Math.abs(pt[0] - 1) < 1e-12)
    assert(Math.abs(pt[1] - 0.5) < 1e-12)
  })

  it('should return start point at t=0', function () {
    const pt = math.bezierCurve([[0, 0], [1, 1], [2, 0]], 0)
    assert(Math.abs(pt[0] - 0) < 1e-12)
    assert(Math.abs(pt[1] - 0) < 1e-12)
  })

  it('should return end point at t=1', function () {
    const pt = math.bezierCurve([[0, 0], [1, 1], [2, 0]], 1)
    assert(Math.abs(pt[0] - 2) < 1e-12)
    assert(Math.abs(pt[1] - 0) < 1e-12)
  })

  it('should work for linear Bezier (two control points)', function () {
    const pt = math.bezierCurve([[0, 0], [4, 8]], 0.25)
    assert(Math.abs(pt[0] - 1) < 1e-12)
    assert(Math.abs(pt[1] - 2) < 1e-12)
  })

  it('should work for cubic Bezier', function () {
    // Standard cubic Bezier [[0,0],[0,1],[1,1],[1,0]] at t=0.5 → [0.5, 0.75]
    const pt = math.bezierCurve([[0, 0], [0, 1], [1, 1], [1, 0]], 0.5)
    assert(Math.abs(pt[0] - 0.5) < 1e-12)
    assert(Math.abs(pt[1] - 0.75) < 1e-12)
  })

  it('should work for 3D control points', function () {
    const pt = math.bezierCurve([[0, 0, 0], [1, 1, 1], [2, 0, 2]], 0.5)
    assert.strictEqual(pt.length, 3)
    assert(Math.abs(pt[0] - 1) < 1e-12)
    assert(Math.abs(pt[1] - 0.5) < 1e-12)
    assert(Math.abs(pt[2] - 1) < 1e-12)
  })

  it('should accept an array of t values', function () {
    const pts = math.bezierCurve([[0, 0], [1, 1], [2, 0]], [0, 0.5, 1])
    assert.strictEqual(pts.length, 3)
    assert(Math.abs(pts[0][0] - 0) < 1e-12)
    assert(Math.abs(pts[1][0] - 1) < 1e-12)
    assert(Math.abs(pts[2][0] - 2) < 1e-12)
  })

  it('should throw for t outside [0,1]', function () {
    assert.throws(() => math.bezierCurve([[0, 0], [1, 1], [2, 0]], -0.1), /\[0, 1\]/)
    assert.throws(() => math.bezierCurve([[0, 0], [1, 1], [2, 0]], 1.1), /\[0, 1\]/)
  })
})
