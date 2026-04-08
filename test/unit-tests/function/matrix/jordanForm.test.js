// test jordanForm
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createJordanForm } from '../../../../src/function/matrix/jordanForm.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...allFactories, createJordanForm })
const { jordanForm } = math

const TOL = 1e-8

function approxEqual (a, b) {
  return Math.abs(a - b) < TOL
}

describe('jordanForm', function () {
  it('should return a diagonal J for a diagonal matrix', function () {
    const A = [[2, 0], [0, 3]]
    const { J } = jordanForm(A)
    const JArr = Array.isArray(J) ? J : J.toArray()
    assert.ok(approxEqual(JArr[0][0], 2), `J[0][0] should be 2, got ${JArr[0][0]}`)
    assert.ok(approxEqual(JArr[1][1], 3), `J[1][1] should be 3, got ${JArr[1][1]}`)
    assert.ok(approxEqual(JArr[0][1], 0), `J[0][1] should be 0`)
    assert.ok(approxEqual(JArr[1][0], 0), `J[1][0] should be 0`)
  })

  it('should produce a Jordan block with 1 on superdiagonal for repeated eigenvalue', function () {
    const A = [[2, 1], [0, 2]]
    const { J } = jordanForm(A)
    const JArr = Array.isArray(J) ? J : J.toArray()
    assert.ok(approxEqual(JArr[0][0], 2), `J[0][0] should be 2, got ${JArr[0][0]}`)
    assert.ok(approxEqual(JArr[1][1], 2), `J[1][1] should be 2, got ${JArr[1][1]}`)
    assert.ok(approxEqual(JArr[0][1], 1), `J[0][1] should be 1 (Jordan block), got ${JArr[0][1]}`)
  })

  it('should return both J and P', function () {
    const A = [[2, 0], [0, 3]]
    const result = jordanForm(A)
    assert.ok(result.J !== undefined, 'result should have J')
    assert.ok(result.P !== undefined, 'result should have P')
  })

  it('should return Matrix objects when given Matrix input', function () {
    const A = math.matrix([[2, 0], [0, 3]])
    const { J, P } = jordanForm(A)
    assert.ok(J && typeof J.toArray === 'function', 'J should be a Matrix')
    assert.ok(P && typeof P.toArray === 'function', 'P should be a Matrix')
  })

  it('should throw for a non-square matrix', function () {
    assert.throws(function () {
      jordanForm([[1, 2, 3], [4, 5, 6]])
    }, /square/)
  })

  it('should handle a 3x3 diagonal matrix', function () {
    const A = [[1, 0, 0], [0, 2, 0], [0, 0, 4]]
    const { J } = jordanForm(A)
    const JArr = Array.isArray(J) ? J : J.toArray()
    // Eigenvalues may be in different order, just check diagonal contains {1, 2, 4}
    const diag = [JArr[0][0], JArr[1][1], JArr[2][2]].map(v =>
      Math.round(v * 1e6) / 1e6
    ).sort((a, b) => a - b)
    assert.deepStrictEqual(diag, [1, 2, 4])
  })
})
