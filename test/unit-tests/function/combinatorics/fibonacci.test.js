import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createFibonacci } from '../../../../src/function/combinatorics/fibonacci.js'

const math = create({ ...all, createFibonacci })

describe('fibonacci', function () {
  it('should compute fibonacci(0) = 0', function () {
    assert.strictEqual(math.fibonacci(0), 0)
  })

  it('should compute fibonacci(1) = 1', function () {
    assert.strictEqual(math.fibonacci(1), 1)
  })

  it('should compute fibonacci(2) = 1', function () {
    assert.strictEqual(math.fibonacci(2), 1)
  })

  it('should compute fibonacci(3) = 2', function () {
    assert.strictEqual(math.fibonacci(3), 2)
  })

  it('should compute fibonacci(4) = 3', function () {
    assert.strictEqual(math.fibonacci(4), 3)
  })

  it('should compute fibonacci(5) = 5', function () {
    assert.strictEqual(math.fibonacci(5), 5)
  })

  it('should compute fibonacci(10) = 55', function () {
    assert.strictEqual(math.fibonacci(10), 55)
  })

  it('should compute fibonacci(20) = 6765', function () {
    assert.strictEqual(math.fibonacci(20), 6765)
  })

  it('should compute fibonacci(50) = 12586269025', function () {
    assert.strictEqual(math.fibonacci(50), 12586269025)
  })

  it('should handle fibonacci(70) without overflow', function () {
    assert.strictEqual(math.fibonacci(70), 190392490709135)
  })

  it('should throw for n > 70 with number input', function () {
    assert.throws(function () { math.fibonacci(71) }, /exceeds Number.MAX_SAFE_INTEGER/)
  })

  it('should handle BigInt inputs for small n', function () {
    assert.strictEqual(math.fibonacci(0n), 0n)
    assert.strictEqual(math.fibonacci(1n), 1n)
    assert.strictEqual(math.fibonacci(10n), 55n)
    assert.strictEqual(math.fibonacci(50n), 12586269025n)
  })

  it('should handle BigInt inputs for large n > 70', function () {
    assert.strictEqual(math.fibonacci(100n), 354224848179261915075n)
  })

  it('should throw for negative number input', function () {
    assert.throws(function () { math.fibonacci(-1) }, /Non-negative integer/)
  })

  it('should throw for negative BigInt input', function () {
    assert.throws(function () { math.fibonacci(-1n) }, /Non-negative integer/)
  })

  it('should throw for non-integer number input', function () {
    assert.throws(function () { math.fibonacci(1.5) }, /Integer value expected/)
  })
})
