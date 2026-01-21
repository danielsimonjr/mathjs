/**
 * Test for setPowerset - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'

describe('setPowerset', function (): void {
  it('should return the powerset of a set', function (): void {
    assert.deepStrictEqual(math.setPowerset([1, 2]), [[], [1], [2], [1, 2]])
    assert.deepStrictEqual(math.setPowerset([1, math.complex(2, 2)]), [
      [],
      [math.complex(2, 2)],
      [1],
      [math.complex(2, 2), 1]
    ])
    assert.deepStrictEqual(math.setPowerset([]), [])
  })

  it('should return the powerset of a multiset', function (): void {
    assert.deepStrictEqual(math.setPowerset([1, 1]), [[], [1], [1], [1, 1]])
  })

  it('should always return an array', function (): void {
    assert.strictEqual(math.typeOf(math.setPowerset([1, 2, 3])), 'Array')
    assert.strictEqual(
      math.typeOf(math.setPowerset(math.matrix([1, 2, 3]))),
      'Array'
    )
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setPowerset()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      math.setPowerset([], [])
    }, /TypeError: Too many arguments/)
  })
})
