// test laplace
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLaplace } from '../../../../src/function/algebra/laplace.js'

const math = create({ ...all, createLaplace })

describe('laplace', function () {
  it('should compute L{1} = 1/s', function () {
    const result = math.laplace('1', 't', 's')
    assert.ok(typeof result === 'string')
    assert.ok(result.includes('s'), 'result should contain s: ' + result)
    const val = math.evaluate(result, { s: 2 })
    assert.ok(Math.abs(val - 0.5) < 1e-9, 'expected 0.5 at s=2, got: ' + val)
  })

  it('should compute L{t} = 1/s^2', function () {
    const result = math.laplace('t', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    assert.ok(Math.abs(val - 0.25) < 1e-9, 'expected 0.25 at s=2, got: ' + val)
  })

  it('should compute L{t^2} = 2/s^3', function () {
    const result = math.laplace('t^2', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    // 2/s^3 at s=2 => 2/8 = 0.25
    assert.ok(Math.abs(val - 0.25) < 1e-9, 'expected 0.25 at s=2, got: ' + val)
  })

  it('should compute L{sin(t)} = 1/(s^2+1)', function () {
    const result = math.laplace('sin(t)', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    // 1/(4+1) = 0.2
    assert.ok(Math.abs(val - 0.2) < 1e-9, 'expected 0.2 at s=2, got: ' + val)
  })

  it('should compute L{cos(t)} = s/(s^2+1)', function () {
    const result = math.laplace('cos(t)', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    // 2/(4+1) = 0.4
    assert.ok(Math.abs(val - 0.4) < 1e-9, 'expected 0.4 at s=2, got: ' + val)
  })

  it('should compute L{exp(2*t)} = 1/(s-2)', function () {
    const result = math.laplace('exp(2*t)', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 3 })
    // 1/(3-2) = 1
    assert.ok(Math.abs(val - 1) < 1e-9, 'expected 1 at s=3, got: ' + val)
  })

  it('should compute L{exp(-t)} = 1/(s+1)', function () {
    const result = math.laplace('exp(-t)', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    // 1/(2+1) = 1/3
    assert.ok(Math.abs(val - 1 / 3) < 1e-9, 'expected 1/3 at s=2, got: ' + val)
  })

  it('should handle linearity: L{2*sin(t)} = 2/(s^2+1)', function () {
    const result = math.laplace('2*sin(t)', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    // 2/(4+1) = 0.4
    assert.ok(Math.abs(val - 0.4) < 1e-9, 'expected 0.4 at s=2, got: ' + val)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('t^2')
    const result = math.laplace(node, 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    assert.ok(Math.abs(val - 0.25) < 1e-9, 'expected 0.25 at s=2, got: ' + val)
  })

  it('should compute L{sin(3*t)} = 3/(s^2+9)', function () {
    const result = math.laplace('sin(3*t)', 't', 's')
    assert.ok(typeof result === 'string')
    const val = math.evaluate(result, { s: 2 })
    // 3/(4+9) = 3/13
    assert.ok(Math.abs(val - 3 / 13) < 1e-9, 'expected 3/13 at s=2, got: ' + val)
  })
})
