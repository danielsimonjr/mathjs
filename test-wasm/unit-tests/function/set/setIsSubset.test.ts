<<<<<<< HEAD
// @ts-nocheck
// test setIsSubset
=======
/**
 * Test for setIsSubset - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('setIsSubset', function () {
  it('should return true or false', function () {
=======
describe('setIsSubset', function (): void {
  it('should return true or false', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.setIsSubset([1, 2], [1, 2, 3, 4]), true)
    assert.strictEqual(math.setIsSubset([1, 2, 3, 4], [1, 2]), false)
    assert.strictEqual(math.setIsSubset([], [1, 2]), true)
    assert.strictEqual(math.setIsSubset([], []), true)

    assert.strictEqual(
      math.setIsSubset([1, math.complex(2, 2)], [1, 3, 4, math.complex(2, 2)]),
      true
    )
  })

<<<<<<< HEAD
  it('should return true or false', function () {
=======
  it('should return true or false', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      math.setIsSubset([1, 1, 2, 3, 4, 4], [1, 2, 3, 4, 4, 4]),
      false
    )
    assert.strictEqual(
      math.setIsSubset([1, 2, 3, 4, 4], [1, 2, 3, 4, 4, 4]),
      true
    )
    assert.strictEqual(
      math.setIsSubset([1, 2, 4, 3, 4], [1, 2, 4, 3, 4, 4]),
      true
    )
  })

<<<<<<< HEAD
  it('should return boolean', function () {
=======
  it('should return boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      math.typeOf(math.setIsSubset([1, 2, 3], [3, 4, 5])),
      'boolean'
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.setIsSubset()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setIsSubset()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setIsSubset([], [], [])
    }, /TypeError: Too many arguments/)
  })
})
