import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createFullSimplify } from '../../../../src/function/algebra/fullSimplify.js'

const math = create({ ...all, createFullSimplify })

describe('fullSimplify', function () {
  it('should simplify sin(x)^2 + cos(x)^2 to 1', function () {
    const result = math.fullSimplify('sin(x)^2 + cos(x)^2')
    const str = result.toString().replace(/ /g, '')
    assert.strictEqual(str, '1', `Expected '1' but got '${str}'`)
  })

  it('should simplify (x^2 - 1)/(x - 1) to x + 1', function () {
    const result = math.fullSimplify('(x^2 - 1) / (x - 1)')
    const str = result.trim()
    // Should evaluate the same as x+1 at a test point
    const scope = { x: 5 }
    const val = math.evaluate(str, scope)
    assert(Math.abs(val - 6) < 1e-8, `Expected x+1 form, got '${str}' which evaluates to ${val}`)
  })

  it('should combine like terms', function () {
    const result = math.fullSimplify('2*x + 3*x')
    const str = result.toString().replace(/ /g, '')
    // Should evaluate to 5*x at x=2
    const val = math.evaluate(result, { x: 2 })
    assert(Math.abs(val - 10) < 1e-8, `Expected 5*x, got '${result}' = ${val}`)
  })

  it('should return a string when given a string', function () {
    const result = math.fullSimplify('x + 0')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('x + 0')
    const result = math.fullSimplify(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should handle constants', function () {
    const result = math.fullSimplify('2 + 3')
    const str = result.toString().replace(/ /g, '')
    assert.strictEqual(str, '5')
  })

  it('should accept options argument', function () {
    // Should not throw
    const result = math.fullSimplify('x + 0', {})
    assert.strictEqual(typeof result, 'string')
  })

  it('should be numerically equivalent to original', function () {
    const exprs = ['sin(x)^2 + cos(x)^2', '(x + 1)^2 - x^2 - 2*x']
    for (const expr of exprs) {
      const simplified = math.fullSimplify(expr)
      const scope = { x: 1.5 }
      const original = math.evaluate(expr, scope)
      const simplified_val = math.evaluate(simplified, scope)
      assert(
        Math.abs(original - simplified_val) < 1e-6,
        `Mismatch for "${expr}": original=${original}, simplified="${simplified}" => ${simplified_val}`
      )
    }
  })
})
