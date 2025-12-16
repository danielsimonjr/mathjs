<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for inv - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test inv
import assert from 'assert'

import { approxDeepEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'
const inv = math.inv

<<<<<<< HEAD
describe('inv', function () {
  it('should return the inverse of a number', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('inv', function (): void {
  it('should return the inverse of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(inv(4), 1 / 4)
    assert.deepStrictEqual(inv(math.bignumber(4)), math.bignumber(1 / 4))
  })

<<<<<<< HEAD
  it('should return the inverse of a matrix with just one value', function () {
=======
  it('should return the inverse of a matrix with just one value', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(inv([4]), [1 / 4])
    assert.deepStrictEqual(inv([[4]]), [[1 / 4]])
  })

<<<<<<< HEAD
  it('should return the inverse for each element in an array', function () {
=======
  it('should return the inverse for each element in an array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(inv([4]), [1 / 4])
    assert.deepStrictEqual(inv([[4]]), [[1 / 4]])

    approxDeepEqual(
      inv([
        [1, 4, 7],
        [3, 0, 5],
        [-1, 9, 11]
      ]),
      [
        [5.625, -2.375, -2.5],
        [4.75, -2.25, -2],
        [-3.375, 1.625, 1.5]
      ]
    )

    approxDeepEqual(
      inv([
        [2, -1, 0],
        [-1, 2, -1],
        [0, -1, 2]
      ]),
      [
        [3 / 4, 1 / 2, 1 / 4],
        [1 / 2, 1, 1 / 2],
        [1 / 4, 1 / 2, 3 / 4]
      ]
    )

    // the following will force swapping of empty rows in the middle of the matrix
    approxDeepEqual(
      inv([
        [1, 0, 0],
        [0, 0, 1],
        [0, 1, 0]
      ]),
      [
        [1, 0, 0],
        [0, 0, 1],
        [0, 1, 0]
      ]
    )

    approxDeepEqual(
      inv([
        [1, 0, 0],
        [0, -1, 1],
        [0, 0, 1]
      ]),
      [
        [1, 0, 0],
        [0, -1, 1],
        [0, 0, 1]
      ]
    )
  })

<<<<<<< HEAD
  it('should return the inverse for each element in a matrix', function () {
=======
  it('should return the inverse for each element in a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(inv(math.matrix([4])), math.matrix([1 / 4]))
    assert.deepStrictEqual(inv(math.matrix([[4]])), math.matrix([[1 / 4]]))
    assert.deepStrictEqual(
      inv(math.matrix([[4]], 'sparse')),
      math.matrix([[1 / 4]], 'sparse')
    )
    assert.deepStrictEqual(
      inv(
        math.matrix(
          [
            [1, 2],
            [3, 4]
          ],
          'sparse'
        )
      ),
      math.matrix(
        [
          [-2, 1],
          [1.5, -0.5]
        ],
        'sparse'
      )
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of non-square matrices', function () {
    assert.throws(function () {
      inv([1, 2, 3])
    }, /Matrix must be square/)
    assert.throws(function () {
=======
  it('should throw an error in case of non-square matrices', function (): void {
    assert.throws(function (): void {
      inv([1, 2, 3])
    }, /Matrix must be square/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      inv([
        [1, 2, 3],
        [4, 5, 6]
      ])
    }, /Matrix must be square/)
  })

<<<<<<< HEAD
  it('should throw an error in case of multi dimensional matrices', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of multi dimensional matrices', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      inv([
        [
          [1, 2, 3],
          [4, 5, 6]
        ]
      ])
    }, /Matrix must be two dimensional/)
  })

<<<<<<< HEAD
  it('should throw an error in case of non-invertable matrices', function () {
    assert.throws(function () {
      inv([[0]])
    }, /Cannot calculate inverse, determinant is zero/)
    assert.throws(function () {
=======
  it('should throw an error in case of non-invertable matrices', function (): void {
    assert.throws(function (): void {
      inv([[0]])
    }, /Cannot calculate inverse, determinant is zero/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      inv([
        [1, 0],
        [0, 0]
      ])
    }, /Cannot calculate inverse, determinant is zero/)
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      inv([
        [1, 1, 1],
        [1, 0, 0],
        [0, 0, 0]
      ])
    }, /Cannot calculate inverse, determinant is zero/)
  })

<<<<<<< HEAD
  it('should throw an error in case of wrong number of arguments', function () {
    assert.throws(function () {
      inv()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of wrong number of arguments', function (): void {
    assert.throws(function (): void {
      inv()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      inv([], [])
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.concat(inv(new Date()))
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should avoid issues with elements that are almost zero', function () {
=======
  it('should avoid issues with elements that are almost zero', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      inv([
        [0, 1, 0, 788],
        [-1, 0, 0, 692],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]),
      [
        [0, -1, 0, 692],
        [1, 0, 0, -788],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]
    )

    approxDeepEqual(
      inv([
        [6.123233995736766e-17, 1, 0, 788],
        [-1, 6.123233995736766e-17, 0, 692],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]),
      [
        [6.123233995736766e-17, -1, 0, 692],
        [1, 6.123233995736766e-17, 0, -788],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]
    )
  })

<<<<<<< HEAD
  it('should  LaTeX inv', function () {
=======
  it('should  LaTeX inv', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('inv([[1,2],[3,4]])')
    assert.strictEqual(
      expression.toTex(),
      '\\left(\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\right)^{-1}'
    )
  })
})
