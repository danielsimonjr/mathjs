<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for cot - AssemblyScript-friendly TypeScript
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
const cot = math.cot
const bigmath = math.create({ number: 'BigNumber', precision: 20 })

<<<<<<< HEAD
describe('cot', function () {
  it('should return the cotan of a boolean', function () {
=======
describe('cot', function (): void {
  it('should return the cotan of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(cot(true), 0.642092615934331)
    approxEqual(cot(false), Infinity)
  })

<<<<<<< HEAD
  it('should return the cotan of a number', function () {
=======
  it('should return the cotan of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(cot(0), Infinity)
    approxEqual(1 / cot((pi * 1) / 8), 0.414213562373095)
    approxEqual(1 / cot((pi * 1) / 4), 1)
    approxEqual(cot((pi * 2) / 4), 0)
    approxEqual(1 / cot((pi * 3) / 4), -1)
    approxEqual(1 / cot((pi * 4) / 4), 0)
    approxEqual(1 / cot((pi * 5) / 4), 1)
    approxEqual(cot((pi * 6) / 4), 0)
    approxEqual(1 / cot((pi * 7) / 4), -1)
    approxEqual(1 / cot((pi * 8) / 4), 0)
  })

<<<<<<< HEAD
  it('should return the cotan of a bignumber', function () {
=======
  it('should return the cotan of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const Big = bigmath.bignumber
    const bigPi = bigmath.pi

    const arg1 = Big(0)
    const result1 = bigmath.cot(arg1)
    assert.ok(!result1.isFinite())
    assert.strictEqual(result1.constructor.precision, 20)
    assert.deepStrictEqual(arg1, Big(0))

    const result2 = bigmath.cot(bigPi.div(8))
    assert.deepStrictEqual(result2.toString(), '2.4142135623730950488')
    assert.strictEqual(result2.constructor.precision, 20)
    assert.strictEqual(bigPi.constructor.precision, 20)

    assert.deepStrictEqual(
      bigmath.cot(bigPi.div(2)),
      Big('-1.4142135623730950488e-15')
    ) // about zero
    assert.deepStrictEqual(bigmath.cot(bigPi), Big('26769019461318409709')) // about infinity
  })

<<<<<<< HEAD
  it('should return the cotan of a complex number', function () {
=======
  it('should return the cotan of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const re = 0.00373971037633696
    const im = 0.99675779656935837
    approxDeepEqual(cot(complex('2+3i')), complex(-re, -im))
    approxDeepEqual(cot(complex('2-3i')), complex(-re, im))
    approxDeepEqual(cot(complex('-2+3i')), complex(re, -im))
    approxDeepEqual(cot(complex('-2-3i')), complex(re, im))
    approxDeepEqual(cot(complex('i')), complex(0, -1.313035285499331))
    approxDeepEqual(cot(complex('1')), complex(0.642092615934331, 0))
    approxDeepEqual(
      cot(complex('1+i')),
      complex(0.217621561854403, -0.868014142895925)
    )
  })

<<<<<<< HEAD
  it('should return the cotan of an angle', function () {
=======
  it('should return the cotan of an angle', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(cot(unit('45deg')), 1)
    approxEqual(cot(unit('-45deg')), -1)

    assert(math.isBigNumber(cot(unit(math.bignumber(45), 'deg'))))
    approxEqual(cot(unit(math.bignumber(45), 'deg')).toNumber(), 1)

    approxDeepEqual(
      cot(math.unit(complex('1+i'), 'rad')),
      complex(0.217621561854403, -0.868014142895925)
    )
  })

<<<<<<< HEAD
  it('should throw an error if called with an invalid unit', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with an invalid unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cot(unit('5 celsius'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if called with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cot('string')
    })
  })

  const cot123 = [0.642092615934331, -0.457657554360286, -7.015252551434534]

<<<<<<< HEAD
  it('should not operate on an array', function () {
=======
  it('should not operate on an array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => cot([1, 2, 3]), TypeError)
    approxDeepEqual(math.map([1, 2, 3], cot), cot123)
  })

<<<<<<< HEAD
  it('should not operate on a matrix', function () {
=======
  it('should not operate on a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => cot(matrix([1, 2, 3])), TypeError)
    approxDeepEqual(math.map(matrix([1, 2, 3]), cot), matrix(cot123))
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      cot()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      cot()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cot(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX cot', function () {
=======
  it('should LaTeX cot', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('cot(1)')
    assert.strictEqual(expression.toTex(), '\\cot\\left(1\\right)')
  })
})
