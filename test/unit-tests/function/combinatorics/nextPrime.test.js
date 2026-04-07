import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createNextPrime } from '../../../../src/function/combinatorics/nextPrime.js'

const math = create({ ...all, createNextPrime })

describe('nextPrime', function () {
  it('should return 2 for nextPrime(0)', function () {
    assert.strictEqual(math.nextPrime(0), 2)
  })

  it('should return 2 for nextPrime(1)', function () {
    assert.strictEqual(math.nextPrime(1), 2)
  })

  it('should return 3 for nextPrime(2)', function () {
    assert.strictEqual(math.nextPrime(2), 3)
  })

  it('should return 5 for nextPrime(3)', function () {
    assert.strictEqual(math.nextPrime(3), 5)
  })

  it('should return 11 for nextPrime(10)', function () {
    assert.strictEqual(math.nextPrime(10), 11)
  })

  it('should return 101 for nextPrime(100)', function () {
    assert.strictEqual(math.nextPrime(100), 101)
  })

  it('should return 1009 for nextPrime(1000)', function () {
    assert.strictEqual(math.nextPrime(1000), 1009)
  })

  it('should return correct prime after a prime input', function () {
    assert.strictEqual(math.nextPrime(7), 11)
    assert.strictEqual(math.nextPrime(11), 13)
    assert.strictEqual(math.nextPrime(13), 17)
  })

  it('should handle non-integer input (floor behavior)', function () {
    assert.strictEqual(math.nextPrime(10.5), 11)
    assert.strictEqual(math.nextPrime(1.9), 2)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.nextPrime(-1) }, /Non-negative/)
  })
})
