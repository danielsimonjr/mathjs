<<<<<<< HEAD
// @ts-nocheck
/* eslint-disable no-loss-of-precision */

=======
/**
 * Test for acosh - AssemblyScript-friendly TypeScript
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
const acosh = math.acosh
const cosh = math.cosh
const complex = math.complex
const matrix = math.matrix
const unit = math.unit
const bigmath = math.create({ number: 'BigNumber', precision: 20 })
const biggermath = math.create({ precision: 22 })
const predmath = math.create({ predictable: true })
const acoshBig = bigmath.acosh
const Big = bigmath.bignumber

<<<<<<< HEAD
describe('acosh', function () {
  it('should return the hyperbolic arccos of a boolean', function () {
=======
describe('acosh', function (): void {
  it('should return the hyperbolic arccos of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(acosh(true), 0)
    approxDeepEqual(acosh(false), complex(0, pi / 2))
    // assert.ok(isNaN(acosh(false)))
  })

<<<<<<< HEAD
  it('should return the hyperbolic arccos of a number', function () {
=======
  it('should return the hyperbolic arccos of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(acosh(-2), complex(1.31695789692481670862504634730797, pi))
    approxDeepEqual(acosh(0), complex(0, pi / 2))
    // assert.ok(isNaN(acosh(-2)))
    // assert.ok(isNaN(acosh(0)))

    approxEqual(acosh(1), 0)
    approxEqual(acosh(2), 1.31695789692481670862504634730797)
    approxEqual(acosh(3), 1.7627471740390860504652186499595)
    approxEqual(acosh(pi), 1.811526272460853107021852049305)
  })

<<<<<<< HEAD
  it('should return NaN for values out of range and predictable:true', function () {
=======
  it('should return NaN for values out of range and predictable:true', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(typeof predmath.acosh(-2), 'number')
    assert(isNaN(predmath.acosh(-2)))
  })

<<<<<<< HEAD
  it('should return the hyperbolic arccos of a bignumber', function () {
=======
  it('should return the hyperbolic arccos of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const arg = Big(1)
    assert.deepStrictEqual(acosh(arg), Big(0))
    assert.deepStrictEqual(acoshBig(Big(2)), Big('1.3169578969248167086'))
    assert.deepStrictEqual(acoshBig(Big(3)), Big('1.7627471740390860505'))
    assert.deepStrictEqual(
      acoshBig(bigmath.pi).toString(),
      '1.811526272460853107'
    )

    // Make sure arg was not changed
    assert.deepStrictEqual(arg, Big(1))
  })

<<<<<<< HEAD
  it('should be the inverse function of hyperbolic cos', function () {
=======
  it('should be the inverse function of hyperbolic cos', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(acosh(cosh(-1)), 1)
    approxEqual(acosh(cosh(0)), 0)
    approxEqual(acosh(cosh(0.1)), 0.1)
    approxEqual(acosh(cosh(0.5)), 0.5)
    approxEqual(acosh(cosh(2)), 2)
  })

<<<<<<< HEAD
  it('should be the inverse function of bignumber cosh', function () {
=======
  it('should be the inverse function of bignumber cosh', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(acoshBig(bigmath.cosh(Big(-1))), Big(1))
    assert.deepStrictEqual(acoshBig(bigmath.cosh(Big(0))), Big(0))
    assert.deepStrictEqual(acoshBig(bigmath.cosh(Big(2))), Big(2))

    // Pass in extra digit
    const arg = Big(0.1)
    assert.deepStrictEqual(
      acoshBig(biggermath.cosh(arg)),
      Big('0.10000000000000000012')
    )
    assert.deepStrictEqual(
      acoshBig(biggermath.cosh(Big(0.5))),
      Big('0.49999999999999999995')
    )
    assert.deepStrictEqual(arg, Big(0.1))
  })

<<<<<<< HEAD
  it('should throw an error if the bignumber result is complex', function () {
=======
  it('should throw an error if the bignumber result is complex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.ok(acosh(Big(0.5).isNaN()))
    assert.ok(acosh(Big(-0.5).isNaN()))
  })

<<<<<<< HEAD
  it('should return the arccosh of a complex number', function () {
=======
  it('should return the arccosh of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      acosh(complex('2+3i')),
      complex(1.9833870299165, 1.000143542473797)
    )
    approxDeepEqual(
      acosh(complex('2-3i')),
      complex(1.9833870299165, -1.000143542473797)
    )
    approxDeepEqual(
      acosh(complex('-2+3i')),
      complex(1.9833870299165, 2.141449111116)
    )
    approxDeepEqual(
      acosh(complex('-2-3i')),
      complex(1.9833870299165, -2.141449111116)
    )
    approxDeepEqual(
      acosh(complex('1+i')),
      complex(1.061275061905036, 0.904556894302381)
    )
    approxDeepEqual(
      acosh(complex('i')),
      complex(0.881373587019543, 1.570796326794897)
    )
    assert.deepStrictEqual(acosh(complex('1')), complex(-0, 0))
    approxDeepEqual(acosh(complex('0')), complex(0, pi / 2))
  })

<<<<<<< HEAD
  it('should throw an error if called with a unit', function () {
    assert.throws(function () {
      acosh(unit('45deg'))
    })
    assert.throws(function () {
=======
  it('should throw an error if called with a unit', function (): void {
    assert.throws(function (): void {
      acosh(unit('45deg'))
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      acosh(unit('5 celsius'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if called with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      acosh('string')
    })
  })

<<<<<<< HEAD
  it('should not operate on arrays and matrices', function () {
=======
  it('should not operate on arrays and matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => acosh([1, 2, 3]), TypeError)
    assert.throws(() => acosh(matrix([1, 2, 3])), TypeError)
    const acosh123 = [0, 1.3169578969248167, 1.7627471740390860504]
    approxDeepEqual(math.map([1, 2, 3], acosh), acosh123)
    approxDeepEqual(math.map(matrix([1, 2, 3]), acosh), matrix(acosh123))
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      acosh()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      acosh()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      acosh(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX acosh', function () {
=======
  it('should LaTeX acosh', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('acosh(1)')
    assert.strictEqual(expression.toTex(), '\\cosh^{-1}\\left(1\\right)')
  })
})
