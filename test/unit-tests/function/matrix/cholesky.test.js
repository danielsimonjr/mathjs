// test cholesky
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createCholesky } from '../../../../src/function/matrix/cholesky.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...allFactories, createCholesky })
const { cholesky } = math

const TOL = 1e-9

function approxEqual (a, b, tol) {
  return Math.abs(a - b) < (tol || TOL)
}

function checkLLT (A, L) {
  // Verify L * L^T = A
  const n = A.length
  const LArr = Array.isArray(L) ? L : L.toArray()
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += LArr[i][k] * LArr[j][k]
      }
      assert.ok(
        approxEqual(sum, A[i][j]),
        `L*L^T[${i}][${j}] = ${sum}, expected ${A[i][j]}`
      )
    }
  }
}

function checkLowerTriangular (L) {
  const LArr = Array.isArray(L) ? L : L.toArray()
  const n = LArr.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      assert.ok(
        approxEqual(LArr[i][j], 0),
        `L[${i}][${j}] = ${LArr[i][j]}, expected 0 (lower triangular)`
      )
    }
  }
}

describe('cholesky', function () {
  it('should decompose a 2x2 positive definite matrix', function () {
    const A = [[4, 2], [2, 3]]
    const L = cholesky(A)
    checkLowerTriangular(L)
    checkLLT(A, L)
  })

  it('should decompose a 3x3 positive definite matrix', function () {
    const A = [[9, 3, 1], [3, 5, 2], [1, 2, 6]]
    const L = cholesky(A)
    checkLowerTriangular(L)
    checkLLT(A, L)
  })

  it('should decompose the identity matrix', function () {
    const A = [[1, 0], [0, 1]]
    const L = cholesky(A)
    const LArr = Array.isArray(L) ? L : L.toArray()
    assert.ok(approxEqual(LArr[0][0], 1))
    assert.ok(approxEqual(LArr[1][1], 1))
    assert.ok(approxEqual(LArr[1][0], 0))
    checkLLT(A, L)
  })

  it('should return a Matrix when given a Matrix input', function () {
    const A = math.matrix([[4, 2], [2, 3]])
    const L = cholesky(A)
    assert.ok(L && typeof L.toArray === 'function', 'result should be a Matrix')
    checkLLT([[4, 2], [2, 3]], L)
  })

  it('should throw for a non-positive definite matrix', function () {
    assert.throws(function () {
      cholesky([[1, 2], [2, 1]]) // det = 1 - 4 = -3, not positive definite
    }, /not positive definite/)
  })

  it('should throw for a non-square matrix', function () {
    assert.throws(function () {
      cholesky([[1, 2, 3], [4, 5, 6]])
    }, /square/)
  })

  it('should correctly compute L[0][0] = sqrt(A[0][0])', function () {
    const A = [[4, 2], [2, 3]]
    const L = cholesky(A)
    const LArr = Array.isArray(L) ? L : L.toArray()
    assert.ok(approxEqual(LArr[0][0], 2), `L[0][0] should be 2, got ${LArr[0][0]}`)
  })

  it('should decompose a 4x4 positive definite matrix', function () {
    // A = M * M^T ensures positive definiteness
    const A = [
      [4, 2, 0, 0],
      [2, 5, 1, 0],
      [0, 1, 6, 2],
      [0, 0, 2, 7]
    ]
    const L = cholesky(A)
    checkLowerTriangular(L)
    checkLLT(A, L)
  })
})
