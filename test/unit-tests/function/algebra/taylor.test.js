// test taylor
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createTaylor } from '../../../../src/function/algebra/taylor.js'

const math = create({ ...all, createTaylor })

describe('taylor', function () {
  it('should compute Taylor polynomial of sin(x) around 0, order 5', function () {
    const result = math.taylor('sin(x)', 'x', 0, 5)
    assert.strictEqual(typeof result, 'string')
    // Verify numerically at x=0.5
    const val = math.evaluate(result, { x: 0.5 })
    assert.ok(Math.abs(val - Math.sin(0.5)) < 0.001, 'sin(0.5) approximation off: ' + val)
  })

  it('should compute Taylor polynomial of exp(x) around 0, order 4', function () {
    const result = math.taylor('exp(x)', 'x', 0, 4)
    assert.strictEqual(typeof result, 'string')
    assert.ok(result.includes('x'), 'expected x in result')
    const val = math.evaluate(result, { x: 0.5 })
    assert.ok(Math.abs(val - Math.exp(0.5)) < 0.01, 'exp(0.5) approximation off: ' + val)
  })

  it('should compute Taylor polynomial of cos(x) around 0, order 6', function () {
    const result = math.taylor('cos(x)', 'x', 0, 6)
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result, { x: 0.3 })
    assert.ok(Math.abs(val - Math.cos(0.3)) < 0.001, 'cos(0.3) approximation off: ' + val)
  })

  it('should return 0 for the zero function', function () {
    const result = math.taylor('0', 'x', 0, 3)
    assert.ok(result === '0' || result.trim() === '0', 'expected "0", got: ' + result)
  })

  it('should use default point=0 and order=6 with 2 args', function () {
    const result = math.taylor('exp(x)', 'x')
    assert.strictEqual(typeof result, 'string')
    assert.ok(result.includes('x'))
  })

  it('should use default order=6 with 3 args', function () {
    const result = math.taylor('exp(x)', 'x', 0)
    assert.strictEqual(typeof result, 'string')
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^2')
    const result = math.taylor(node, 'x', 0, 3)
    assert.strictEqual(typeof result, 'string')
  })

  it('should correctly expand a polynomial exactly', function () {
    const result = math.taylor('x^2 + 2*x + 1', 'x', 0, 4)
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result, { x: 3 })
    assert.ok(Math.abs(val - 16) < 0.01, 'expected 16, got: ' + val)
  })

  it('should produce a string polynomial (not include remainder notation)', function () {
    const result = math.taylor('sin(x)', 'x', 0, 5)
    // Should not contain ellipsis, O(), or + O notation
    assert.ok(!result.includes('O('), 'should not include O() notation')
    assert.ok(!result.includes('...'), 'should not include ellipsis')
  })
})
