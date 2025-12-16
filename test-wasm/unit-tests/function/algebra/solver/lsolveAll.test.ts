<<<<<<< HEAD
// @ts-nocheck
// test lsolveAll
=======
/**
 * Test for lsolveAll - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import { approxDeepEqual } from '../../../../../tools/approx.js'
import math from '../../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('lsolveAll', function () {
  it('should solve linear system 4 x 4, arrays', function () {
=======
describe('lsolveAll', function (): void {
  it('should solve linear system 4 x 4, arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 1]
    ]
    const b = [1, 2, 3, 4]

    const x = math.lsolveAll(m, b)

    approxDeepEqual(x, [[[1], [1], [1], [1]]])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, array and column array', function () {
=======
  it('should solve linear system 4 x 4, array and column array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 1]
    ]
    const b = [[1], [2], [3], [4]]
    const x = math.lsolveAll(m, b)

    approxDeepEqual(x, [[[1], [1], [1], [1]]])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, matrices', function () {
=======
  it('should solve linear system 4 x 4, matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 1]
    ])
    const b = math.matrix([1, 2, 3, 4])

    const x = math.lsolveAll(m, b)

    assert(x[0] instanceof math.Matrix)
    approxDeepEqual(x, [math.matrix([[1], [1], [1], [1]])])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, sparse matrices', function () {
=======
  it('should solve linear system 4 x 4, sparse matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.sparse([
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 1]
    ])
    const b = math.matrix([[1], [2], [3], [4]], 'sparse')

    const x = math.lsolveAll(m, b)

    assert(x[0] instanceof math.Matrix)
    approxDeepEqual(x, [math.matrix([[1], [1], [1], [1]])])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, matrix and column matrix', function () {
=======
  it('should solve linear system 4 x 4, matrix and column matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 1]
    ])
    const b = math.matrix([[1], [2], [3], [4]])

    const x = math.lsolveAll(m, b)

    assert(x[0] instanceof math.Matrix)
    approxDeepEqual(x, [math.matrix([[1], [1], [1], [1]])])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, sparse matrix and column matrix', function () {
=======
  it('should solve linear system 4 x 4, sparse matrix and column matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix(
      [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [1, 1, 1, 0],
        [1, 1, 1, 1]
      ],
      'sparse'
    )
    const b = math.matrix([[1], [2], [3], [4]], 'sparse')

    const x = math.lsolveAll(m, b)

    assert(x[0] instanceof math.Matrix)
    approxDeepEqual(x, [math.matrix([[1], [1], [1], [1]])])
  })

<<<<<<< HEAD
  it('should return an empty array when there is no solution', function () {
=======
  it('should return an empty array when there is no solution', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      [],
      math.lsolveAll(
        [
          [1, 1],
          [0, 0]
        ],
        [1, 1]
      )
    )
    assert.deepStrictEqual(
      [],
      math.lsolveAll(
        math.matrix(
          [
            [1, 1],
            [0, 0]
          ],
          'dense'
        ),
        [1, 1]
      )
    )
    assert.deepStrictEqual(
      [],
      math.lsolveAll(
        math.matrix(
          [
            [1, 1],
            [0, 0]
          ],
          'sparse'
        ),
        [1, 1]
      )
    )
  })

<<<<<<< HEAD
  it('should solve systems with singular dense matrices', function () {
=======
  it('should solve systems with singular dense matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      math.lsolveAll(
        [
          [2, 0, 0],
          [1, 0, 0],
          [-1, 1, 1]
        ],
        [4, 2, 1]
      ),
      [
        [[2], [0], [3]],
        [[2], [1], [2]]
      ]
    )

    approxDeepEqual(
      math.lsolveAll(
        [
          [0, 0, 0],
          [1, 1, 0],
          [2, 1, 0]
        ],
        [0, 2, 2]
      ),
      [
        [[0], [2], [0]],
        [[0], [2], [1]]
      ]
    )

    approxDeepEqual(
      math.lsolveAll(
        [
          [0, 0, 0],
          [1, 1, 0],
          [1, 1, 0]
        ],
        [0, 2, 2]
      ),
      [
        [[0], [2], [0]],
        [[1], [1], [0]],
        [[0], [2], [1]]
      ]
    )
  })

<<<<<<< HEAD
  it('should solve systems with singular sparse matrices', function () {
=======
  it('should solve systems with singular sparse matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(
      math.lsolveAll(
        math.matrix(
          [
            [2, 0, 0],
            [1, 0, 0],
            [-1, 1, 1]
          ],
          'sparse'
        ),
        [4, 2, 1]
      ),
      [math.matrix([[2], [0], [3]]), math.matrix([[2], [1], [2]])]
    )

    approxDeepEqual(
      math.lsolveAll(
        math.matrix(
          [
            [0, 0, 0],
            [1, 1, 0],
            [2, 1, 0]
          ],
          'sparse'
        ),
        [0, 2, 2]
      ),
      [math.matrix([[0], [2], [0]]), math.matrix([[0], [2], [1]])]
    )

    approxDeepEqual(
      math.lsolveAll(
        math.matrix(
          [
            [0, 0, 0],
            [1, 1, 0],
            [1, 1, 0]
          ],
          'sparse'
        ),
        [0, 2, 2]
      ),
      [
        math.matrix([[0], [2], [0]]),
        math.matrix([[1], [1], [0]]),
        math.matrix([[0], [2], [1]])
      ]
    )
  })
})
