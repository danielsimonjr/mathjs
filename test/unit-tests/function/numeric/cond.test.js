import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('cond', function () {
  it('should return 1 for the identity matrix (2-norm)', function () {
    const result = math.cond([[1, 0], [0, 1]])
    assert(Math.abs(result - 1) < 1e-6)
  })

  it('should return 1 for the identity matrix (1-norm)', function () {
    const result = math.cond([[1, 0], [0, 1]], 1)
    assert(Math.abs(result - 1) < 1e-10)
  })

  it('should return 1 for the identity matrix (Inf-norm)', function () {
    const result = math.cond([[1, 0], [0, 1]], Infinity)
    assert(Math.abs(result - 1) < 1e-10)
  })

  it('should return a large condition number for a nearly singular matrix', function () {
    const A = [[1, 2], [1, 2 + 1e-10]]
    const result = math.cond(A)
    assert(result > 1e8)
  })

  it('should return a reasonable condition number for a well-conditioned matrix', function () {
    const A = [[2, 1], [1, 3]]
    const result = math.cond(A)
    assert(result > 1 && result < 100)
  })

  it('should use default p=2 when no p is given', function () {
    const A = [[4, 0], [0, 2]]
    const result = math.cond(A)
    assert(Math.abs(result - 2) < 1e-6)
  })

  it('should throw for invalid p', function () {
    assert.throws(function () { math.cond([[1, 0], [0, 1]], 3) }, /p must be/)
  })
})
