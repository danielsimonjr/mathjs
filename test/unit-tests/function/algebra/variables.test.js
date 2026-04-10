import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createVariables } from '../../../../src/function/algebra/variables.js'

const math = create({ ...all, createVariables })

describe('variables', function () {
  it('should extract variables from a simple expression', function () {
    const result = math.variables('x^2 + y*z')
    assert.deepStrictEqual(result, ['x', 'y', 'z'])
  })

  it('should exclude pi from results', function () {
    const result = math.variables('x^2 + y*z + pi')
    assert.deepStrictEqual(result, ['x', 'y', 'z'])
  })

  it('should return empty array for constant expression', function () {
    const result = math.variables('3 + pi')
    assert.deepStrictEqual(result, [])
  })

  it('should return sorted unique variables', function () {
    const result = math.variables('z + a + m + a')
    assert.deepStrictEqual(result, ['a', 'm', 'z'])
  })

  it('should handle single variable', function () {
    const result = math.variables('3*x + 2')
    assert.deepStrictEqual(result, ['x'])
  })

  it('should extract variables from function arguments', function () {
    // sin(b) - the function name sin is not a variable, but b is
    const result = math.variables('a*sin(b) + c')
    assert.ok(result.includes('a'), 'should contain a')
    assert.ok(result.includes('b'), 'should contain b')
    assert.ok(result.includes('c'), 'should contain c')
    assert.ok(!result.includes('sin'), 'should not contain sin')
  })

  it('should accept a Node input', function () {
    const node = math.parse('x + y')
    const result = math.variables(node)
    assert.deepStrictEqual(result, ['x', 'y'])
  })

  it('should handle expression with only constants', function () {
    const result = math.variables('2 + 3')
    assert.deepStrictEqual(result, [])
  })

  it('should handle nested expressions', function () {
    const result = math.variables('(a + b) * (c - d)')
    assert.deepStrictEqual(result, ['a', 'b', 'c', 'd'])
  })

  it('should exclude e (Euler number) from results', function () {
    const result = math.variables('x * e')
    assert.ok(!result.includes('e'), 'should not include e constant')
  })
})
