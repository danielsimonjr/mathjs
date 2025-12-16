<<<<<<< HEAD
// @ts-nocheck
/* eslint-disable no-loss-of-precision */

=======
/**
 * Test for asinh - AssemblyScript-friendly TypeScript
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
const asinh = math.asinh
const sinh = math.sinh
const complex = math.complex
const matrix = math.matrix
const unit = math.unit
const bigmath = math.create({ number: 'BigNumber', precision: 20 })
const biggermath = math.create({ precision: 21 })
const asinhBig = bigmath.asinh
const Big = bigmath.bignumber

<<<<<<< HEAD
describe('asinh', function () {
  it('should return the hyperbolic arcsin of a boolean', function () {
=======
describe('asinh', function (): void {
  it('should return the hyperbolic arcsin of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(asinh(true), 0.881373587019543)
    assert.strictEqual(asinh(false), 0)
  })

<<<<<<< HEAD
  it('should return the hyperbolic arcsin of a number', function () {
=======
  it('should return the hyperbolic arcsin of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(asinh(-2), -1.44363547517881034249327674027311)
    approxEqual(asinh(-1), -0.88137358701954302523260932497979)
    approxEqual(asinh(0), 0)
    approxEqual(asinh(1), 0.88137358701954302523260932497979)
    approxEqual(asinh(2), 1.44363547517881034249327674027311)
    approxEqual(asinh(pi), 1.8622957433108482198883613251826)
  })

<<<<<<< HEAD
  it('should return the hyperbolic arcsin of a bignumber', function () {
=======
  it('should return the hyperbolic arcsin of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const arg = Big(-2)
    assert.deepStrictEqual(asinhBig(arg), Big('-1.4436354751788103425'))
    assert.deepStrictEqual(asinhBig(Big(-1)), Big('-0.88137358701954302523'))
    assert.deepStrictEqual(asinhBig(Big(0)), Big(0))
    assert.deepStrictEqual(asinhBig(Big(1)), Big('0.88137358701954302523'))
    assert.deepStrictEqual(asinhBig(Big(2)), Big('1.4436354751788103425'))
    assert.deepStrictEqual(
      asinhBig(bigmath.pi).toString(),
      '1.8622957433108482199'
    )

    // Make sure arg was not changed
    assert.deepStrictEqual(arg, Big(-2))
  })

<<<<<<< HEAD
  it('should be the inverse function of hyperbolic sin', function () {
=======
  it('should be the inverse function of hyperbolic sin', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(asinh(sinh(-1)), -1)
    approxEqual(asinh(sinh(0)), 0)
    approxEqual(asinh(sinh(0.1)), 0.1)
    approxEqual(asinh(sinh(0.5)), 0.5)
    approxEqual(asinh(sinh(2)), 2)
  })

<<<<<<< HEAD
  it('should be the inverse function of bignumber sinh', function () {
=======
  it('should be the inverse function of bignumber sinh', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(asinhBig(bigmath.sinh(Big(-1))), Big(-1))
    assert.deepStrictEqual(asinhBig(bigmath.sinh(Big(0))), Big(0))
    assert.deepStrictEqual(asinhBig(bigmath.sinh(Big(0.5))), Big(0.5))
    assert.deepStrictEqual(asinhBig(bigmath.sinh(Big(2))), Big(2))

    /* Pass in more digits to pi. */
    assert.deepStrictEqual(
      asinhBig(biggermath.sinh(Big(0.1))),
      Big('0.099999999999999999996')
    )
  })

<<<<<<< HEAD
  it('should return the arcsinh of a complex number', function () {
=======
  it('should return the arcsinh of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      asinh(complex('2+3i')),
      complex(1.9686379257931, 0.9646585044076028)
    )
    approxDeepEqual(
      asinh(complex('2-3i')),
      complex(1.9686379257931, -0.9646585044076028)
    )
    approxDeepEqual(
      asinh(complex('-2+3i')),
      complex(-1.9686379257931, 0.9646585044076028)
    )
    approxDeepEqual(
      asinh(complex('-2-3i')),
      complex(-1.9686379257931, -0.9646585044076028)
    )
    approxDeepEqual(
      asinh(complex('1+i')),
      complex(1.0612750619050357, 0.6662394324925153)
    )
    approxDeepEqual(asinh(complex('i')), complex(0, pi / 2))
    approxDeepEqual(asinh(complex('1')), complex(0.881373587019543025, 0))
    assert.deepStrictEqual(asinh(complex('0')), complex(0, 0))
  })

<<<<<<< HEAD
  it('should throw an error if called with a unit', function () {
    assert.throws(function () {
      asinh(unit('45deg'))
    })
    assert.throws(function () {
=======
  it('should throw an error if called with a unit', function (): void {
    assert.throws(function (): void {
      asinh(unit('45deg'))
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      asinh(unit('5 celsius'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if called with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      asinh('string')
    })
  })

<<<<<<< HEAD
  it('should not operate on arrays and matrices', function () {
=======
  it('should not operate on arrays and matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => asinh([1, 2, 3]), TypeError)
    assert.throws(() => asinh(matrix([1, 2, 3])), TypeError)
    const asinh123 = [
      0.881373587019543025, 1.4436354751788103, 1.8184464592320668
    ]
    approxDeepEqual(math.map([1, 2, 3], asinh), asinh123)
    approxDeepEqual(math.map(matrix([1, 2, 3]), asinh), matrix(asinh123))
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      asinh()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      asinh()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      asinh(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX asinh', function () {
=======
  it('should LaTeX asinh', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('asinh(2)')
    assert.strictEqual(expression.toTex(), '\\sinh^{-1}\\left(2\\right)')
  })
})
