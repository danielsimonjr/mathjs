import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'

describe('jacobian', function () {
  it('should compute Jacobian of [x*y, x+y] with respect to [x, y]', function () {
    // J = [[d(x*y)/dx, d(x*y)/dy], [d(x+y)/dx, d(x+y)/dy]]
    //   = [[y, x], [1, 1]]
    const result = math.jacobian(['x*y', 'x+y'], ['x', 'y'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].length, 2)
    assert.strictEqual(result[1].length, 2)

    const j00 = math.parse(result[0][0]) // d(x*y)/dx = y
    const j01 = math.parse(result[0][1]) // d(x*y)/dy = x
    const j10 = math.parse(result[1][0]) // d(x+y)/dx = 1
    const j11 = math.parse(result[1][1]) // d(x+y)/dy = 1

    approxEqual(j00.evaluate({ x: 2, y: 3 }), 3, 1e-10)
    approxEqual(j01.evaluate({ x: 2, y: 3 }), 2, 1e-10)
    approxEqual(j10.evaluate({ x: 2, y: 3 }), 1, 1e-10)
    approxEqual(j11.evaluate({ x: 2, y: 3 }), 1, 1e-10)
  })

  it('should compute Jacobian of [x^2, y^2] with respect to [x, y]', function () {
    // J = [[2x, 0], [0, 2y]]
    const result = math.jacobian(['x^2', 'y^2'], ['x', 'y'])
    assert.ok(Array.isArray(result))

    const j00 = math.parse(result[0][0])
    const j01 = math.parse(result[0][1])
    const j10 = math.parse(result[1][0])
    const j11 = math.parse(result[1][1])

    approxEqual(j00.evaluate({ x: 3, y: 4 }), 6, 1e-10)
    approxEqual(j01.evaluate({ x: 3, y: 4 }), 0, 1e-10)
    approxEqual(j10.evaluate({ x: 3, y: 4 }), 0, 1e-10)
    approxEqual(j11.evaluate({ x: 3, y: 4 }), 8, 1e-10)
  })

  it('should compute Jacobian of a single expression', function () {
    // J = [[2*x, 6*y^2]] (1x2 Jacobian = gradient row vector)
    const result = math.jacobian(['x^2 + 2*y^3'], ['x', 'y'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 2)

    const j00 = math.parse(result[0][0])
    const j01 = math.parse(result[0][1])
    approxEqual(j00.evaluate({ x: 2, y: 1 }), 4, 1e-10)
    approxEqual(j01.evaluate({ x: 2, y: 1 }), 6, 1e-10)
  })

  it('should return zeros for expressions independent of a variable', function () {
    // [x] with respect to [x, y]: J = [[1, 0]]
    const result = math.jacobian(['x'], ['x', 'y'])
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 2)
    const j00 = math.parse(result[0][0])
    const j01 = math.parse(result[0][1])
    approxEqual(j00.evaluate({ x: 5, y: 5 }), 1, 1e-10)
    approxEqual(j01.evaluate({ x: 5, y: 5 }), 0, 1e-10)
  })

  it('should compute Jacobian for 3 expressions and 3 variables', function () {
    // Identity-like: [x, y, z] w.r.t. [x, y, z] -> 3x3 identity
    const result = math.jacobian(['x', 'y', 'z'], ['x', 'y', 'z'])
    assert.strictEqual(result.length, 3)
    assert.strictEqual(result[0].length, 3)
    // Diagonal should be 1, off-diagonal 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const val = math.parse(result[i][j]).evaluate({ x: 1, y: 1, z: 1 })
        approxEqual(val, i === j ? 1 : 0, 1e-10)
      }
    }
  })

  it('should accept Node objects in exprs array', function () {
    const e1 = math.parse('x*y')
    const e2 = math.parse('x+y')
    const result = math.jacobian([e1, e2], ['x', 'y'])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 2)
    result.forEach(function (row) {
      row.forEach(function (comp) {
        assert.strictEqual(typeof comp, 'string')
      })
    })
  })
})
