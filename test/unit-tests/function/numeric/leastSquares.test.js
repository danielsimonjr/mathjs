import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLeastSquares } from '../../../../src/function/numeric/leastSquares.js'

const math = create({ ...allFactories, createLeastSquares })

describe('leastSquares', function () {
  it('should fit a linear model y = a*x + b', function () {
    // True params: a=2, b=1
    const data = [[1, 3], [2, 5], [3, 7], [4, 9], [5, 11]]
    const residuals = function (params, d) {
      return d.map(function (pt) { return params[0] * pt[0] + params[1] - pt[1] })
    }
    const result = math.leastSquares(residuals, [1, 0], data)
    assert(Math.abs(result.x[0] - 2) < 1e-4)
    assert(Math.abs(result.x[1] - 1) < 1e-4)
    assert(result.resnorm < 1e-6)
    assert(result.converged === true)
  })

  it('should fit an exponential model y = a * exp(b*x)', function () {
    const data = [0, 1, 2, 3, 4].map(function (x) { return [x, 2 * Math.exp(0.5 * x)] })
    const residuals = function (params, d) {
      return d.map(function (pt) { return params[0] * Math.exp(params[1] * pt[0]) - pt[1] })
    }
    const result = math.leastSquares(residuals, [1, 0.1], data)
    assert(Math.abs(result.x[0] - 2) < 1e-3)
    assert(Math.abs(result.x[1] - 0.5) < 1e-3)
    assert(result.resnorm < 1e-4)
  })

  it('should handle a single-parameter model', function () {
    const data = [[1, 3], [2, 6], [3, 9]]
    const residuals = function (params, d) {
      return d.map(function (pt) { return params[0] * pt[0] - pt[1] })
    }
    const result = math.leastSquares(residuals, [1], data)
    assert(Math.abs(result.x[0] - 3) < 1e-4)
    assert(result.converged === true)
  })

  it('should accept options object', function () {
    const data = [[1, 2], [2, 4], [3, 6]]
    const residuals = function (params, d) {
      return d.map(function (pt) { return params[0] * pt[0] - pt[1] })
    }
    const result = math.leastSquares(residuals, [1], data, { tol: 1e-10, maxIter: 500 })
    assert(Math.abs(result.x[0] - 2) < 1e-6)
    assert(result.converged === true)
  })

  it('should return object with expected properties', function () {
    const data = [[0, 1]]
    const residuals = function (params, d) {
      return d.map(function (pt) { return params[0] - pt[1] })
    }
    const result = math.leastSquares(residuals, [0], data)
    assert('x' in result)
    assert('resnorm' in result)
    assert('iterations' in result)
    assert('converged' in result)
    assert(Array.isArray(result.x))
    assert(typeof result.resnorm === 'number')
  })

  it('should minimize resnorm to near zero for a perfect fit', function () {
    const data = [[1, 1], [2, 4], [3, 9], [4, 16]]
    const residuals = function (params, d) {
      return d.map(function (pt) { return params[0] * pt[0] * pt[0] - pt[1] })
    }
    const result = math.leastSquares(residuals, [0.5], data)
    assert(Math.abs(result.x[0] - 1) < 1e-4)
    assert(result.resnorm < 1e-6)
  })
})
