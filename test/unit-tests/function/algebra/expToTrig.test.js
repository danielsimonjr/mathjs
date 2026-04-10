import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createExpToTrig } from '../../../../src/function/algebra/expToTrig.js'

const math = create({ ...all, createExpToTrig })

describe('expToTrig', function () {
  it('should convert exp(i*x) to cos(x) + i*sin(x)', function () {
    const result = math.expToTrig('exp(i * x)')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cos(x)') && str.includes('sin(x)') && str.includes('i'),
      `Expected cos(x) + i*sin(x) form, got '${str}'`
    )
  })

  it('should convert (exp(x) + exp(-x))/2 to cosh(x)', function () {
    const result = math.expToTrig('(exp(x) + exp(-x)) / 2')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('cosh(x)'),
      `Expected cosh(x), got '${str}'`
    )
  })

  it('should convert (exp(x) - exp(-x))/2 to sinh(x)', function () {
    const result = math.expToTrig('(exp(x) - exp(-x)) / 2')
    const str = result.toString().replace(/ /g, '')
    assert(
      str.includes('sinh(x)'),
      `Expected sinh(x), got '${str}'`
    )
  })

  it('should leave plain exp(x) unchanged', function () {
    const result = math.expToTrig('exp(x)')
    const str = result.toString().replace(/ /g, '')
    assert(str.includes('exp(x)'), `Expected exp(x), got '${str}'`)
  })

  it('should return a string when given a string', function () {
    const result = math.expToTrig('exp(i * x)')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a Node when given a Node', function () {
    const node = math.parse('exp(i * x)')
    const result = math.expToTrig(node)
    assert.strictEqual(typeof result.toString, 'function', 'expected a Node')
  })

  it('should handle nested expressions', function () {
    // Should not throw
    assert.doesNotThrow(() => math.expToTrig('exp(i * x) + exp(-i * x)'))
  })
})
