<<<<<<< HEAD
// @ts-nocheck
// test sign
=======
/**
 * Test for sign - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import { approxDeepEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'
<<<<<<< HEAD
=======

interface MathNode {
  type: string
  toTex(): string
}
>>>>>>> claude/review-sprints-quality-checks-Rlfec
const bignumber = math.bignumber
const fraction = math.fraction
const complex = math.complex

<<<<<<< HEAD
describe('sign', function () {
  it('should calculate the sign of a boolean', function () {
=======
describe('sign', function (): void {
  it('should calculate the sign of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.sign(true), 1)
    assert.strictEqual(math.sign(false), 0)
  })

<<<<<<< HEAD
  it('should calculate the sign of a number', function () {
=======
  it('should calculate the sign of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.sign(3), 1)
    assert.strictEqual(math.sign(-3), -1)
    assert.strictEqual(math.sign(0), 0)
  })

<<<<<<< HEAD
  it('should calculate the sign of a bigint', function () {
=======
  it('should calculate the sign of a bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.sign(3n), 1n)
    assert.strictEqual(math.sign(-3n), -1n)
    assert.strictEqual(math.sign(0n), 0n)
  })

<<<<<<< HEAD
  it('should calculate the sign of a big number', function () {
=======
  it('should calculate the sign of a big number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.sign(bignumber(3)), bignumber(1))
    assert.deepStrictEqual(math.sign(bignumber(-3)), bignumber(-1))
    assert.deepStrictEqual(math.sign(bignumber(0)), bignumber(0))
  })

<<<<<<< HEAD
  it('should calculate the sign of a fraction', function () {
=======
  it('should calculate the sign of a fraction', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = fraction(0.5)
    assert(math.sign(a) instanceof math.Fraction)
    assert.strictEqual(math.sign(a).toString(), '1')
    assert.strictEqual(math.sign(fraction(-0.5)).toString(), '-1')
    assert.strictEqual(a.toString(), '0.5')
    assert.deepStrictEqual(math.sign(math.fraction(0)), math.fraction(0))
  })

<<<<<<< HEAD
  it('should calculate the sign of a complex value', function () {
=======
  it('should calculate the sign of a complex value', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      math.sign(math.complex(2, -3)),
      math.complex(0.554700196225229, -0.832050294337844)
    )
  })

<<<<<<< HEAD
  it('should calculate the sign of a unit', function () {
=======
  it('should calculate the sign of a unit', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.sign(math.unit('5 cm')), 1)
    assert.strictEqual(math.sign(math.unit('-5 kg')), -1)
    assert.strictEqual(math.sign(math.unit('0 mol/s')), 0)

    /* sign is ambiguous on units with offset, because you don't know if
     * -3 degC is the difference between two temperatures, in which case
     * it is definitely negative, or an actual temperature of something,
     * in which case it is arguably positive. So actually mathjs should
     * throw an error, which we will test below. Formerly:
     assert.strictEqual(math.sign(math.unit('-283.15 degC')), -1)
     assert.strictEqual(math.sign(math.unit('-273.15 degC')), 0)
     assert.strictEqual(math.sign(math.unit('-263.15 degC')), 1)
    */

    assert.deepStrictEqual(
      math.sign(math.unit(bignumber(5), 'cm')),
      bignumber(1)
    )
    assert.deepStrictEqual(
      math.sign(math.unit(bignumber(-5), 'cm')),
      bignumber(-1)
    )
    assert.deepStrictEqual(math.sign(math.unit(fraction(5), 'cm')), fraction(1))
    assert.deepStrictEqual(
      math.sign(math.unit(fraction(-5), 'cm')),
      fraction(-1)
    )

    assert.deepStrictEqual(
      math.sign(math.unit(complex(3, 4), 'mi')),
      complex(0.6, 0.8)
    )
  })

<<<<<<< HEAD
  it('should throw an error on a valueless unit or a unit with offset', function () {
=======
  it('should throw an error on a valueless unit or a unit with offset', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => math.sign(math.unit('ohm')), TypeError)
    assert.throws(() => math.sign(math.unit('-3 degC')), /ambiguous/)
  })

<<<<<<< HEAD
  it('should throw an error when used with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error when used with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.sign('hello world')
    })
  })

<<<<<<< HEAD
  it('should return a matrix of the signs of each elements in the given array', function () {
    assert.deepStrictEqual(math.sign([-2, -1, 0, 1, 2]), [-1, -1, 0, 1, 1])
  })

  it('should return a matrix of the signs of each elements in the given matrix', function () {
=======
  it('should return a matrix of the signs of each elements in the given array', function (): void {
    assert.deepStrictEqual(math.sign([-2, -1, 0, 1, 2]), [-1, -1, 0, 1, 1])
  })

  it('should return a matrix of the signs of each elements in the given matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.sign(math.matrix([-2, -1, 0, 1, 2])),
      math.matrix([-1, -1, 0, 1, 1])
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.sign()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.sign()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.sign(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.sign(null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  describe('sign(0) should return 0', function () {
    it('number', function () {
      assert.strictEqual(math.sign(0), 0)
    })

    it('bignumber', function () {
      assert.deepStrictEqual(math.sign(math.bignumber(0)), math.bignumber(0))
    })

    it('complex', function () {
=======
  describe('sign(0) should return 0', function (): void {
    it('number', function (): void {
      assert.strictEqual(math.sign(0), 0)
    })

    it('bignumber', function (): void {
      assert.deepStrictEqual(math.sign(math.bignumber(0)), math.bignumber(0))
    })

    it('complex', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(math.sign(math.complex(0)), math.complex(0))
    })
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.sign(null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX sign', function () {
=======
  it('should LaTeX sign', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('sign(-4)')
    assert.strictEqual(expression.toTex(), '\\mathrm{sign}\\left(-4\\right)')
  })
})
