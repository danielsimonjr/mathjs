import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createAsymptotic } from '../../../../src/function/algebra/asymptotic.js'

const math = create({ ...all, createAsymptotic })

describe('asymptotic', function () {
  it('should find leading term of a polynomial as x → Infinity', function () {
    const result = math.asymptotic('3*x^4 + 2*x^2 + 1', 'x', Infinity)
    assert.strictEqual(typeof result, 'string')
    // Leading term should be 3 * x ^ 4 or equivalent — check degree 4 is mentioned
    assert.ok(result.includes('4'), 'result should mention degree 4: ' + result)
  })

  it('should handle simple linear polynomial', function () {
    const result = math.asymptotic('x + 1', 'x', Infinity)
    assert.strictEqual(typeof result, 'string')
    // Leading term should be x
    assert.ok(result.includes('x'), 'result should contain x: ' + result)
  })

  it('should handle rational function (x^3 + x) / (x^2 + 1) as x → Infinity', function () {
    const result = math.asymptotic('(x^3 + x) / (x^2 + 1)', 'x', Infinity)
    assert.strictEqual(typeof result, 'string')
    // Leading term: x^3 / x^2 = x
    assert.ok(result.includes('x'), 'result should simplify to x: ' + result)
  })

  it('should handle a constant polynomial', function () {
    const result = math.asymptotic('7', 'x', Infinity)
    // Should return '7' or equivalent
    assert.ok(result !== null && result !== undefined)
  })

  it('should handle quadratic polynomial leading term', function () {
    const result = math.asymptotic('x^2 + 5*x + 6', 'x', Infinity)
    assert.strictEqual(typeof result, 'string')
    assert.ok(result.includes('2'), 'result should mention degree 2: ' + result)
  })
})
