import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPolynomialLCM } from '../../../../src/function/algebra/polynomialLCM.js'
import { createPolynomialGCD } from '../../../../src/function/algebra/polynomialGCD.js'
import { createPolymul } from '../../../../src/function/algebra/polymul.js'

const math = create({ ...all, createPolynomialLCM, createPolynomialGCD, createPolymul })

function evalPoly (exprStr, variable, value) {
  const scope = {}
  scope[variable] = value
  return math.evaluate(exprStr, scope)
}

describe('polynomialLCM', function () {
  it('should compute LCM of x^2-1 and x^2-2x+1', function () {
    // GCD = x-1, LCM = (x^2-1)(x^2-2x+1)/(x-1) = (x+1)(x-1)^2 = x^3 - x^2 - x + 1
    const result = math.polynomialLCM('x^2 - 1', 'x^2 - 2*x + 1', 'x')
    // Verify by checking roots: LCM should vanish at x=1 and x=-1
    assert.ok(Math.abs(evalPoly(result, 'x', 1)) < 1e-6, 'LCM should vanish at x=1')
    assert.ok(Math.abs(evalPoly(result, 'x', -1)) < 1e-6, 'LCM should vanish at x=-1')
  })

  it('should compute LCM of x^2-1 and x+1', function () {
    // GCD = x+1, LCM = (x^2-1)(x+1)/(x+1) = x^2-1 = (x-1)(x+1)
    const result = math.polynomialLCM('x^2 - 1', 'x + 1', 'x')
    assert.ok(Math.abs(evalPoly(result, 'x', 1)) < 1e-6, 'should vanish at x=1')
    assert.ok(Math.abs(evalPoly(result, 'x', -1)) < 1e-6, 'should vanish at x=-1')
    // degree should be 2
    assert.ok(Math.abs(evalPoly(result, 'x', 2)) > 1e-6, 'should not vanish at x=2')
  })

  it('should compute LCM of coprime polynomials (GCD=1)', function () {
    // x^2-4 and x^2-1 are coprime, LCM = (x^2-4)(x^2-1)
    const result = math.polynomialLCM('x^2 - 4', 'x^2 - 1', 'x')
    // LCM should vanish at 2, -2, 1, -1
    assert.ok(Math.abs(evalPoly(result, 'x', 2)) < 1e-6, 'should vanish at x=2')
    assert.ok(Math.abs(evalPoly(result, 'x', -2)) < 1e-6, 'should vanish at x=-2')
    assert.ok(Math.abs(evalPoly(result, 'x', 1)) < 1e-6, 'should vanish at x=1')
    assert.ok(Math.abs(evalPoly(result, 'x', -1)) < 1e-6, 'should vanish at x=-1')
  })

  it('should return a string result', function () {
    const result = math.polynomialLCM('x^2 - 4', 'x - 2', 'x')
    assert.strictEqual(typeof result, 'string')
  })

  it('should handle LCM with identical polynomials (LCM = itself)', function () {
    const result = math.polynomialLCM('x^2 - 1', 'x^2 - 1', 'x')
    // LCM should be x^2-1, vanishing at x=1 and x=-1
    assert.ok(Math.abs(evalPoly(result, 'x', 1)) < 1e-6)
    assert.ok(Math.abs(evalPoly(result, 'x', -1)) < 1e-6)
  })
})
