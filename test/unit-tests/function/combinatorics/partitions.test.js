import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPartitions } from '../../../../src/function/combinatorics/partitions.js'

const math = create({ ...all, createPartitions })

describe('partitions', function () {
  it('should compute P(0) = 1', function () {
    assert.strictEqual(math.partitions(0), 1)
  })

  it('should compute P(1) = 1', function () {
    assert.strictEqual(math.partitions(1), 1)
  })

  it('should compute P(2) = 2', function () {
    assert.strictEqual(math.partitions(2), 2)
  })

  it('should compute P(3) = 3', function () {
    assert.strictEqual(math.partitions(3), 3)
  })

  it('should compute P(4) = 5', function () {
    assert.strictEqual(math.partitions(4), 5)
  })

  it('should compute P(5) = 7', function () {
    assert.strictEqual(math.partitions(5), 7)
  })

  it('should compute P(6) = 11', function () {
    assert.strictEqual(math.partitions(6), 11)
  })

  it('should compute P(10) = 42', function () {
    assert.strictEqual(math.partitions(10), 42)
  })

  it('should compute P(20) = 627', function () {
    assert.strictEqual(math.partitions(20), 627)
  })

  it('should compute P(100) = 190569292', function () {
    assert.strictEqual(math.partitions(100), 190569292)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.partitions(-1) }, /Non-negative integer/)
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.partitions(1.5) }, /Non-negative integer/)
  })
})
