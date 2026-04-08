import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createCarmichaelLambda } from '../../../../src/function/combinatorics/carmichaelLambda.js'

const math = create({ ...all, createCarmichaelLambda })

describe('carmichaelLambda', function () {
  it('should return 1 for carmichaelLambda(1)', function () {
    assert.strictEqual(math.carmichaelLambda(1), 1)
  })

  it('should return 1 for carmichaelLambda(2)', function () {
    assert.strictEqual(math.carmichaelLambda(2), 1)
  })

  it('should return 2 for carmichaelLambda(4)', function () {
    assert.strictEqual(math.carmichaelLambda(4), 2)
  })

  it('should return 2 for carmichaelLambda(8)', function () {
    assert.strictEqual(math.carmichaelLambda(8), 2)
  })

  it('should return 4 for carmichaelLambda(16)', function () {
    assert.strictEqual(math.carmichaelLambda(16), 4)
  })

  it('should return p-1 for prime p=7: carmichaelLambda(7) = 6', function () {
    assert.strictEqual(math.carmichaelLambda(7), 6)
  })

  it('should return 2 for carmichaelLambda(12)', function () {
    assert.strictEqual(math.carmichaelLambda(12), 2)
  })

  it('should return 4 for carmichaelLambda(15)', function () {
    assert.strictEqual(math.carmichaelLambda(15), 4)
  })

  it('should return 6 for carmichaelLambda(9)', function () {
    assert.strictEqual(math.carmichaelLambda(9), 6)
  })

  it('should return 4 for carmichaelLambda(5)', function () {
    assert.strictEqual(math.carmichaelLambda(5), 4)
  })

  it('should return 2 for carmichaelLambda(3)', function () {
    assert.strictEqual(math.carmichaelLambda(3), 2)
  })

  it('should throw for n = 0', function () {
    assert.throws(function () { math.carmichaelLambda(0) }, /Positive integer/)
  })

  it('should throw for negative input', function () {
    assert.throws(function () { math.carmichaelLambda(-1) }, /Positive integer/)
  })

  it('should throw for non-integer input', function () {
    assert.throws(function () { math.carmichaelLambda(1.5) }, /Positive integer/)
  })
})
