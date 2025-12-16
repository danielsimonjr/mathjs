<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for deepEqual - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test deepEqual
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const deepEqual = math.deepEqual

<<<<<<< HEAD
describe('deepEqual', function () {
  it('should compare scalars correctly', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('deepEqual', function (): void {
  it('should compare scalars correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(deepEqual(2, 3), false)
    assert.strictEqual(deepEqual(2, 2), true)
    assert.strictEqual(deepEqual(0, 0), true)
    assert.strictEqual(deepEqual(-2, 2), false)
    assert.strictEqual(deepEqual(2, math.bignumber(2)), true)
    assert.strictEqual(deepEqual(math.fraction(1, 2), 0.5), true)
    assert.strictEqual(deepEqual(true, 1), true)
  })

<<<<<<< HEAD
  it('should compare two matrices', function () {
=======
  it('should compare two matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(deepEqual([1, 4, 5], [3, 4, 5]), false)
    assert.deepStrictEqual(deepEqual([1, 4, 5], [1, 4, 5]), true)
    assert.deepStrictEqual(deepEqual([1, 4, 5], [1, 4]), false)
    assert.deepStrictEqual(deepEqual([1, 4], [1, 4, 5]), false)
    assert.deepStrictEqual(deepEqual([1, 4, 5], matrix([3, 4, 5])), false)
    assert.deepStrictEqual(deepEqual([1, 4, 5], matrix([1, 4, 5])), true)
    assert.deepStrictEqual(
      deepEqual(matrix([1, 4, 5]), matrix([1, 4, 5])),
      true
    )

    assert.deepStrictEqual(
      deepEqual(
        matrix([
          [1, 2],
          [3, 4]
        ]),
        matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      true
    )
    assert.deepStrictEqual(
      deepEqual(
        matrix([
          [1, 2],
          [3, 4]
        ]),
        matrix([
          [1, 2],
          [3, 5]
        ])
      ),
      false
    )
    assert.deepStrictEqual(
      deepEqual(
        matrix([
          [1, 2],
          [3, 4]
        ]),
        matrix([
          [1, 2],
          [3, 4],
          [5, 6]
        ])
      ),
      false
    )
    assert.deepStrictEqual(
      deepEqual(
        matrix([
          [1, 2],
          [3, 4],
          [5, 6]
        ]),
        matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      false
    )
  })

<<<<<<< HEAD
  it('should compare mixed scalars and matrices', function () {
=======
  it('should compare mixed scalars and matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(deepEqual([1, 2, 3], 2), false)
    assert.deepStrictEqual(deepEqual(2, [1, 2, 3]), false)
    assert.deepStrictEqual(deepEqual(matrix([1, 2, 3]), 2), false)
    assert.deepStrictEqual(deepEqual(2, matrix([1, 2, 3])), false)
  })

<<<<<<< HEAD
  it('should compare two matrices with mixed types', function () {
=======
  it('should compare two matrices with mixed types', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(deepEqual([1, 4], [true, 4]), true)
    assert.deepStrictEqual(deepEqual([1, 4], [1, '4']), true)
    assert.deepStrictEqual(deepEqual([2, 3], [2, bignumber(3)]), true)
    assert.deepStrictEqual(deepEqual([2, 3], [2, bignumber(4)]), false)
    assert.deepStrictEqual(
      deepEqual([complex(2, 3), 3], [complex(2, 3), 3]),
      true
    )
    assert.deepStrictEqual(
      deepEqual([complex(2, 3), 3], [complex(2, 4), 3]),
      false
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      deepEqual(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      deepEqual(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      deepEqual(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      deepEqual(['A'], ['B'])
    }, /Error: Cannot convert "A" to a number/)
  })

<<<<<<< HEAD
  it('should LaTeX deepEqual', function () {
=======
  it('should LaTeX deepEqual', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('deepEqual([1,2],[1,3])')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{deepEqual}\\left(\\begin{bmatrix}1\\\\2\\end{bmatrix},\\begin{bmatrix}1\\\\3\\end{bmatrix}\\right)'
    )
  })
})
