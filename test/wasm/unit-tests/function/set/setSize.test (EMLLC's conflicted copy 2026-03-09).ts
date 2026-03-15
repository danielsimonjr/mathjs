/**
 * Test for setSize - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'

describe('setSize', function (): void {
  it('should return the number of elements of a set', function (): void {
    assert.strictEqual(math.setSize([]), 0)
    assert.strictEqual(math.setSize([1]), 1)
    assert.strictEqual(math.setSize([1, 2]), 2)
    assert.strictEqual(math.setSize([1, math.complex(2, 2)]), 2)
  })

  it('should return the number of elements of a multiset', function (): void {
    assert.strictEqual(math.setSize([1, 1]), 2)
    assert.strictEqual(math.setSize([1, 1], true), 1)
    assert.strictEqual(math.setSize([1, 2, 1], true), 2)
  })

  it('should return a number', function (): void {
    assert.strictEqual(math.typeOf(math.setSize([1, 2, 3])), 'number')
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      math.setSize([], [])
    }, /TypeError: Unexpected type of argument/)
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setSize()
    }, /TypeError: Too few arguments/)
  })
})
