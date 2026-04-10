import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMultivariateTaylor } from '../../../../src/function/algebra/multivariateTaylor.js'
import { approxEqual } from '../../../../tools/approx.js'

const math = create({ ...all, createMultivariateTaylor })

describe('multivariateTaylor', function () {
  it('should expand x*y around (0,0) to order 2', function () {
    const result = math.multivariateTaylor('x * y', ['x', 'y'], [0, 0], 2)
    assert.strictEqual(typeof result, 'string')
    // x*y expanded to order 2: only term is x*y (coefficient 1)
    // Evaluate at (2, 3): should be 6
    const val = math.evaluate(result, { x: 2, y: 3 })
    approxEqual(Number(val), 6, 1e-8)
  })

  it('should expand x^2 + y^2 around (0,0) to order 2', function () {
    const result = math.multivariateTaylor('x^2 + y^2', ['x', 'y'], [0, 0], 2)
    assert.strictEqual(typeof result, 'string')
    // Should equal x^2 + y^2 exactly for order 2
    const val = math.evaluate(result, { x: 1, y: 2 })
    approxEqual(Number(val), 5, 1e-8)
  })

  it('should expand a constant around (0,0) to order 2', function () {
    const result = math.multivariateTaylor('3', ['x', 'y'], [0, 0], 2)
    // Constant: result should be '3'
    const val = math.evaluate(result, { x: 1, y: 1 })
    approxEqual(Number(val), 3, 1e-8)
  })

  it('should expand x + y around (0,0) to order 1', function () {
    const result = math.multivariateTaylor('x + y', ['x', 'y'], [0, 0], 1)
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result, { x: 2, y: 3 })
    approxEqual(Number(val), 5, 1e-8)
  })

  it('should throw for mismatched variables and points', function () {
    assert.throws(function () {
      math.multivariateTaylor('x + y', ['x', 'y'], [0], 2)
    }, /same length/)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x + y')
    const result = math.multivariateTaylor(node, ['x', 'y'], [0, 0], 2)
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result, { x: 1, y: 1 })
    approxEqual(Number(val), 2, 1e-8)
  })

  it('should expand sin(x+y) around (0,0) to order 3 and match sin at small values', function () {
    const result = math.multivariateTaylor('sin(x + y)', ['x', 'y'], [0, 0], 3)
    assert.strictEqual(typeof result, 'string')
    // For small x, y: sin(x+y) ≈ x + y - (x+y)^3/6
    const x = 0.1
    const y = 0.1
    const approx = math.evaluate(result, { x, y })
    const exact = Math.sin(x + y)
    approxEqual(Number(approx), exact, 1e-4)
  })
})
