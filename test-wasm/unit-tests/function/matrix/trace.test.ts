<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for trace - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('trace', function () {
  it('should calculate correctly the trace of a NxN array', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('trace', function (): void {
  it('should calculate correctly the trace of a NxN array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.trace([5]), 5)
    assert.strictEqual(
      math.trace([
        [1, 2],
        [3, 4]
      ]),
      5
    )
    approxEqual(
      math.trace([
        [-2, 2, 3],
        [-1, 1, 3],
        [2, 0, -1]
      ]),
      -2
    )
    approxEqual(
      math.trace([
        [1, 4, 7],
        [3, 0, 5],
        [-1, 9, 11]
      ]),
      12
    )
    approxEqual(
      math.trace([
        [1, 7, 4, 3, 7],
        [0, 7, 0, 3, 7],
        [0, 7, 4, 3, 0],
        [1, 7, 5, 9, 7],
        [2, 7, 4, 3, 7]
      ]),
      28
    )
  })

<<<<<<< HEAD
  it('should calculate correctly the trace of a NxN matrix', function () {
=======
  it('should calculate correctly the trace of a NxN matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.trace(math.matrix([5])), 5)
    assert.strictEqual(
      math.trace(
        math.matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      5
    )
    assert.strictEqual(
      math.trace(
        math.matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      5
    )
    approxEqual(
      math.trace(
        math.matrix([
          [-2, 2, 3],
          [-1, 1, 3],
          [2, 0, -1]
        ])
      ),
      -2
    )
    approxEqual(
      math.trace(
        math.matrix([
          [1, 4, 7],
          [3, 0, 5],
          [-1, 9, 11]
        ])
      ),
      12
    )
    approxEqual(
      math.trace(
        math.matrix([
          [1, 7, 4, 3, 7],
          [0, 7, 0, 3, 7],
          [0, 7, 4, 3, 0],
          [1, 7, 5, 9, 7],
          [2, 7, 4, 3, 7]
        ])
      ),
      28
    )
    approxEqual(math.trace(math.diag([4, -5, 6])), 5)
  })

<<<<<<< HEAD
  it('should calculate correctly the trace of a NxN matrix, sparse', function () {
=======
  it('should calculate correctly the trace of a NxN matrix, sparse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.trace(math.matrix([5], 'sparse')), 5)
    assert.strictEqual(
      math.trace(
        math.matrix(
          [
            [1, 2],
            [3, 4]
          ],
          'sparse'
        )
      ),
      5
    )
    assert.strictEqual(
      math.trace(
        math.matrix(
          [
            [1, 2],
            [3, 4]
          ],
          'sparse'
        )
      ),
      5
    )
    approxEqual(
      math.trace(
        math.matrix(
          [
            [-2, 2, 3],
            [-1, 1, 3],
            [2, 0, -1]
          ],
          'sparse'
        )
      ),
      -2
    )
    approxEqual(
      math.trace(
        math.matrix(
          [
            [1, 4, 7],
            [3, 0, 5],
            [-1, 9, 11]
          ],
          'sparse'
        )
      ),
      12
    )
    approxEqual(
      math.trace(
        math.matrix(
          [
            [1, 7, 4, 3, 7],
            [0, 7, 0, 3, 7],
            [0, 7, 4, 3, 0],
            [1, 7, 5, 9, 7],
            [2, 7, 4, 3, 7]
          ],
          'sparse'
        )
      ),
      28
    )
  })

<<<<<<< HEAD
  it('should return N for the identity matrix', function () {
=======
  it('should return N for the identity matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.trace(math.identity(7)), 7)
    assert.strictEqual(math.trace(math.identity(2)), 2)
    assert.strictEqual(math.trace(math.identity(1)), 1)
  })

<<<<<<< HEAD
  it('should calculate the trace for a scalar', function () {
=======
  it('should calculate the trace for a scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.trace(7), 7)

    const c1 = math.complex(2, 3)
    const c2 = math.trace(c1)
    assert.deepStrictEqual(c1, c2)

    // c2 should be a clone
    c1.re = 0
    assert.strictEqual(c1.re, 0)
    assert.strictEqual(c2.re, 2)
  })

<<<<<<< HEAD
  it('should calculate the trace for a 1x1 array', function () {
=======
  it('should calculate the trace for a 1x1 array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c1 = math.complex(2, 3)
    const c2 = math.trace([[c1]])
    assert.deepStrictEqual(c1, c2)

    // c2 should be a clone
    c1.re = 0
    assert.strictEqual(c1.re, 0)
    assert.strictEqual(c2.re, 2)
  })

<<<<<<< HEAD
  it('should calculate the trace for a 1x1 matrix', function () {
=======
  it('should calculate the trace for a 1x1 matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c1 = math.complex(2, 3)
    const c2 = math.trace(math.matrix([[c1]]))
    assert.deepStrictEqual(c1, c2)

    // c2 should be a clone
    c1.re = 0
    assert.strictEqual(c1.re, 0)
    assert.strictEqual(c2.re, 2)
  })

<<<<<<< HEAD
  it('should calculate the trace for a 1x1 matrix, sparse', function () {
=======
  it('should calculate the trace for a 1x1 matrix, sparse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c1 = math.complex(2, 3)
    const c2 = math.trace(math.matrix([[c1]], 'sparse'))
    assert.deepStrictEqual(c1, c2)

    // c2 should be a clone
    c1.re = 0
    assert.strictEqual(c1.re, 0)
    assert.strictEqual(c2.re, 2)
  })

<<<<<<< HEAD
  it('should calculate correctly the trace of a matrix with bignumbers', function () {
=======
  it('should calculate correctly the trace of a matrix with bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bignumber = math.bignumber

    // 1x1
    assert.deepStrictEqual(math.trace([bignumber(5)]), bignumber(5))

    // 2x2
    assert.deepStrictEqual(
      math.trace([
        [bignumber(1), bignumber(2)],
        [bignumber(3), bignumber(4)]
      ]),
      bignumber(5)
    )

    // 3x3
    assert.deepStrictEqual(
      math.trace([
        [bignumber(-2), bignumber(2), bignumber(3)],
        [bignumber(-1), bignumber(1), bignumber(3)],
        [bignumber(2), bignumber(0), bignumber(-1)]
      ]),
      bignumber(-2)
    )

    // the following would fail with regular Numbers due to a precision overflow
    assert.deepStrictEqual(
      math.trace([
        [bignumber(1e10 + 1), bignumber(1e10)],
        [bignumber(1e10), bignumber(-1e10)]
      ]),
      bignumber(1)
    )
  })

<<<<<<< HEAD
  it('should calculate the trace of a matrix with mixed numbers and bignumbers', function () {
=======
  it('should calculate the trace of a matrix with mixed numbers and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bignumber = math.bignumber
    assert.deepStrictEqual(
      math.trace([
        [bignumber(2), 1],
        [bignumber(3), 4]
      ]),
      bignumber(6)
    )
  })

<<<<<<< HEAD
  it('should not change the value of the initial matrix', function () {
=======
  it('should not change the value of the initial matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]
    math.trace(m)
    assert.deepStrictEqual(m, [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])
  })

<<<<<<< HEAD
  it('should not accept a non-square matrix', function () {
    assert.throws(function () {
      math.trace([1, 2])
    })
    assert.throws(function () {
=======
  it('should not accept a non-square matrix', function (): void {
    assert.throws(function (): void {
      math.trace([1, 2])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.trace([
        [1, 2, 3],
        [1, 2, 3]
      ])
    })
<<<<<<< HEAD
    assert.throws(function () {
      math.trace([0, 1], [0, 1], [0, 1])
    })
    assert.throws(function () {
=======
    assert.throws(function (): void {
      math.trace([0, 1], [0, 1], [0, 1])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.trace(
        math.matrix([
          [1, 2, 3],
          [1, 2, 3]
        ])
      )
    })
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.trace(
        math.matrix(
          [
            [1, 2, 3],
            [1, 2, 3]
          ],
          'sparse'
        )
      )
    })
  })

<<<<<<< HEAD
  it('should not accept arrays with dimensions higher than 2', function () {
    assert.throws(function () {
      math.trace([[[1]]])
    }, RangeError)
    assert.throws(function () {
=======
  it('should not accept arrays with dimensions higher than 2', function (): void {
    assert.throws(function (): void {
      math.trace([[[1]]])
    }, RangeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.trace(math.matrix([[[1]]]))
    }, RangeError)
  })

<<<<<<< HEAD
  it('should LaTeX trace', function () {
=======
  it('should LaTeX trace', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('trace([[1,2],[3,4]])')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{tr}\\left(\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\right)'
    )
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should calculate trace on a square matrix', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should calculate trace on a square matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      let m = math.matrix([
        [1, 2],
        [4, -2]
      ])
      assert.strictEqual(math.trace(m), -1)

      m = math.matrix([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ])
      assert.strictEqual(math.trace(m), 0)

      m = math.matrix([
        [1, 0, 0, 0],
        [0, 0, 2, 0],
        [1, 0, 0, 0],
        [0, 0, 1, 9]
      ])
      assert.strictEqual(math.trace(m), 10)
    })

<<<<<<< HEAD
    it('should throw an error for invalid matrix', function () {
=======
    it('should throw an error for invalid matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix([
        [1, 2, 3],
        [4, 5, 6]
      ])
<<<<<<< HEAD
      assert.throws(function () {
=======
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        math.trace(m)
      })
    })
  })

<<<<<<< HEAD
  describe('SparseMatrix', function () {
    it('should calculate trace on a square matrix', function () {
=======
  describe('SparseMatrix', function (): void {
    it('should calculate trace on a square matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      let m = math.matrix(
        [
          [1, 2],
          [4, -2]
        ],
        'sparse'
      )
      assert.strictEqual(math.trace(m), -1)

      m = math.matrix(
        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        'sparse'
      )
      assert.strictEqual(math.trace(m), 0)

      m = math.matrix(
        [
          [1, 0, 0, 0],
          [0, 0, 2, 0],
          [1, 0, 0, 0],
          [0, 0, 1, 9]
        ],
        'sparse'
      )
      assert.strictEqual(math.trace(m), 10)
    })

<<<<<<< HEAD
    it('should throw an error for invalid matrix', function () {
=======
    it('should throw an error for invalid matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const m = math.matrix(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        'sparse'
      )
<<<<<<< HEAD
      assert.throws(function () {
=======
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        math.trace(m)
      })
    })
  })
})
