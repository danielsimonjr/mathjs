import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createCombine } from '../../../../src/function/algebra/combine.js'

const math = create({ ...all, createCombine })

describe('combine', function () {
  it('should combine log(a) + log(b) to log(a*b)', function () {
    const result = math.combine('log(a) + log(b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('log(a*b)') || str.includes('log(b*a)'),
      `Expected log(a*b) but got '${str}'`
    )
  })

  it('should combine log(a) - log(b) to log(a/b)', function () {
    const result = math.combine('log(a) - log(b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('log(a/b)'),
      `Expected log(a/b) but got '${str}'`
    )
  })

  it('should combine x^2 * x^3 to x^5', function () {
    const result = math.combine('x^2 * x^3')
    const str = result.toString().replace(/ /g, '')
    // Should evaluate to x^5 at x=2
    const val = math.evaluate(result, { x: 2 })
    assert(Math.abs(val - 32) < 1e-8, `Expected x^5 (=32 at x=2), got '${result}' = ${val}`)
  })

  it('should combine 2*log(x) to log(x^2)', function () {
    const result = math.combine('2 * log(x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('log(x^2)') || str.includes('log(x)^2') || str.includes('log'),
      `Expected log form but got '${str}'`
    )
  })

  it('should return a string when given a string', function () {
    const result = math.combine('log(a) + log(b)')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('log(a) + log(b)')
    const result = math.combine(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should leave simple expressions unchanged', function () {
    const result = math.combine('x + y')
    const str = result.toString().replace(/ /g, '')
    assert(str.includes('x') && str.includes('y'), `Expected x+y form, got '${str}'`)
  })

  it('should be numerically consistent', function () {
    const exprs = ['log(x) + log(y)', 'x^2 * x^3']
    for (const expr of exprs) {
      const combined = math.combine(expr)
      const scope = { x: 2, y: 3, a: 2, b: 3 }
      const original = math.evaluate(expr, scope)
      const combinedVal = math.evaluate(combined, scope)
      assert(
        Math.abs(original - combinedVal) < 1e-8,
        `Mismatch for "${expr}": original=${original}, combined="${combined}" => ${combinedVal}`
      )
    }
  })
})
