<<<<<<< HEAD
// @ts-nocheck
// test invmod
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const { invmod, complex, bignumber } = math

describe('invmod', function () {
  it('should find the multiplicative inverse for basic cases', function () {
=======
/**
 * Test for invmod - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
const { invmod, complex, bignumber } = math

describe('invmod', function (): void {
  it('should find the multiplicative inverse for basic cases', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(invmod(2, 7), 4)
    assert.strictEqual(invmod(3, 11), 4)
    assert.strictEqual(invmod(10, 17), 12)
  })

<<<<<<< HEAD
  it('should return NaN when there is no multiplicative inverse', function () {
=======
  it('should return NaN when there is no multiplicative inverse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert(isNaN(invmod(3, 15)))
    assert(isNaN(invmod(14, 7)))
    assert(isNaN(invmod(42, 1200)))
  })

<<<<<<< HEAD
  it('should work when a≥b', function () {
=======
  it('should work when a≥b', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(invmod(4, 3), 1)
    assert(isNaN(invmod(7, 7)))
  })

<<<<<<< HEAD
  it('should work for negative values', function () {
=======
  it('should work for negative values', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(invmod(-2, 7), 3)
    assert.strictEqual(invmod(-2000000, 21), 10)
  })

<<<<<<< HEAD
  it('should calculate invmod for BigNumbers', function () {
=======
  it('should calculate invmod for BigNumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(invmod(bignumber(13), bignumber(25)), bignumber(2))
    assert.deepStrictEqual(invmod(bignumber(-7), bignumber(48)), bignumber(41))
  })

<<<<<<< HEAD
  it('should calculate invmod for mixed BigNumbers and Numbers', function () {
=======
  it('should calculate invmod for mixed BigNumbers and Numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(invmod(bignumber(44), 7), bignumber(4))
    assert.deepStrictEqual(invmod(4, math.bignumber(15)), bignumber(4))
  })

<<<<<<< HEAD
  it('should throw an error if b is zero', function () {
    assert.throws(function () {
=======
  it('should throw an error if b is zero', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      invmod(1, 0)
    }, /Divisor must be non zero/)
  })

<<<<<<< HEAD
  it('should throw an error if only one argument', function () {
    assert.throws(function () {
=======
  it('should throw an error if only one argument', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      invmod(1)
    }, /TypeError: Too few arguments/)
  })

<<<<<<< HEAD
  it('should throw an error for non-integer numbers', function () {
    assert.throws(function () {
      invmod(2, 4.1)
    }, /Parameters in function invmod must be integer numbers/)
    assert.throws(function () {
=======
  it('should throw an error for non-integer numbers', function (): void {
    assert.throws(function (): void {
      invmod(2, 4.1)
    }, /Parameters in function invmod must be integer numbers/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      invmod(2.3, 4)
    }, /Parameters in function invmod must be integer numbers/)
  })

<<<<<<< HEAD
  it('should throw an error with complex numbers', function () {
    assert.throws(function () {
=======
  it('should throw an error with complex numbers', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      invmod(complex(1, 3), 2)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should convert strings to numbers', function () {
=======
  it('should convert strings to numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(invmod('7', '15'), 13)
    assert.strictEqual(invmod(7, '15'), 13)
    assert.strictEqual(invmod('7', 15), 13)

<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      invmod('a', 8)
    }, /Cannot convert "a" to a number/)
  })

<<<<<<< HEAD
  it('should throw an error with units', function () {
    assert.throws(function () {
=======
  it('should throw an error with units', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      invmod(math.unit('5cm'), 2)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX invmod', function () {
=======
  it('should LaTeX invmod', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('invmod(2,3)')
    assert.strictEqual(expression.toTex(), '\\mathrm{invmod}\\left(2,3\\right)')
  })
})
