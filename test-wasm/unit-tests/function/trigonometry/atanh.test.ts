<<<<<<< HEAD
// @ts-nocheck
/* eslint-disable no-loss-of-precision */

=======
/**
 * Test for atanh - AssemblyScript-friendly TypeScript
 */
/* eslint-disable no-loss-of-precision */


interface MathNode {
  type: string
  toTex(): string
}

>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
import { approxEqual, approxDeepEqual } from '../../../../tools/approx.js'
const pi = math.pi
const atanh = math.atanh
const tanh = math.tanh
const complex = math.complex
const matrix = math.matrix
const unit = math.unit
const bigmath = math.create({ number: 'BigNumber', precision: 20 })
const biggermath = math.create({ precision: 21 })
const predmath = math.create({ predictable: true })
const atanhBig = bigmath.atanh
const Big = bigmath.bignumber

<<<<<<< HEAD
describe('atanh', function () {
  it('should return the hyperbolic arctan of a boolean', function () {
=======
describe('atanh', function (): void {
  it('should return the hyperbolic arctan of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(atanh(true), Infinity)
    assert.strictEqual(atanh(false), 0)
  })

<<<<<<< HEAD
  it('should return the hyperbolic arctan of a number', function () {
=======
  it('should return the hyperbolic arctan of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(atanh(-2), complex(-0.54930614433405485, pi / 2))
    approxDeepEqual(atanh(2), complex(0.54930614433405485, -pi / 2))
    // assert.ok(isNaN(atanh(-2)))
    // assert.ok(isNaN(atanh(2)))

    approxEqual(atanh(-1), -Infinity)
    approxEqual(atanh(-0.5), -0.54930614433405484569762261846)
    approxEqual(atanh(0), 0)
    approxEqual(atanh(0.5), 0.54930614433405484569762261846)
    approxEqual(atanh(1), Infinity)
  })

<<<<<<< HEAD
  it('should return the hyperbolic arctan of a number when predictable:true', function () {
=======
  it('should return the hyperbolic arctan of a number when predictable:true', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(typeof predmath.atanh(-2), 'number')
    assert(isNaN(predmath.atanh(-2)))
  })

<<<<<<< HEAD
  it('should return the hyperbolic arctan of a bignumber', function () {
=======
  it('should return the hyperbolic arctan of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const arg1 = Big(-1)
    const arg2 = Big(-0.5)
    assert.deepStrictEqual(atanhBig(arg1).toString(), '-Infinity')
    assert.deepStrictEqual(atanhBig(arg2), Big('-0.5493061443340548457'))
    assert.deepStrictEqual(atanhBig(Big(0)), Big(0))
    assert.deepStrictEqual(atanhBig(Big(0.5)), Big('0.5493061443340548457'))
    assert.deepStrictEqual(atanhBig(Big(1)).toString(), 'Infinity')

    // Make sure arg was not changed
    assert.deepStrictEqual(arg1, Big(-1))
    assert.deepStrictEqual(arg2, Big(-0.5))
  })

<<<<<<< HEAD
  it('should be the inverse function of hyperbolic tan', function () {
=======
  it('should be the inverse function of hyperbolic tan', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(atanh(tanh(-1)), -1)
    approxEqual(atanh(tanh(0)), 0)
    approxEqual(atanh(tanh(0.1)), 0.1)
    approxEqual(atanh(tanh(0.5)), 0.5)
  })

<<<<<<< HEAD
  it('should be the inverse function of bignumber tanh', function () {
=======
  it('should be the inverse function of bignumber tanh', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(atanhBig(bigmath.tanh(Big(-0.5))), Big(-0.5))
    assert.deepStrictEqual(atanhBig(bigmath.tanh(Big(0))), Big(0))
    assert.deepStrictEqual(atanhBig(bigmath.tanh(Big(0.5))), Big(0.5))

    /* Pass in more digits to pi. */
    const arg = Big(-1)
    assert.deepStrictEqual(atanhBig(biggermath.tanh(arg)), Big(-1))
    assert.deepStrictEqual(atanhBig(biggermath.tanh(Big(0.1))), Big(0.1))
    assert.deepStrictEqual(arg, Big(-1))

    assert.ok(atanh(Big(1.1)).isNaN())
  })

<<<<<<< HEAD
  it('should return the arctanh of a complex number', function () {
=======
  it('should return the arctanh of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      atanh(complex('2+3i')),
      complex(0.1469466662255, 1.33897252229449)
    )
    approxDeepEqual(
      atanh(complex('2-3i')),
      complex(0.1469466662255, -1.33897252229449)
    )
    approxDeepEqual(
      atanh(complex('-2+3i')),
      complex(-0.1469466662255, 1.33897252229449)
    )
    approxDeepEqual(
      atanh(complex('-2-3i')),
      complex(-0.1469466662255, -1.33897252229449)
    )
    approxDeepEqual(
      atanh(complex('1+i')),
      complex(0.402359478108525, 1.01722196789785137)
    )
    approxDeepEqual(atanh(complex('i')), complex(0, pi / 4))

    approxDeepEqual(atanh(complex('2')), complex(0.54930614433405485, -pi / 2))
    assert.deepStrictEqual(atanh(complex('1')), complex(Infinity, 0))
    assert.deepStrictEqual(atanh(complex('0')), complex(0, 0))
    approxDeepEqual(atanh(complex('-2')), complex(-0.54930614433405485, pi / 2))
  })

<<<<<<< HEAD
  it('should throw an error if called with a unit', function () {
    assert.throws(function () {
      atanh(unit('45deg'))
    })
    assert.throws(function () {
=======
  it('should throw an error if called with a unit', function (): void {
    assert.throws(function (): void {
      atanh(unit('45deg'))
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      atanh(unit('5 celsius'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if called with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      atanh('string')
    })
  })

<<<<<<< HEAD
  it('should not operate on arrays and matrices', function () {
=======
  it('should not operate on arrays and matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => atanh([-1, 0, 1]), TypeError)
    assert.throws(() => atanh(matrix([-1, 0, 1])), TypeError)
    const atanh101 = [-Infinity, 0, Infinity]
    assert.deepStrictEqual(math.map([-1, 0, 1], atanh), atanh101)
    assert.deepStrictEqual(
      math.map(matrix([-1, 0, 1]), atanh),
      matrix(atanh101)
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      atanh()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      atanh()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      atanh(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX atanh', function () {
=======
  it('should LaTeX atanh', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('atanh(0.5)')
    assert.strictEqual(expression.toTex(), '\\tanh^{-1}\\left(0.5\\right)')
  })
})
