// test series
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createSeries } from '../../../../src/function/algebra/series.js'

const math = create({ ...all, createSeries })

describe('series', function () {
  it('should compute Taylor series of exp(x) around 0', function () {
    const result = math.series('exp(x)', 'x', 0, 4)
    assert.ok(typeof result === 'string', 'expected string result')
    assert.ok(result.includes('x'), 'expected x in result: ' + result)
    // Verify numerically: evaluate at x=0.5
    const val = math.evaluate(result, { x: 0.5 })
    assert.ok(Math.abs(val - Math.exp(0.5)) < 0.01, 'exp(0.5) approximation off: ' + val)
  })

  it('should compute Taylor series of sin(x) around 0', function () {
    const result = math.series('sin(x)', 'x', 0, 5)
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { x: 0.3 })
    assert.ok(Math.abs(val - Math.sin(0.3)) < 0.01, 'sin(0.3) approximation off: ' + val)
  })

  it('should compute Taylor series of cos(x) around 0', function () {
    const result = math.series('cos(x)', 'x', 0, 4)
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { x: 0.3 })
    assert.ok(Math.abs(val - Math.cos(0.3)) < 0.01, 'cos(0.3) approximation off: ' + val)
  })

  it('should compute series for a polynomial exactly', function () {
    const result = math.series('x^2 + 2*x + 1', 'x', 0, 4)
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { x: 3 })
    assert.ok(Math.abs(val - 16) < 0.01, 'expected 16, got: ' + val)
  })

  it('should use default point=0 and order=6 when called with 2 args', function () {
    const result = math.series('exp(x)', 'x')
    assert.ok(typeof result === 'string')
    assert.ok(result.includes('x'))
  })

  it('should use default order=6 when called with 3 args', function () {
    const result = math.series('exp(x)', 'x', 0)
    assert.ok(typeof result === 'string')
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^2')
    const result = math.series(node, 'x', 0, 3)
    assert.ok(typeof result === 'string')
  })

  it('should return 0 for the zero function', function () {
    const result = math.series('0', 'x', 0, 3)
    assert.ok(result === '0' || result.trim() === '0', 'expected "0", got: ' + result)
  })
})
