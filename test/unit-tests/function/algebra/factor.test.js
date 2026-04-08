// test factor
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createFactor } from '../../../../src/function/algebra/factor.js'

const math = create({ ...all, createFactor })

describe('factor', function () {
  function evalFactored (result, scope) {
    return math.evaluate(result, scope)
  }

  it('should factor x^2 - 4', function () {
    const result = math.factor('x^2 - 4')
    assert.ok(typeof result === 'string')
    // Verify the factored form evaluates the same
    const testPoints = [-3, -2, 0, 2, 5]
    for (const pt of testPoints) {
      const orig = math.evaluate('x^2 - 4', { x: pt })
      const fact = evalFactored(result, { x: pt })
      assert.ok(Math.abs(orig - fact) < 1e-8, 'mismatch at x=' + pt + ': orig=' + orig + ' fact=' + fact + ' expr=' + result)
    }
  })

  it('should factor x^2 + 2*x + 1', function () {
    const result = math.factor('x^2 + 2*x + 1')
    assert.ok(typeof result === 'string')
    const testPoints = [-3, -1, 0, 2, 5]
    for (const pt of testPoints) {
      const orig = math.evaluate('x^2 + 2*x + 1', { x: pt })
      const fact = evalFactored(result, { x: pt })
      assert.ok(Math.abs(orig - fact) < 1e-8, 'mismatch at x=' + pt + ': orig=' + orig + ' fact=' + fact)
    }
  })

  it('should factor x^2 - 5*x + 6', function () {
    const result = math.factor('x^2 - 5*x + 6')
    assert.ok(typeof result === 'string')
    const testPoints = [-1, 0, 2, 3, 5]
    for (const pt of testPoints) {
      const orig = math.evaluate('x^2 - 5*x + 6', { x: pt })
      const fact = evalFactored(result, { x: pt })
      assert.ok(Math.abs(orig - fact) < 1e-6, 'mismatch at x=' + pt)
    }
  })

  it('should factor x^3 - x', function () {
    const result = math.factor('x^3 - x')
    assert.ok(typeof result === 'string')
    const testPoints = [-2, -1, 0, 1, 2]
    for (const pt of testPoints) {
      const orig = math.evaluate('x^3 - x', { x: pt })
      const fact = evalFactored(result, { x: pt })
      assert.ok(Math.abs(orig - fact) < 1e-6, 'mismatch at x=' + pt)
    }
  })

  it('should factor a linear expression', function () {
    const result = math.factor('2*x - 6')
    assert.ok(typeof result === 'string')
    const testPoints = [0, 3, 5]
    for (const pt of testPoints) {
      const orig = math.evaluate('2*x - 6', { x: pt })
      const fact = evalFactored(result, { x: pt })
      assert.ok(Math.abs(orig - fact) < 1e-6, 'mismatch at x=' + pt)
    }
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^2 - 4')
    const result = math.factor(node)
    assert.ok(typeof result === 'string')
    const orig = math.evaluate('x^2 - 4', { x: 3 })
    const fact = evalFactored(result, { x: 3 })
    assert.ok(Math.abs(orig - fact) < 1e-6, 'mismatch at x=3')
  })

  it('should accept explicit variable', function () {
    const result = math.factor('x^2 - 9', 'x')
    assert.ok(typeof result === 'string')
    const orig = math.evaluate('x^2 - 9', { x: 5 })
    const fact = evalFactored(result, { x: 5 })
    assert.ok(Math.abs(orig - fact) < 1e-6, 'mismatch at x=5')
  })
})
