import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLaplacian } from '../../../../src/function/algebra/laplacian.js'
import { approxEqual } from '../../../../tools/approx.js'

const math = create({ ...all, createLaplacian })

describe('laplacian', function () {
  it('should compute Laplacian of x^2 + y^2 (result: 4)', function () {
    const result = math.laplacian('x^2 + y^2', ['x', 'y'])
    assert.strictEqual(typeof result, 'string')
    // Evaluate to verify: d²/dx²(x²+y²) + d²/dy²(x²+y²) = 2 + 2 = 4
    const val = math.evaluate(result, { x: 1, y: 1 })
    approxEqual(Number(val), 4, 1e-10)
  })

  it('should compute Laplacian of x^3 + y^3', function () {
    const result = math.laplacian('x^3 + y^3', ['x', 'y'])
    // d²/dx² = 6x, d²/dy² = 6y → total = 6x + 6y
    const val = math.evaluate(result, { x: 1, y: 2 })
    approxEqual(Number(val), 6 * 1 + 6 * 2, 1e-10)
  })

  it('should compute Laplacian of a constant as 0', function () {
    const result = math.laplacian('5', ['x', 'y'])
    const val = math.evaluate(result, { x: 1, y: 1 })
    approxEqual(Number(val), 0, 1e-10)
  })

  it('should compute Laplacian of a single variable expression', function () {
    const result = math.laplacian('x^2', ['x'])
    // d²/dx²(x²) = 2
    const val = math.evaluate(result, { x: 1 })
    approxEqual(Number(val), 2, 1e-10)
  })

  it('should accept a parsed Node as input', function () {
    const node = math.parse('x^2 + y^2')
    const result = math.laplacian(node, ['x', 'y'])
    assert.strictEqual(typeof result, 'string')
    const val = math.evaluate(result, { x: 2, y: 3 })
    approxEqual(Number(val), 4, 1e-10)
  })

  it('should compute Laplacian of three-variable expression', function () {
    const result = math.laplacian('x^2 + y^2 + z^2', ['x', 'y', 'z'])
    // = 2 + 2 + 2 = 6
    const val = math.evaluate(result, { x: 1, y: 1, z: 1 })
    approxEqual(Number(val), 6, 1e-10)
  })
})
