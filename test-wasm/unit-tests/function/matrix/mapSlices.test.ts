<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for mapSlices - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const sum = math.sum

<<<<<<< HEAD
describe('mapSlices', function () {
  const mapSlices = math.mapSlices

  it('should apply a function to the rows of a matrix', function () {
=======
describe('mapSlices', function (): void {
  const mapSlices = math.mapSlices

  it('should apply a function to the rows of a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      mapSlices(
        [
          [1, 2],
          [3, 4]
        ],
        0,
        sum
      ),
      [4, 6]
    )
  })

<<<<<<< HEAD
  it('should temporarily be accessible via synonym `apply`', function () {
=======
  it('should temporarily be accessible via synonym `apply`', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.apply(
        [
          [1, 2],
          [3, 4]
        ],
        0,
        sum
      ),
      [4, 6]
    )
  })

<<<<<<< HEAD
  it('should apply a function to the columns of a matrix', function () {
=======
  it('should apply a function to the columns of a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      mapSlices(
        [
          [1, 2],
          [3, 4]
        ],
        1,
        sum
      ),
      [3, 7]
    )
  })

  const inputMatrix = [
    // this is a 4x3x2 matrix, full test coverage
    [
      [1, 2],
      [3, 4],
      [5, 6]
    ],
    [
      [7, 8],
      [9, 10],
      [11, 12]
    ],
    [
      [13, 14],
      [15, 16],
      [17, 18]
    ],
    [
      [19, 20],
      [21, 22],
      [23, 24]
    ]
  ]

<<<<<<< HEAD
  it('should apply to the rows of a tensor', function () {
=======
  it('should apply to the rows of a tensor', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(mapSlices(inputMatrix, 2, sum), [
      [3, 7, 11],
      [15, 19, 23],
      [27, 31, 35],
      [39, 43, 47]
    ])
  })

<<<<<<< HEAD
  it('should throw an error if the dimension is out of range', function () {
    assert.throws(function () {
=======
  it('should throw an error if the dimension is out of range', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      mapSlices(
        [
          [1, 2],
          [3, 4]
        ],
        3,
        sum
      )
    }, /Index out of range/)
  })

<<<<<<< HEAD
  it('should throw an error if the dimension is not an integer', function () {
    assert.throws(function () {
=======
  it('should throw an error if the dimension is not an integer', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      mapSlices(
        [
          [1, 2],
          [3, 4]
        ],
        [1, 2],
        sum
      )
    }, /Unexpected type of argument in function mapSlices/)
  })

<<<<<<< HEAD
  it('should throw an error if the matrix, is not a matrix or array', function () {
    assert.throws(function () {
=======
  it('should throw an error if the matrix, is not a matrix or array', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      mapSlices('[[1, 2], [3, 4]]', 0, sum)
    }, /Unexpected type of argument in function mapSlices/)
  })
})
