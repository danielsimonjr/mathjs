<<<<<<< HEAD
// @ts-nocheck
// test setDistinct
=======
/**
 * Test for setDistinct - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('setDistinct', function () {
  it('should return the elements of a set', function () {
=======
describe('setDistinct', function (): void {
  it('should return the elements of a set', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setDistinct([1, 2]), [1, 2])
    assert.deepStrictEqual(math.setDistinct([]), [])
  })

<<<<<<< HEAD
  it('should return the distinct elements of a multiset', function () {
=======
  it('should return the distinct elements of a multiset', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setDistinct([1, 1, 2, 2]), [1, 2])
    assert.deepStrictEqual(math.setDistinct([1, 2, 1, 2]), [1, 2])
    assert.deepStrictEqual(
      math.setDistinct([1, 2, math.complex(3, 3), 2, math.complex(3, 3)]),
      [math.complex(3, 3), 1, 2]
    )
  })

<<<<<<< HEAD
  it('should return the same type of output as the inputs', function () {
=======
  it('should return the same type of output as the inputs', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.typeOf(math.setDistinct([1, 2, 3])), 'Array')
    assert.strictEqual(
      math.typeOf(math.setDistinct(math.matrix([1, 2, 3]))),
      'DenseMatrix'
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.setDistinct()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setDistinct()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setDistinct([], [])
    }, /TypeError: Too many arguments/)
  })
})
