import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const gradient = math.gradient

describe('gradient', function () {
  it('should compute gradient of x^2 + y^2 at [1, 1]', function () {
    const f = ([x, y]) => x * x + y * y
    const g = gradient(f, [1, 1])
    assert.strictEqual(g.length, 2)
    assert(Math.abs(g[0] - 2) < 1e-5)
    assert(Math.abs(g[1] - 2) < 1e-5)
  })

  it('should compute gradient of x^2 + y^2 at [3, 4]', function () {
    const f = ([x, y]) => x * x + y * y
    const g = gradient(f, [3, 4])
    assert(Math.abs(g[0] - 6) < 1e-5)
    assert(Math.abs(g[1] - 8) < 1e-5)
  })

  it('should compute gradient of a 3D function', function () {
    const f = ([x, y, z]) => x * x + 2 * y * y + 3 * z * z
    const g = gradient(f, [1, 1, 1])
    assert(Math.abs(g[0] - 2) < 1e-5)
    assert(Math.abs(g[1] - 4) < 1e-5)
    assert(Math.abs(g[2] - 6) < 1e-5)
  })

  it('should return zero gradient for a constant function', function () {
    const f = () => 5
    const g = gradient(f, [1, 2, 3])
    assert(Math.abs(g[0]) < 1e-5)
    assert(Math.abs(g[1]) < 1e-5)
    assert(Math.abs(g[2]) < 1e-5)
  })

  it('should accept a custom step size', function () {
    const f = ([x, y]) => x * x + y * y
    const g = gradient(f, [1, 1], 1e-5)
    assert(Math.abs(g[0] - 2) < 1e-4)
    assert(Math.abs(g[1] - 2) < 1e-4)
  })

  it('should compute gradient of x*y at [2, 3]', function () {
    const f = ([x, y]) => x * y
    const g = gradient(f, [2, 3])
    assert(Math.abs(g[0] - 3) < 1e-5)  // df/dx = y = 3
    assert(Math.abs(g[1] - 2) < 1e-5)  // df/dy = x = 2
  })

  it('should handle 1D functions', function () {
    const f = ([x]) => x * x * x
    const g = gradient(f, [2])
    assert(Math.abs(g[0] - 12) < 1e-4)  // d/dx x^3 = 3x^2 = 12 at x=2
  })
})
