<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for coth - AssemblyScript-friendly TypeScript
 */
interface MathNode {
  type: string
  toTex(): string
}

>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
import { approxEqual, approxDeepEqual } from '../../../../tools/approx.js'
const pi = math.pi
const complex = math.complex
const matrix = math.matrix
const unit = math.unit
const coth = math.coth
const bigmath = math.create({ precision: 20 })
const biggermath = math.create({ number: 'BigNumber', precision: 21 })

<<<<<<< HEAD
describe('coth', function () {
  it('should return the coth of a boolean', function () {
=======
describe('coth', function (): void {
  it('should return the coth of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(coth(true), 1.3130352854993)
    approxEqual(coth(false), Number.POSITIVE_INFINITY)
  })

<<<<<<< HEAD
  it('should return the coth of a number', function () {
=======
  it('should return the coth of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(coth(0), Number.POSITIVE_INFINITY)
    approxEqual(coth(pi), 1.0037418731973)
    approxEqual(coth(1), 1.3130352854993)
    approxEqual(coth(2), 1.0373147207275)
    approxEqual(coth(3), 1.0049698233137)
  })

<<<<<<< HEAD
  it('should return the coth of a bignumber', function () {
=======
  it('should return the coth of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const cothBig = bigmath.coth
    const Big = bigmath.bignumber
    assert.deepStrictEqual(cothBig(Big(0)).toString(), 'Infinity')
    assert.deepStrictEqual(cothBig(Big(1)), Big('1.3130352854993313036'))
    assert.deepStrictEqual(cothBig(Big(2)), Big('1.0373147207275480959'))
    assert.deepStrictEqual(cothBig(Big(3)), Big('1.0049698233136891711'))

    /* Pass in extra digits to pi. */
    assert.deepStrictEqual(cothBig(biggermath.pi), Big('1.0037418731973212882'))
  })

<<<<<<< HEAD
  it('should return the coth of a complex number', function () {
=======
  it('should return the coth of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(coth(complex('1')), complex(1.3130352854993, 0))
    approxDeepEqual(coth(complex('i')), complex(0, -0.64209261593433))
    approxDeepEqual(
      coth(complex('2 + i')),
      complex(0.98432922645819, -0.032797755533753)
    )
  })

<<<<<<< HEAD
  it('should throw an error on an angle', function () {
    assert.throws(() => coth(unit('90deg')), TypeError)
  })

  it('should throw an error if called with an invalid unit', function () {
    assert.throws(function () {
=======
  it('should throw an error on an angle', function (): void {
    assert.throws(() => coth(unit('90deg')), TypeError)
  })

  it('should throw an error if called with an invalid unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      coth(unit('5 celsius'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if called with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      coth('string')
    })
  })

  const coth123 = [1.3130352854993, 1.0373147207275, 1.0049698233137]

<<<<<<< HEAD
  it('should not operate on an array', function () {
=======
  it('should not operate on an array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => coth([1, 2, 3]), TypeError)
    approxDeepEqual(math.map([1, 2, 3], coth), coth123)
  })

<<<<<<< HEAD
  it('should not operate on a matrix', function () {
=======
  it('should not operate on a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => coth(matrix([1, 2, 3])), TypeError)
    approxDeepEqual(math.map(matrix([1, 2, 3]), coth), matrix(coth123))
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      coth()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      coth()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      coth(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX coth', function () {
=======
  it('should LaTeX coth', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('coth(1)')
    assert.strictEqual(expression.toTex(), '\\coth\\left(1\\right)')
  })
})
