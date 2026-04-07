import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createLucasL } from '../../../../src/function/combinatorics/lucasL.js'

const math = create({ ...all, createLucasL })

describe('lucasL', function () {
  it('should compute L(0) = 2', function () {
    assert.strictEqual(math.lucasL(0), 2)
  })

  it('should compute L(1) = 1', function () {
    assert.strictEqual(math.lucasL(1), 1)
  })

  it('should compute L(2) = 3', function () {
    assert.strictEqual(math.lucasL(2), 3)
  })

  it('should compute L(3) = 4', function () {
    assert.strictEqual(math.lucasL(3), 4)
  })

  it('should compute L(4) = 7', function () {
    assert.strictEqual(math.lucasL(4), 7)
  })

  it('should compute L(5) = 11', function () {
    assert.strictEqual(math.lucasL(5), 11)
  })

  it('should compute L(6) = 18', function () {
    assert.strictEqual(math.lucasL(6), 18)
  })

  it('should compute L(10) = 123', function () {
    assert.strictEqual(math.lucasL(10), 123)
  })

  it('should compute L(20) = 15127', function () {
    assert.strictEqual(math.lucasL(20), 15127)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.lucasL(-1) }, /Non-negative integer/)
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.lucasL(1.5) }, /Non-negative integer/)
  })
})
