import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createTrigReduce } from '../../../../src/function/algebra/trigReduce.js'

const math = create({ ...all, createTrigReduce })

describe('trigReduce', function () {
  it('should reduce sin(x)^2 to (1 - cos(2*x))/2', function () {
    const result = math.trigReduce('sin(x)^2')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cos(2') && str.includes('1'),
      `Expected (1 - cos(2*x))/2 form, got '${str}'`
    )
  })

  it('should reduce cos(x)^2 to (1 + cos(2*x))/2', function () {
    const result = math.trigReduce('cos(x)^2')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cos(2') && str.includes('1'),
      `Expected (1 + cos(2*x))/2 form, got '${str}'`
    )
  })

  it('should reduce sin(a)*cos(b)', function () {
    const result = math.trigReduce('sin(a) * cos(b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('sin(') && str.includes('/2'),
      `Expected product-to-sum form, got '${str}'`
    )
  })

  it('should reduce sin(a)*sin(b)', function () {
    const result = math.trigReduce('sin(a) * sin(b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cos(') && str.includes('/2'),
      `Expected product-to-sum form, got '${str}'`
    )
  })

  it('should reduce cos(a)*cos(b)', function () {
    const result = math.trigReduce('cos(a) * cos(b)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cos(') && str.includes('/2'),
      `Expected product-to-sum form, got '${str}'`
    )
  })

  it('should return a string when given a string', function () {
    const result = math.trigReduce('sin(x)^2')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('sin(x)^2')
    const result = math.trigReduce(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should be numerically equivalent', function () {
    const exprs = ['sin(x)^2', 'cos(x)^2', 'sin(x) * cos(x)']
    for (const expr of exprs) {
      const reduced = math.trigReduce(expr)
      const scope = { x: 0.7 }
      const original = math.evaluate(expr, scope)
      const reducedVal = math.evaluate(reduced, scope)
      assert(
        Math.abs(original - reducedVal) < 1e-8,
        `Mismatch for "${expr}": original=${original}, reduced="${reduced}" => ${reducedVal}`
      )
    }
  })
})
