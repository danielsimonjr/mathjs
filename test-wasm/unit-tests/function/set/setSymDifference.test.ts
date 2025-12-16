<<<<<<< HEAD
// @ts-nocheck
// test setSymDifference
=======
/**
 * Test for setSymDifference - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('setSymDifference', function () {
  it('should return the symetric difference of two sets', function () {
=======
describe('setSymDifference', function (): void {
  it('should return the symetric difference of two sets', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setSymDifference([1, 2, 3], [3, 4]), [1, 2, 4])
    assert.deepStrictEqual(math.setSymDifference([3, 4], [1, 2, 3]), [4, 1, 2])
    assert.deepStrictEqual(math.setSymDifference([1, 2], [1, 2, 3, 4]), [3, 4])
    assert.deepStrictEqual(math.setSymDifference([], [3, 4]), [3, 4])
    assert.deepStrictEqual(math.setSymDifference([], []), [])
  })

<<<<<<< HEAD
  it('should return the symetric difference of two multisets', function () {
=======
  it('should return the symetric difference of two multisets', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.setSymDifference([1, 1, 2, 3, 4, 4], [1, 2, 3, 4, 4, 4]),
      [1, 4]
    )
  })

<<<<<<< HEAD
  it('should return the same type of output as the inputs', function () {
=======
  it('should return the same type of output as the inputs', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
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

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.setSymDifference()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setSymDifference()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setSymDifference([], [], [])
    }, /TypeError: Too many arguments/)
  })
})
