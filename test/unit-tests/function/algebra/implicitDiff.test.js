import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'

describe('implicitDiff', function () {
  it('should compute dy/dx for a unit circle x^2 + y^2 - 1 = 0', function () {
    // dy/dx = -(2x) / (2y) = -x/y
    const result = math.implicitDiff('x^2 + y^2 - 1', 'y', 'x')
    assert.strictEqual(typeof result, 'string')
    // Evaluate and verify: at (1, 1) slope should be -1
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), -1, 1e-10)
    approxEqual(resultNode.evaluate({ x: 1, y: 2 }), -0.5, 1e-10)
  })

  it('should compute dy/dx for x^2 - y = 0', function () {
    // F = x^2 - y, dF/dx = 2x, dF/dy = -1
    // dy/dx = -(2x)/(-1) = 2x
    const result = math.implicitDiff('x^2 - y', 'y', 'x')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 3, y: 9 }), 6, 1e-10)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), 2, 1e-10)
  })

  it('should compute dy/dx for x*y - 1 = 0 (xy = 1)', function () {
    // F = x*y - 1, dF/dx = y, dF/dy = x
    // dy/dx = -y/x
    const result = math.implicitDiff('x*y - 1', 'y', 'x')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), -1, 1e-10)
    approxEqual(resultNode.evaluate({ x: 2, y: 0.5 }), -0.25, 1e-10)
  })

  it('should accept a parsed Node as input', function () {
    const exprNode = math.parse('x^2 + y^2 - 1')
    const result = math.implicitDiff(exprNode, 'y', 'x')
    assert.strictEqual(typeof result, 'string')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1 }), -1, 1e-10)
  })

  it('should throw for non-string variable inputs', function () {
    assert.throws(() => math.implicitDiff('x^2 + y^2', 42, 'x'), TypeError)
  })
})
