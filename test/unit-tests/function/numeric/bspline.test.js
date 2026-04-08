import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { createBspline } from '../../../../src/function/numeric/bspline.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...all, createBspline })

describe('bspline', function () {
  it('should evaluate a linear B-spline (degree 1) at midpoint', function () {
    // Two control points [0,0] and [1,1], linear B-spline, t=0.5 should give [0.5,0.5]
    const knots = [0, 0, 1, 1]
    const pts = [[0, 0], [1, 1]]
    const result = math.bspline(knots, pts, 1, 0.5)
    assert(Array.isArray(result), 'result should be an array')
    assert(Math.abs(result[0] - 0.5) < 1e-10, 'x-coordinate should be 0.5')
    assert(Math.abs(result[1] - 0.5) < 1e-10, 'y-coordinate should be 0.5')
  })

  it('should evaluate a linear B-spline (degree 1) through [0,0],[1,1] at t=0 and t=1', function () {
    const knots = [0, 0, 1, 1]
    const pts = [[0, 0], [1, 1]]
    const r0 = math.bspline(knots, pts, 1, 0)
    const r1 = math.bspline(knots, pts, 1, 1)
    assert(Math.abs(r0[0] - 0) < 1e-10)
    assert(Math.abs(r0[1] - 0) < 1e-10)
    assert(Math.abs(r1[0] - 1) < 1e-10)
    assert(Math.abs(r1[1] - 1) < 1e-10)
  })

  it('should evaluate a quadratic B-spline (degree 2)', function () {
    // Uniform quadratic B-spline: 3 control points, 6 knots
    const knots = [0, 0, 0, 1, 1, 1]
    const pts = [[0, 0], [1, 1], [2, 0]]
    const result = math.bspline(knots, pts, 2, 0.5)
    assert(Array.isArray(result))
    // At t=0.5 of a symmetric quadratic B-spline, x should be 1.0, y should be 0.5
    assert(Math.abs(result[0] - 1.0) < 1e-10, 'x should be 1.0 at t=0.5')
    assert(Math.abs(result[1] - 0.5) < 1e-10, 'y should be 0.5 at t=0.5')
  })

  it('should handle scalar control points', function () {
    // 1D B-spline: uniform cubic with 4 control points
    const knots = [0, 0, 0, 0, 1, 1, 1, 1]
    const pts = [0, 1, 2, 3]
    const result = math.bspline(knots, pts, 3, 0.5)
    assert(typeof result === 'number', 'scalar control points should return a number')
    // Cubic B-spline through 0,1,2,3 at t=0.5 should be near 1.5
    assert(Math.abs(result - 1.5) < 0.1, 'value at t=0.5 should be near 1.5')
  })

  it('should start and end at the first and last control point (clamped)', function () {
    const knots = [0, 0, 0, 1, 2, 2, 2]
    const pts = [[0, 0], [1, 2], [2, 2], [3, 0]]
    const r0 = math.bspline(knots, pts, 2, 0)
    const r1 = math.bspline(knots, pts, 2, 2)
    assert(Math.abs(r0[0] - 0) < 1e-10, 'should start at first control point x')
    assert(Math.abs(r0[1] - 0) < 1e-10, 'should start at first control point y')
    assert(Math.abs(r1[0] - 3) < 1e-10, 'should end at last control point x')
    assert(Math.abs(r1[1] - 0) < 1e-10, 'should end at last control point y')
  })

  it('should throw for t outside the domain', function () {
    const knots = [0, 0, 0, 1, 1, 1]
    const pts = [[0, 0], [1, 1], [2, 0]]
    assert.throws(() => math.bspline(knots, pts, 2, -0.1), /outside the valid domain/)
    assert.throws(() => math.bspline(knots, pts, 2, 1.1), /outside the valid domain/)
  })

  it('should throw for invalid knot vector length', function () {
    const knots = [0, 0, 1, 1] // should be length 6 for 3 pts degree 2
    const pts = [[0, 0], [1, 1], [2, 0]]
    assert.throws(() => math.bspline(knots, pts, 2, 0.5), /knot vector length/)
  })

  it('should throw for degree less than 1', function () {
    const knots = [0, 1, 2]
    const pts = [[0, 0], [1, 1]]
    assert.throws(() => math.bspline(knots, pts, 0, 0.5), /degree must be a positive integer/)
  })

  it('should evaluate a piecewise linear B-spline (degree 1) with multiple segments', function () {
    // Uniform knots for 4 control points, degree 1: [0,0,1,2,3,3]
    const knots = [0, 0, 1, 2, 3, 3]
    const pts = [[0, 0], [1, 1], [2, 0], [3, 1]]
    const r1 = math.bspline(knots, pts, 1, 1.0)
    // At t=1, should be at second control point [1,1]
    assert(Math.abs(r1[0] - 1) < 1e-10)
    assert(Math.abs(r1[1] - 1) < 1e-10)
  })
})
