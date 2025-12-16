<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for diag - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber

<<<<<<< HEAD
describe('diag', function () {
  it('should return a diagonal matrix on the default diagonal', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('diag', function (): void {
  it('should return a diagonal matrix on the default diagonal', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.diag([1, 2, 3]), [
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3]
    ])
    assert.deepStrictEqual(
      math.diag([
        [1, 2, 3],
        [4, 5, 6]
      ]),
      [1, 5]
    )
  })

<<<<<<< HEAD
  it('should return a diagonal matrix on the default diagonal, dense matrix', function () {
=======
  it('should return a diagonal matrix on the default diagonal, dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.diag([1, 2, 3], 'dense'),
      math.matrix(
        [
          [1, 0, 0],
          [0, 2, 0],
          [0, 0, 3]
        ],
        'dense'
      )
    )
    assert.deepStrictEqual(
      math.diag(
        math.matrix(
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          'dense'
        )
      ),
      math.matrix([1, 5], 'dense')
    )
  })

<<<<<<< HEAD
  it('should return a diagonal matrix on the default diagonal, sparse matrix', function () {
=======
  it('should return a diagonal matrix on the default diagonal, sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.diag([1, 2, 3], 'sparse'),
      math.matrix(
        [
          [1, 0, 0],
          [0, 2, 0],
          [0, 0, 3]
        ],
        'sparse'
      )
    )
    assert.deepStrictEqual(
      math.diag(
        math.matrix(
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          'sparse'
        )
      ),
      math.matrix([1, 5], 'sparse')
    )
  })

<<<<<<< HEAD
  it('should return a array output on array input', function () {
=======
  it('should return a array output on array input', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.diag([1, 2]), [
      [1, 0],
      [0, 2]
    ])
  })

<<<<<<< HEAD
  it('should return a matrix output on matrix input', function () {
=======
  it('should return a matrix output on matrix input', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.diag(math.matrix([1, 2])),
      math.matrix([
        [1, 0],
        [0, 2]
      ])
    )
    assert.deepStrictEqual(
      math.diag(
        math.matrix([
          [1, 2],
          [3, 4]
        ])
      ),
      math.matrix([1, 4])
    )
  })

<<<<<<< HEAD
  it('should put vector on given diagonal k in returned matrix', function () {
=======
  it('should put vector on given diagonal k in returned matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.diag([1, 2, 3], 1), [
      [0, 1, 0, 0],
      [0, 0, 2, 0],
      [0, 0, 0, 3]
    ])
    assert.deepStrictEqual(math.diag([1, 2, 3], -1), [
      [0, 0, 0],
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3]
    ])
  })

<<<<<<< HEAD
  it('should return diagonal k from a matrix', function () {
=======
  it('should return diagonal k from a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.diag(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        1
      ),
      [2, 6]
    )
    assert.deepStrictEqual(
      math.diag(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        -1
      ),
      [4]
    )
    assert.deepStrictEqual(
      math.diag(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        -2
      ),
      []
    )
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid k', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid k', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.diag(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        2.4
      )
    }, /Second parameter in function diag must be an integer/)
  })

<<<<<<< HEAD
  describe('bignumber', function () {
=======
  describe('bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const array123 = [bignumber(1), bignumber(2), bignumber(3)]
    const array123456 = [
      [bignumber(1), bignumber(2), bignumber(3)],
      [bignumber(4), bignumber(5), bignumber(6)]
    ]

<<<<<<< HEAD
    it('should return a diagonal matrix on the default diagonal', function () {
=======
    it('should return a diagonal matrix on the default diagonal', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(math.diag(array123), [
        [bignumber(1), bignumber(0), bignumber(0)],
        [bignumber(0), bignumber(2), bignumber(0)],
        [bignumber(0), bignumber(0), bignumber(3)]
      ])

      assert.deepStrictEqual(math.diag(array123456), [
        bignumber(1),
        bignumber(5)
      ])
    })

<<<<<<< HEAD
    it('should return a array output on array input', function () {
=======
    it('should return a array output on array input', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(math.diag([bignumber(1), bignumber(2)]), [
        [bignumber(1), bignumber(0)],
        [bignumber(0), bignumber(2)]
      ])
    })

<<<<<<< HEAD
    it('should return a matrix output on matrix input', function () {
=======
    it('should return a matrix output on matrix input', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        math.diag(math.matrix([bignumber(1), bignumber(2)])),
        math.matrix([
          [bignumber(1), bignumber(0)],
          [bignumber(0), bignumber(2)]
        ])
      )
      assert.deepStrictEqual(
        math.diag(
          math.matrix([
            [bignumber(1), bignumber(2)],
            [bignumber(3), bignumber(4)]
          ])
        ),
        math.matrix([bignumber(1), bignumber(4)])
      )
    })

<<<<<<< HEAD
    it('should put vector on given diagonal k in returned matrix', function () {
=======
    it('should put vector on given diagonal k in returned matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(math.diag(array123, bignumber(1)), [
        [bignumber(0), bignumber(1), bignumber(0), bignumber(0)],
        [bignumber(0), bignumber(0), bignumber(2), bignumber(0)],
        [bignumber(0), bignumber(0), bignumber(0), bignumber(3)]
      ])
      assert.deepStrictEqual(math.diag(array123, bignumber(-1)), [
        [bignumber(0), bignumber(0), bignumber(0)],
        [bignumber(1), bignumber(0), bignumber(0)],
        [bignumber(0), bignumber(2), bignumber(0)],
        [bignumber(0), bignumber(0), bignumber(3)]
      ])
    })

<<<<<<< HEAD
    it('should return diagonal k from a matrix', function () {
=======
    it('should return diagonal k from a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(math.diag(array123456, bignumber(1)), [
        bignumber(2),
        bignumber(6)
      ])
      assert.deepStrictEqual(math.diag(array123456, bignumber(-1)), [
        bignumber(4)
      ])
      assert.deepStrictEqual(math.diag(array123456, bignumber(-2)), [])
    })
  })

<<<<<<< HEAD
  it('should throw an error of the input matrix is not valid', function () {
    assert.throws(function () {
=======
  it('should throw an error of the input matrix is not valid', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.diag([
        [[1], [2]],
        [[3], [4]]
      ])
    })
    // TODO: test diag for all types of input (also scalar)
  })

<<<<<<< HEAD
  it('should throw an error in case of wrong number of arguments', function () {
    assert.throws(function () {
      math.diag()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of wrong number of arguments', function (): void {
    assert.throws(function (): void {
      math.diag()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.diag([], 2, 'dense', 4)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
      math.diag(2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      math.diag(2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.diag([], new Date())
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX diag', function () {
=======
  it('should LaTeX diag', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expr1 = math.parse('diag([1,2,3])')
    const expr2 = math.parse('diag([1,2,3],1)')

    assert.strictEqual(
      expr1.toTex(),
      '\\mathrm{diag}\\left(\\begin{bmatrix}1\\\\2\\\\3\\end{bmatrix}\\right)'
    )
    assert.strictEqual(
      expr2.toTex(),
      '\\mathrm{diag}\\left(\\begin{bmatrix}1\\\\2\\\\3\\end{bmatrix},1\\right)'
    )
  })
})
