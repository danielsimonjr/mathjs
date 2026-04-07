// test matrixLog
import assert from 'assert'
import { approxDeepEqual } from '../../../../tools/approx.js'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createMatrixLog } from '../../../../src/function/matrix/matrixLog.js'
import { create } from '../../../../src/core/create.js'

// Create a math instance that includes our new matrixLog factory
const math = create({ ...allFactories, createMatrixLog })
const { matrixLog } = math

describe('matrixLog', function () {
  it('should return the zero matrix for the identity matrix', function () {
    const A = [[1, 0], [0, 1]]
    const result = matrixLog(A)
    approxDeepEqual(result, [[0, 0], [0, 0]], 1e-9)
  })

  it('should return [[1, 0], [0, 1]] for diag(e, e)', function () {
    const e = Math.E
    const A = [[e, 0], [0, e]]
    const result = matrixLog(A)
    approxDeepEqual(result, [[1, 0], [0, 1]], 1e-9)
  })

  it('should return [[1, 0], [0, 2]] for diag(e, e^2)', function () {
    const e = Math.E
    const A = [[e, 0], [0, e * e]]
    const result = matrixLog(A)
    approxDeepEqual(result, [[1, 0], [0, 2]], 1e-8)
  })

  it('should handle a 3x3 identity matrix', function () {
    const A = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const result = matrixLog(A)
    approxDeepEqual(result, [[0, 0, 0], [0, 0, 0], [0, 0, 0]], 1e-9)
  })

  it('should handle a 3x3 diagonal matrix', function () {
    const e = Math.E
    const A = [[e, 0, 0], [0, e * e, 0], [0, 0, e * e * e]]
    const result = matrixLog(A)
    approxDeepEqual(result, [[1, 0, 0], [0, 2, 0], [0, 0, 3]], 1e-8)
  })

  it('should return a Matrix when given a Matrix input', function () {
    const A = math.matrix([[1, 0], [0, 1]])
    const result = matrixLog(A)
    assert.ok(result && typeof result.toArray === 'function', 'result should be a Matrix')
    approxDeepEqual(result.toArray(), [[0, 0], [0, 0]], 1e-9)
  })

  it('should throw for a matrix with a non-positive eigenvalue', function () {
    // Diagonal matrix with negative entry
    const A = [[-1, 0], [0, 1]]
    assert.throws(() => matrixLog(A), /matrixLog/)
  })

  it('should throw for a non-square matrix', function () {
    const A = [[1, 2, 3], [4, 5, 6]]
    assert.throws(() => matrixLog(A), /square/)
  })

  it('should handle a symmetric positive-definite 2x2 matrix', function () {
    // A = [[5, 1], [1, 3]] — positive eigenvalues
    const A = [[5, 1], [1, 3]]
    const result = matrixLog(A)
    // Verify by checking dimensions and that result is finite
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].length, 2)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        assert.ok(isFinite(result[i][j]), 'matrixLog result should be finite')
      }
    }
  })
})
