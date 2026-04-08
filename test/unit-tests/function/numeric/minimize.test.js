import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMinimize } from '../../../../src/function/numeric/minimize.js'

const math = create({ ...allFactories, createMinimize })

describe('minimize', function () {
  it('should minimize a 1D quadratic function', function () {
    const result = math.minimize(function (x) { return (x[0] - 3) * (x[0] - 3) }, [0])
    assert(Math.abs(result.x[0] - 3) < 1e-5)
    assert(result.fval < 1e-8)
    assert(typeof result.iterations === 'number')
    assert(result.converged === true)
  })

  it('should minimize a 2D quadratic (x-1)^2 + (y-2)^2', function () {
    const result = math.minimize(
      function (v) { return (v[0] - 1) * (v[0] - 1) + (v[1] - 2) * (v[1] - 2) },
      [0, 0]
    )
    assert(Math.abs(result.x[0] - 1) < 1e-4)
    assert(Math.abs(result.x[1] - 2) < 1e-4)
    assert(result.fval < 1e-6)
    assert(result.converged === true)
  })

  it('should minimize a 3D function', function () {
    const result = math.minimize(
      function (v) {
        return (v[0] - 1) * (v[0] - 1) + (v[1] + 1) * (v[1] + 1) + (v[2] - 2) * (v[2] - 2)
      },
      [0, 0, 0]
    )
    assert(Math.abs(result.x[0] - 1) < 1e-4)
    assert(Math.abs(result.x[1] + 1) < 1e-4)
    assert(Math.abs(result.x[2] - 2) < 1e-4)
  })

  it('should accept options object with tol and maxIter', function () {
    const result = math.minimize(
      function (v) { return (v[0] - 5) * (v[0] - 5) + (v[1] - 3) * (v[1] - 3) },
      [0, 0],
      { tol: 1e-10, maxIter: 2000 }
    )
    assert(Math.abs(result.x[0] - 5) < 1e-4)
    assert(Math.abs(result.x[1] - 3) < 1e-4)
    assert(result.converged === true)
  })

  it('should handle non-quadratic functions (Rosenbrock)', function () {
    const result = math.minimize(
      function (v) {
        const a = 1 - v[0]
        const b = v[1] - v[0] * v[0]
        return a * a + 100 * b * b
      },
      [0, 0],
      { maxIter: 5000, tol: 1e-6 }
    )
    assert(Math.abs(result.x[0] - 1) < 0.1)
    assert(Math.abs(result.x[1] - 1) < 0.1)
  })

  it('should return an object with expected properties', function () {
    const result = math.minimize(function (v) { return v[0] * v[0] }, [1])
    assert('x' in result)
    assert('fval' in result)
    assert('iterations' in result)
    assert('converged' in result)
    assert(Array.isArray(result.x))
  })

  it('should minimize from non-zero starting point', function () {
    const result = math.minimize(
      function (v) { return (v[0] - 2) * (v[0] - 2) + (v[1] - 4) * (v[1] - 4) },
      [5, 5]
    )
    assert(Math.abs(result.x[0] - 2) < 1e-4)
    assert(Math.abs(result.x[1] - 4) < 1e-4)
  })
})
