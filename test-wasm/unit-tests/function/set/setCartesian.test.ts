<<<<<<< HEAD
// @ts-nocheck
// test setCartesian
=======
/**
 * Test for setCartesian - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('setCartesian', function () {
  it('should return the cartesian product of two sets', function () {
=======
describe('setCartesian', function (): void {
  it('should return the cartesian product of two sets', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
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

<<<<<<< HEAD
  it('should return the cartesian product of two sets with mixed content', function () {
=======
  it('should return the cartesian product of two sets with mixed content', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setCartesian([1, math.complex(2, 3)], [3]), [
      [math.complex(2, 3), 3],
      [1, 3]
    ])
  })

<<<<<<< HEAD
  it('should return the cartesian product of two multisets', function () {
=======
  it('should return the cartesian product of two multisets', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setCartesian([1, 1], [3, 3]), [
      [1, 3],
      [1, 3],
      [1, 3],
      [1, 3]
    ])
  })

<<<<<<< HEAD
  it('should return the same type of output as the inputs', function () {
=======
  it('should return the same type of output as the inputs', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
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

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.setCartesian()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setCartesian()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setCartesian([], [], [])
    }, /TypeError: Too many arguments/)
  })
})
