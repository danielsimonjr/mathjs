import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createMoebiusMu } from '../../../../src/function/combinatorics/moebiusMu.js'

const math = create({ ...all, createMoebiusMu })

describe('moebiusMu', function () {
  it('should return 1 for n=1', function () {
    assert.strictEqual(math.moebiusMu(1), 1)
  })

  it('should return -1 for prime n=2', function () {
    assert.strictEqual(math.moebiusMu(2), -1)
  })

  it('should return -1 for prime n=3', function () {
    assert.strictEqual(math.moebiusMu(3), -1)
  })

  it('should return 0 for n=4 (has squared factor 2^2)', function () {
    assert.strictEqual(math.moebiusMu(4), 0)
  })

  it('should return -1 for prime n=5', function () {
    assert.strictEqual(math.moebiusMu(5), -1)
  })

  it('should return 1 for n=6 (=2*3, two distinct primes)', function () {
    assert.strictEqual(math.moebiusMu(6), 1)
  })

  it('should return 0 for n=8 (=2^3, squared factor)', function () {
    assert.strictEqual(math.moebiusMu(8), 0)
  })

  it('should return 0 for n=9 (=3^2, squared factor)', function () {
    assert.strictEqual(math.moebiusMu(9), 0)
  })

  it('should return -1 for n=30 (=2*3*5, three distinct primes)', function () {
    assert.strictEqual(math.moebiusMu(30), -1)
  })

  it('should return 1 for n=210 (=2*3*5*7, four distinct primes)', function () {
    assert.strictEqual(math.moebiusMu(210), 1)
  })

  it('should throw for n=0', function () {
    assert.throws(function () { math.moebiusMu(0) }, /Positive integer/)
  })

  it('should throw for negative n', function () {
    assert.throws(function () { math.moebiusMu(-1) }, /Positive integer/)
  })

  it('should throw for non-integer', function () {
    assert.throws(function () { math.moebiusMu(1.5) }, /Positive integer/)
  })
})
