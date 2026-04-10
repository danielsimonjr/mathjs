import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createTogether } from '../../../../src/function/algebra/together.js'
import { createCancel } from '../../../../src/function/algebra/cancel.js'
import { createNormalForm } from '../../../../src/function/algebra/normalForm.js'

const math = create({ ...all, createTogether, createCancel, createNormalForm })

describe('normalForm', function () {
  it('should simplify (x^2 - 1)/(x - 1) to x + 1', function () {
    const result = math.normalForm('(x^2 - 1) / (x - 1)')
    // Should evaluate the same as x+1 at x=5
    const val = math.evaluate(result, { x: 5 })
    assert(Math.abs(val - 6) < 1e-8, `Expected x+1 form (=6 at x=5), got '${result}' = ${val}`)
  })

  it('should normalize 1/2 + 1/3', function () {
    const result = math.normalForm('1/2 + 1/3')
    const val = math.evaluate(result)
    assert(Math.abs(val - 5 / 6) < 1e-8, `Expected 5/6 = ${5 / 6}, got '${result}' = ${val}`)
  })

  it('should normalize (x + 1)^2 / (x + 1) to x + 1', function () {
    const result = math.normalForm('(x + 1)^2 / (x + 1)')
    const val = math.evaluate(result, { x: 3 })
    assert(Math.abs(val - 4) < 1e-8, `Expected x+1 (=4 at x=3), got '${result}' = ${val}`)
  })

  it('should return a string', function () {
    const result = math.normalForm('x + 0')
    assert.strictEqual(typeof result, 'string')
  })

  it('should accept Node input', function () {
    const node = math.parse('1/2 + 1/3')
    const result = math.normalForm(node)
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result)
    assert(Math.abs(val - 5 / 6) < 1e-8, `Expected 5/6, got '${result}' = ${val}`)
  })

  it('should leave a simple polynomial unchanged numerically', function () {
    const result = math.normalForm('x^2 + 2*x + 1')
    const val = math.evaluate(result, { x: 3 })
    // (3+1)^2 = 16
    assert(Math.abs(val - 16) < 1e-8, `Expected 16 at x=3, got '${result}' = ${val}`)
  })

  it('should be numerically equivalent to original', function () {
    const exprs = ['(x + 1)^2 / (x + 1)', '1/2 + 1/3', 'x^2 + 2*x + 1']
    for (const expr of exprs) {
      const normalized = math.normalForm(expr)
      const scope = { x: 2 }
      const original = math.evaluate(expr, scope)
      const normalizedVal = math.evaluate(normalized, scope)
      assert(
        Math.abs(original - normalizedVal) < 1e-8,
        `Mismatch for "${expr}": original=${original}, normalized="${normalized}" => ${normalizedVal}`
      )
    }
  })
})
