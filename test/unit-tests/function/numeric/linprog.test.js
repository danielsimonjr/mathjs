import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLinprog } from '../../../../src/function/numeric/linprog.js'

const math = create({ ...allFactories, createLinprog })

describe('linprog', function () {
  it('should solve a simple LP: minimize x+y subject to x+y>=2, x,y>=0', function () {
    // Minimize x+y subject to -x-y <= -2 (i.e. x+y >= 2), x>=0, y>=0
    const result = math.linprog([1, 1], [[-1, -1]], [-2])
    assert.strictEqual(result.status, 'optimal')
    assert(Math.abs(result.fval - 2) < 1e-6)
  })

  it('should minimize -x-2y subject to x+y<=4, x<=3, y<=2', function () {
    const result = math.linprog([-1, -2], [[1, 1], [1, 0], [0, 1]], [4, 3, 2])
    assert.strictEqual(result.status, 'optimal')
    assert(result.fval < -5)
    assert(result.x[0] >= -1e-6)
    assert(result.x[1] >= -1e-6)
  })

  it('should solve a 1-variable LP: minimize -x subject to x<=5', function () {
    const result = math.linprog([-1], [[1]], [5])
    assert.strictEqual(result.status, 'optimal')
    assert(Math.abs(result.x[0] - 5) < 1e-5)
    assert(Math.abs(result.fval + 5) < 1e-5)
  })

  it('should solve LP with equality constraints', function () {
    // Minimize x+y subject to x+y = 3, x>=0, y>=0
    const result = math.linprog([1, 1], [], [], [[1, 1]], [3])
    assert.strictEqual(result.status, 'optimal')
    assert(Math.abs(result.fval - 3) < 1e-4)
    assert(Math.abs(result.x[0] + result.x[1] - 3) < 1e-4)
  })

  it('should return status optimal for feasible problem', function () {
    const result = math.linprog([1, 0], [[1, 0], [0, 1]], [10, 10])
    assert.strictEqual(result.status, 'optimal')
    assert(Array.isArray(result.x))
    assert(typeof result.fval === 'number')
  })

  it('should return result with expected properties', function () {
    const result = math.linprog([1], [[1]], [1])
    assert('x' in result)
    assert('fval' in result)
    assert('status' in result)
  })
})
