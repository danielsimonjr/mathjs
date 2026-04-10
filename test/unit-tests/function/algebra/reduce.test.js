import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createReduce } from '../../../../src/function/algebra/reduce.js'
import { createAssume } from '../../../../src/function/algebra/assume.js'
import { clearAssumptions } from '../../../../src/function/algebra/assume.js'

const math = create({ ...all, createReduce, createAssume })

describe('reduce', function () {
  beforeEach(function () {
    clearAssumptions()
  })

  it('should filter solutions to Positive domain', function () {
    const result = math.reduce('x^2 - 1', 'x', 'Positive')
    assert.deepStrictEqual(result, [1])
  })

  it('should filter solutions to Negative domain', function () {
    const result = math.reduce('x^2 - 4', 'x', 'Negative')
    assert.deepStrictEqual(result, [-2])
  })

  it('should filter solutions to Nonnegative domain', function () {
    const result = math.reduce('x^2 - 4', 'x', 'Nonnegative')
    assert.deepStrictEqual(result, [2])
  })

  it('should filter solutions to Nonzero domain', function () {
    // x^2 - x = x(x-1), roots are 0 and 1; nonzero keeps only 1
    const result = math.reduce('x^2 - x', 'x', 'Nonzero')
    assert.ok(result.includes(1), 'should contain 1')
    assert.ok(!result.includes(0), 'should not contain 0')
  })

  it('should filter solutions to Integer domain', function () {
    // x^2 - 4: roots are -2 and 2, both integers
    const result = math.reduce('x^2 - 4', 'x', 'Integer')
    assert.ok(result.includes(-2))
    assert.ok(result.includes(2))
  })

  it('should use stored assumption when no domain provided', function () {
    math.assume('x', 'positive')
    const result = math.reduce('x^2 - 9', 'x')
    assert.deepStrictEqual(result, [3])
  })

  it('should return all solutions when domain is Real', function () {
    const result = math.reduce('x^2 - 4', 'x', 'Real')
    assert.ok(result.includes(-2))
    assert.ok(result.includes(2))
  })

  it('should return all solutions when domain is Complex', function () {
    const result = math.reduce('x^2 - 4', 'x', 'Complex')
    assert.ok(result.includes(-2))
    assert.ok(result.includes(2))
  })

  it('should throw for unknown domain', function () {
    assert.throws(() => math.reduce('x^2 - 1', 'x', 'Quaternion'), /reduce: unknown domain/)
  })

  it('should return empty array when no solutions match domain', function () {
    // x^2 = -1 has no real solutions
    const result = math.reduce('x^2 + 1', 'x', 'Real')
    assert.deepStrictEqual(result, [])
  })

  it('should accept Node input', function () {
    const node = math.parse('x^2 - 1')
    const result = math.reduce(node, 'x', 'Positive')
    assert.deepStrictEqual(result, [1])
  })

  it('should handle linear equation with domain filter', function () {
    const result = math.reduce('x + 5', 'x', 'Positive')
    assert.deepStrictEqual(result, [])
  })
})
