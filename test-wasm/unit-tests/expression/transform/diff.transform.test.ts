<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for diff.transform - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const diff = math.expression.transform.diff

<<<<<<< HEAD
describe('diff.transform', function () {
  it('Should use one-based indexing for dimensions with arrays', function () {
=======
describe('diff.transform', function (): void {
  it('Should use one-based indexing for dimensions with arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // With Dim = 1
    assert.deepStrictEqual(diff([1, 2, 4, 7, 0], 1), [1, 2, 3, -7])
    assert.deepStrictEqual(
      diff([1, 2, 4, 7, 0], math.bignumber(1)),
      [1, 2, 3, -7]
    )

    // Without Dim = 1
    assert.deepStrictEqual(diff([1, 2, 4, 7, 0]), [1, 2, 3, -7])
  })

<<<<<<< HEAD
  it('Should use one-based indexing for dimensions with matrices', function () {
=======
  it('Should use one-based indexing for dimensions with matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // With Dim = 1
    assert.deepStrictEqual(
      diff(math.matrix([1, 2, 4, 7, 0]), 1),
      math.matrix([1, 2, 3, -7])
    )
    assert.deepStrictEqual(
      diff(math.matrix([1, 2, 4, 7, 0]), math.bignumber(1)),
      math.matrix([1, 2, 3, -7])
    )

    // Without Dim = 1
    assert.deepStrictEqual(
      diff(math.matrix([1, 2, 4, 7, 0])),
      math.matrix([1, 2, 3, -7])
    )
  })

  it('should throw an error if the dimension is below the range for one based indices', function () {
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      diff(math.matrix([1, 2, 4, 7, 0]), 0)
    }, Error)
  })

  it('should throw an error if the dimension is above the range for one based indices', function () {
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      diff(math.matrix([1, 2, 4, 7, 0]), math.bignumber(0))
    }, Error)
  })

<<<<<<< HEAD
  it('should work with the parser', function () {
=======
  it('should work with the parser', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.evaluate('diff([1, 2, 4, 7, 0], 1)'),
      math.matrix([1, 2, 3, -7])
    )
  })
})
