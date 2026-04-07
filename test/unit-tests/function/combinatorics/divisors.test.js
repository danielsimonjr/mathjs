import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createDivisors } from '../../../../src/function/combinatorics/divisors.js'

const math = create({ ...all, createDivisors })

describe('divisors', function () {
  it('should return [1] for divisors(1)', function () {
    assert.deepStrictEqual(math.divisors(1), [1])
  })

  it('should return [1, 2] for divisors(2) (prime)', function () {
    assert.deepStrictEqual(math.divisors(2), [1, 2])
  })

  it('should return [1, 3] for divisors(3) (prime)', function () {
    assert.deepStrictEqual(math.divisors(3), [1, 3])
  })

  it('should return [1, 2, 3, 4, 6, 12] for divisors(12)', function () {
    assert.deepStrictEqual(math.divisors(12), [1, 2, 3, 4, 6, 12])
  })

  it('should return [1, 2, 4, 7, 14, 28] for divisors(28)', function () {
    assert.deepStrictEqual(math.divisors(28), [1, 2, 4, 7, 14, 28])
  })

  it('should return [1, prime] for a large prime', function () {
    assert.deepStrictEqual(math.divisors(997), [1, 997])
  })

  it('should return correct divisors for a perfect square (36)', function () {
    assert.deepStrictEqual(math.divisors(36), [1, 2, 3, 4, 6, 9, 12, 18, 36])
  })

  it('should return correct sorted divisors for divisors(100)', function () {
    assert.deepStrictEqual(math.divisors(100), [1, 2, 4, 5, 10, 20, 25, 50, 100])
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.divisors(1.5) }, /Positive integer/)
  })

  it('should throw for n = 0', function () {
    assert.throws(function () { math.divisors(0) }, /Positive integer/)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.divisors(-6) }, /Positive integer/)
  })
})
