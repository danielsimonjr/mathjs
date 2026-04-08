// test hessenbergForm
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createHessenbergForm } from '../../../../src/function/matrix/hessenbergForm.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...allFactories, createHessenbergForm })
const { hessenbergForm } = math

const TOL = 1e-9

function approxEqual (a, b) {
  return Math.abs(a - b) < TOL
}

function checkUpperHessenberg (H) {
  const HArr = Array.isArray(H) ? H : H.toArray()
  const n = HArr.length
  for (let i = 2; i < n; i++) {
    for (let j = 0; j < i - 1; j++) {
      assert.ok(
        approxEqual(HArr[i][j], 0),
        `H[${i}][${j}] = ${HArr[i][j]}, expected 0 (upper Hessenberg)`
      )
    }
  }
}

function checkOrthogonal (Q) {
  const QArr = Array.isArray(Q) ? Q : Q.toArray()
  const n = QArr.length
  // Q * Q^T should be identity
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let dot = 0
      for (let k = 0; k < n; k++) {
        dot += QArr[i][k] * QArr[j][k]
      }
      const expected = i === j ? 1 : 0
      assert.ok(
        approxEqual(dot, expected),
        `(Q*Q^T)[${i}][${j}] = ${dot}, expected ${expected}`
      )
    }
  }
}

function checkReconstructionAQHQt (A, H, Q) {
  const n = A.length
  const HArr = Array.isArray(H) ? H : H.toArray()
  const QArr = Array.isArray(Q) ? Q : Q.toArray()

  // Compute Q * H
  const QH = []
  for (let i = 0; i < n; i++) {
    QH.push(new Array(n).fill(0))
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        QH[i][j] += QArr[i][k] * HArr[k][j]
      }
    }
  }

  // Compute (Q * H) * Q^T
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let val = 0
      for (let k = 0; k < n; k++) {
        val += QH[i][k] * QArr[j][k]
      }
      assert.ok(
        approxEqual(val, A[i][j]),
        `(Q*H*Q^T)[${i}][${j}] = ${val}, expected ${A[i][j]}`
      )
    }
  }
}

describe('hessenbergForm', function () {
  it('should reduce a 3x3 symmetric matrix to Hessenberg form', function () {
    const A = [[4, 1, 2], [3, 4, 1], [2, 1, 4]]
    const { H, Q } = hessenbergForm(A)
    checkUpperHessenberg(H)
    checkOrthogonal(Q)
    checkReconstructionAQHQt(A, H, Q)
  })

  it('should keep a 2x2 matrix already in Hessenberg form unchanged (no reflections needed)', function () {
    const A = [[3, 2], [1, 4]]
    const { H, Q } = hessenbergForm(A)
    // 2x2 is always Hessenberg — no reduction needed
    checkUpperHessenberg(H)
  })

  it('should handle a 4x4 matrix', function () {
    const A = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ]
    const { H, Q } = hessenbergForm(A)
    checkUpperHessenberg(H)
    checkOrthogonal(Q)
  })

  it('should return the same matrix (already Hessenberg) for upper triangular', function () {
    const A = [[2, 3, 4], [0, 5, 6], [0, 0, 7]]
    const { H } = hessenbergForm(A)
    checkUpperHessenberg(H)
  })

  it('should return Matrix objects when given Matrix input', function () {
    const A = math.matrix([[4, 1, 2], [3, 4, 1], [2, 1, 4]])
    const { H, Q } = hessenbergForm(A)
    assert.ok(H && typeof H.toArray === 'function', 'H should be a Matrix')
    assert.ok(Q && typeof Q.toArray === 'function', 'Q should be a Matrix')
  })

  it('should throw for non-square matrix', function () {
    assert.throws(function () {
      hessenbergForm([[1, 2, 3], [4, 5, 6]])
    }, /square/)
  })

  it('should satisfy A = Q * H * Q^T for a random-like 3x3', function () {
    const A = [[5, 4, 2], [4, 5, 3], [2, 3, 5]]
    const { H, Q } = hessenbergForm(A)
    checkUpperHessenberg(H)
    checkOrthogonal(Q)
    checkReconstructionAQHQt(A, H, Q)
  })
})
