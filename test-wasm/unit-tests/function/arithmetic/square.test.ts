<<<<<<< HEAD
// @ts-nocheck
// test square
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for square - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
>>>>>>> claude/review-sprints-quality-checks-Rlfec
const bignumber = math.bignumber
const fraction = math.fraction
const matrix = math.matrix
const square = math.square

<<<<<<< HEAD
describe('square', function () {
  it('should return the square of a boolean', function () {
=======
describe('square', function (): void {
  it('should return the square of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(square(true), 1)
    assert.strictEqual(square(false), 0)
  })

<<<<<<< HEAD
  it('should return the square of a number', function () {
=======
  it('should return the square of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(square(4), 16)
    assert.strictEqual(square(-2), 4)
    assert.strictEqual(square(0), 0)
  })

<<<<<<< HEAD
  it('should return the square of a bigint', function () {
=======
  it('should return the square of a bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(square(4n), 16n)
    assert.strictEqual(square(-2n), 4n)
    assert.strictEqual(square(0n), 0n)
  })

<<<<<<< HEAD
  it('should return the square of a big number', function () {
=======
  it('should return the square of a big number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(square(bignumber(4)), bignumber(16))
    assert.deepStrictEqual(square(bignumber(-2)), bignumber(4))
    assert.deepStrictEqual(square(bignumber(0)), bignumber(0))
  })

<<<<<<< HEAD
  it('should return the square of a fraction', function () {
=======
  it('should return the square of a fraction', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = fraction(0.5)
    assert(square(a) instanceof math.Fraction)
    assert.strictEqual(square(a).toString(), '0.25')
    assert.strictEqual(a.toString(), '0.5')
  })

<<<<<<< HEAD
  it('should throw an error if used with wrong number of arguments', function () {
    assert.throws(function () {
      square()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error if used with wrong number of arguments', function (): void {
    assert.throws(function (): void {
      square()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      square(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      square(null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should return the square of a complex number', function () {
=======
  it('should return the square of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(square(math.complex('2i')), math.complex('-4'))
    assert.deepStrictEqual(square(math.complex('2+3i')), math.complex('-5+12i'))
    assert.deepStrictEqual(square(math.complex('2')), math.complex('4'))
  })

<<<<<<< HEAD
  it('should return the square of a unit', function () {
=======
  it('should return the square of a unit', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(square(math.unit('4 cm')).toString(), '16 cm^2')
    assert.strictEqual(square(math.unit('-2 cm')).toString(), '4 cm^2')
    assert.strictEqual(square(math.unit('0 cm')).toString(), '0 cm^2')
  })

<<<<<<< HEAD
  it('should throw an error when used with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error when used with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      square('text')
    })
  })

<<<<<<< HEAD
  it('should not operate on a matrix', function () {
=======
  it('should not operate on a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => square([2, 3, 4, 5]), TypeError)
    assert.deepStrictEqual(math.map([2, 3, 4, 5], square), [4, 9, 16, 25])
    assert.deepStrictEqual(
      math.map(matrix([2, 3, 4, 5]), square),
      matrix([4, 9, 16, 25])
    )
    assert.deepStrictEqual(
      math.map(
        matrix([
          [1, 2],
          [3, 4]
        ]),
        square
      ),
      matrix([
        [1, 4],
        [9, 16]
      ])
    )
  })

<<<<<<< HEAD
  it('should LaTeX square', function () {
=======
  it('should LaTeX square', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('square(4)')
    assert.strictEqual(expression.toTex(), '\\left(4\\right)^2')
  })
})
