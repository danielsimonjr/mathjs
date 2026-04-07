// test matrixRank
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createSvd } from '../../../../src/function/matrix/svd.js'
import { createMatrixRank } from '../../../../src/function/matrix/matrixRank.js'
import { create } from '../../../../src/core/create.js'

// Create a math instance that includes our new svd and matrixRank factories
const math = create({ ...allFactories, createSvd, createMatrixRank })
const { matrixRank } = math

describe('matrixRank', function () {
  it('should return 2 for a full-rank 2x2 matrix', function () {
    assert.strictEqual(matrixRank([[1, 2], [3, 4]]), 2)
  })

  it('should return 2 for a 2x2 identity matrix', function () {
    assert.strictEqual(matrixRank([[1, 0], [0, 1]]), 2)
  })

  it('should return 1 for a rank-1 matrix', function () {
    // [[1, 2, 3], [2, 4, 6]] — second row is 2× first row
    assert.strictEqual(matrixRank([[1, 2, 3], [2, 4, 6]]), 1)
  })

  it('should return 0 for a zero matrix', function () {
    assert.strictEqual(matrixRank([[0, 0], [0, 0]]), 0)
  })

  it('should return full rank for a 3x3 identity matrix', function () {
    assert.strictEqual(matrixRank([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 3)
  })

  it('should return 2 for a 3x3 rank-2 matrix', function () {
    // Row 3 = row1 + row2
    const A = [[1, 2, 3], [4, 5, 6], [5, 7, 9]]
    assert.strictEqual(matrixRank(A), 2)
  })

  it('should respect a custom tolerance', function () {
    // Slightly imperfect rank-1 matrix
    const A = [[1, 2], [2, 4]]
    // With default tol, rank should be 1
    assert.strictEqual(matrixRank(A), 1)
    // With very large tol, rank could be 0
    assert.strictEqual(matrixRank(A, 1e10), 0)
  })

  it('should return 0 for empty input', function () {
    assert.strictEqual(matrixRank([[]]), 0)
  })

  it('should work with Matrix input', function () {
    const A = math.matrix([[1, 2], [3, 4]])
    assert.strictEqual(matrixRank(A), 2)
  })

  it('should return 1 for a rank-1 column matrix', function () {
    const A = [[1, 2], [2, 4], [3, 6]]
    assert.strictEqual(matrixRank(A), 1)
  })

  it('should throw for non-2D input', function () {
    assert.throws(() => matrixRank([1, 2, 3]), /matrixRank/)
  })
})
