import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'

describe('divergence', function () {
  it('should compute divergence of [x^2, y^2, z^2]', function () {
    // div = 2x + 2y + 2z
    const result = math.divergence(['x^2', 'y^2', 'z^2'], ['x', 'y', 'z'])
    assert.strictEqual(typeof result, 'string')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1, z: 1 }), 6, 1e-10)
    approxEqual(resultNode.evaluate({ x: 1, y: 2, z: 3 }), 12, 1e-10)
  })

  it('should compute divergence of [x, y] in 2D', function () {
    // div = 1 + 1 = 2
    const result = math.divergence(['x', 'y'], ['x', 'y'])
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 5, y: 5 }), 2, 1e-10)
  })

  it('should compute divergence of a zero field', function () {
    // div = 0
    const result = math.divergence(['y', 'x', 'z^0 - 1'], ['x', 'y', 'z'])
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 1, z: 1 }), 0, 1e-10)
  })

  it('should compute divergence of [x*y, y*z, x*z]', function () {
    // d(x*y)/dx = y, d(y*z)/dy = z, d(x*z)/dz = x
    // div = y + z + x
    const result = math.divergence(['x*y', 'y*z', 'x*z'], ['x', 'y', 'z'])
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 2, z: 3 }), 6, 1e-10)
  })

  it('should throw when field and variable arrays have different lengths', function () {
    assert.throws(
      () => math.divergence(['x^2', 'y^2'], ['x', 'y', 'z']),
      /same length/
    )
  })

  it('should accept Node objects in field array', function () {
    const f1 = math.parse('x^2')
    const f2 = math.parse('y^2')
    const result = math.divergence([f1, f2], ['x', 'y'])
    assert.strictEqual(typeof result, 'string')
    const resultNode = math.parse(result)
    approxEqual(resultNode.evaluate({ x: 1, y: 2 }), 6, 1e-10)
  })
})
