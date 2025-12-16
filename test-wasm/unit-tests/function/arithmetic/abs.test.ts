<<<<<<< HEAD
// @ts-nocheck
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const { abs, bignumber, complex, fraction, matrix, Matrix, unit, parse } = math

describe('abs', function () {
  it('should return the abs value of a boolean', function () {
=======
/**
 * Test for abs - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

const { abs, bignumber, complex, fraction, matrix, Matrix, unit, parse } = math

describe('abs', function (): void {
  it('should return the abs value of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(abs(true), 1)
    assert.strictEqual(abs(false), 0)
  })

<<<<<<< HEAD
  it('should not support null', function () {
    assert.throws(function () {
=======
  it('should not support null', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      abs(null)
    }, /Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should return the abs value of a number', function () {
=======
  it('should return the abs value of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(abs(-4.2), 4.2)
    assert.strictEqual(abs(-3.5), 3.5)
    assert.strictEqual(abs(100), 100)
    assert.strictEqual(abs(0), 0)
  })

<<<<<<< HEAD
  it('should return the abs value of a bigint', function () {
=======
  it('should return the abs value of a bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(abs(-4n), 4n)
    assert.strictEqual(abs(4n), 4n)
    assert.strictEqual(abs(0n), 0n)
  })

<<<<<<< HEAD
  it('should return the absolute value of a big number', function () {
=======
  it('should return the absolute value of a big number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(abs(bignumber(-2.3)), bignumber(2.3))
    assert.deepStrictEqual(abs(bignumber('5e500')), bignumber('5e500'))
    assert.deepStrictEqual(abs(bignumber('-5e500')), bignumber('5e500'))
  })

<<<<<<< HEAD
  it('should return the absolute value of a complex number', function () {
=======
  it('should return the absolute value of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(abs(complex(3, -4)), 5)
    assert.strictEqual(abs(complex(1e200, -4e200)), 4.12310562561766e200)
  })

<<<<<<< HEAD
  it('should return the absolute value of a fraction', function () {
=======
  it('should return the absolute value of a fraction', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = fraction('-1/3')
    assert.strictEqual(abs(a).toString(), '0.(3)')
    assert.strictEqual(a.toString(), '-0.(3)')
    assert.strictEqual(abs(fraction('1/3')).toString(), '0.(3)')
  })

<<<<<<< HEAD
  it('should convert a string to a number', function () {
    assert.strictEqual(abs('-2'), 2)
  })

  it('should return the absolute value of all elements in an Array', function () {
=======
  it('should convert a string to a number', function (): void {
    assert.strictEqual(abs('-2'), 2)
  })

  it('should return the absolute value of all elements in an Array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    let a1 = abs([1, -2, 3])
    assert.ok(Array.isArray(a1))
    assert.deepStrictEqual(a1, [1, 2, 3])
    a1 = abs([-2, -1, 0, 1, 2])
    assert.ok(Array.isArray(a1))
    assert.deepStrictEqual(a1, [2, 1, 0, 1, 2])
  })

<<<<<<< HEAD
  it('should return the absolute number of a complex number with zero', function () {
=======
  it('should return the absolute number of a complex number with zero', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(abs(complex(1, 0)), 1)
    assert.strictEqual(abs(complex(0, 1)), 1)
    assert.strictEqual(abs(complex(0, 0)), 0)
    assert.strictEqual(abs(complex(-1, 0)), 1)
    assert.strictEqual(abs(complex(0, -1)), 1)
  })

<<<<<<< HEAD
  it('should return the absolute value of all elements in a matrix', function () {
=======
  it('should return the absolute value of all elements in a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    let a1 = abs(matrix([1, -2, 3]))
    assert.ok(a1 instanceof Matrix)
    assert.deepStrictEqual(a1.size(), [3])
    assert.deepStrictEqual(a1.valueOf(), [1, 2, 3])
    a1 = abs(matrix([-2, -1, 0, 1, 2]))
    assert.ok(a1 instanceof Matrix)
    assert.deepStrictEqual(a1.size(), [5])
    assert.deepStrictEqual(a1.valueOf(), [2, 1, 0, 1, 2])
  })

<<<<<<< HEAD
  it('should return the absolute value of a unit', function () {
=======
  it('should return the absolute value of a unit', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    let u = abs(unit('5 m'))
    assert.strictEqual(u.toString(), '5 m')

    u = abs(unit('-5 m'))
    assert.strictEqual(u.toString(), '5 m')

    u = abs(unit('-283.15 degC'))
    assert.strictEqual(u.toString(), '-263.15 degC')

    u = abs(unit(fraction(2, 3), 'm'))
    assert.strictEqual(u.toString(), '2/3 m')

    u = abs(unit(complex(-4, 3), 'in'))
    assert.strictEqual(u.toString(), '5 in')

    u = abs(unit(-10)) // dimensionless unit
    assert.strictEqual(u.toString(), '10')
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      abs()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      abs()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      abs(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      abs(null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should throw an error in case of unsupported types', function () {
    assert.throws(function () {
      abs(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      abs(null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of unsupported types', function (): void {
    assert.throws(function (): void {
      abs(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      abs(null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      abs(undefined)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX abs', function () {
=======
  it('should LaTeX abs', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = parse('abs(-1)')
    assert.strictEqual(expression.toTex(), '\\left|-1\\right|')
  })
})
