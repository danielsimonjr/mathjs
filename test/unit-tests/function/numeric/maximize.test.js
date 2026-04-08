import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMaximize } from '../../../../src/function/numeric/maximize.js'

const math = create({ ...allFactories, createMaximize })

describe('maximize', function () {
  it('should maximize a 1D concave function -(x-3)^2 + 5', function () {
    const result = math.maximize(
      function (v) { return -(v[0] - 3) * (v[0] - 3) + 5 },
      [0]
    )
    assert(Math.abs(result.x[0] - 3) < 1e-4)
    assert(Math.abs(result.fval - 5) < 1e-4)
    assert(result.converged === true)
  })

  it('should maximize a 2D concave function -(x-1)^2 - (y-2)^2 + 10', function () {
    const result = math.maximize(
      function (v) { return -(v[0] - 1) * (v[0] - 1) - (v[1] - 2) * (v[1] - 2) + 10 },
      [0, 0]
    )
    assert(Math.abs(result.x[0] - 1) < 1e-4)
    assert(Math.abs(result.x[1] - 2) < 1e-4)
    assert(Math.abs(result.fval - 10) < 1e-4)
  })

  it('should return positive fval when function has a positive maximum', function () {
    const result = math.maximize(
      function (v) { return -(v[0] - 3) * (v[0] - 3) - (v[1] + 1) * (v[1] + 1) + 7 },
      [0, 0]
    )
    assert(result.fval > 0)
    assert(Math.abs(result.fval - 7) < 1e-4)
  })

  it('should accept options object', function () {
    const result = math.maximize(
      function (v) { return -(v[0] - 4) * (v[0] - 4) + 3 },
      [0],
      { tol: 1e-10, maxIter: 2000 }
    )
    assert(Math.abs(result.x[0] - 4) < 1e-4)
    assert(result.converged === true)
  })

  it('should return an object with expected properties', function () {
    const result = math.maximize(function (v) { return -v[0] * v[0] + 1 }, [0])
    assert('x' in result)
    assert('fval' in result)
    assert('iterations' in result)
    assert('converged' in result)
    assert(Array.isArray(result.x))
  })

  it('should produce fval equal to maximum value not negative of it', function () {
    const result = math.maximize(
      function (v) { return -(v[0] - 2) * (v[0] - 2) + 4 },
      [0]
    )
    assert(result.fval > 3.9)
  })
})
