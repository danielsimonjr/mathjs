<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for expm - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test expm
import assert from 'assert'

import { approxDeepEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'
const expm = math.expm

<<<<<<< HEAD
describe('expm', function () {
  it('should only accept a square matrix', function () {
    assert.throws(function () {
      expm(5)
    }, /Unexpected type/)
    assert.throws(function () {
      expm([1, 2])
    }, /Matrix must be square/)
    assert.throws(function () {
      expm([[1, 2]])
    }, /Matrix must be square/)
    assert.throws(function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('expm', function (): void {
  it('should only accept a square matrix', function (): void {
    assert.throws(function (): void {
      expm(5)
    }, /Unexpected type/)
    assert.throws(function (): void {
      expm([1, 2])
    }, /Matrix must be square/)
    assert.throws(function (): void {
      expm([[1, 2]])
    }, /Matrix must be square/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      expm([
        [1, 2, 3],
        [4, 5, 6]
      ])
    }, /Matrix must be square/)
  })

<<<<<<< HEAD
  it('should compute the exponential of a matrix', function () {
=======
  it('should compute the exponential of a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    // Trivial example
    approxDeepEqual(
      expm([
        [1, 0],
        [0, 1]
      ]),
      math.matrix([
        [2.718281828, 0],
        [0, 2.718281828]
      ])
    )

    // Example given in the Moler and Van Loan paper
    approxDeepEqual(
      expm([
        [-49, 24],
        [-64, 31]
      ]),
      math.matrix([
        [-0.735759, 0.551819],
        [-1.471518, 1.103638]
      ])
    )

    // Another example from the same paper
    approxDeepEqual(
      expm([
        [0, 6, 0, 0],
        [0, 0, 6, 0],
        [0, 0, 0, 6],
        [0, 0, 0, 0]
      ]),
      math.matrix([
        [1, 6, 18, 36],
        [0, 1, 6, 18],
        [0, 0, 1, 6],
        [0, 0, 0, 1]
      ])
    )

    // And another
    approxDeepEqual(
      expm([
        [1, 1],
        [0, 1]
      ]),
      math.matrix([
        [2.718282, 2.718282],
        [0, 2.718282]
      ])
    )

    // And another
    approxDeepEqual(
      expm([
        [1 + 1e-5, 1],
        [0, 1 - 1e-5]
      ]),
      math.matrix([
        [2.718309, 2.718282],
        [0, 2.718255]
      ])
    )
  })

<<<<<<< HEAD
  it('should work on SparseMatrix', function () {
=======
  it('should work on SparseMatrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      expm(
        math.sparse([
          [0, 6, 0, 0],
          [0, 0, 6, 0],
          [0, 0, 0, 6],
          [0, 0, 0, 0]
        ])
      ),
      math.sparse([
        [1, 6, 18, 36],
        [0, 1, 6, 18],
        [0, 0, 1, 6],
        [0, 0, 0, 1]
      ])
    )
  })

<<<<<<< HEAD
  it('should LaTeX transpose', function () {
=======
  it('should LaTeX transpose', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('expm([[1,2],[3,4]])')
    assert.strictEqual(
      expression.toTex(),
      '\\exp\\left(\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\right)'
    )
  })
})
