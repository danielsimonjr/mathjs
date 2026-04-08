import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { createRbfInterpolate } from '../../../../src/function/numeric/rbfInterpolate.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...all, createRbfInterpolate })

describe('rbfInterpolate', function () {
  it('should return an object with an evaluate method', function () {
    const rbf = math.rbfInterpolate([[0], [1], [2]], [0, 1, 4], 'gaussian')
    assert.strictEqual(typeof rbf.evaluate, 'function')
  })

  it('should exactly reproduce data values at training points (gaussian)', function () {
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 4]
    const rbf = math.rbfInterpolate(pts, vals, 'gaussian')
    for (let i = 0; i < pts.length; i++) {
      assert(
        Math.abs(rbf.evaluate(pts[i]) - vals[i]) < 1e-6,
        'should match value at point ' + i + ', got ' + rbf.evaluate(pts[i])
      )
    }
  })

  it('should interpolate with multiquadric kernel', function () {
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 4]
    const rbf = math.rbfInterpolate(pts, vals, 'multiquadric')
    // Should reproduce training values
    for (let i = 0; i < pts.length; i++) {
      assert(Math.abs(rbf.evaluate(pts[i]) - vals[i]) < 1e-6)
    }
  })

  it('should interpolate with inverseMultiquadric kernel', function () {
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 2]
    const rbf = math.rbfInterpolate(pts, vals, 'inverseMultiquadric')
    for (let i = 0; i < pts.length; i++) {
      assert(Math.abs(rbf.evaluate(pts[i]) - vals[i]) < 1e-6)
    }
  })

  it('should interpolate with thinPlateSpline kernel (2D points)', function () {
    // Thin plate spline is natural for 2D data; use non-symmetric scattered points
    const pts = [[0, 0], [1, 0], [0, 2], [2, 1]]
    const vals = [0, 1, 4, 3]
    const rbf = math.rbfInterpolate(pts, vals, 'thinPlateSpline')
    for (let i = 0; i < pts.length; i++) {
      assert(Math.abs(rbf.evaluate(pts[i]) - vals[i]) < 1e-6)
    }
  })

  it('should interpolate 2D scattered data', function () {
    const pts = [[0, 0], [1, 0], [0, 1], [1, 1]]
    const vals = [0, 1, 1, 2]
    const rbf = math.rbfInterpolate(pts, vals, 'gaussian')
    // Should reproduce training values
    for (let i = 0; i < pts.length; i++) {
      assert(Math.abs(rbf.evaluate(pts[i]) - vals[i]) < 1e-5)
    }
  })

  it('should return a reasonable interpolated value between training points', function () {
    // f(x) = x^2: training at 0,1,2 with values 0,1,4
    const pts = [[0], [1], [2]]
    const vals = [0, 1, 4]
    const rbf = math.rbfInterpolate(pts, vals, 'multiquadric')
    const v = rbf.evaluate([1.5])
    // x^2 at 1.5 = 2.25; RBF should give a close approximation
    assert(v > 1.5 && v < 3.5, 'interpolated value at x=1.5 should be near 2.25, got ' + v)
  })

  it('should throw for unknown kernel', function () {
    assert.throws(
      () => math.rbfInterpolate([[0], [1]], [0, 1], 'bogus'),
      /unknown kernel/
    )
  })

  it('should throw if points and values have different lengths', function () {
    assert.throws(
      () => math.rbfInterpolate([[0], [1]], [0, 1, 2], 'gaussian'),
      /same length/
    )
  })

  it('should throw for empty points array', function () {
    assert.throws(
      () => math.rbfInterpolate([], [], 'gaussian'),
      /at least one point/
    )
  })
})
