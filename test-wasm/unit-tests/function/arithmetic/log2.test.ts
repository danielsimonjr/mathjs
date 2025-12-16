<<<<<<< HEAD
// @ts-nocheck
// test exp
=======
/**
 * Test for log2 - AssemblyScript-friendly TypeScript
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
const log2 = math.log2

<<<<<<< HEAD
describe('log2', function () {
  it('should return the log base 2 of a boolean', function () {
=======
describe('log2', function (): void {
  it('should return the log base 2 of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(log2(true), 0)
    assert.strictEqual(log2(false), -Infinity)
  })

<<<<<<< HEAD
  it('should return the log base 2 of positive numbers', function () {
=======
  it('should return the log base 2 of positive numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(log2(1), 0)
    assert.strictEqual(log2(2), 1)
    approxDeepEqual(log2(3), 1.584962500721156)

    assert.strictEqual(log2(0.25), -2)
    assert.strictEqual(log2(0.5), -1)
    assert.strictEqual(log2(4), 2)
    assert.strictEqual(log2(8), 3)
  })

<<<<<<< HEAD
  it('should return the log base 2 of negative numbers', function () {
=======
  it('should return the log base 2 of negative numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(log2(-1), complex('0.000000000000000 + 4.532360141827194i'))
    approxDeepEqual(log2(-2), complex('1 + 4.532360141827194i'))
    approxDeepEqual(log2(-3), complex('1.584962500721156 + 4.532360141827194i'))
  })

<<<<<<< HEAD
  it('should return the log base 2 of negative numbers with predicable:true', function () {
=======
  it('should return the log base 2 of negative numbers with predicable:true', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(typeof mathPredictable.log2(-1), 'number')
    assert(isNaN(mathPredictable.log2(-1)))
  })

<<<<<<< HEAD
  it('should return the log base 2 of zero', function () {
    approxDeepEqual(log2(0), -Infinity)
  })

  it('should return the log of positive bignumbers', function () {
=======
  it('should return the log base 2 of zero', function (): void {
    approxDeepEqual(log2(0), -Infinity)
  })

  it('should return the log of positive bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ precision: 100 })

    assert.deepStrictEqual(
      bigmath.log2(bigmath.bignumber(1)),
      bigmath.bignumber(0)
    )
    assert.deepStrictEqual(
      bigmath.log2(bigmath.bignumber(2)),
      bigmath.bignumber(1)
    )
    assert.deepStrictEqual(
      bigmath.log2(bigmath.bignumber(4)),
      bigmath.bignumber(2)
    )
    assert.deepStrictEqual(
      bigmath.log2(bigmath.bignumber(8)),
      bigmath.bignumber(3)
    )
    assert.deepStrictEqual(
      bigmath.log2(bigmath.bignumber(16)),
      bigmath.bignumber(4)
    )
    assert.deepStrictEqual(
      bigmath.log2(bigmath.bignumber(2).pow(500)),
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
      bigmath.log2(bigmath.bignumber(-1)),
      bigmath.complex('0.000000000000000 + 4.532360141827194i')
    )
    approxDeepEqual(
      bigmath.log2(bigmath.bignumber(-2)),
      bigmath.complex('1 + 4.532360141827194i')
    )
    approxDeepEqual(
      bigmath.log2(bigmath.bignumber(-3)),
      bigmath.complex('1.584962500721156 + 4.532360141827194i')
    )
  })

<<<<<<< HEAD
  it('should return the log of a bignumber with value zero', function () {
=======
  it('should return the log of a bignumber with value zero', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ precision: 100 })

    assert.deepStrictEqual(
      bigmath.log2(bigmath.bignumber(0)).toString(),
      '-Infinity'
    )
  })

<<<<<<< HEAD
  it('should throw an error if used with a wrong number of arguments', function () {
    assert.throws(function () {
      log2()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error if used with a wrong number of arguments', function (): void {
    assert.throws(function (): void {
      log2()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      log2(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should return the log base 2 of a complex number', function () {
=======
  it('should return the log base 2 of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(log2(complex(0, 1)), complex('2.2661800709135i'))
    approxDeepEqual(log2(complex(0, -1)), complex('-2.2661800709135i'))
    approxDeepEqual(
      log2(complex(1, 1)),
      complex('0.500000000000000 + 1.1330900354567985i')
    )
    approxDeepEqual(
      log2(complex(1, -1)),
      complex('0.500000000000000 - 1.1330900354567985i')
    )
    approxDeepEqual(
      log2(complex(-1, -1)),
      complex('0.500000000000000 - 3.399270106370395i')
    )
    approxDeepEqual(
      log2(complex(-1, 1)),
      complex('0.500000000000000 + 3.399270106370395i')
    )
    approxDeepEqual(log2(complex(1, 0)), complex(0, 0))
  })

<<<<<<< HEAD
  it('should return the log base two of a large bigint', function () {
=======
  it('should return the log base two of a large bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const two70 = 2n ** 70n
    assert.strictEqual(log2(two70), 70)
  })

<<<<<<< HEAD
  it('should throw an error when used on a unit', function () {
    assert.throws(function () {
=======
  it('should throw an error when used on a unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      log2(unit('5cm'))
    })
  })

<<<<<<< HEAD
  it('should throw an error when used on a string', function () {
    assert.throws(function () {
=======
  it('should throw an error when used on a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      log2('text')
    })
  })

<<<<<<< HEAD
  it('should return the log base 2 of each element of a matrix', function () {
=======
  it('should return the log base 2 of each element of a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const res = [0, 1, 1.584962500721156, 2]
    approxDeepEqual(log2([1, 2, 3, 4]), res)
    approxDeepEqual(log2(matrix([1, 2, 3, 4])), matrix(res))
    approxDeepEqual(
      math.divide(log2(matrix([1, 2, 3, 4])), math.LOG2E),
      matrix([0, 0.693147180559945, 1.09861228866811, 1.386294361119891])
    )
    approxDeepEqual(
      log2(
        matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      matrix([
        [0, 1],
        [1.584962500721156, 2]
      ])
    )
  })

<<<<<<< HEAD
  it('should LaTeX log2', function () {
=======
  it('should LaTeX log2', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('log2(10)')
    assert.strictEqual(expression.toTex(), '\\log_{2}\\left(10\\right)')
  })
})
