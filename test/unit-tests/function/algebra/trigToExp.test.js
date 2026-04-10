import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createTrigToExp } from '../../../../src/function/algebra/trigToExp.js'

const math = create({ ...all, createTrigToExp })

describe('trigToExp', function () {
  it('should convert cos(x) to (exp(i*x) + exp(-i*x))/2', function () {
    const result = math.trigToExp('cos(x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('exp(') && str.includes('i') && str.includes('/2'),
      `Expected exp form with /2, got '${str}'`
    )
  })

  it('should convert sin(x) to (exp(i*x) - exp(-i*x))/(2*i)', function () {
    const result = math.trigToExp('sin(x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('exp(') && str.includes('i'),
      `Expected exp form, got '${str}'`
    )
  })

  it('should convert sinh(x) to (exp(x) - exp(-x))/2', function () {
    const result = math.trigToExp('sinh(x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('exp(x)') && str.includes('/2'),
      `Expected (exp(x) - exp(-x))/2 form, got '${str}'`
    )
  })

  it('should convert cosh(x) to (exp(x) + exp(-x))/2', function () {
    const result = math.trigToExp('cosh(x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('exp(x)') && str.includes('/2'),
      `Expected (exp(x) + exp(-x))/2 form, got '${str}'`
    )
  })

  it('should convert tanh(x) to exp form', function () {
    const result = math.trigToExp('tanh(x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('exp(x)'),
      `Expected exp form, got '${str}'`
    )
  })

  it('should return a string when given a string', function () {
    const result = math.trigToExp('cos(x)')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('cos(x)')
    const result = math.trigToExp(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should be numerically equivalent (real parts at x=1)', function () {
    // sinh and cosh can be evaluated numerically
    const exprs = ['sinh(x)', 'cosh(x)', 'tanh(x)']
    for (const expr of exprs) {
      const converted = math.trigToExp(expr)
      const scope = { x: 1 }
      const original = math.evaluate(expr, scope)
      const convertedVal = math.evaluate(converted, scope)
      assert(
        Math.abs(original - convertedVal) < 1e-8,
        `Mismatch for "${expr}": original=${original}, converted="${converted}" => ${convertedVal}`
      )
    }
  })
})
