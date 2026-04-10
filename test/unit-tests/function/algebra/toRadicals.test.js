import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createToRadicals } from '../../../../src/function/algebra/toRadicals.js'
import { approxEqual } from '../../../../tools/approx.js'

const math = create({ ...all, createToRadicals })

describe('toRadicals', function () {
  it('should convert x^(1/2) to sqrt form', function () {
    const result = math.toRadicals('x^(1/2)')
    assert.strictEqual(typeof result, 'string')
    // Result should evaluate to the same as sqrt(x)
    const original = Math.sqrt(4)
    const converted = math.evaluate(result, { x: 4 })
    approxEqual(Number(converted), original, 1e-10)
  })

  it('should convert x^(1/3) to cbrt form', function () {
    const result = math.toRadicals('x^(1/3)')
    assert.strictEqual(typeof result, 'string')
    const original = Math.cbrt(8)
    const converted = math.evaluate(result, { x: 8 })
    approxEqual(Number(converted), original, 1e-10)
  })

  it('should convert x^(2/3) to nthRoot form', function () {
    const result = math.toRadicals('x^(2/3)')
    assert.strictEqual(typeof result, 'string')
    const original = Math.cbrt(8 ** 2)
    const converted = math.evaluate(result, { x: 8 })
    approxEqual(Number(converted), original, 1e-10)
  })

  it('should simplify 4^(1/2) to 2', function () {
    const result = math.toRadicals('4^(1/2)')
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result)
    approxEqual(Number(val), 2, 1e-10)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x^(1/2)')
    const result = math.toRadicals(node)
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result, { x: 9 })
    approxEqual(Number(val), 3, 1e-10)
  })

  it('should leave non-power expressions unchanged', function () {
    const result = math.toRadicals('x + 1')
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result, { x: 2 })
    approxEqual(Number(val), 3, 1e-10)
  })
})
