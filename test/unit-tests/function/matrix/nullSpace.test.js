// test nullSpace
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createSvd } from '../../../../src/function/matrix/svd.js'
import { createNullSpace } from '../../../../src/function/matrix/nullSpace.js'
import { create } from '../../../../src/core/create.js'

// Create a math instance that includes our new svd and nullSpace factories
const math = create({ ...allFactories, createSvd, createNullSpace })
const { nullSpace } = math

/**
 * Check that A * v ≈ 0 for each basis vector v.
 */
function checkNullVectors (A, basis, tol) {
  tol = tol || 1e-8
  const m = A.length
  const n = A[0].length
  for (const v of basis) {
    const vArr = Array.isArray(v) ? v : v.toArray()
    assert.strictEqual(vArr.length, n, 'null space vector should have length n=' + n)
    // Compute A * v
    for (let i = 0; i < m; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) {
        sum += A[i][j] * vArr[j]
      }
      assert.ok(
        Math.abs(sum) < tol,
        'A*v[' + i + '] should be ~0, got ' + sum
      )
    }
  }
}

describe('nullSpace', function () {
  it('should return empty array for a full-rank square matrix', function () {
    const A = [[1, 2], [3, 4]]
    const basis = nullSpace(A)
    assert.strictEqual(basis.length, 0)
  })

  it('should return 1-dimensional null space for a rank-1 2x2 matrix', function () {
    // [[1, 2], [2, 4]] has rank 1, null space dim = 1
    const A = [[1, 2], [2, 4]]
    const basis = nullSpace(A)
    assert.strictEqual(basis.length, 1)
    checkNullVectors(A, basis)
  })

  it('should return a 2-dimensional null space for a rank-1 row', function () {
    // 1x3 matrix [1, 2, 3] has rank 1, null space dim = 2
    const A = [[1, 2, 3]]
    const basis = nullSpace(A)
    assert.strictEqual(basis.length, 2)
    checkNullVectors(A, basis)
  })

  it('should return empty for a 3x3 identity matrix (no null space)', function () {
    const A = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const basis = nullSpace(A)
    assert.strictEqual(basis.length, 0)
  })

  it('should return 1-dimensional null space for a 3x3 rank-2 matrix', function () {
    // Third row = first + second
    const A = [[1, 2, 3], [4, 5, 6], [5, 7, 9]]
    const basis = nullSpace(A)
    // rank = 2, null space dim = 3 - 2 = 1
    assert.strictEqual(basis.length, 1)
    checkNullVectors(A, basis)
  })

  it('should work with Matrix input', function () {
    const A = math.matrix([[1, 2], [2, 4]])
    const basis = nullSpace(A)
    assert.strictEqual(basis.length, 1)
  })

  it('should return empty array for 0-column matrix', function () {
    // Edge case: empty-column matrix
    const basis = nullSpace([[]])
    assert.strictEqual(basis.length, 0)
  })

  it('null space vectors should be near-unit vectors (orthonormal)', function () {
    const A = [[1, 2, 3], [4, 5, 6]]
    const basis = nullSpace(A)
    for (const v of basis) {
      const vArr = Array.isArray(v) ? v : v.toArray()
      const norm = Math.sqrt(vArr.reduce((s, x) => s + x * x, 0))
      assert.ok(Math.abs(norm - 1) < 1e-8, 'null space vector should be unit, norm=' + norm)
    }
  })
})
