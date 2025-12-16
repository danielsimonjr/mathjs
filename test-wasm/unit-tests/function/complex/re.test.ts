<<<<<<< HEAD
// @ts-nocheck
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

describe('re', function () {
  it('should return the real part of a complex number', function () {
=======
/**
 * Test for re - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

describe('re', function (): void {
  it('should return the real part of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.re(math.complex(2, 3)), 2)
    assert.strictEqual(math.re(math.complex(-2, -3)), -2)
    assert.strictEqual(math.re(math.i), 0)
  })

<<<<<<< HEAD
  it('should return the real part of a real number', function () {
    assert.strictEqual(math.re(2), 2)
  })

  it('should return the real part of a big number', function () {
    assert.deepStrictEqual(math.re(math.bignumber(2)), math.bignumber(2))
  })

  it('should return the real part of a boolean', function () {
=======
  it('should return the real part of a real number', function (): void {
    assert.strictEqual(math.re(2), 2)
  })

  it('should return the real part of a big number', function (): void {
    assert.deepStrictEqual(math.re(math.bignumber(2)), math.bignumber(2))
  })

  it('should return the real part of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.re(true), 1)
    assert.strictEqual(math.re(false), 0)
  })

<<<<<<< HEAD
  it('should return the real part for each element in a matrix', function () {
=======
  it('should return the real part for each element in a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.re([2, math.complex('3-6i')]), [2, 3])
    assert.deepStrictEqual(
      math.re(math.matrix([2, math.complex('3-6i')])).valueOf(),
      [2, 3]
    )
  })

<<<<<<< HEAD
  it('should throw an error when called with an unsupported type of argument', function () {
    assert.throws(function () {
      math.re(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error when called with an unsupported type of argument', function (): void {
    assert.throws(function (): void {
      math.re(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.re(math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      math.re()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.re()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.re(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX re', function () {
=======
  it('should LaTeX re', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('re(1+i)')
    assert.strictEqual(
      expression.toTex(),
      '\\Re\\left\\lbrace1+ i\\right\\rbrace'
    )
  })
})
