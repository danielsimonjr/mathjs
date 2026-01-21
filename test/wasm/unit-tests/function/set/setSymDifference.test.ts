/**
 * Test for setSymDifference - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'

describe('setSymDifference', function (): void {
  it('should return the symetric difference of two sets', function (): void {
    assert.deepStrictEqual(math.setSymDifference([1, 2, 3], [3, 4]), [1, 2, 4])
    assert.deepStrictEqual(math.setSymDifference([3, 4], [1, 2, 3]), [4, 1, 2])
    assert.deepStrictEqual(math.setSymDifference([1, 2], [1, 2, 3, 4]), [3, 4])
    assert.deepStrictEqual(math.setSymDifference([], [3, 4]), [3, 4])
    assert.deepStrictEqual(math.setSymDifference([], []), [])
  })

  it('should return the symetric difference of two multisets', function (): void {
    assert.deepStrictEqual(
      math.setSymDifference([1, 1, 2, 3, 4, 4], [1, 2, 3, 4, 4, 4]),
      [1, 4]
    )
  })

  it('should return the same type of output as the inputs', function (): void {
    assert.strictEqual(
      math.typeOf(math.setSymDifference([1, 2, 3], [3, 4, 5])),
      'Array'
    )
    assert.strictEqual(
      math.typeOf(
        math.setSymDifference(math.matrix([1, 2, 3]), math.matrix([3, 4, 5]))
      ),
      'DenseMatrix'
    )
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setSymDifference()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      math.setSymDifference([], [], [])
    }, /TypeError: Too many arguments/)
  })
})
