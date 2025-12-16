<<<<<<< HEAD
// @ts-nocheck
// test setSize
=======
/**
 * Test for setSize - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('setSize', function () {
  it('should return the number of elements of a set', function () {
=======
describe('setSize', function (): void {
  it('should return the number of elements of a set', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.setSize([]), 0)
    assert.strictEqual(math.setSize([1]), 1)
    assert.strictEqual(math.setSize([1, 2]), 2)
    assert.strictEqual(math.setSize([1, math.complex(2, 2)]), 2)
  })

<<<<<<< HEAD
  it('should return the number of elements of a multiset', function () {
=======
  it('should return the number of elements of a multiset', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.setSize([1, 1]), 2)
    assert.strictEqual(math.setSize([1, 1], true), 1)
    assert.strictEqual(math.setSize([1, 2, 1], true), 2)
  })

<<<<<<< HEAD
  it('should return a number', function () {
    assert.strictEqual(math.typeOf(math.setSize([1, 2, 3])), 'number')
  })

  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
=======
  it('should return a number', function (): void {
    assert.strictEqual(math.typeOf(math.setSize([1, 2, 3])), 'number')
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setSize([], [])
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.setSize()
    }, /TypeError: Too few arguments/)
  })
})
