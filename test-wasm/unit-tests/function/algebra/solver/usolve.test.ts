<<<<<<< HEAD
// @ts-nocheck
// test usolve
=======
/**
 * Test for usolve - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import { approxDeepEqual } from '../../../../../tools/approx.js'
import math from '../../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('usolve', function () {
  it('should solve linear system 4 x 4, arrays', function () {
=======
describe('usolve', function (): void {
  it('should solve linear system 4 x 4, arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1]
    ]
    const b = [1, 2, 3, 4]

    const x = math.usolve(m, b)

    approxDeepEqual(x, [[-1], [-1], [-1], [4]])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, array and column array', function () {
=======
  it('should solve linear system 4 x 4, array and column array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1]
    ]
    const b = [[1], [2], [3], [4]]
    const x = math.usolve(m, b)

    approxDeepEqual(x, [[-1], [-1], [-1], [4]])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, matrices', function () {
=======
  it('should solve linear system 4 x 4, matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1]
    ])
    const b = math.matrix([1, 2, 3, 4])

    const x = math.usolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-1], [-1], [4]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, sparse matrices', function () {
=======
  it('should solve linear system 4 x 4, sparse matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.sparse([
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1]
    ])
    const b = math.matrix([[1], [2], [3], [4]], 'sparse')

    const x = math.usolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-1], [-1], [4]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, matrix and column matrix', function () {
=======
  it('should solve linear system 4 x 4, matrix and column matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [1, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 0, 1, 1],
      [0, 0, 0, 1]
    ])
    const b = math.matrix([[1], [2], [3], [4]])

    const x = math.usolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-1], [-1], [4]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, sparse matrix and column matrix', function () {
=======
  it('should solve linear system 4 x 4, sparse matrix and column matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix(
      [
        [1, 1, 1, 1],
        [0, 1, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 0, 1]
      ],
      'sparse'
    )
    const b = math.matrix([[1], [2], [3], [4]], 'sparse')

    const x = math.usolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-1], [-1], [4]]))
  })

<<<<<<< HEAD
  it('should throw exception when matrix is singular', function () {
    assert.throws(function () {
=======
  it('should throw exception when matrix is singular', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.usolve(
        [
          [1, 1],
          [0, 0]
        ],
        [1, 1]
      )
    }, /Error: Linear system cannot be solved since matrix is singular/)
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.usolve(
        math.matrix(
          [
            [1, 1],
            [0, 0]
          ],
          'dense'
        ),
        [1, 1]
      )
    }, /Error: Linear system cannot be solved since matrix is singular/)
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.usolve(
        math.matrix(
          [
            [1, 1],
            [0, 0]
          ],
          'sparse'
        ),
        [1, 1]
      )
    }, /Error: Linear system cannot be solved since matrix is singular/)
  })
})
