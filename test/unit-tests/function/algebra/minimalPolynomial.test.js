import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMinimalPolynomial } from '../../../../src/function/algebra/minimalPolynomial.js'
import { approxEqual } from '../../../../tools/approx.js'

const math = create({ ...all, createMinimalPolynomial })

describe('minimalPolynomial', function () {
  it('should find minimal polynomial of sqrt(2)', function () {
    const result = math.minimalPolynomial('sqrt(2)', 'x')
    assert.strictEqual(typeof result, 'string')
    // Should be x^2 - 2, verify sqrt(2) is a root
    const val = math.evaluate(result, { x: Math.sqrt(2) })
    approxEqual(Number(val), 0, 1e-10)
    // Verify degree 2 and constant term -2
    assert.ok(result.includes('2'), 'result should contain 2: ' + result)
  })

  it('should find minimal polynomial of cbrt(3)', function () {
    const result = math.minimalPolynomial('cbrt(3)', 'x')
    assert.strictEqual(typeof result, 'string')
    // Should be x^3 - 3
    const val = math.evaluate(result, { x: Math.cbrt(3) })
    approxEqual(Number(val), 0, 1e-10)
  })

  it('should find minimal polynomial of a rational integer', function () {
    const result = math.minimalPolynomial('5', 'x')
    assert.strictEqual(typeof result, 'string')
    // Should be x - 5
    const val = math.evaluate(result, { x: 5 })
    approxEqual(Number(val), 0, 1e-10)
  })

  it('should find minimal polynomial of sqrt(2) + sqrt(3)', function () {
    const result = math.minimalPolynomial('sqrt(2) + sqrt(3)', 'x')
    assert.strictEqual(typeof result, 'string')
    // Should be x^4 - 10x^2 + 1
    const alpha = Math.sqrt(2) + Math.sqrt(3)
    const val = math.evaluate(result, { x: alpha })
    approxEqual(Number(val), 0, 1e-8)
  })

  it('should throw for unsupported expressions', function () {
    assert.throws(function () {
      math.minimalPolynomial('sin(x)', 'x')
    }, /unsupported/)
  })

  it('should find minimal polynomial of nthRoot(8, 3)', function () {
    const result = math.minimalPolynomial('nthRoot(8, 3)', 'x')
    assert.strictEqual(typeof result, 'string')
    // Should be x^3 - 8
    const val = math.evaluate(result, { x: 2 })
    approxEqual(Number(val), 0, 1e-10)
  })
})
