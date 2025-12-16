<<<<<<< HEAD
// @ts-nocheck
// test expm1
=======
/**
 * Test for expm1 - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import { approxEqual, approxDeepEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'
<<<<<<< HEAD
=======

interface MathNode {
  type: string
  toTex(): string
}

>>>>>>> claude/review-sprints-quality-checks-Rlfec
const complex = math.complex
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const expm1 = math.expm1

<<<<<<< HEAD
describe('expm1', function () {
  it('should exponentiate a boolean', function () {
=======
describe('expm1', function (): void {
  it('should exponentiate a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(expm1(true), 1.71828182845905)
    approxEqual(expm1(false), 0)
  })

<<<<<<< HEAD
  it('should exponentiate a number', function () {
=======
  it('should exponentiate a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(expm1(-3), -0.950212931632136)
    approxEqual(expm1(-2), -0.8646647167633873)
    approxEqual(expm1(-1), -0.6321205588285577)
    approxEqual(expm1(0), 0)
    approxEqual(expm1(1), 1.71828182845905)
    approxEqual(expm1(2), 6.38905609893065)
    approxEqual(expm1(3), 19.0855369231877)
    approxEqual(expm1(math.log(100)) + 1, 100)

    // function requirements
    assert.ok(isNaN(expm1(NaN)))
    assert.strictEqual(expm1(+0), 0)
    assert.strictEqual(expm1(-0), -0)
    assert.strictEqual(expm1(+Infinity), Infinity)
    assert.strictEqual(expm1(-Infinity), -1)
  })

<<<<<<< HEAD
  it('should exponentiate a bignumber', function () {
=======
  it('should exponentiate a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ precision: 100 })

    assert.deepStrictEqual(
      bigmath.expm1(bigmath.bignumber(1)),
      bigmath.bignumber(
        '1.718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427'
      )
    )
  })

<<<<<<< HEAD
  it("should throw an error if there's wrong number of arguments", function () {
    assert.throws(function () {
      expm1()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it("should throw an error if there's wrong number of arguments", function (): void {
    assert.throws(function (): void {
      expm1()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      expm1(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should exponentiate a complex number correctly', function () {
=======
  it('should exponentiate a complex number correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      expm1(math.i),
      complex('-0.45969769413186 + 0.841470984807897i')
    )
    approxDeepEqual(
      expm1(complex(0, -1)),
      complex('-0.45969769413186 - 0.841470984807897i')
    )
    approxDeepEqual(
      expm1(complex(1, 1)),
      complex('0.46869393991589 + 2.28735528717884i')
    )
    approxDeepEqual(
      expm1(complex(1, -1)),
      complex('0.46869393991589 - 2.28735528717884i')
    )
    approxDeepEqual(
      expm1(complex(-1, -1)),
      complex('-0.80123388965359 - 0.309559875653112i')
    )
    approxDeepEqual(
      expm1(complex(-1, 1)),
      complex('-0.80123388965359 + 0.309559875653112i')
    )
    approxDeepEqual(expm1(complex(1, 0)), complex('1.71828182845905'))

    // test some logic identities
    const multiply = math.multiply
    const pi = math.pi
    const i = math.i
    approxDeepEqual(expm1(multiply(0.5, multiply(pi, i))), complex(-1, 1))
    approxDeepEqual(expm1(multiply(1, multiply(pi, i))), complex(-2, 0))
    approxDeepEqual(expm1(multiply(1.5, multiply(pi, i))), complex(-1, -1))
    approxDeepEqual(expm1(multiply(2, multiply(pi, i))), complex(0, 0))
    approxDeepEqual(expm1(multiply(-0.5, multiply(pi, i))), complex(-1, -1))
    approxDeepEqual(expm1(multiply(-1, multiply(pi, i))), complex(-2, 0))
    approxDeepEqual(expm1(multiply(-1.5, multiply(pi, i))), complex(-1, 1))
  })

<<<<<<< HEAD
  it('should throw an error on a unit', function () {
    assert.throws(function () {
=======
  it('should throw an error on a unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      expm1(unit('5cm'))
    })
  })

<<<<<<< HEAD
  it('should throw an error with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      expm1('text')
    })
  })

<<<<<<< HEAD
  it('should not operate on matrices, arrays and ranges', function () {
=======
  it('should not operate on matrices, arrays and ranges', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // array
    assert.throws(
      () => expm1([0, 1, 2, 3]),
      /Function 'expm1' doesn't apply to matrices/
    )
    approxDeepEqual(
      math.map([0, 1, 2, 3], expm1),
      [0, 1.71828182845905, 6.38905609893065, 19.0855369231877]
    )
    approxDeepEqual(
      math.map(
        [
          [0, 1],
          [2, 3]
        ],
        expm1
      ),
      [
        [0, 1.71828182845905],
        [6.38905609893065, 19.0855369231877]
      ]
    )
    // dense matrix
    assert.throws(() => expm1(matrix([0, 1, 2, 3])), TypeError)
    approxDeepEqual(
      math.map(matrix([0, 1, 2, 3]), expm1),
      matrix([0, 1.71828182845905, 6.38905609893065, 19.0855369231877])
    )
    approxDeepEqual(
      math.map(
        matrix([
          [0, 1],
          [2, 3]
        ]),
        expm1
      ),
      matrix([
        [0, 1.71828182845905],
        [6.38905609893065, 19.0855369231877]
      ])
    )
    // sparse matrix
    approxDeepEqual(
      math.map(
        sparse([
          [0, 1],
          [2, 3]
        ]),
        expm1
      ),
      sparse([
        [0, 1.71828182845905],
        [6.38905609893065, 19.0855369231877]
      ])
    )
  })

<<<<<<< HEAD
  it('should LaTeX expm1', function () {
=======
  it('should LaTeX expm1', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('expm1(0)')
    assert.strictEqual(expression.toTex(), '\\left(e^{0}-1\\right)')
  })
})
