import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDegree } from '../../../../src/function/algebra/degree.js'

const math = create({ ...all, createDegree })

describe('degree', function () {
  it('should return 5 for 3*x^5 + 2*x^3 + 1', function () {
    const result = math.degree('3*x^5 + 2*x^3 + 1', 'x')
    assert.strictEqual(result, 5)
  })

  it('should return 2 for x^2 + x + 1', function () {
    const result = math.degree('x^2 + x + 1', 'x')
    assert.strictEqual(result, 2)
  })

  it('should return 0 for a constant', function () {
    const result = math.degree('7', 'x')
    assert.strictEqual(result, 0)
  })

  it('should return 1 for x', function () {
    const result = math.degree('x', 'x')
    assert.strictEqual(result, 1)
  })

  it('should return 0 when the variable does not appear', function () {
    const result = math.degree('y^3 + 2*y', 'x')
    assert.strictEqual(result, 0)
  })

  it('should handle multiplication: degree of 2*x^3*y^2 in x is 3', function () {
    const result = math.degree('2*x^3*y^2', 'x')
    assert.strictEqual(result, 3)
  })

  it('should handle sum: degree of x^3 + x^2 is 3', function () {
    const result = math.degree('x^3 + x^2', 'x')
    assert.strictEqual(result, 3)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^4 + 2*x + 3')
    const result = math.degree(node, 'x')
    assert.strictEqual(result, 4)
  })

  it('should handle polynomial with negative coefficient', function () {
    const result = math.degree('-5*x^6 + x', 'x')
    assert.strictEqual(result, 6)
  })
})
