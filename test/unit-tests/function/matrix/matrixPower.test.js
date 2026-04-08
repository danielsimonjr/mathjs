// test matrixPower
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createMatrixPower } from '../../../../src/function/matrix/matrixPower.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...allFactories, createMatrixPower })
const { matrixPower } = math

const TOL = 1e-9

function approxEqual (a, b) {
  return Math.abs(a - b) < TOL
}

function checkMatrix (result, expected) {
  const R = Array.isArray(result) ? result : result.toArray()
  const n = expected.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      assert.ok(
        approxEqual(R[i][j], expected[i][j]),
        `result[${i}][${j}] = ${R[i][j]}, expected ${expected[i][j]}`
      )
    }
  }
}

describe('matrixPower', function () {
  it('should compute A^3 for upper triangular matrix [[1,1],[0,1]]', function () {
    const A = [[1, 1], [0, 1]]
    const result = matrixPower(A, 3)
    checkMatrix(result, [[1, 3], [0, 1]])
  })

  it('should return identity for n=0', function () {
    const A = [[2, 1], [0, 3]]
    const result = matrixPower(A, 0)
    checkMatrix(result, [[1, 0], [0, 1]])
  })

  it('should compute A^1 = A', function () {
    const A = [[3, 1], [2, 4]]
    const result = matrixPower(A, 1)
    checkMatrix(result, A)
  })

  it('should compute A^2 for diagonal matrix', function () {
    const A = [[2, 0], [0, 3]]
    const result = matrixPower(A, 2)
    checkMatrix(result, [[4, 0], [0, 9]])
  })

  it('should compute A^-1', function () {
    const A = [[4, 7], [2, 6]]
    const result = matrixPower(A, -1)
    const Rinv = Array.isArray(result) ? result : result.toArray()
    // Verify A * A^-1 = I
    const prod = math.multiply(A, result)
    const P = Array.isArray(prod) ? prod : prod.toArray()
    assert.ok(approxEqual(P[0][0], 1), `P[0][0] = ${P[0][0]}`)
    assert.ok(approxEqual(P[0][1], 0), `P[0][1] = ${P[0][1]}`)
    assert.ok(approxEqual(P[1][0], 0), `P[1][0] = ${P[1][0]}`)
    assert.ok(approxEqual(P[1][1], 1), `P[1][1] = ${P[1][1]}`)
  })

  it('should compute A^-2', function () {
    const A = [[2, 0], [0, 4]]
    const result = matrixPower(A, -2)
    const R = Array.isArray(result) ? result : result.toArray()
    assert.ok(approxEqual(R[0][0], 0.25), `R[0][0] = ${R[0][0]}`)
    assert.ok(approxEqual(R[1][1], 1 / 16), `R[1][1] = ${R[1][1]}`)
  })

  it('should compute A^5', function () {
    const A = [[1, 1], [0, 1]]
    const result = matrixPower(A, 5)
    checkMatrix(result, [[1, 5], [0, 1]])
  })

  it('should return Matrix when given Matrix input', function () {
    const A = math.matrix([[2, 0], [0, 3]])
    const result = matrixPower(A, 2)
    assert.ok(result && typeof result.toArray === 'function', 'result should be a Matrix')
    const R = result.toArray()
    assert.ok(approxEqual(R[0][0], 4))
    assert.ok(approxEqual(R[1][1], 9))
  })

  it('should throw for non-integer exponent', function () {
    assert.throws(function () {
      matrixPower([[1, 0], [0, 1]], 1.5)
    }, /integer/)
  })

  it('should throw for non-square matrix', function () {
    assert.throws(function () {
      matrixPower([[1, 2, 3], [4, 5, 6]], 2)
    }, /square/)
  })
})
