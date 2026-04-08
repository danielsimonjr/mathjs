import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPrime } from '../../../../src/function/combinatorics/prime.js'

const math = create({ ...all, createPrime })

describe('prime', function () {
  it('should return 2 for prime(1)', function () {
    assert.strictEqual(math.prime(1), 2)
  })

  it('should return 3 for prime(2)', function () {
    assert.strictEqual(math.prime(2), 3)
  })

  it('should return 5 for prime(3)', function () {
    assert.strictEqual(math.prime(3), 5)
  })

  it('should return 7 for prime(4)', function () {
    assert.strictEqual(math.prime(4), 7)
  })

  it('should return 11 for prime(5)', function () {
    assert.strictEqual(math.prime(5), 11)
  })

  it('should return 97 for prime(25)', function () {
    assert.strictEqual(math.prime(25), 97)
  })

  it('should return 541 for prime(100)', function () {
    assert.strictEqual(math.prime(100), 541)
  })

  it('should return 7919 for prime(1000)', function () {
    assert.strictEqual(math.prime(1000), 7919)
  })

  it('should throw for n = 0', function () {
    assert.throws(function () { math.prime(0) }, /Positive integer/)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.prime(-1) }, /Positive integer/)
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.prime(1.5) }, /Positive integer/)
  })
})
