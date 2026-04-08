// test polarDecomposition
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createPolarDecomposition } from '../../../../src/function/matrix/polarDecomposition.js'
import { createSvd } from '../../../../src/function/matrix/svd.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...allFactories, createSvd, createPolarDecomposition })
const { polarDecomposition } = math

const TOL = 1e-8

function approxEqual (a, b) {
  return Math.abs(a - b) < TOL
}

function checkOrthogonal (U) {
  const UArr = Array.isArray(U) ? U : U.toArray()
  const n = UArr.length
  // U * U^T should be identity
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0
      for (let k = 0; k < n; k++) {
        dot += UArr[i][k] * UArr[j][k]
      }
      const expected = i === j ? 1 : 0
      assert.ok(
        approxEqual(dot, expected),
        `(U*U^T)[${i}][${j}] = ${dot}, expected ${expected}`
      )
    }
  }
}

function checkSymmetric (P) {
  const PArr = Array.isArray(P) ? P : P.toArray()
  const n = PArr.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      assert.ok(
        approxEqual(PArr[i][j], PArr[j][i]),
        `P[${i}][${j}] = ${PArr[i][j]}, P[${j}][${i}] = ${PArr[j][i]}, not symmetric`
      )
    }
  }
}

function checkReconstruction (A, U, P) {
  const n = A.length
  const UArr = Array.isArray(U) ? U : U.toArray()
  const PArr = Array.isArray(P) ? P : P.toArray()

  // A ≈ U * P
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let val = 0
      for (let k = 0; k < n; k++) {
        val += UArr[i][k] * PArr[k][j]
      }
      assert.ok(
        approxEqual(val, A[i][j]),
        `(U*P)[${i}][${j}] = ${val}, expected ${A[i][j]}`
      )
    }
  }
}

describe('polarDecomposition', function () {
  it('should decompose a 2x2 matrix into U and P', function () {
    const A = [[3, 2], [1, 4]]
    const { U, P } = polarDecomposition(A)
    assert.ok(U !== undefined, 'result should have U')
    assert.ok(P !== undefined, 'result should have P')
  })

  it('should produce an orthogonal U', function () {
    const A = [[3, 2], [1, 4]]
    const { U } = polarDecomposition(A)
    checkOrthogonal(U)
  })

  it('should produce a symmetric P', function () {
    const A = [[3, 2], [1, 4]]
    const { P } = polarDecomposition(A)
    checkSymmetric(P)
  })

  it('should satisfy A = U * P', function () {
    const A = [[3, 2], [1, 4]]
    const { U, P } = polarDecomposition(A)
    checkReconstruction(A, U, P)
  })

  it('should decompose the identity correctly: U = I, P = I', function () {
    const A = [[1, 0], [0, 1]]
    const { U, P } = polarDecomposition(A)
    checkOrthogonal(U)
    checkSymmetric(P)
    checkReconstruction(A, U, P)
  })

  it('should decompose a 3x3 matrix', function () {
    const A = [[4, 1, 2], [3, 4, 1], [2, 1, 4]]
    const { U, P } = polarDecomposition(A)
    checkOrthogonal(U)
    checkSymmetric(P)
    checkReconstruction(A, U, P)
  })

  it('should return Matrix objects when given Matrix input', function () {
    const A = math.matrix([[3, 2], [1, 4]])
    const { U, P } = polarDecomposition(A)
    assert.ok(U && typeof U.toArray === 'function', 'U should be a Matrix')
    assert.ok(P && typeof P.toArray === 'function', 'P should be a Matrix')
  })

  it('should throw for non-square matrix', function () {
    assert.throws(function () {
      polarDecomposition([[1, 2, 3], [4, 5, 6]])
    }, /square/)
  })

  it('should correctly decompose a diagonal matrix', function () {
    const A = [[3, 0], [0, 5]]
    const { U, P } = polarDecomposition(A)
    checkOrthogonal(U)
    checkSymmetric(P)
    checkReconstruction(A, U, P)
  })
})
