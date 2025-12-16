<<<<<<< HEAD
// @ts-nocheck
// test bitNot
=======
/**
 * Test for bitNot - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const bitNot = math.bitNot

<<<<<<< HEAD
describe('bitNot', function () {
  it('should return bitwise not of a boolean', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('bitNot', function (): void {
  it('should return bitwise not of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(bitNot(true), -2)
    assert.strictEqual(bitNot(false), -1)
  })

<<<<<<< HEAD
  it('should perform bitwise not of a number', function () {
=======
  it('should perform bitwise not of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(bitNot(2), -3)
    assert.deepStrictEqual(bitNot(-2), 1)
    assert.deepStrictEqual(bitNot(0), -1)
  })

<<<<<<< HEAD
  it('should perform bitwise not of a bigint', function () {
=======
  it('should perform bitwise not of a bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(bitNot(2n), -3n)
    assert.deepStrictEqual(bitNot(-2n), 1n)
    assert.deepStrictEqual(bitNot(0n), -1n)
  })

<<<<<<< HEAD
  it('should perform bitwise not of a bignumber', function () {
=======
  it('should perform bitwise not of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(bitNot(bignumber(2)), bignumber(-3))
    assert.deepStrictEqual(bitNot(bignumber(-2)), bignumber(1))
    assert.deepStrictEqual(
      bitNot(bignumber('1.2345e30')),
      bignumber('-1234500000000000000000000000001')
    )
  })

<<<<<<< HEAD
  it('should throw an error if the parameters are not integers', function () {
    assert.throws(function () {
      bitNot(1.1)
    }, /Integer expected in function bitNot/)
    assert.throws(function () {
=======
  it('should throw an error if the parameters are not integers', function (): void {
    assert.throws(function (): void {
      bitNot(1.1)
    }, /Integer expected in function bitNot/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitNot(bignumber(1.1))
    }, /Integer expected in function bitNot/)
  })

<<<<<<< HEAD
  it('should throw an error if used with a unit', function () {
    assert.throws(function () {
=======
  it('should throw an error if used with a unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitNot(math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should perform element-wise bitwise not on a matrix', function () {
=======
  it('should perform element-wise bitwise not on a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a2 = math.matrix([
      [1, 2],
      [3, 4]
    ])
    const a7 = bitNot(a2)
    assert.ok(a7 instanceof math.Matrix)
    assert.deepStrictEqual(a7.size(), [2, 2])
    assert.deepStrictEqual(a7.valueOf(), [
      [-2, -3],
      [-4, -5]
    ])
  })

<<<<<<< HEAD
  it('should perform element-wise bitwise not on an array', function () {
=======
  it('should perform element-wise bitwise not on an array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      bitNot([
        [1, 2],
        [3, 4]
      ]),
      [
        [-2, -3],
        [-4, -5]
      ]
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      bitNot()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      bitNot()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitNot(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of argument', function () {
    assert.throws(function () {
      bitNot(null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      bitNot(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of argument', function (): void {
    assert.throws(function (): void {
      bitNot(null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitNot(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitNot(undefined)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX bitNot', function () {
    const expression = math.parse('bitNot(4)')
=======
  it('should LaTeX bitNot', function (): void {
    const expression = math.parse('bitNot(4)') as MathNode
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(expression.toTex(), '\\~\\left(4\\right)')
  })
})
