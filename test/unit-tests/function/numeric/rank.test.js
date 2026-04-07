import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('rank', function () {
  it('should return 2 for full-rank 2x2 identity', function () {
    assert.strictEqual(math.rank([[1, 0], [0, 1]]), 2)
  })

  it('should return 1 for rank-1 matrix', function () {
    assert.strictEqual(math.rank([[1, 2], [2, 4]]), 1)
  })

  it('should return 0 for zero matrix', function () {
    assert.strictEqual(math.rank([[0, 0], [0, 0]]), 0)
  })

  it('should return 2 for rank-2 matrix out of 3 rows', function () {
    assert.strictEqual(math.rank([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 2)
  })

  it('should return 3 for full-rank 3x3 matrix', function () {
    assert.strictEqual(math.rank([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 3)
  })

  it('should work with non-square matrices', function () {
    // 2x3 full row rank
    assert.strictEqual(math.rank([[1, 0, 0], [0, 1, 0]]), 2)
  })

  it('should accept a custom tolerance', function () {
    // Nearly singular: rank 1 with tight tolerance
    const A = [[1, 2], [1 + 1e-8, 2 + 2e-8]]
    assert.strictEqual(math.rank(A, 1e-6), 1)
  })
})
