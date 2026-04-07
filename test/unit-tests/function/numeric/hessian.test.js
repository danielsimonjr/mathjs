import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const hessian = math.hessian

describe('hessian', function () {
  it('should compute Hessian of x^2 + y^2 at [0, 0]', function () {
    const f = ([x, y]) => x * x + y * y
    const H = hessian(f, [0, 0])
    assert.strictEqual(H.length, 2)
    assert.strictEqual(H[0].length, 2)
    assert(Math.abs(H[0][0] - 2) < 1e-3)
    assert(Math.abs(H[0][1]) < 1e-3)
    assert(Math.abs(H[1][0]) < 1e-3)
    assert(Math.abs(H[1][1] - 2) < 1e-3)
  })

  it('should compute Hessian of x*y (mixed partials)', function () {
    const f = ([x, y]) => x * y
    const H = hessian(f, [1, 1])
    assert(Math.abs(H[0][0]) < 1e-3)       // d²/dx² = 0
    assert(Math.abs(H[0][1] - 1) < 1e-3)   // d²/dxdy = 1
    assert(Math.abs(H[1][0] - 1) < 1e-3)   // d²/dydx = 1
    assert(Math.abs(H[1][1]) < 1e-3)       // d²/dy² = 0
  })

  it('should produce a symmetric matrix', function () {
    const f = ([x, y, z]) => x * x * y + y * z * z
    const H = hessian(f, [1, 2, 3])
    assert.strictEqual(H.length, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        assert(Math.abs(H[i][j] - H[j][i]) < 1e-6)
      }
    }
  })

  it('should compute Hessian of x^2 + 3*y^2', function () {
    const f = ([x, y]) => x * x + 3 * y * y
    const H = hessian(f, [2, 2])
    assert(Math.abs(H[0][0] - 2) < 1e-3)
    assert(Math.abs(H[1][1] - 6) < 1e-3)
    assert(Math.abs(H[0][1]) < 1e-3)
  })

  it('should accept a custom step size', function () {
    const f = ([x, y]) => x * x + y * y
    const H = hessian(f, [0, 0], 1e-3)
    assert(Math.abs(H[0][0] - 2) < 1e-2)
    assert(Math.abs(H[1][1] - 2) < 1e-2)
  })

  it('should handle 1D functions', function () {
    const f = ([x]) => x * x * x * x  // d²/dx² = 12x^2
    const H = hessian(f, [2])
    assert.strictEqual(H.length, 1)
    assert(Math.abs(H[0][0] - 48) < 1e-1)  // 12 * 4 = 48
  })
})
