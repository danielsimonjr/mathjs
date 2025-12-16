<<<<<<< HEAD
// @ts-nocheck
// test exp
=======
/**
 * Test for log10 - AssemblyScript-friendly TypeScript
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
const mathPredictable = math.create({ predictable: true })
const complex = math.complex
const matrix = math.matrix
const unit = math.unit
const log10 = math.log10

<<<<<<< HEAD
describe('log10', function () {
  it('should return the log base 10 of a boolean', function () {
=======
describe('log10', function (): void {
  it('should return the log base 10 of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(log10(true), 0)
    assert.strictEqual(log10(false), -Infinity)
  })

<<<<<<< HEAD
  it('should return the log base 10 of positive numbers', function () {
=======
  it('should return the log base 10 of positive numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(log10(1), 0)
    approxDeepEqual(log10(2), 0.301029995663981)
    approxDeepEqual(log10(3), 0.477121254719662)

    approxDeepEqual(log10(0.01), -2)
    approxDeepEqual(log10(0.1), -1)
    approxDeepEqual(log10(1), 0)
    approxDeepEqual(log10(10), 1)
    approxDeepEqual(log10(100), 2)
    approxDeepEqual(log10(1000), 3)
  })

<<<<<<< HEAD
  it('should return the log base 10 of negative numbers', function () {
=======
  it('should return the log base 10 of negative numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      log10(-1),
      complex('0.000000000000000 + 1.364376353841841i')
    )
    approxDeepEqual(
      log10(-2),
      complex('0.301029995663981 + 1.364376353841841i')
    )
    approxDeepEqual(
      log10(-3),
      complex('0.477121254719662 + 1.364376353841841i')
    )
  })

<<<<<<< HEAD
  it('should return the log base 10 of negative numbers with predicable:true', function () {
=======
  it('should return the log base 10 of negative numbers with predicable:true', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(typeof mathPredictable.log10(-1), 'number')
    assert(isNaN(mathPredictable.log10(-1)))
  })

<<<<<<< HEAD
  it('should return the log base 10 of zero', function () {
    approxDeepEqual(log10(0), -Infinity)
  })

  it('should return the log of positive bignumbers', function () {
=======
  it('should return the log base 10 of zero', function (): void {
    approxDeepEqual(log10(0), -Infinity)
  })

  it('should return the log of positive bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ precision: 100 })

    assert.deepStrictEqual(
      bigmath.log10(bigmath.bignumber(1)),
      bigmath.bignumber(0)
    )
    assert.deepStrictEqual(
      bigmath.log10(bigmath.bignumber(10)),
      bigmath.bignumber(1)
    )
    assert.deepStrictEqual(
      bigmath.log10(bigmath.bignumber(100)),
      bigmath.bignumber(2)
    )
    assert.deepStrictEqual(
      bigmath.log10(bigmath.bignumber(1000)),
      bigmath.bignumber(3)
    ) // note: this gives a round-off error with regular numbers
    assert.deepStrictEqual(
      bigmath.log10(bigmath.bignumber(10000)),
      bigmath.bignumber(4)
    )
    assert.deepStrictEqual(
      bigmath.log10(bigmath.bignumber('1e500')),
      bigmath.bignumber(500)
    )
  })

<<<<<<< HEAD
  it('should return the log of negative bignumbers', function () {
=======
  it('should return the log of negative bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ precision: 100 })

    approxDeepEqual(
      bigmath.log10(bigmath.bignumber(-1)),
      bigmath.complex('0.000000000000000 + 1.364376353841841i')
    )
    approxDeepEqual(
      bigmath.log10(bigmath.bignumber(-2)),
      bigmath.complex('0.301029995663981 + 1.364376353841841i')
    )
    approxDeepEqual(
      bigmath.log10(bigmath.bignumber(-3)),
      bigmath.complex('0.477121254719662 + 1.364376353841841i')
    )
  })

<<<<<<< HEAD
  it('should return the log of a bignumber with value zero', function () {
=======
  it('should return the log of a bignumber with value zero', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ precision: 100 })

    assert.deepStrictEqual(
      bigmath.log10(bigmath.bignumber(0)).toString(),
      '-Infinity'
    )
  })

<<<<<<< HEAD
  it('should throw an error if used with a wrong number of arguments', function () {
    assert.throws(function () {
      log10()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error if used with a wrong number of arguments', function (): void {
    assert.throws(function (): void {
      log10()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      log10(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      log10(null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should return the log base 10 of a complex number', function () {
=======
  it('should return the log base 10 of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      log10(complex(0, 1)),
      complex('0.000000000000000 + 0.682188176920921i')
    )
    approxDeepEqual(
      log10(complex(0, -1)),
      complex('0.000000000000000 - 0.682188176920921i')
    )
    approxDeepEqual(
      log10(complex(1, 1)),
      complex('0.150514997831991 + 0.341094088460460i')
    )
    approxDeepEqual(
      log10(complex(1, -1)),
      complex('0.150514997831991 - 0.341094088460460i')
    )
    approxDeepEqual(
      log10(complex(-1, -1)),
      complex('0.150514997831991 - 1.023282265381381i')
    )
    approxDeepEqual(
      log10(complex(-1, 1)),
      complex('0.150514997831991 + 1.023282265381381i')
    )
    approxDeepEqual(log10(complex(1, 0)), complex(0, 0))
  })

<<<<<<< HEAD
  it('should return the log base 10 of a large bigint', function () {
=======
  it('should return the log base 10 of a large bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const ten16 = 10000000000000000n
    assert.strictEqual(log10(ten16), 16)
  })

<<<<<<< HEAD
  it('should throw an error when used on a unit', function () {
    assert.throws(function () {
=======
  it('should throw an error when used on a unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      log10(unit('5cm'))
    })
  })

<<<<<<< HEAD
  it('should throw an error when used on a string', function () {
    assert.throws(function () {
=======
  it('should throw an error when used on a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      log10('text')
    })
  })

<<<<<<< HEAD
  it('should return the log base 10 of each element of a matrix', function () {
=======
  it('should return the log base 10 of each element of a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const res = [0, 0.301029995663981, 0.477121254719662, 0.602059991327962]
    approxDeepEqual(log10([1, 2, 3, 4]), res)
    approxDeepEqual(log10(matrix([1, 2, 3, 4])), matrix(res))
    approxDeepEqual(
      math.divide(log10(matrix([1, 2, 3, 4])), math.LOG10E),
      matrix([0, 0.693147180559945, 1.09861228866811, 1.386294361119891])
    )
    approxDeepEqual(
      log10(
        matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      matrix([
        [0, 0.301029995663981],
        [0.477121254719662, 0.602059991327962]
      ])
    )
  })

<<<<<<< HEAD
  it('should LaTeX log10', function () {
=======
  it('should LaTeX log10', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('log10(10)')
    assert.strictEqual(expression.toTex(), '\\log_{10}\\left(10\\right)')
  })
})
