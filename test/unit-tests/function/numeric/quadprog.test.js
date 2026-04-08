import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createQuadprog } from '../../../../src/function/numeric/quadprog.js'

const math = create({ ...allFactories, createQuadprog })

describe('quadprog', function () {
  it('should minimize a simple unconstrained QP with loose constraints', function () {
    const H = [[2, 0], [0, 2]]
    const f = [0, 0]
    const A = [[-1, 0], [0, -1]]
    const b = [0, 0]
    const result = math.quadprog(H, f, A, b)
    assert(typeof result.fval === 'number')
    assert(Array.isArray(result.x))
    assert('status' in result)
  })

  it('should solve min (x-1)^2 + (y-2)^2', function () {
    // H = 2*I, f = [-2, -4], unconstrained min at x=1, y=2
    const H = [[2, 0], [0, 2]]
    const f = [-2, -4]
    const A = [[-1, 0], [0, -1], [1, 0], [0, 1]]
    const b = [100, 100, 100, 100]
    const result = math.quadprog(H, f, A, b)
    assert.strictEqual(result.status, 'optimal')
    assert(Math.abs(result.x[0] - 1) < 1e-4)
    assert(Math.abs(result.x[1] - 2) < 1e-4)
  })

  it('should respect active inequality constraints', function () {
    // min x^2 subject to x >= 2 (i.e. -x <= -2)
    const H = [[2]]
    const f = [0]
    const A = [[-1]]
    const b = [-2]
    const result = math.quadprog(H, f, A, b)
    assert(result.x[0] >= 2 - 1e-4)
  })

  it('should solve with equality constraints: min x^2+y^2 s.t. x+y=1', function () {
    const H = [[2, 0], [0, 2]]
    const f = [0, 0]
    const A = [[-1, 0], [0, -1], [1, 0], [0, 1]]
    const b = [100, 100, 100, 100]
    const Aeq = [[1, 1]]
    const beq = [1]
    const result = math.quadprog(H, f, A, b, Aeq, beq)
    assert(Math.abs(result.x[0] + result.x[1] - 1) < 1e-4)
  })

  it('should return object with expected properties', function () {
    const H = [[2, 0], [0, 2]]
    const f = [-2, -4]
    const result = math.quadprog(H, f, [], [])
    assert('x' in result)
    assert('fval' in result)
    assert('status' in result)
    assert('iterations' in result)
    assert(Array.isArray(result.x))
  })
})
