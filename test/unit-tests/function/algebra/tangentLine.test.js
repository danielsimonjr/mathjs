import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'

describe('tangentLine', function () {
  it('should compute tangent line of x^2 at x=2', function () {
    // f(2) = 4, f'(2) = 4, tangent: 4x - 4
    const result = math.tangentLine('x^2', 'x', 2)
    assert.strictEqual(typeof result, 'string')
    // Evaluate both at a point to verify correctness
    const tangentFn = (x) => 4 * x - 4
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 0 }), tangentFn(0), 1e-10)
    approxEqual(resultNode.evaluate({ x: 3 }), tangentFn(3), 1e-10)
  })

  it('should compute tangent line of sin(x) at x=0', function () {
    // f(0) = 0, f'(0) = 1, tangent: x
    const result = math.tangentLine('sin(x)', 'x', 0)
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 0 }), 0, 1e-10)
    approxEqual(resultNode.evaluate({ x: 1 }), 1, 1e-10)
  })

  it('should compute tangent line of x^3 at x=1', function () {
    // f(1) = 1, f'(1) = 3, tangent: 3x - 2
    const result = math.tangentLine('x^3', 'x', 1)
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1 }), 1, 1e-10)
    approxEqual(resultNode.evaluate({ x: 2 }), 4, 1e-10)
  })

  it('should compute tangent line of a constant at any point', function () {
    // f = 5, f' = 0, tangent: 5
    const result = math.tangentLine('5', 'x', 3)
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 0 }), 5, 1e-10)
    approxEqual(resultNode.evaluate({ x: 10 }), 5, 1e-10)
  })

  it('should compute tangent line of exp(x) at x=0', function () {
    // f(0) = 1, f'(0) = 1, tangent: x + 1
    const result = math.tangentLine('exp(x)', 'x', 0)
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 0 }), 1, 1e-10)
    approxEqual(resultNode.evaluate({ x: 1 }), 2, 1e-10)
  })

  it('should accept a parsed Node as input', function () {
    const exprNode = math.parse('x^2')
    const result = math.tangentLine(exprNode, 'x', 2)
    assert.strictEqual(typeof result, 'string')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 2 }), 4, 1e-10)
  })

  it('should throw for invalid inputs', function () {
    assert.throws(() => math.tangentLine('x^2', 'x', 'notanumber'), Error)
  })
})
