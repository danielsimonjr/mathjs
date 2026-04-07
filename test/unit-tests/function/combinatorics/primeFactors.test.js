import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPrimeFactors } from '../../../../src/function/combinatorics/primeFactors.js'

const math = create({ ...all, createPrimeFactors })

describe('primeFactors', function () {
  it('should return [] for primeFactors(1)', function () {
    assert.deepStrictEqual(math.primeFactors(1), [])
  })

  it('should return [2] for primeFactors(2)', function () {
    assert.deepStrictEqual(math.primeFactors(2), [2])
  })

  it('should return [3] for primeFactors(3)', function () {
    assert.deepStrictEqual(math.primeFactors(3), [3])
  })

  it('should return [2, 2, 3] for primeFactors(12)', function () {
    assert.deepStrictEqual(math.primeFactors(12), [2, 2, 3])
  })

  it('should return [2, 2, 5, 5] for primeFactors(100)', function () {
    assert.deepStrictEqual(math.primeFactors(100), [2, 2, 5, 5])
  })

  it('should return [997] for primeFactors(997) (prime)', function () {
    assert.deepStrictEqual(math.primeFactors(997), [997])
  })

  it('should factorize primeFactors(360) correctly', function () {
    assert.deepStrictEqual(math.primeFactors(360), [2, 2, 2, 3, 3, 5])
  })

  it('should factorize primeFactors(8) = [2, 2, 2]', function () {
    assert.deepStrictEqual(math.primeFactors(8), [2, 2, 2])
  })

  it('should factorize primeFactors(30) = [2, 3, 5]', function () {
    assert.deepStrictEqual(math.primeFactors(30), [2, 3, 5])
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.primeFactors(1.5) }, /Positive integer/)
  })

  it('should throw for n = 0', function () {
    assert.throws(function () { math.primeFactors(0) }, /Positive integer/)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.primeFactors(-5) }, /Positive integer/)
  })
})
