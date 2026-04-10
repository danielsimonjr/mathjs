import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'

describe('curl', function () {
  it('should compute curl of a conservative field [y*z, x*z, x*y]', function () {
    // curl of a gradient of a scalar field is always zero
    // F = grad(x*y*z), so curl(F) = [0, 0, 0]
    const result = math.curl(['y*z', 'x*z', 'x*y'], ['x', 'y', 'z'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 3)
    result.forEach(function (comp) {
      const node = math.parse(comp)
      approxEqual(node.evaluate({ x: 1, y: 1, z: 1 }), 0)
    })
  })

  it('should compute curl of [y, -x, 0]', function () {
    // This represents a rotation in the xy plane
    // curl = [d(0)/dy - d(-x)/dz, d(y)/dz - d(0)/dx, d(-x)/dx - d(y)/dy]
    //      = [0 - 0, 0 - 0, -1 - 1] = [0, 0, -2]
    const result = math.curl(['y', '-x', '0'], ['x', 'y', 'z'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 3)
    const c0 = math.parse(result[0])
    const c1 = math.parse(result[1])
    const c2 = math.parse(result[2])
    approxEqual(c0.evaluate({ x: 1, y: 1, z: 1 }), 0)
    approxEqual(c1.evaluate({ x: 1, y: 1, z: 1 }), 0)
    approxEqual(c2.evaluate({ x: 1, y: 1, z: 1 }), -2)
  })

  it('should compute curl of [x^2, y^2, z^2]', function () {
    // All partials between different vars are 0
    // curl = [0 - 0, 0 - 0, 0 - 0] = [0, 0, 0]
    const result = math.curl(['x^2', 'y^2', 'z^2'], ['x', 'y', 'z'])
    result.forEach(function (comp) {
      const node = math.parse(comp)
      approxEqual(node.evaluate({ x: 2, y: 3, z: 4 }), 0)
    })
  })

  it('should compute curl of [z, x, y]', function () {
    // curl = [d(y)/dy - d(x)/dz, d(z)/dz - d(y)/dx, d(x)/dx - d(z)/dy]
    //      = [1 - 0, 1 - 0, 1 - 0] = [1, 1, 1]
    const result = math.curl(['z', 'x', 'y'], ['x', 'y', 'z'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 3)
    result.forEach(function (comp) {
      const node = math.parse(comp)
      approxEqual(node.evaluate({ x: 5, y: 5, z: 5 }), 1)
    })
  })

  it('should throw when field does not have exactly 3 components', function () {
    assert.throws(
      () => math.curl(['x', 'y'], ['x', 'y']),
      /3 components/
    )
  })

  it('should throw when variables does not have exactly 3 components', function () {
    assert.throws(
      () => math.curl(['x', 'y', 'z'], ['x', 'y']),
      /3 components/
    )
  })

  it('should accept Node objects in field array', function () {
    const f1 = math.parse('y*z')
    const f2 = math.parse('x*z')
    const f3 = math.parse('x*y')
    const result = math.curl([f1, f2, f3], ['x', 'y', 'z'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 3)
    result.forEach(function (comp) {
      const node = math.parse(comp)
      approxEqual(node.evaluate({ x: 1, y: 1, z: 1 }), 0)
    })
  })
})
