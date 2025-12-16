<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for arg - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'
const arg = math.arg

<<<<<<< HEAD
describe('arg', function () {
  it('should compute the argument of a boolean', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('arg', function (): void {
  it('should compute the argument of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(arg(true), 0)
    assert.strictEqual(arg(false), 0)
  })

<<<<<<< HEAD
  it('should compute the argument of a number', function () {
=======
  it('should compute the argument of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(arg(1), 0)
    assert.strictEqual(arg(2), 0)
    assert.strictEqual(arg(0), 0)
    approxEqual(arg(-2), 3.141592653589793)
  })

<<<<<<< HEAD
  it('should compute the argument of a bignumber', function () {
=======
  it('should compute the argument of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(arg(math.bignumber(1)), math.bignumber(0))
    assert.deepStrictEqual(
      arg(math.bignumber(-2)),
      math.bignumber(
        '3.141592653589793238462643383279502884197169399375105820974944592'
      )
    )
  })

<<<<<<< HEAD
  it('should compute the argument of a complex number correctly', function () {
=======
  it('should compute the argument of a complex number correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(arg(math.complex('0')) / math.pi, 0)
    assert.strictEqual(arg(math.complex('1 + 0i')) / math.pi, 0)
    assert.strictEqual(arg(math.complex('1 + i')) / math.pi, 0.25)
    assert.strictEqual(arg(math.complex('0 + i')) / math.pi, 0.5)
    assert.strictEqual(arg(math.complex('-1 + i')) / math.pi, 0.75)
    assert.strictEqual(arg(math.complex('-1 + 0i')) / math.pi, 1)
    assert.strictEqual(arg(math.complex('-1 - i')) / math.pi, -0.75)
    assert.strictEqual(arg(math.complex('0 - i')) / math.pi, -0.5)
    assert.strictEqual(arg(math.complex('1 - i')) / math.pi, -0.25)
    assert.strictEqual(arg(math.i) / math.pi, 0.5)
  })

<<<<<<< HEAD
  it('should calculate the argument for each element in a matrix', function () {
=======
  it('should calculate the argument for each element in a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.divide(
        arg([math.i, math.unaryMinus(math.i), math.add(1, math.i)]),
        math.pi
      ),
      [0.5, -0.5, 0.25]
    )
    assert.deepStrictEqual(
      math
        .matrix(
          math.divide(
            arg([math.i, math.unaryMinus(math.i), math.add(1, math.i)]),
            math.pi
          )
        )
        .valueOf(),
      [0.5, -0.5, 0.25]
    )
  })

<<<<<<< HEAD
  it('should compute the argument of a real number correctly', function () {
=======
  it('should compute the argument of a real number correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(arg(2) / math.pi, 0)
    assert.strictEqual(arg(-2) / math.pi, 1)
  })

<<<<<<< HEAD
  it('should throw an error if used with a string', function () {
    assert.throws(function () {
=======
  it('should throw an error if used with a string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      arg('string')
    })
  })

<<<<<<< HEAD
  it('should throw an error if used with a unit', function () {
    assert.throws(function () {
=======
  it('should throw an error if used with a unit', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      arg(math.unit('5cm'))
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      arg()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      arg()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      arg(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX arg', function () {
=======
  it('should LaTeX arg', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('arg(1+i)')
    assert.strictEqual(expression.toTex(), '\\arg\\left(1+ i\\right)')
  })
})
