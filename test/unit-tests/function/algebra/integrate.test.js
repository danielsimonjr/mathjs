// test integrate
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createIntegrate } from '../../../../src/function/algebra/integrate.js'

const math = create({ ...all, createIntegrate })

describe('integrate', function () {
  it('should integrate a constant', function () {
    const result = math.integrate('3', 'x')
    assert.ok(result.includes('3') && result.includes('x'), 'expected 3*x, got: ' + result)
  })

  it('should integrate a linear term', function () {
    const result = math.integrate('x', 'x')
    // x^2/2
    assert.ok(result.includes('x') && result.includes('2'), 'expected x^2/2 form, got: ' + result)
  })

  it('should integrate x^2 using power rule', function () {
    const result = math.integrate('x^2', 'x')
    // (1/3)*x^3
    assert.ok(result.includes('x') && result.includes('3'), 'expected x^3/3 form, got: ' + result)
    // Verify numerically
    const val = math.evaluate(result, { x: 3 })
    assert.ok(Math.abs(val - 9) < 1e-6, 'expected 9 at x=3, got: ' + val)
  })

  it('should integrate x^3 using power rule', function () {
    const result = math.integrate('x^3', 'x')
    // x^4/4
    assert.ok(result.includes('4'), 'expected x^4/4 form, got: ' + result)
    const val = math.evaluate(result, { x: 2 })
    assert.ok(Math.abs(val - 4) < 1e-6, 'expected 4 at x=2, got: ' + val)
  })

  it('should integrate sin(x)', function () {
    const result = math.integrate('sin(x)', 'x')
    assert.ok(result.includes('cos'), 'expected -cos(x), got: ' + result)
  })

  it('should integrate cos(x)', function () {
    const result = math.integrate('cos(x)', 'x')
    assert.ok(result.includes('sin'), 'expected sin(x), got: ' + result)
  })

  it('should integrate exp(x)', function () {
    const result = math.integrate('exp(x)', 'x')
    assert.ok(result.includes('exp'), 'expected exp(x), got: ' + result)
  })

  it('should integrate a polynomial sum', function () {
    const result = math.integrate('x^2 + x + 1', 'x')
    assert.ok(result.includes('x'), 'expected polynomial in x, got: ' + result)
  })

  it('should integrate a constant multiple', function () {
    const result = math.integrate('3*x^2', 'x')
    assert.ok(result.includes('x') && result.includes('3'), 'expected 3*x^3/... form, got: ' + result)
    const val = math.evaluate(result, { x: 2 })
    assert.ok(Math.abs(val - 8) < 1e-6, 'integral of 3x^2 at x=2 should be 8, got: ' + val)
  })

  it('should integrate 1/x to log(x)', function () {
    const result = math.integrate('1/x', 'x')
    assert.ok(result.includes('log'), 'expected log(x), got: ' + result)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^2')
    const result = math.integrate(node, 'x')
    assert.ok(result.includes('x') && result.includes('3'), 'expected x^3/3 form, got: ' + result)
  })

  it('should handle integration of a constant with respect to a variable', function () {
    const result = math.integrate('5', 'x')
    assert.ok(result.includes('5') && result.includes('x'), 'expected 5*x form, got: ' + result)
  })

  it('should throw for unsupported expressions', function () {
    assert.throws(function () {
      math.integrate('sin(x^2)', 'x')
    }, /integrate/)
  })
})
