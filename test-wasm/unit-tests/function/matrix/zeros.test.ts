<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for zeros - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test zeros
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const zeros = math.zeros
const matrix = math.matrix
const size = math.size

<<<<<<< HEAD
describe('zeros', function () {
  it('should create an empty matrix', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('zeros', function (): void {
  it('should create an empty matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(zeros(), matrix())
    assert.deepStrictEqual(zeros([]), [])
    assert.deepStrictEqual(zeros(matrix([])), matrix())
  })

<<<<<<< HEAD
  it('should create an empty matrix, sparse', function () {
=======
  it('should create an empty matrix, sparse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(zeros('sparse'), matrix('sparse'))
    assert.deepStrictEqual(zeros([], 'sparse'), matrix([], 'sparse'))
    assert.deepStrictEqual(zeros(matrix([]), 'sparse'), matrix('sparse'))
  })

<<<<<<< HEAD
  it('should create a vector with zeros', function () {
=======
  it('should create a vector with zeros', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(zeros(3), matrix([0, 0, 0]))
    assert.deepStrictEqual(zeros(matrix([4])), matrix([0, 0, 0, 0]))
    assert.deepStrictEqual(zeros([4]), [0, 0, 0, 0])
    assert.deepStrictEqual(zeros(0), matrix([]))
  })

<<<<<<< HEAD
  it('should create a matrix with bignumber zeros', function () {
=======
  it('should create a matrix with bignumber zeros', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const zero = math.bignumber(0)
    const three = math.bignumber(3)
    assert.deepStrictEqual(zeros(three), matrix([zero, zero, zero]))
    assert.deepStrictEqual(zeros([three]), [zero, zero, zero])
  })

<<<<<<< HEAD
  it('should create a 2D matrix with zeros from an array', function () {
=======
  it('should create a 2D matrix with zeros from an array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      zeros(2, 3),
      matrix([
        [0, 0, 0],
        [0, 0, 0]
      ])
    )
    assert.deepStrictEqual(
      zeros(3, 2),
      matrix([
        [0, 0],
        [0, 0],
        [0, 0]
      ])
    )
    assert.deepStrictEqual(zeros([3, 2]), [
      [0, 0],
      [0, 0],
      [0, 0]
    ])
  })

<<<<<<< HEAD
  it('should create a matrix with zeros from a matrix', function () {
=======
  it('should create a matrix with zeros from a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(zeros(matrix([3])), matrix([0, 0, 0]))
    assert.deepStrictEqual(
      zeros(matrix([3, 2])),
      matrix([
        [0, 0],
        [0, 0],
        [0, 0]
      ])
    )
  })

<<<<<<< HEAD
  it('should create a 3D matrix with zeros', function () {
=======
  it('should create a 3D matrix with zeros', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const res = [
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    ]

    assert.deepStrictEqual(zeros(2, 3, 4), matrix(res))
    assert.deepStrictEqual(zeros(matrix([2, 3, 4])), matrix(res))
    assert.deepStrictEqual(zeros([2, 3, 4]), res)
  })

  // TODO: test setting `matrix`

<<<<<<< HEAD
  it('should create a matrix with zeros with the same size as original matrix', function () {
=======
  it('should create a matrix with zeros with the same size as original matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = matrix([
      [1, 2, 3],
      [4, 5, 6]
    ])
    assert.deepStrictEqual(zeros(size(a)), [
      [0, 0, 0],
      [0, 0, 0]
    ])
    assert.deepStrictEqual(
      zeros(matrix(size(a))),
      matrix([
        [0, 0, 0],
        [0, 0, 0]
      ])
    )
    assert.deepStrictEqual(
      zeros(size(a), 'dense'),
      matrix([
        [0, 0, 0],
        [0, 0, 0]
      ])
    )
  })

  // TODO: test with invalid input

<<<<<<< HEAD
  it('should LaTeX zeros', function () {
=======
  it('should LaTeX zeros', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('zeros(2,3)')
    assert.strictEqual(expression.toTex(), '\\mathrm{zeros}\\left(2,3\\right)')
  })
})
