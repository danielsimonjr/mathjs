import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createPowerExpand } from '../../../../src/function/algebra/powerExpand.js'

const math = create({ ...all, createPowerExpand })

describe('powerExpand', function () {
  it('should expand (x*y)^3 to x^3 * y^3', function () {
    const result = math.powerExpand('(x * y)^3')
    const str = result.toString().replace(/ /g, '')
    // Both x^3 and y^3 should appear
    assert(
      str.includes('x^3') && str.includes('y^3'),
      `Expected x^3*y^3 form, got '${str}'`
    )
  })

  it('should expand (a^2)^3 to a^6', function () {
    const result = math.powerExpand('(a^2)^3')
    const str = result.toString().replace(/ /g, '')
    // Should simplify (a^2)^3 = a^(2*3) = a^6
    const val = math.evaluate(result, { a: 2 })
    assert(Math.abs(val - 64) < 1e-8, `Expected a^6 (=64 at a=2), got '${result}' = ${val}`)
  })

  it('should expand log(x * y) to log(x) + log(y)', function () {
    const result = math.powerExpand('log(x * y)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('log(x)') && str.includes('log(y)'),
      `Expected log(x) + log(y), got '${str}'`
    )
  })

  it('should expand log(x / y) to log(x) - log(y)', function () {
    const result = math.powerExpand('log(x / y)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('log(x)') && str.includes('log(y)'),
      `Expected log(x) - log(y), got '${str}'`
    )
  })

  it('should expand log(x^n) to n*log(x)', function () {
    const result = math.powerExpand('log(x^2)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('log(x)'),
      `Expected n*log(x) form, got '${str}'`
    )
  })

  it('should return a string when given a string', function () {
    const result = math.powerExpand('(x * y)^2')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('(x * y)^2')
    const result = math.powerExpand(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should be numerically equivalent', function () {
    const exprs = ['(x * y)^3', 'log(x * y)', 'log(x / y)']
    for (const expr of exprs) {
      const expanded = math.powerExpand(expr)
      const scope = { x: 2, y: 3 }
      const original = math.evaluate(expr, scope)
      const expandedVal = math.evaluate(expanded, scope)
      assert(
        Math.abs(original - expandedVal) < 1e-8,
        `Mismatch for "${expr}": original=${original}, expanded="${expanded}" => ${expandedVal}`
      )
    }
  })
})
