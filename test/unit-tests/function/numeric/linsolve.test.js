import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('linsolve', function () {
  it('should solve a simple 2x2 system', function () {
    const A = [[2, 1], [1, 3]]
    const b = [5, 10]
    const x = math.linsolve(A, b)
    // Verify Ax = b
    assert(Math.abs(2 * x[0] + x[1] - 5) < 1e-10)
    assert(Math.abs(x[0] + 3 * x[1] - 10) < 1e-10)
  })

  it('should solve identity system', function () {
    const x = math.linsolve([[1, 0], [0, 1]], [4, 7])
    assert(Math.abs(x[0] - 4) < 1e-10)
    assert(Math.abs(x[1] - 7) < 1e-10)
  })

  it('should solve a 3x3 system', function () {
    const A = [[1, 1, 1], [0, 2, 5], [2, 5, -1]]
    const b = [6, -4, 27]
    const x = math.linsolve(A, b)
    // Expected: x = [5, 3, -2]
    assert(Math.abs(x[0] - 5) < 1e-10)
    assert(Math.abs(x[1] - 3) < 1e-10)
    assert(Math.abs(x[2] + 2) < 1e-10)
  })

  it('should handle negative values', function () {
    const A = [[-2, 1], [1, -3]]
    const b = [-1, -2]
    const x = math.linsolve(A, b)
    assert(Math.abs(-2 * x[0] + x[1] - (-1)) < 1e-10)
    assert(Math.abs(x[0] - 3 * x[1] - (-2)) < 1e-10)
  })

  it('should throw for singular matrix', function () {
    assert.throws(function () {
      math.linsolve([[1, 2], [2, 4]], [1, 2])
    }, /singular/)
  })

  it('should throw for incompatible dimensions', function () {
    assert.throws(function () {
      math.linsolve([[1, 2], [3, 4]], [1, 2, 3])
    }, /dimensions/)
  })
})
