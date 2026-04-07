// test svd
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createSvd } from '../../../../src/function/matrix/svd.js'
import { create } from '../../../../src/core/create.js'

// Create a math instance that includes our new svd factory
const math = create({ ...allFactories, createSvd })
const { svd } = math

/**
 * Helper: reconstruct A from U, S, V^T and check element-wise closeness.
 * A ≈ U * diag(S) * V^T
 */
function checkReconstruction (A, result, tol) {
  tol = tol || 1e-9
  const { U, S, V } = result
  const UArr = Array.isArray(U) ? U : U.toArray()
  const VArr = Array.isArray(V) ? V : V.toArray()

  const m = A.length
  const n = A[0].length
  const k = S.length

  // Reconstruct: R = U * diag(S) * V^T
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let r = 0; r < k; r++) {
        sum += UArr[i][r] * S[r] * VArr[j][r]
      }
      assert.ok(
        Math.abs(sum - A[i][j]) < tol,
        'Reconstruction error at [' + i + '][' + j + ']: got ' + sum + ', expected ' + A[i][j]
      )
    }
  }
}

describe('svd', function () {
  it('should decompose a 2x2 matrix and reconstruct it', function () {
    const A = [[3, 2], [2, 3]]
    const result = svd(A)
    assert.ok(Array.isArray(result.S), 'S should be an array')
    assert.strictEqual(result.S.length, 2)
    assert.ok(result.S[0] >= result.S[1], 'singular values should be in descending order')
    assert.ok(result.S[0] >= 0 && result.S[1] >= 0, 'singular values should be non-negative')
    checkReconstruction(A, result)
  })

  it('should decompose a 3x2 rectangular matrix', function () {
    const A = [[1, 2], [3, 4], [5, 6]]
    const result = svd(A)
    assert.strictEqual(result.S.length, 2)
    assert.ok(result.S[0] >= result.S[1])
    checkReconstruction(A, result)
  })

  it('should handle the 2x2 identity matrix', function () {
    const A = [[1, 0], [0, 1]]
    const result = svd(A)
    assert.strictEqual(result.S.length, 2)
    // All singular values of identity are 1
    assert.ok(Math.abs(result.S[0] - 1) < 1e-9, 'first singular value should be ~1')
    assert.ok(Math.abs(result.S[1] - 1) < 1e-9, 'second singular value should be ~1')
    checkReconstruction(A, result)
  })

  it('should handle a 3x3 identity matrix', function () {
    const A = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const result = svd(A)
    assert.strictEqual(result.S.length, 3)
    for (const s of result.S) {
      assert.ok(Math.abs(s - 1) < 1e-9, 'singular value should be ~1')
    }
    checkReconstruction(A, result)
  })

  it('should handle a rank-deficient matrix (one singular value near 0)', function () {
    // [[1, 2], [2, 4]] is rank 1
    const A = [[1, 2], [2, 4]]
    const result = svd(A)
    assert.strictEqual(result.S.length, 2)
    assert.ok(result.S[0] > 1e-9, 'largest singular value should be positive')
    assert.ok(result.S[1] < 1e-9, 'smallest singular value should be near zero')
    checkReconstruction(A, result)
  })

  it('should handle a symmetric 3x3 matrix', function () {
    const A = [[4, 1, 0], [1, 3, 1], [0, 1, 2]]
    const result = svd(A)
    assert.strictEqual(result.S.length, 3)
    assert.ok(result.S[0] >= result.S[1])
    assert.ok(result.S[1] >= result.S[2])
    checkReconstruction(A, result)
  })

  it('should return Matrix objects when input is a Matrix', function () {
    const A = math.matrix([[3, 2], [2, 3]])
    const result = svd(A)
    assert.ok(result.U && typeof result.U.toArray === 'function', 'U should be a Matrix')
    assert.ok(result.V && typeof result.V.toArray === 'function', 'V should be a Matrix')
    assert.ok(Array.isArray(result.S), 'S should be a plain Array')
  })

  it('should handle a 2x2 diagonal matrix', function () {
    const A = [[5, 0], [0, 3]]
    const result = svd(A)
    assert.strictEqual(result.S.length, 2)
    assert.ok(Math.abs(result.S[0] - 5) < 1e-9, 'largest singular value should be 5')
    assert.ok(Math.abs(result.S[1] - 3) < 1e-9, 'second singular value should be 3')
    checkReconstruction(A, result)
  })

  it('should throw for empty matrix', function () {
    assert.throws(() => svd([]), /Matrix must not be empty/)
    assert.throws(() => svd([[]]), /Matrix must not be empty/)
  })
})
