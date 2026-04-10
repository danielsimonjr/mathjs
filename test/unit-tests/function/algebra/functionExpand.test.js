import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createFunctionExpand } from '../../../../src/function/algebra/functionExpand.js'

const math = create({ ...all, createFunctionExpand })

describe('functionExpand', function () {
  it('should expand gamma(n + 1) to n * gamma(n)', function () {
    const result = math.functionExpand('gamma(n + 1)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('n') && str.includes('gamma(n)'),
      `Expected n*gamma(n) form, got '${str}'`
    )
  })

  it('should expand beta(a, b) to gamma ratio', function () {
    const result = math.functionExpand('beta(a, b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('gamma(a)') && str.includes('gamma(b)') && str.includes('gamma(a+b)'),
      `Expected gamma product/ratio form, got '${str}'`
    )
  })

  it('should expand combinations(n, k) to factorial or gamma ratio', function () {
    const result = math.functionExpand('combinations(n, k)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('factorial') || str.includes('gamma'),
      `Expected factorial or gamma form, got '${str}'`
    )
  })

  it('should evaluate gamma(5) = 24', function () {
    const result = math.functionExpand('gamma(5)')
    const str = result.toString().trim()
    // gamma(5) = 4! = 24
    const val = math.evaluate(str)
    assert(Math.abs(val - 24) < 1e-8, `Expected 24, got '${str}' = ${val}`)
  })

  it('should evaluate factorial(4) = 24', function () {
    const result = math.functionExpand('factorial(4)')
    const str = result.toString().trim()
    const val = math.evaluate(str)
    assert(Math.abs(val - 24) < 1e-8, `Expected 24, got '${str}' = ${val}`)
  })

  it('should return a string when given a string', function () {
    const result = math.functionExpand('gamma(n + 1)')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('gamma(n + 1)')
    const result = math.functionExpand(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should handle simple expressions without special functions', function () {
    // Should not throw
    assert.doesNotThrow(() => math.functionExpand('x + 1'))
  })
})
