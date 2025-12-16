<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for csc - AssemblyScript-friendly TypeScript
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
const csc = math.csc
const bigmath = math.create({ number: 'BigNumber', precision: 20 })

<<<<<<< HEAD
describe('csc', function () {
  it('should return the cosecant of a boolean', function () {
=======
describe('csc', function (): void {
  it('should return the cosecant of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(csc(true), 1.18839510577812)
    approxEqual(csc(false), Infinity)
  })

<<<<<<< HEAD
  it('should return the cosecant of a number', function () {
=======
  it('should return the cosecant of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(1 / csc(0), 0)
    approxEqual(1 / csc((pi * 1) / 4), 0.707106781186548)
    approxEqual(1 / csc((pi * 1) / 8), 0.38268343236509)
    approxEqual(1 / csc((pi * 2) / 4), 1)
    approxEqual(1 / csc((pi * 3) / 4), 0.707106781186548)
    approxEqual(1 / csc((pi * 4) / 4), 0)
    approxEqual(1 / csc((pi * 5) / 4), -0.707106781186548)
    approxEqual(1 / csc((pi * 6) / 4), -1)
    approxEqual(1 / csc((pi * 7) / 4), -0.707106781186548)
    approxEqual(1 / csc((pi * 8) / 4), 0)
    approxEqual(1 / csc(pi / 4), math.sqrt(2) / 2)
  })

<<<<<<< HEAD
  it('should return the cosecant of a bignumber', function () {
=======
  it('should return the cosecant of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const Big = bigmath.bignumber
    const bigPi = bigmath.pi
    const sqrt2 = bigmath.SQRT2.toString()

    assert.deepStrictEqual(bigmath.csc(Big(0)).toString(), 'Infinity')
    assert.deepStrictEqual(
      bigmath.csc(bigPi.div(8)).toString(),
      '2.6131259297527530557'
    )
    assert.deepStrictEqual(bigmath.csc(bigPi.div(4)).toString(), sqrt2)
    assert.deepStrictEqual(bigmath.csc(bigPi.div(2)).toString(), '1')
    assert.deepStrictEqual(bigmath.csc(bigPi), Big('-26769019461318409709')) // large number (about infinity)
    assert.deepStrictEqual(bigmath.csc(bigPi.times(3).div(2)).toString(), '-1')
  })

<<<<<<< HEAD
  it('should return the cosecant of a complex number', function () {
=======
  it('should return the cosecant of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const re = 0.0904732097532074
    const im = 0.0412009862885741
    approxDeepEqual(csc(complex('2+3i')), complex(re, im))
    approxDeepEqual(csc(complex('2-3i')), complex(re, -im))
    approxDeepEqual(csc(complex('-2+3i')), complex(-re, im))
    approxDeepEqual(csc(complex('-2-3i')), complex(-re, -im))
    approxDeepEqual(csc(complex('i')), complex(0, -0.850918128239322))
    approxDeepEqual(csc(complex('1')), complex(1.18839510577812, 0))
    approxDeepEqual(
      csc(complex('1+i')),
      complex(0.621518017170428, -0.303931001628426)
    )
  })

<<<<<<< HEAD
  it('should return the cosecant of an angle', function () {
=======
  it('should return the cosecant of an angle', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(csc(unit('45deg')), 1.4142135623731)
    approxEqual(csc(unit('-45deg')), -1.4142135623731)

    assert(math.isBigNumber(csc(unit(math.bignumber(45), 'deg'))))
    approxEqual(
      csc(unit(math.bignumber(45), 'deg')).toNumber(),
      1.4142135623731
    )

    approxDeepEqual(
      csc(unit(complex('1+i'), 'rad')),
      complex(0.621518017170428, -0.303931001628426)
    )
  })

<<<<<<< HEAD
  it('should throw an error if called with an invalid unit', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with an invalid unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      csc(unit('5 celsius'))
    })
  })

<<<<<<< HEAD
  it('should throw an error if called with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      csc('string')
    })
  })

  const csc123 = [1.18839510577812, 1.09975017029462, 7.08616739573719]

<<<<<<< HEAD
  it('should not operate on an array', function () {
=======
  it('should not operate on an array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => csc([1, 2, 3]), TypeError)
    approxDeepEqual(math.map([1, 2, 3], csc), csc123)
  })

<<<<<<< HEAD
  it('should not operate on a matrix', function () {
=======
  it('should not operate on a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => csc(matrix([1, 2, 3])), TypeError)
    approxDeepEqual(math.map(matrix([1, 2, 3]), csc), matrix(csc123))
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      csc()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      csc()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      csc(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX csc', function () {
=======
  it('should LaTeX csc', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('csc(1)')
    assert.strictEqual(expression.toTex(), '\\csc\\left(1\\right)')
  })
})
