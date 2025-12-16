<<<<<<< HEAD
// @ts-nocheck
// test setMultiplicity
=======
/**
 * Test for setMultiplicity - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('setMultiplicity', function () {
  it('should return the multiplicity on an element of a set', function () {
=======
describe('setMultiplicity', function (): void {
  it('should return the multiplicity on an element of a set', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setMultiplicity(1, [1, 2]), 1)
    assert.deepStrictEqual(math.setMultiplicity(1, []), 0)
  })

<<<<<<< HEAD
  it('should return the multiplicity on an element of a multiset', function () {
=======
  it('should return the multiplicity on an element of a multiset', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.setMultiplicity(1, [1, 1, 2]), 2)
    assert.deepStrictEqual(math.setMultiplicity(1, [1, 2, 1]), 2)
  })

<<<<<<< HEAD
  it('should return a number', function () {
=======
  it('should return a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      math.typeOf(math.setMultiplicity(3, [3, 4, 5])),
      'number'
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.setMultiplicity()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.setMultiplicity()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setMultiplicity(1, [], [])
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid order of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid order of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setMultiplicity([], 1)
    }, /TypeError: Unexpected type of argument/)
  })
})
