import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'

describe('partialDerivative', function () {
  it('should compute first partial derivative with respect to x', function () {
    // d/dx(x^2 * y^3) = 2*x*y^3
    const result = math.partialDerivative('x^2 * y^3', 'x')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), 2, 1e-10)
    approxEqual(resultNode.evaluate({ x: 2, y: 1 }), 4, 1e-10)
  })

  it('should compute first partial derivative with respect to y', function () {
    // d/dy(x^2 * y^3) = 3*x^2*y^2
    const result = math.partialDerivative('x^2 * y^3', 'y')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), 3, 1e-10)
    approxEqual(resultNode.evaluate({ x: 2, y: 1 }), 12, 1e-10)
  })

  it('should compute mixed partial derivative d^2/dxdy', function () {
    // d/dx(d/dy(x^2 * y^3)) = d/dx(3*x^2*y^2) = 6*x*y^2
    const result = math.partialDerivative('x^2 * y^3', ['x', 'y'])
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), 6, 1e-10)
    approxEqual(resultNode.evaluate({ x: 2, y: 2 }), 48, 1e-10)
  })

  it('should compute second-order partial derivative d^2/dx^2', function () {
    // d^2/dx^2(x^3) = 6x
    const result = math.partialDerivative('x^3', ['x', 'x'])
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1 }), 6, 1e-10)
    approxEqual(resultNode.evaluate({ x: 2 }), 12, 1e-10)
  })

  it('should return 0 for partial derivative of constant', function () {
    const result = math.partialDerivative('5', 'x')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1 }), 0, 1e-10)
  })

  it('should handle three-variable expressions', function () {
    // d^3/dxdydz(x*y*z) = 1
    const result = math.partialDerivative('x*y*z', ['x', 'y', 'z'])
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1, z: 1 }), 1, 1e-10)
  })

  it('should accept a parsed Node as input', function () {
    const exprNode = math.parse('x^2 * y^3')
    const result = math.partialDerivative(exprNode, ['x', 'y'])
    assert.strictEqual(typeof result, 'string')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), 6, 1e-10)
  })
})
