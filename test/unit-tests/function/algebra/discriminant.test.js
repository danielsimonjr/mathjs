import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createDiscriminant } from '../../../../src/function/algebra/discriminant.js'
import { createCoefficientList } from '../../../../src/function/algebra/coefficientList.js'
import { createPolyder } from '../../../../src/function/algebra/polyder.js'

const math = create({ ...all, createDiscriminant, createCoefficientList, createPolyder })

describe('discriminant', function () {
  it('should return 0 for a perfect square (x^2 + 2x + 1)', function () {
    const result = math.discriminant('x^2 + 2*x + 1', 'x')
    assert.ok(Math.abs(result - 0) < 1e-6, `Expected 0, got ${result}`)
  })

  it('should return 16 for x^2 - 4', function () {
    const result = math.discriminant('x^2 - 4', 'x')
    assert.ok(Math.abs(result - 16) < 1e-6, `Expected 16, got ${result}`)
  })

  it('should return positive discriminant for x^2 - x - 6 (two real roots)', function () {
    // (x-3)(x+2): b^2 - 4ac = 1 + 24 = 25
    const result = math.discriminant('x^2 - x - 6', 'x')
    assert.ok(Math.abs(result - 25) < 1e-6, `Expected 25, got ${result}`)
  })

  it('should return negative discriminant for x^2 + x + 1 (no real roots)', function () {
    // b^2 - 4ac = 1 - 4 = -3
    const result = math.discriminant('x^2 + x + 1', 'x')
    assert.ok(Math.abs(result - (-3)) < 1e-6, `Expected -3, got ${result}`)
  })

  it('should return 1 for a linear polynomial', function () {
    const result = math.discriminant('2*x + 3', 'x')
    assert.strictEqual(result, 1)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^2 - 4')
    const result = math.discriminant(node, 'x')
    assert.ok(Math.abs(result - 16) < 1e-6, `Expected 16, got ${result}`)
  })

  it('should handle a cubic polynomial discriminant', function () {
    // x^3 - 3x + 2 = (x-1)^2*(x+2): discriminant should be 0
    const result = math.discriminant('x^3 - 3*x + 2', 'x')
    assert.ok(Math.abs(result) < 1e-3, `Expected 0 (repeated root), got ${result}`)
  })
})
