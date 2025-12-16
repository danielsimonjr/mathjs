<<<<<<< HEAD
// @ts-nocheck
// test lusolve
=======
/**
 * Test for lusolve - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import { approxDeepEqual } from '../../../../../tools/approx.js'
import math from '../../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('lusolve', function () {
  it('should solve linear system 4 x 4, arrays', function () {
=======
describe('lusolve', function (): void {
  it('should solve linear system 4 x 4, arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 4]
    ]
    const b = [-1, -1, -1, -1]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, [[-1], [-0.5], [-1 / 3], [-0.25]])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, array and column array', function () {
=======
  it('should solve linear system 4 x 4, array and column array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 4]
    ]
    const b = [[-1], [-1], [-1], [-1]]
    const x = math.lusolve(m, b)

    approxDeepEqual(x, [[-1], [-0.5], [-1 / 3], [-0.25]])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, matrices', function () {
=======
  it('should solve linear system 4 x 4, matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 4]
    ])
    const b = math.matrix([-1, -1, -1, -1])

    const x = math.lusolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-0.5], [-1 / 3], [-0.25]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, sparse matrices', function () {
=======
  it('should solve linear system 4 x 4, sparse matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix(
      [
        [1, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 3, 0],
        [0, 0, 0, 4]
      ],
      'sparse'
    )
    const b = math.matrix([[-1], [-1], [-1], [-1]], 'sparse')

    const x = math.lusolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-0.5], [-1 / 3], [-0.25]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, matrix and column matrix', function () {
=======
  it('should solve linear system 4 x 4, matrix and column matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 4]
    ])
    const b = math.matrix([[-1], [-1], [-1], [-1]])

    const x = math.lusolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-0.5], [-1 / 3], [-0.25]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, sparse matrix and column matrix', function () {
=======
  it('should solve linear system 4 x 4, sparse matrix and column matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix(
      [
        [1, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 3, 0],
        [0, 0, 0, 4]
      ],
      'sparse'
    )
    const b = math.matrix([[-1], [-1], [-1], [-1]], 'sparse')

    const x = math.lusolve(m, b)

    assert(x instanceof math.Matrix)
    approxDeepEqual(x, math.matrix([[-1], [-0.5], [-1 / 3], [-0.25]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, LUP decomposition (array)', function () {
=======
  it('should solve linear system 4 x 4, LUP decomposition (array)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 4]
    ]
    const lup = math.lup(m)

    const x = math.lusolve(lup, [-1, -1, -1, -1])
    approxDeepEqual(x, math.matrix([[-1], [-0.5], [-1 / 3], [-0.25]]))

    const y = math.lusolve(lup, [1, 2, 1, -1])
    approxDeepEqual(y, math.matrix([[1], [1], [1 / 3], [-0.25]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, LUP decomposition (matrix)', function () {
=======
  it('should solve linear system 4 x 4, LUP decomposition (matrix)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 4]
    ])
    const lup = math.lup(m)

    const x = math.lusolve(lup, [-1, -1, -1, -1])
    approxDeepEqual(x, math.matrix([[-1], [-0.5], [-1 / 3], [-0.25]]))

    const y = math.lusolve(lup, [1, 2, 1, -1])
    approxDeepEqual(y, math.matrix([[1], [1], [1 / 3], [-0.25]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, LUP decomposition (sparse matrix)', function () {
=======
  it('should solve linear system 4 x 4, LUP decomposition (sparse matrix)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix(
      [
        [1, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 3, 0],
        [0, 0, 0, 4]
      ],
      'sparse'
    )
    const lup = math.lup(m)

    const x = math.lusolve(lup, [-1, -1, -1, -1])
    approxDeepEqual(x, math.matrix([[-1], [-0.5], [-1 / 3], [-0.25]]))

    const y = math.lusolve(lup, [1, 2, 1, -1])
    approxDeepEqual(y, math.matrix([[1], [1], [1 / 3], [-0.25]]))
  })

<<<<<<< HEAD
  it('should solve linear system 3 x 3, no permutations, arrays', function () {
=======
  it('should solve linear system 3 x 3, no permutations, arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [2, 1, 1],
      [1, 2, -1],
      [1, 2, 1]
    ]
    const b = [-2, 4, 2]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, [[-5 / 3], [7 / 3], [-1]])
  })

<<<<<<< HEAD
  it('should solve linear system 3 x 3, no permutations, matrix', function () {
=======
  it('should solve linear system 3 x 3, no permutations, matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [2, 1, 1],
      [1, 2, -1],
      [1, 2, 1]
    ])
    const b = [-2, 4, 2]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, math.matrix([[-5 / 3], [7 / 3], [-1]]))
  })

<<<<<<< HEAD
  it('should solve linear system 3 x 3, no permutations, sparse matrix', function () {
=======
  it('should solve linear system 3 x 3, no permutations, sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix(
      [
        [2, 1, 1],
        [1, 2, -1],
        [1, 2, 1]
      ],
      'sparse'
    )
    const b = [-2, 4, 2]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, math.matrix([[-5 / 3], [7 / 3], [-1]]))
  })

<<<<<<< HEAD
  it('should solve linear system 3 x 3, permutations, arrays', function () {
=======
  it('should solve linear system 3 x 3, permutations, arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 2, -1],
      [2, 1, 1],
      [1, 2, 1]
    ]
    const b = [4, -2, 2]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, [[-5 / 3], [7 / 3], [-1]])
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, permutations, matrix - Issue 437', function () {
=======
  it('should solve linear system 4 x 4, permutations, matrix - Issue 437', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix([
      [-1, 1, -1, 1],
      [0, 0, 0, 1],
      [1, 1, 1, 1],
      [8, 4, 2, 1]
    ])

    const b = [0.1, 0.2, 0.15, 0.1]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, math.matrix([[0.025], [-0.075], [0], [0.2]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, permutations, sparse - Issue 437', function () {
=======
  it('should solve linear system 4 x 4, permutations, sparse - Issue 437', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.sparse([
      [-1, 1, -1, 1],
      [0, 0, 0, 1],
      [1, 1, 1, 1],
      [8, 4, 2, 1]
    ])

    const b = [0.1, 0.2, 0.15, 0.1]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, math.matrix([[0.025], [-0.075], [0], [0.2]]))
  })

<<<<<<< HEAD
  it('should solve linear system 3 x 3, permutations, sparse matrix', function () {
=======
  it('should solve linear system 3 x 3, permutations, sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.matrix(
      [
        [1, 2, -1],
        [2, 1, 1],
        [1, 2, 1]
      ],
      'sparse'
    )
    const b = [4, -2, 2]

    const x = math.lusolve(m, b)

    approxDeepEqual(x, math.matrix([[-5 / 3], [7 / 3], [-1]]))
  })

<<<<<<< HEAD
  it('should solve linear system 4 x 4, natural ordering (order=0), partial pivoting, sparse matrix', function () {
=======
  it('should solve linear system 4 x 4, natural ordering (order=0), partial pivoting, sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.sparse([
      [4.5, 0, 3.2, 0],
      [3.1, 2.9, 0, 0.9],
      [0, 1.7, 3, 0],
      [3.5, 0.4, 0, 1]
    ])

    const b = [1.0, 1.25, 1.5, 1.75]

    const x = math.lusolve(m, b, 0, 1)

    approxDeepEqual(
      x,
      math.matrix([[-0.186372], [-0.131621], [0.574586], [2.45495]])
    )
  })

<<<<<<< HEAD
  it("should solve linear system 4 x 4, amd(A+A') (order=1), partial pivoting, sparse matrix", function () {
=======
  it("should solve linear system 4 x 4, amd(A+A') (order=1), partial pivoting, sparse matrix", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.sparse([
      [4.5, 0, 3.2, 0],
      [3.1, 2.9, 0, 0.9],
      [0, 1.7, 3, 0],
      [3.5, 0.4, 0, 1]
    ])

    const b = [1.0, 1.25, 1.5, 1.75]

    const x = math.lusolve(m, b, 1, 1)

    approxDeepEqual(
      x,
      math.matrix([[-0.186372], [-0.131621], [0.574586], [2.45495]])
    )
  })

<<<<<<< HEAD
  it("should solve linear system 4 x 4, amd(A'*A) (order=2), partial pivoting, sparse matrix", function () {
=======
  it("should solve linear system 4 x 4, amd(A'*A) (order=2), partial pivoting, sparse matrix", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.sparse([
      [4.5, 0, 3.2, 0],
      [3.1, 2.9, 0, 0.9],
      [0, 1.7, 3, 0],
      [3.5, 0.4, 0, 1]
    ])

    const b = [1.0, 1.25, 1.5, 1.75]

    const x = math.lusolve(m, b, 2, 1)

    approxDeepEqual(
      x,
      math.matrix([[-0.186372], [-0.131621], [0.574586], [2.45495]])
    )
  })

<<<<<<< HEAD
  it("should solve linear system 4 x 4, amd(A'*A) (order=3), partial pivoting, sparse matrix", function () {
=======
  it("should solve linear system 4 x 4, amd(A'*A) (order=3), partial pivoting, sparse matrix", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = math.sparse([
      [4.5, 0, 3.2, 0],
      [3.1, 2.9, 0, 0.9],
      [0, 1.7, 3, 0],
      [3.5, 0.4, 0, 1]
    ])

    const b = [1.0, 1.25, 1.5, 1.75]

    const x = math.lusolve(m, b, 3, 1)

    approxDeepEqual(
      x,
      math.matrix([[-0.186372], [-0.131621], [0.574586], [2.45495]])
    )
  })

<<<<<<< HEAD
  it('should throw exception when matrix is singular', function () {
    assert.throws(function () {
=======
  it('should throw exception when matrix is singular', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.lusolve(
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
      math.lusolve(
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
      math.lusolve(
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
