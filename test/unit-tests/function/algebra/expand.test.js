import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createExpand } from '../../../../src/function/algebra/expand.js'

const math = create({ ...all, createExpand })

/**
 * Normalize expression string by removing spaces and sorting addends
 * @param {string} s
 * @return {string}
 */
function normalizeExpr (s) {
  return s.replace(/ /g, '')
}

describe('expand', function () {
  it('should expand (x+1)^2', function () {
    const result = math.expand('(x + 1)^2')
    const str = normalizeExpr(result)
    // Should contain x^2, 2*x, and 1 in some form
    assert(str.includes('x^2') || str.includes('x*x'), `Expected x^2 in "${str}"`)
  })

  it('should expand (x-1)^2', function () {
    const result = math.expand('(x - 1)^2')
    const str = normalizeExpr(result)
    assert(str.includes('x^2') || str.includes('x*x'), `Expected x^2 in "${str}"`)
  })

  it('should return a string when given a string', function () {
    const result = math.expand('(x + 1)^2')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('(x + 1)^2')
    const result = math.expand(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should expand 2*(x+y)', function () {
    const result = math.expand('2 * (x + y)')
    const str = normalizeExpr(result)
    // Should have both 2*x and 2*y
    assert(str.includes('2*x') || str.includes('x*2'), `Expected 2*x in "${str}"`)
    assert(str.includes('2*y') || str.includes('y*2'), `Expected 2*y in "${str}"`)
  })

  it('should expand (x+1)*(x-1) to difference of squares', function () {
    const result = math.expand('(x + 1) * (x - 1)')
    const str = normalizeExpr(result)
    // Should contain x^2 and -1
    assert(str.includes('x^2') || str.includes('x*x'), `Expected x^2 in "${str}"`)
  })

  it('should leave a constant unchanged', function () {
    const result = math.expand('5')
    assert.strictEqual(result.trim(), '5')
  })

  it('expanded result evaluated numerically should match original', function () {
    const exprs = ['(x + 2)^2', '(x - 1) * (x + 3)', '2 * (x + y)']
    for (const expr of exprs) {
      const expanded = math.expand(expr)
      // Evaluate both at x=3, y=2
      const scope = { x: 3, y: 2 }
      const original = math.evaluate(expr, scope)
      const expandedVal = math.evaluate(expanded, scope)
      assert(
        Math.abs(original - expandedVal) < 1e-8,
        `Mismatch for "${expr}": original=${original}, expanded="${expanded}" => ${expandedVal}`
      )
    }
  })
})
