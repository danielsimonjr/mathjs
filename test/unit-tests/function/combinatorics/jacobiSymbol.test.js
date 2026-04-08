import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createJacobiSymbol } from '../../../../src/function/combinatorics/jacobiSymbol.js'

const math = create({ ...all, createJacobiSymbol })

describe('jacobiSymbol', function () {
  it('should return 1 for jacobiSymbol(1, 1)', function () {
    assert.strictEqual(math.jacobiSymbol(1, 1), 1)
  })

  it('should return 0 for jacobiSymbol(0, 5)', function () {
    assert.strictEqual(math.jacobiSymbol(0, 5), 0)
  })

  it('should return 1 for jacobiSymbol(1, 7)', function () {
    assert.strictEqual(math.jacobiSymbol(1, 7), 1)
  })

  it('should return 1 for jacobiSymbol(2, 7)', function () {
    assert.strictEqual(math.jacobiSymbol(2, 7), 1)
  })

  it('should return -1 for jacobiSymbol(3, 5)', function () {
    assert.strictEqual(math.jacobiSymbol(3, 5), -1)
  })

  it('should return 1 for jacobiSymbol(5, 21)', function () {
    assert.strictEqual(math.jacobiSymbol(5, 21), 1)
  })

  it('should return -1 for jacobiSymbol(3, 7)', function () {
    assert.strictEqual(math.jacobiSymbol(3, 7), -1)
  })

  it('should return 0 for jacobiSymbol(6, 9) (gcd(6,9)=3)', function () {
    assert.strictEqual(math.jacobiSymbol(6, 9), 0)
  })

  it('should handle negative a: jacobiSymbol(-1, 5) = 1', function () {
    assert.strictEqual(math.jacobiSymbol(-1, 5), 1)
  })

  it('should handle negative a: jacobiSymbol(-1, 3) = -1', function () {
    assert.strictEqual(math.jacobiSymbol(-1, 3), -1)
  })

  it('should return 1 for jacobiSymbol(2, 17)', function () {
    assert.strictEqual(math.jacobiSymbol(2, 17), 1)
  })

  it('should return -1 for jacobiSymbol(2, 3)', function () {
    assert.strictEqual(math.jacobiSymbol(2, 3), -1)
  })

  it('should throw for non-integer a', function () {
    assert.throws(function () { math.jacobiSymbol(1.5, 5) }, /Integer value expected/)
  })

  it('should throw for even n', function () {
    assert.throws(function () { math.jacobiSymbol(1, 4) }, /Odd positive integer/)
  })

  it('should throw for n = 0', function () {
    assert.throws(function () { math.jacobiSymbol(1, 0) }, /Odd positive integer/)
  })

  it('should throw for negative n', function () {
    assert.throws(function () { math.jacobiSymbol(1, -3) }, /Odd positive integer/)
  })
})
