import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createDivisorSigma } from '../../../../src/function/combinatorics/divisorSigma.js'

const math = create({ ...all, createDivisorSigma })

describe('divisorSigma', function () {
  it('should return 1 for divisorSigma(0, 1)', function () {
    assert.strictEqual(math.divisorSigma(0, 1), 1)
  })

  it('should return 1 for divisorSigma(1, 1)', function () {
    assert.strictEqual(math.divisorSigma(1, 1), 1)
  })

  it('should return 6 for divisorSigma(0, 12)', function () {
    assert.strictEqual(math.divisorSigma(0, 12), 6)
  })

  it('should return 28 for divisorSigma(1, 12) (sum of divisors)', function () {
    assert.strictEqual(math.divisorSigma(1, 12), 28)
  })

  it('should return 12 for divisorSigma(1, 6) (perfect number)', function () {
    assert.strictEqual(math.divisorSigma(1, 6), 12)
  })

  it('should return 50 for divisorSigma(2, 6)', function () {
    assert.strictEqual(math.divisorSigma(2, 6), 50)
  })

  it('should return 2 for divisorSigma(0, p) for prime p=7', function () {
    assert.strictEqual(math.divisorSigma(0, 7), 2)
  })

  it('should return p+1 for divisorSigma(1, p) for prime p=7', function () {
    assert.strictEqual(math.divisorSigma(1, 7), 8)
  })

  it('should return 1+4=5 for divisorSigma(1, 4)', function () {
    assert.strictEqual(math.divisorSigma(1, 4), 7) // 1+2+4=7
  })

  it('should return sum of divisors for divisorSigma(1, 28)', function () {
    assert.strictEqual(math.divisorSigma(1, 28), 56) // perfect number
  })

  it('should throw for negative k', function () {
    assert.throws(function () { math.divisorSigma(-1, 6) }, /Non-negative integer/)
  })

  it('should throw for non-integer k', function () {
    assert.throws(function () { math.divisorSigma(1.5, 6) }, /Non-negative integer/)
  })

  it('should throw for n = 0', function () {
    assert.throws(function () { math.divisorSigma(1, 0) }, /Positive integer/)
  })

  it('should throw for negative n', function () {
    assert.throws(function () { math.divisorSigma(1, -1) }, /Positive integer/)
  })
})
