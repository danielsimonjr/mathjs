/**
 * Test for setCartesian - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

describe('setCartesian', function (): void {
  it('should return the cartesian product of two sets', function (): void {
    assert.deepStrictEqual(math.setCartesian([1], [3]), [[1, 3]])
    assert.deepStrictEqual(math.setCartesian([1, 2], [3]), [
      [1, 3],
      [2, 3]
    ])
    assert.deepStrictEqual(math.setCartesian([1, 2], [3, 4]), [
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4]
    ])
    assert.deepStrictEqual(math.setCartesian([], [3, 4]), [])
    assert.deepStrictEqual(math.setCartesian([], []), [])
  })

  it('should return the cartesian product of two sets with mixed content', function (): void {
    assert.deepStrictEqual(math.setCartesian([1, math.complex(2, 3)], [3]), [
      [math.complex(2, 3), 3],
      [1, 3]
    ])
  })

  it('should return the cartesian product of two multisets', function (): void {
    assert.deepStrictEqual(math.setCartesian([1, 1], [3, 3]), [
      [1, 3],
      [1, 3],
      [1, 3],
      [1, 3]
    ])
  })

  it('should return the same type of output as the inputs', function (): void {
    assert.strictEqual(
      math.typeOf(math.setCartesian([1, 2, 3], [3, 4, 5])),
      'Array'
    )
    assert.strictEqual(
      math.typeOf(
        math.setCartesian(math.matrix([1, 2, 3]), math.matrix([3, 4, 5]))
      ),
      'DenseMatrix'
    )
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setCartesian()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      math.setCartesian([], [], [])
    }, /TypeError: Too many arguments/)
  })
})
