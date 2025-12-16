<<<<<<< HEAD
// @ts-nocheck
// test cube
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for cube - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

>>>>>>> claude/review-sprints-quality-checks-Rlfec
const bignumber = math.bignumber
const fraction = math.fraction
const matrix = math.matrix
const cube = math.cube

<<<<<<< HEAD
describe('cube', function () {
  it('should return the cube of a boolean', function () {
=======
describe('cube', function (): void {
  it('should return the cube of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(cube(true), 1)
    assert.strictEqual(cube(false), 0)
  })

<<<<<<< HEAD
  it('should return the cube of a number', function () {
=======
  it('should return the cube of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(cube(4), 64)
    assert.strictEqual(cube(-2), -8)
    assert.strictEqual(cube(0), 0)
  })

<<<<<<< HEAD
  it('should return the cube of a bigint', function () {
=======
  it('should return the cube of a bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(cube(4n), 64n)
    assert.strictEqual(cube(-2n), -8n)
    assert.strictEqual(cube(0n), 0n)
  })

<<<<<<< HEAD
  it('should return the cube of a big number', function () {
=======
  it('should return the cube of a big number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(cube(bignumber(4)), bignumber(64))
    assert.deepStrictEqual(cube(bignumber(-2)), bignumber(-8))
    assert.deepStrictEqual(cube(bignumber(0)), bignumber(0))
  })

<<<<<<< HEAD
  it('should return the cube of a fraction', function () {
=======
  it('should return the cube of a fraction', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = fraction(0.5)
    assert(cube(a) instanceof math.Fraction)
    assert.strictEqual(cube(a).toString(), '0.125')
    assert.strictEqual(a.toString(), '0.5')
  })

<<<<<<< HEAD
  it('should return the cube of a complex number', function () {
=======
  it('should return the cube of a complex number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(cube(math.complex('2i')), math.complex(-0, -8))
    assert.deepStrictEqual(cube(math.complex('2+3i')), math.complex('-46+9i'))
    assert.deepStrictEqual(cube(math.complex('2')), math.complex('8'))
  })

<<<<<<< HEAD
  it('should return the cube of a unit', function () {
=======
  it('should return the cube of a unit', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(cube(math.unit('4 cm')).toString(), '64 cm^3')
    assert.strictEqual(cube(math.unit('-2 cm')).toString(), '-8 cm^3')
    assert.strictEqual(cube(math.unit('0 cm')).toString(), '0 cm^3')
  })

<<<<<<< HEAD
  it('should throw an error with strings', function () {
    assert.throws(function () {
=======
  it('should throw an error with strings', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cube('text')
    })
  })

<<<<<<< HEAD
  it("should throw an error if there's wrong number of args", function () {
    assert.throws(function () {
      cube()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it("should throw an error if there's wrong number of args", function (): void {
    assert.throws(function (): void {
      cube()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cube(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cube(null)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should not operate on a matrix, array or range', function () {
=======
  it('should not operate on a matrix, array or range', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(() => cube([2, 3, 4, 5]), TypeError)
    assert.throws(() => cube(matrix([2, 3, 4, 5])), TypeError)
    assert.deepStrictEqual(math.map([2, 3, 4, 5], cube), [8, 27, 64, 125])
    assert.deepStrictEqual(
      math.map(matrix([2, 3, 4, 5]), cube),
      matrix([8, 27, 64, 125])
    )
    assert.deepStrictEqual(
      math.map(
        matrix([
          [1, 2],
          [3, 4]
        ]),
        cube
      ),
      matrix([
        [1, 8],
        [27, 64]
      ])
    )
  })

<<<<<<< HEAD
  it('should LaTeX cube', function () {
=======
  it('should LaTeX cube', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('cube(2)')
    assert.strictEqual(expression.toTex(), '\\left(2\\right)^3')
  })
})
