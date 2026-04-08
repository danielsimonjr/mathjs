import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createIntegerDigits } from '../../../../src/function/combinatorics/integerDigits.js'

const math = create({ ...all, createIntegerDigits })

describe('integerDigits', function () {
  it('should return [0] for integerDigits(0)', function () {
    assert.deepStrictEqual(math.integerDigits(0), [0])
  })

  it('should return [1] for integerDigits(1)', function () {
    assert.deepStrictEqual(math.integerDigits(1), [1])
  })

  it('should return [1, 2, 3] for integerDigits(123)', function () {
    assert.deepStrictEqual(math.integerDigits(123), [1, 2, 3])
  })

  it('should return [9, 9, 9] for integerDigits(999)', function () {
    assert.deepStrictEqual(math.integerDigits(999), [9, 9, 9])
  })

  it('should return [1, 0] for integerDigits(10)', function () {
    assert.deepStrictEqual(math.integerDigits(10), [1, 0])
  })

  it('should return [15, 15] for integerDigits(255, 16)', function () {
    assert.deepStrictEqual(math.integerDigits(255, 16), [15, 15])
  })

  it('should return [1, 0, 1, 0] for integerDigits(10, 2)', function () {
    assert.deepStrictEqual(math.integerDigits(10, 2), [1, 0, 1, 0])
  })

  it('should return [1, 1, 1, 1, 1, 1, 1, 1] for integerDigits(255, 2)', function () {
    assert.deepStrictEqual(math.integerDigits(255, 2), [1, 1, 1, 1, 1, 1, 1, 1])
  })

  it('should return [1, 0] for integerDigits(8, 8)', function () {
    assert.deepStrictEqual(math.integerDigits(8, 8), [1, 0])
  })

  it('should return [2, 0] for integerDigits(6, 3)', function () {
    assert.deepStrictEqual(math.integerDigits(6, 3), [2, 0])
  })

  it('should return [0] for integerDigits(0, 2)', function () {
    assert.deepStrictEqual(math.integerDigits(0, 2), [0])
  })

  it('should throw for negative n', function () {
    assert.throws(function () { math.integerDigits(-1) }, /Non-negative integer/)
  })

  it('should throw for non-integer n', function () {
    assert.throws(function () { math.integerDigits(1.5) }, /Non-negative integer/)
  })

  it('should throw for base < 2', function () {
    assert.throws(function () { math.integerDigits(5, 1) }, /Integer >= 2 expected/)
  })

  it('should throw for non-integer base', function () {
    assert.throws(function () { math.integerDigits(5, 2.5) }, /Integer >= 2 expected/)
  })
})
