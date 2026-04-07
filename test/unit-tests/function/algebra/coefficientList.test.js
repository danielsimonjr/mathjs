import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createCoefficientList } from '../../../../src/function/algebra/coefficientList.js'

const math = create({ ...all, createCoefficientList })

describe('coefficientList', function () {
  it('should extract coefficients of a quadratic', function () {
    const coeffs = math.coefficientList('3*x^2 + 2*x + 1', 'x')
    assert.strictEqual(coeffs.length, 3)
    assert.strictEqual(coeffs[0], 1) // constant term
    assert.strictEqual(coeffs[1], 2) // x coefficient
    assert.strictEqual(coeffs[2], 3) // x^2 coefficient
  })

  it('should extract coefficients of a cubic with missing terms', function () {
    const coeffs = math.coefficientList('x^3 - x', 'x')
    assert.strictEqual(coeffs.length, 4)
    assert.strictEqual(coeffs[0], 0)  // constant
    assert.strictEqual(coeffs[1], -1) // x
    assert.strictEqual(coeffs[2], 0)  // x^2
    assert.strictEqual(coeffs[3], 1)  // x^3
  })

  it('should return [c] for a constant expression', function () {
    const coeffs = math.coefficientList('5', 'x')
    assert.strictEqual(coeffs.length, 1)
    assert.strictEqual(coeffs[0], 5)
  })

  it('should return [0, 1] for x', function () {
    const coeffs = math.coefficientList('x', 'x')
    assert.strictEqual(coeffs.length, 2)
    assert.strictEqual(coeffs[0], 0)
    assert.strictEqual(coeffs[1], 1)
  })

  it('should work with a Node input', function () {
    const node = math.parse('2*x + 3')
    const coeffs = math.coefficientList(node, 'x')
    assert.strictEqual(coeffs[0], 3)
    assert.strictEqual(coeffs[1], 2)
  })

  it('should handle negative coefficients', function () {
    const coeffs = math.coefficientList('-x^2 + 4', 'x')
    assert.strictEqual(coeffs[0], 4)
    assert.strictEqual(coeffs[1], 0)
    assert.strictEqual(coeffs[2], -1)
  })

  it('coefficients should satisfy the polynomial identity', function () {
    const coeffs = math.coefficientList('x^2 - 3*x + 2', 'x')
    // Verify: evaluate at x=5 using coefficients
    const x = 5
    let val = 0
    for (let i = 0; i < coeffs.length; i++) {
      val += coeffs[i] * Math.pow(x, i)
    }
    // Direct evaluation
    const expected = x * x - 3 * x + 2 // 25 - 15 + 2 = 12
    assert(Math.abs(val - expected) < 1e-6)
  })
})
