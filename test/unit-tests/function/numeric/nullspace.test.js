import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('nullspace', function () {
  it('should return empty array for full-rank matrix', function () {
    const result = math.nullspace([[1, 0], [0, 1]])
    assert.strictEqual(result.length, 0)
  })

  it('should return one basis vector for rank-1 matrix', function () {
    const result = math.nullspace([[1, 2], [2, 4]])
    assert.strictEqual(result.length, 1)
    // Verify: A * v = 0
    const v = result[0]
    assert(Math.abs(v[0] + 2 * v[1]) < 1e-10)
    assert(Math.abs(2 * v[0] + 4 * v[1]) < 1e-10)
  })

  it('should return two basis vectors for rank-2 3x3 singular matrix', function () {
    const A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const result = math.nullspace(A)
    assert.strictEqual(result.length, 1)
    // Verify each basis vector satisfies A * v = 0
    for (const v of result) {
      for (let i = 0; i < 3; i++) {
        const dot = A[i].reduce((s, a, j) => s + a * v[j], 0)
        assert(Math.abs(dot) < 1e-8, 'A*v should be zero')
      }
    }
  })

  it('should return correct null space for zero matrix', function () {
    const result = math.nullspace([[0, 0], [0, 0]])
    assert.strictEqual(result.length, 2)
  })

  it('should return null space for overdetermined system', function () {
    // 3x2 matrix with rank 1
    const A = [[1, 2], [2, 4], [3, 6]]
    const result = math.nullspace(A)
    assert.strictEqual(result.length, 1)
    const v = result[0]
    for (let i = 0; i < 3; i++) {
      const dot = A[i].reduce((s, a, j) => s + a * v[j], 0)
      assert(Math.abs(dot) < 1e-10)
    }
  })
})
