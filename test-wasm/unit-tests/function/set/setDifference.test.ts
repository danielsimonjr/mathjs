<<<<<<< HEAD
// @ts-nocheck
// test setDifference
=======
/**
 * Test for setDifference - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('setDifference', function () {
  it('should return the difference of two sets', function () {
=======
describe('setDifference', function (): void {
  it('should return the difference of two sets', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setDifference([1, 2, 3], [3, 4]), [1, 2])
    assert.deepStrictEqual(math.setDifference([3, 4], [1, 2, 3]), [4])
    assert.deepStrictEqual(math.setDifference([1, 2], [1, 2, 3, 4]), [])
    assert.deepStrictEqual(math.setDifference([], [3, 4]), [])
    assert.deepStrictEqual(math.setDifference([], []), [])
  })

<<<<<<< HEAD
  it('should return the difference of two sets with mixed content', function () {
=======
  it('should return the difference of two sets with mixed content', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.setDifference([math.complex(5, 1), 4], [1, 2, math.complex(5, 1)]),
      [4]
    )
  })

<<<<<<< HEAD
  it('should return the difference of two multisets', function () {
=======
  it('should return the difference of two multisets', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.setDifference([1, 1, 2, 3, 4, 4], [1, 2, 3, 4, 4, 4]),
      [1]
    )
    assert.deepStrictEqual(
      math.setDifference([1, 2, 1, 3, 4, 4], [1, 2, 4, 3, 4, 4]),
      [1]
    )
  })

<<<<<<< HEAD
  it('should return the same type of output as the inputs', function () {
=======
  it('should return the same type of output as the inputs', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      math.typeOf(math.setDifference([1, 2, 3], [3, 4, 5])),
      'Array'
    )
    assert.strictEqual(
      math.typeOf(
        math.setDifference(math.matrix([1, 2, 3]), math.matrix([3, 4, 5]))
      ),
      'DenseMatrix'
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.setDifference()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setDifference()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setDifference([], [], [])
    }, /TypeError: Too many arguments/)
  })
})
