<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for ones - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test ones
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const ones = math.ones
const matrix = math.matrix
const size = math.size

<<<<<<< HEAD
describe('ones', function () {
  it('should create an empty matrix', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('ones', function (): void {
  it('should create an empty matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(ones(), matrix())
    assert.deepStrictEqual(ones([]), [])
    assert.deepStrictEqual(ones(matrix([])), matrix())
  })

<<<<<<< HEAD
  it('should create an empty matrix, sparse', function () {
=======
  it('should create an empty matrix, sparse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(ones('sparse'), matrix('sparse'))
    assert.deepStrictEqual(ones([], 'sparse'), matrix([], 'sparse'))
    assert.deepStrictEqual(ones(matrix([]), 'sparse'), matrix('sparse'))
  })

<<<<<<< HEAD
  it('should create a vector with ones', function () {
=======
  it('should create a vector with ones', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(ones(3), matrix([1, 1, 1]))
    assert.deepStrictEqual(ones(matrix([4])), matrix([1, 1, 1, 1]))
    assert.deepStrictEqual(ones([4]), [1, 1, 1, 1])
    assert.deepStrictEqual(ones(0), matrix([]))
  })

<<<<<<< HEAD
  it('should create a 2D matrix with ones', function () {
=======
  it('should create a 2D matrix with ones', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      ones(2, 3),
      matrix([
        [1, 1, 1],
        [1, 1, 1]
      ])
    )
    assert.deepStrictEqual(
      ones(3, 2),
      matrix([
        [1, 1],
        [1, 1],
        [1, 1]
      ])
    )
    assert.deepStrictEqual(ones([3, 2]), [
      [1, 1],
      [1, 1],
      [1, 1]
    ])
  })

<<<<<<< HEAD
  it('should create a matrix with ones from a matrix', function () {
=======
  it('should create a matrix with ones from a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(ones(matrix([3])), matrix([1, 1, 1]))
    assert.deepStrictEqual(
      ones(matrix([3, 2])),
      matrix([
        [1, 1],
        [1, 1],
        [1, 1]
      ])
    )
  })

<<<<<<< HEAD
  it('should create a matrix with bignumber ones', function () {
=======
  it('should create a matrix with bignumber ones', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const one = math.bignumber(1)
    const three = math.bignumber(3)
    assert.deepStrictEqual(ones(three), matrix([one, one, one]))
    assert.deepStrictEqual(ones([three]), [one, one, one])
  })

<<<<<<< HEAD
  it('should create a 3D matrix with ones', function () {
=======
  it('should create a 3D matrix with ones', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const res = [
      [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ],
      [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ]
    ]
    assert.deepStrictEqual(ones(2, 3, 4), matrix(res))
    assert.deepStrictEqual(ones(matrix([2, 3, 4])), matrix(res))
    assert.deepStrictEqual(ones([2, 3, 4]), res)
  })

  // TODO: test setting `matrix`

<<<<<<< HEAD
  it('should create a matrix with ones with the same size as original matrix', function () {
=======
  it('should create a matrix with ones with the same size as original matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = matrix([
      [1, 2, 3],
      [4, 5, 6]
    ])
    assert.deepStrictEqual(ones(size(a)), [
      [1, 1, 1],
      [1, 1, 1]
    ])
    assert.deepStrictEqual(
      ones(matrix(size(a))),
      matrix([
        [1, 1, 1],
        [1, 1, 1]
      ])
    )
    assert.deepStrictEqual(
      ones(size(a), 'dense'),
      matrix([
        [1, 1, 1],
        [1, 1, 1]
      ])
    )
  })

  // TODO: test with invalid inputs

<<<<<<< HEAD
  it('should LaTeX ones', function () {
=======
  it('should LaTeX ones', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('ones(2)')
    assert.strictEqual(expression.toTex(), '\\mathrm{ones}\\left(2\\right)')
  })
})
