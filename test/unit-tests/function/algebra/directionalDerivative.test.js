import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDirectionalDerivative } from '../../../../src/function/algebra/directionalDerivative.js'
import { approxEqual } from '../../../../tools/approx.js'

const math = create({ ...all, createDirectionalDerivative })

describe('directionalDerivative', function () {
  it('should compute directional derivative of x*y in x-direction', function () {
    const result = math.directionalDerivative('x * y', ['x', 'y'], [1, 0])
    assert.strictEqual(typeof result, 'string')
    // D_x(x*y) = ∂(x*y)/∂x = y
    const val = math.evaluate(result, { x: 2, y: 3 })
    approxEqual(Number(val), 3, 1e-10)
  })

  it('should compute directional derivative of x*y in y-direction', function () {
    const result = math.directionalDerivative('x * y', ['x', 'y'], [0, 1])
    assert.strictEqual(typeof result, 'string')
    // D_y(x*y) = ∂(x*y)/∂y = x
    const val = math.evaluate(result, { x: 2, y: 3 })
    approxEqual(Number(val), 2, 1e-10)
  })

  it('should normalize the direction vector', function () {
    // Direction [3, 4] has magnitude 5, normalized = [0.6, 0.8]
    // D_v(x^2 + y^2) = 0.6*2x + 0.8*2y = 1.2x + 1.6y
    const result = math.directionalDerivative('x^2 + y^2', ['x', 'y'], [3, 4])
    const val = math.evaluate(result, { x: 1, y: 1 })
    // = 1.2*1 + 1.6*1 = 2.8
    approxEqual(Number(val), 2.8, 1e-10)
  })

  it('should compute directional derivative in 3D', function () {
    const result = math.directionalDerivative('x*y*z', ['x', 'y', 'z'], [1, 0, 0])
    // = ∂(xyz)/∂x = yz
    const val = math.evaluate(result, { x: 1, y: 2, z: 3 })
    approxEqual(Number(val), 6, 1e-10)
  })

  it('should throw for mismatched variable and direction lengths', function () {
    assert.throws(function () {
      math.directionalDerivative('x * y', ['x', 'y'], [1, 0, 0])
    }, /same length/)
  })

  it('should throw for zero direction vector', function () {
    assert.throws(function () {
      math.directionalDerivative('x * y', ['x', 'y'], [0, 0])
    }, /non-zero/)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x * y')
    const result = math.directionalDerivative(node, ['x', 'y'], [1, 0])
    assert.strictEqual(typeof result, 'string')
  })
})
