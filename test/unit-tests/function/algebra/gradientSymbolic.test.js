import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'

describe('gradientSymbolic', function () {
  it('should compute gradient of x^2 + y^2', function () {
    // grad = [2x, 2y]
    const result = math.gradientSymbolic('x^2 + y^2', ['x', 'y'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 2)
    const dx = math.parse(result[0])
    const dy = math.parse(result[1])
    approxEqual(dx.evaluate({ x: 1, y: 1 }), 2, 1e-10)
    approxEqual(dy.evaluate({ x: 1, y: 3 }), 6, 1e-10)
  })

  it('should compute gradient of x*y*z', function () {
    // grad = [y*z, x*z, x*y]
    const result = math.gradientSymbolic('x*y*z', ['x', 'y', 'z'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 3)
    const dx = math.parse(result[0])
    const dy = math.parse(result[1])
    const dz = math.parse(result[2])
    // at (2, 3, 4): d/dx = y*z = 12, d/dy = x*z = 8, d/dz = x*y = 6
    approxEqual(dx.evaluate({ x: 2, y: 3, z: 4 }), 12, 1e-10)
    approxEqual(dy.evaluate({ x: 2, y: 3, z: 4 }), 8, 1e-10)
    approxEqual(dz.evaluate({ x: 2, y: 3, z: 4 }), 6, 1e-10)
  })

  it('should return zeros for constant expression', function () {
    const result = math.gradientSymbolic('5', ['x', 'y'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 2)
    result.forEach(function (comp) {
      approxEqual(math.parse(comp).evaluate({ x: 1, y: 1 }), 0, 1e-10)
    })
  })

  it('should compute gradient of a single-variable expression', function () {
    const result = math.gradientSymbolic('x^3', ['x'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 1)
    const dx = math.parse(result[0])
    approxEqual(dx.evaluate({ x: 2 }), 12, 1e-10)
  })

  it('should accept a parsed Node as input', function () {
    const exprNode = math.parse('x^2 + y^2')
    const result = math.gradientSymbolic(exprNode, ['x', 'y'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 2)
    result.forEach(function (comp) {
      assert.strictEqual(typeof comp, 'string')
    })
  })
})
