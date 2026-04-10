import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createTrigExpand } from '../../../../src/function/algebra/trigExpand.js'

const math = create({ ...all, createTrigExpand })

describe('trigExpand', function () {
  it('should expand sin(a + b)', function () {
    const result = math.trigExpand('sin(a + b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('sin(a)') && str.includes('cos(b)') && str.includes('cos(a)') && str.includes('sin(b)'),
      `Expected sin(a)cos(b)+cos(a)sin(b) form, got '${str}'`
    )
  })

  it('should expand cos(a + b)', function () {
    const result = math.trigExpand('cos(a + b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cos(a)') && str.includes('cos(b)') && str.includes('sin(a)') && str.includes('sin(b)'),
      `Expected cos(a)cos(b)-sin(a)sin(b) form, got '${str}'`
    )
  })

  it('should expand sin(2*x) to 2*sin(x)*cos(x)', function () {
    const result = math.trigExpand('sin(2 * x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('sin(x)') && str.includes('cos(x)') && str.includes('2'),
      `Expected 2*sin(x)*cos(x) form, got '${str}'`
    )
  })

  it('should expand cos(2*x) to cos(x)^2 - sin(x)^2', function () {
    const result = math.trigExpand('cos(2 * x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cos(x)') && str.includes('sin(x)'),
      `Expected cos(x)^2 - sin(x)^2 form, got '${str}'`
    )
  })

  it('should return a string when given a string', function () {
    const result = math.trigExpand('sin(a + b)')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('sin(a + b)')
    const result = math.trigExpand(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should be numerically equivalent', function () {
    const exprs = ['sin(x + y)', 'cos(x + y)', 'sin(2 * x)']
    for (const expr of exprs) {
      const expanded = math.trigExpand(expr)
      const scope = { x: 0.5, y: 0.3 }
      const original = math.evaluate(expr, scope)
      const expandedVal = math.evaluate(expanded, scope)
      assert(
        Math.abs(original - expandedVal) < 1e-8,
        `Mismatch for "${expr}": original=${original}, expanded="${expanded}" => ${expandedVal}`
      )
    }
  })
})
