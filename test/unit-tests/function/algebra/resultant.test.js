import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createResultant } from '../../../../src/function/algebra/resultant.js'
import { createCoefficientList } from '../../../../src/function/algebra/coefficientList.js'

const math = create({ ...all, createResultant, createCoefficientList })

describe('resultant', function () {
  it('should return 9 for resultant(x^2-1, x^2-4, x)', function () {
    // res(x^2-1, x^2-4) = product of (a_i - b_j) where a_i are roots of p and b_j of q
    // roots of x^2-1: 1, -1; roots of x^2-4: 2, -2
    // res = (1-2)(1+2)(-1-2)(-1+2) = (-1)(3)(-3)(1) = 9
    const result = math.resultant('x^2 - 1', 'x^2 - 4', 'x')
    assert.ok(Math.abs(result - 9) < 1e-6, `Expected 9, got ${result}`)
  })

  it('should return 0 when polynomials share a common root', function () {
    // x^2-1 and x-1 share root x=1
    const result = math.resultant('x^2 - 1', 'x - 1', 'x')
    assert.ok(Math.abs(result) < 1e-6, `Expected 0, got ${result}`)
  })

  it('should return 0 for x^2-3x+2 and x-1 (share root x=1)', function () {
    const result = math.resultant('x^2 - 3*x + 2', 'x - 1', 'x')
    assert.ok(Math.abs(result) < 1e-6, `Expected 0, got ${result}`)
  })

  it('should return 0 for x^2-3x+2 and x-2 (share root x=2)', function () {
    const result = math.resultant('x^2 - 3*x + 2', 'x - 2', 'x')
    assert.ok(Math.abs(result) < 1e-6, `Expected 0, got ${result}`)
  })

  it('should return a non-zero value for coprime polynomials', function () {
    const result = math.resultant('x^2 - 2', 'x^2 - 3', 'x')
    assert.ok(Math.abs(result) > 1e-6, 'Expected non-zero resultant for coprime polynomials')
  })

  it('should accept Node inputs', function () {
    const p = math.parse('x^2 - 1')
    const q = math.parse('x - 1')
    const result = math.resultant(p, q, 'x')
    assert.ok(Math.abs(result) < 1e-6, `Expected 0, got ${result}`)
  })

  it('should accept mixed string/Node inputs', function () {
    const p = math.parse('x^2 - 1')
    const result = math.resultant(p, 'x - 1', 'x')
    assert.ok(Math.abs(result) < 1e-6, `Expected 0, got ${result}`)
  })
})
