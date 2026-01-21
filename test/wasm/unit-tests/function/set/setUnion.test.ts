/**
 * Test for setUnion - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'

describe('setUnion', function (): void {
  it('should return the union of two sets', function (): void {
    assert.deepStrictEqual(math.setUnion([1, 2], [3, 4]), [1, 2, 3, 4])
    assert.deepStrictEqual(math.setUnion(['a', 'b'], ['c', 'd']), [
      'a',
      'b',
      'c',
      'd'
    ])
    assert.deepStrictEqual(math.setUnion([], [3, 4]), [3, 4])
    assert.deepStrictEqual(math.setUnion([], []), [])
  })

  it('should return the union of two multisets', function (): void {
    assert.deepStrictEqual(
      math.setUnion([1, 1, 2, 3, 4, 4], [1, 2, 3, 4, 4, 4]),
      [1, 4, 1, 2, 3, 4, 4]
    )
  })

  it('should return the same type of output as the inputs', function (): void {
    assert.strictEqual(
      math.typeOf(math.setUnion([1, 2, 3], [3, 4, 5])),
      'Array'
    )
    assert.strictEqual(
      math.typeOf(
        math.setUnion(math.matrix([1, 2, 3]), math.matrix([3, 4, 5]))
      ),
      'DenseMatrix'
    )
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setUnion()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      math.setUnion([], [], [])
    }, /TypeError: Too many arguments/)
  })
})
