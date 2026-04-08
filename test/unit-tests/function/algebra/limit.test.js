// test limit
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLimit } from '../../../../src/function/algebra/limit.js'

const math = create({ ...all, createLimit })

describe('limit', function () {
  it('should compute limit of a polynomial by direct substitution', function () {
    const result = math.limit('x^2 + 3*x', 'x', 2)
    assert.ok(Math.abs(result - 10) < 1e-6, 'expected 10, got: ' + result)
  })

  it("should compute limit of sin(x)/x as x->0 (L'Hopital)", function () {
    const result = math.limit('sin(x) / x', 'x', 0)
    assert.ok(Math.abs(result - 1) < 1e-4, 'expected ~1, got: ' + result)
  })

  it('should compute limit of (x^2-1)/(x-1) as x->1', function () {
    const result = math.limit('(x^2 - 1) / (x - 1)', 'x', 1)
    assert.ok(Math.abs(result - 2) < 1e-4, 'expected 2, got: ' + result)
  })

  it('should compute limit of a constant expression', function () {
    const result = math.limit('5', 'x', 0)
    assert.ok(Math.abs(result - 5) < 1e-10, 'expected 5, got: ' + result)
  })

  it('should compute limit of exp(x) as x->0', function () {
    const result = math.limit('exp(x)', 'x', 0)
    assert.ok(Math.abs(result - 1) < 1e-6, 'expected 1, got: ' + result)
  })

  it('should compute limit of x^2 as x->3', function () {
    const result = math.limit('x^2', 'x', 3)
    assert.ok(Math.abs(result - 9) < 1e-6, 'expected 9, got: ' + result)
  })

  it('should handle limit as x->Infinity for 1/x', function () {
    const result = math.limit('1/x', 'x', Infinity)
    assert.ok(Math.abs(result) < 1e-10, 'expected 0, got: ' + result)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^2 + 1')
    const result = math.limit(node, 'x', 2)
    assert.ok(Math.abs(result - 5) < 1e-6, 'expected 5, got: ' + result)
  })
})
