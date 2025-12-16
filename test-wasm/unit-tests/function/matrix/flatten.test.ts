<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for flatten - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const matrix = math.matrix
const flatten = math.flatten
const sparse = math.sparse

<<<<<<< HEAD
describe('flatten', function () {
  it('should flatten an empty array', function () {
    assert.deepStrictEqual(flatten([]), [])
  })

  it('should not clone the flattened array', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('flatten', function (): void {
  it('should flatten an empty array', function (): void {
    assert.deepStrictEqual(flatten([]), [])
  })

  it('should not clone the flattened array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = math.complex()
    const flat = flatten([c])
    assert.deepStrictEqual(flat, [c])
    assert(c === flat[0])
  })

<<<<<<< HEAD
  it('should flatten a 1 dimensional array', function () {
    assert.deepStrictEqual(flatten([1, 2, 3]), [1, 2, 3])
  })

  it('should flatten a 2 dimensional array', function () {
=======
  it('should flatten a 1 dimensional array', function (): void {
    assert.deepStrictEqual(flatten([1, 2, 3]), [1, 2, 3])
  })

  it('should flatten a 2 dimensional array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      flatten([
        [1, 2],
        [3, 4]
      ]),
      [1, 2, 3, 4]
    )
  })

<<<<<<< HEAD
  it('should flatten a 3 dimensional array', function () {
=======
  it('should flatten a 3 dimensional array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      flatten([
        [
          [1, 2],
          [3, 4]
        ],
        [
          [5, 6],
          [7, 8]
        ]
      ]),
      [1, 2, 3, 4, 5, 6, 7, 8]
    )
  })

<<<<<<< HEAD
  it('should flatten a 1 dimensional matrix', function () {
    assert.deepStrictEqual(flatten(matrix([1, 2, 3])), matrix([1, 2, 3]))
  })

  it('should flatten a 2 dimensional matrix', function () {
=======
  it('should flatten a 1 dimensional matrix', function (): void {
    assert.deepStrictEqual(flatten(matrix([1, 2, 3])), matrix([1, 2, 3]))
  })

  it('should flatten a 2 dimensional matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      flatten(
        matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      matrix([1, 2, 3, 4])
    )
  })

<<<<<<< HEAD
  it('should flatten a 3 dimensional matrix', function () {
=======
  it('should flatten a 3 dimensional matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      flatten(
        matrix([
          [
            [1, 2],
            [3, 4]
          ],
          [
            [5, 6],
            [7, 8]
          ]
        ])
      ),
      matrix([1, 2, 3, 4, 5, 6, 7, 8])
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of SparseMatrix input', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of SparseMatrix input', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      flatten(sparse([1, 2]))
    }, /TypeError: SparseMatrix is not supported/)
  })

<<<<<<< HEAD
  it('should throw an error on invalid arguments', function () {
    assert.throws(function () {
      flatten()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
      flatten([], 2)
    }, /TypeError: Too many arguments/)
    assert.throws(function () {
=======
  it('should throw an error on invalid arguments', function (): void {
    assert.throws(function (): void {
      flatten()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      flatten([], 2)
    }, /TypeError: Too many arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      flatten('str')
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX flatten', function () {
=======
  it('should LaTeX flatten', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('flatten([[1,2],[3,4]])')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{flatten}\\left(\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\right)'
    )
  })
})
