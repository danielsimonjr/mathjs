import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPrimePi } from '../../../../src/function/combinatorics/primePi.js'

const math = create({ ...all, createPrimePi })

describe('primePi', function () {
  it('should return 0 for primePi(0)', function () {
    assert.strictEqual(math.primePi(0), 0)
  })

  it('should return 0 for primePi(1)', function () {
    assert.strictEqual(math.primePi(1), 0)
  })

  it('should return 1 for primePi(2)', function () {
    assert.strictEqual(math.primePi(2), 1)
  })

  it('should return 2 for primePi(3)', function () {
    assert.strictEqual(math.primePi(3), 2)
  })

  it('should return 4 for primePi(10)', function () {
    assert.strictEqual(math.primePi(10), 4)
  })

  it('should return 25 for primePi(100)', function () {
    assert.strictEqual(math.primePi(100), 25)
  })

  it('should return 168 for primePi(1000)', function () {
    assert.strictEqual(math.primePi(1000), 168)
  })

  it('should return 4 for primePi(7) (primes: 2,3,5,7)', function () {
    assert.strictEqual(math.primePi(7), 4)
  })

  it('should return 4 for primePi(8) (next prime is 11)', function () {
    assert.strictEqual(math.primePi(8), 4)
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.primePi(1.5) }, /Non-negative integer/)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.primePi(-1) }, /Non-negative integer/)
  })
})
