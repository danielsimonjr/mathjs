import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createGlobalMinimize } from '../../../../src/function/numeric/globalMinimize.js'

const math = create({ ...allFactories, createGlobalMinimize })

describe('globalMinimize', function () {
  it('should find global minimum of (x-3)^2 + (y+1)^2', function () {
    const result = math.globalMinimize(
      function (v) { return (v[0] - 3) * (v[0] - 3) + (v[1] + 1) * (v[1] + 1) },
      [[-10, 10], [-10, 10]]
    )
    assert(Math.abs(result.x[0] - 3) < 0.1)
    assert(Math.abs(result.x[1] + 1) < 0.1)
    assert(result.fval < 0.01)
    assert(typeof result.iterations === 'number')
  })

  it('should find global minimum of a 1D function', function () {
    const result = math.globalMinimize(
      function (v) { return (v[0] - 2) * (v[0] - 2) },
      [[-5, 5]]
    )
    assert(Math.abs(result.x[0] - 2) < 0.1)
    assert(result.fval < 0.01)
  })

  it('should find minimum with multiple dimensions', function () {
    const result = math.globalMinimize(
      function (v) { return (v[0] - 5) * (v[0] - 5) + (v[1] - 5) * (v[1] - 5) },
      [[0, 10], [0, 10]]
    )
    assert(Math.abs(result.x[0] - 5) < 0.2)
    assert(Math.abs(result.x[1] - 5) < 0.2)
  })

  it('should accept options object', function () {
    const result = math.globalMinimize(
      function (v) { return (v[0] - 1) * (v[0] - 1) },
      [[-5, 5]],
      { populationSize: 20, maxIter: 200, tol: 1e-6, mutation: 0.8, crossover: 0.7 }
    )
    assert(Math.abs(result.x[0] - 1) < 0.2)
    assert(result.fval < 0.05)
  })

  it('should return object with expected properties', function () {
    const result = math.globalMinimize(
      function (v) { return v[0] * v[0] },
      [[-1, 1]]
    )
    assert('x' in result)
    assert('fval' in result)
    assert('iterations' in result)
    assert(Array.isArray(result.x))
    assert(typeof result.fval === 'number')
    assert(typeof result.iterations === 'number')
  })

  it('should handle 3D optimization', function () {
    const result = math.globalMinimize(
      function (v) {
        return (v[0] - 1) * (v[0] - 1) + (v[1] - 2) * (v[1] - 2) + (v[2] - 3) * (v[2] - 3)
      },
      [[-5, 5], [-5, 5], [-5, 5]],
      { populationSize: 30, maxIter: 500 }
    )
    assert(Math.abs(result.x[0] - 1) < 0.3)
    assert(Math.abs(result.x[1] - 2) < 0.3)
    assert(Math.abs(result.x[2] - 3) < 0.3)
  })
})
