import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createRowReduce } from '../../../../src/function/matrix/rowReduce.js'
import { approxEqual } from '../../../../tools/approx.js'

const math = create({ ...all, createRowReduce })

describe('rowReduce', function () {
  it('should compute RREF of [[1,2,3],[4,5,6]]', function () {
    const result = math.rowReduce([[1, 2, 3], [4, 5, 6]])
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].length, 3)
    // Expected RREF: [[1, 0, -1], [0, 1, 2]]
    approxEqual(result[0][0], 1, 1e-10)
    approxEqual(result[0][1], 0, 1e-10)
    approxEqual(result[0][2], -1, 1e-10)
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 1, 1e-10)
    approxEqual(result[1][2], 2, 1e-10)
  })

  it('should compute RREF of identity matrix', function () {
    const result = math.rowReduce([[1, 0], [0, 1]])
    approxEqual(result[0][0], 1, 1e-10)
    approxEqual(result[0][1], 0, 1e-10)
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 1, 1e-10)
  })

  it('should handle rank-deficient matrix [[2,4],[1,2]]', function () {
    const result = math.rowReduce([[2, 4], [1, 2]])
    // Expected RREF: [[1, 2], [0, 0]]
    approxEqual(result[0][0], 1, 1e-10)
    approxEqual(result[0][1], 2, 1e-10)
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 0, 1e-10)
  })

  it('should handle a 3x3 matrix', function () {
    const A = [
      [1, 2, 1],
      [0, 3, 3],
      [1, 5, 4]
    ]
    const result = math.rowReduce(A)
    assert.ok(Array.isArray(result))
    assert.strictEqual(result.length, 3)
    // First two pivots should be in columns 0 and 1
    approxEqual(result[0][0], 1, 1e-10)
    approxEqual(result[0][1], 0, 1e-10)
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 1, 1e-10)
  })

  it('should handle augmented matrix for system Ax=b', function () {
    // [1 2 | 5]
    // [3 4 | 11]
    // Solution: x=1, y=2
    const result = math.rowReduce([[1, 2, 5], [3, 4, 11]])
    approxEqual(result[0][0], 1, 1e-10)
    approxEqual(result[0][1], 0, 1e-10)
    approxEqual(result[0][2], 1, 1e-10) // x = 1
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 1, 1e-10)
    approxEqual(result[1][2], 2, 1e-10) // y = 2
  })

  it('should handle a zero matrix', function () {
    const result = math.rowReduce([[0, 0], [0, 0]])
    approxEqual(result[0][0], 0, 1e-10)
    approxEqual(result[0][1], 0, 1e-10)
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 0, 1e-10)
  })

  it('should throw for invalid input', function () {
    assert.throws(function () {
      math.rowReduce([1, 2, 3])
    }, /2D array/)
  })

  it('should handle Matrix input', function () {
    const M = math.matrix([[1, 2], [3, 4]])
    const result = math.rowReduce(M)
    assert.ok(Array.isArray(result), 'should return an array')
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].length, 2)
    // RREF of [[1,2],[3,4]] is [[1,0],[0,1]]
    approxEqual(result[0][0], 1, 1e-10)
    approxEqual(result[0][1], 0, 1e-10)
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 1, 1e-10)
  })

  it('should handle tall matrix (more rows than columns)', function () {
    // 3x2 matrix: [[1,2],[3,6],[2,4]] — rank 1
    const result = math.rowReduce([[1, 2], [3, 6], [2, 4]])
    assert.ok(Array.isArray(result), 'should return an array')
    assert.strictEqual(result.length, 3)
    assert.strictEqual(result[0].length, 2)
    // First row should be [1, 2], others should be [0, 0]
    approxEqual(result[0][0], 1, 1e-10)
    approxEqual(result[0][1], 2, 1e-10)
    approxEqual(result[1][0], 0, 1e-10)
    approxEqual(result[1][1], 0, 1e-10)
    approxEqual(result[2][0], 0, 1e-10)
    approxEqual(result[2][1], 0, 1e-10)
  })

  it('should throw for non-numeric entries', function () {
    assert.throws(function () {
      math.rowReduce([['a', 'b'], ['c', 'd']])
    }, /non-numeric|number|rowReduce/)
  })
})
