import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createEulerPhi } from '../../../../src/function/combinatorics/eulerPhi.js'

const math = create({ ...all, createEulerPhi })

describe('eulerPhi', function () {
  it('should return 1 for eulerPhi(1)', function () {
    assert.strictEqual(math.eulerPhi(1), 1)
  })

  it('should return 1 for eulerPhi(2)', function () {
    assert.strictEqual(math.eulerPhi(2), 1)
  })

  it('should return 2 for eulerPhi(3)', function () {
    assert.strictEqual(math.eulerPhi(3), 2)
  })

  it('should return 2 for eulerPhi(4)', function () {
    assert.strictEqual(math.eulerPhi(4), 2)
  })

  it('should return 2 for eulerPhi(6)', function () {
    assert.strictEqual(math.eulerPhi(6), 2)
  })

  it('should return 4 for eulerPhi(12)', function () {
    assert.strictEqual(math.eulerPhi(12), 4)
  })

  it('should return prime-1 for prime 7: eulerPhi(7) = 6', function () {
    assert.strictEqual(math.eulerPhi(7), 6)
  })

  it('should return prime-1 for prime 13: eulerPhi(13) = 12', function () {
    assert.strictEqual(math.eulerPhi(13), 12)
  })

  it('should return prime-1 for prime 997: eulerPhi(997) = 996', function () {
    assert.strictEqual(math.eulerPhi(997), 996)
  })

  it('should compute eulerPhi(36) = 12', function () {
    assert.strictEqual(math.eulerPhi(36), 12)
  })

  it('should compute eulerPhi(100) = 40', function () {
    assert.strictEqual(math.eulerPhi(100), 40)
  })

  it('should compute eulerPhi(1000) = 400', function () {
    assert.strictEqual(math.eulerPhi(1000), 400)
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.eulerPhi(1.5) }, /Positive integer/)
  })

  it('should throw for n = 0', function () {
    assert.throws(function () { math.eulerPhi(0) }, /Positive integer/)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.eulerPhi(-1) }, /Positive integer/)
  })
})
