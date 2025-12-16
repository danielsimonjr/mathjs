<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for reshape - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
import { DimensionError } from '../../../../src/error/DimensionError.js'

<<<<<<< HEAD
describe('reshape', function () {
  it('should reshape an array', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('reshape', function (): void {
  it('should reshape an array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const array = [
      [0, 1, 2],
      [3, 4, 5]
    ]
    assert.deepStrictEqual(math.reshape(array, [3, 2]), [
      [0, 1],
      [2, 3],
      [4, 5]
    ])

    // should not have mutated the input
    assert.deepStrictEqual(array, [
      [0, 1, 2],
      [3, 4, 5]
    ])
  })

<<<<<<< HEAD
  it('should reshape an array with bignumbers', function () {
=======
  it('should reshape an array with bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const zero = math.bignumber(0)
    const one = math.bignumber(1)
    const two = math.bignumber(2)
    const three = math.bignumber(3)
    const array = [zero, one, two, three]
    assert.deepStrictEqual(math.reshape(array, [two, two]), [
      [zero, one],
      [two, three]
    ])
  })

<<<<<<< HEAD
  it('should reshape a matrix', function () {
=======
  it('should reshape a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const matrix = math.matrix([
      [0, 1, 2],
      [3, 4, 5]
    ])
    assert.deepStrictEqual(
      math.reshape(matrix, [3, 2]),
      math.matrix([
        [0, 1],
        [2, 3],
        [4, 5]
      ])
    )
    assert.deepStrictEqual(
      math.reshape(matrix, math.matrix([3, 2])),
      math.matrix([
        [0, 1],
        [2, 3],
        [4, 5]
      ])
    )

    // should not have mutated the input
    assert.deepStrictEqual(
      matrix,
      math.matrix([
        [0, 1, 2],
        [3, 4, 5]
      ])
    )
  })

<<<<<<< HEAD
  it('should reshape a flat single-element array into multiple dimensions', function () {
=======
  it('should reshape a flat single-element array into multiple dimensions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const array = [3]
    assert.deepStrictEqual(math.reshape(array, [1, 1, 1]), [[[3]]])
  })

<<<<<<< HEAD
  it('should reshape a vector into a 2d matrix', function () {
=======
  it('should reshape a vector into a 2d matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const math2 = math.create({ matrix: 'Array' })
    assert.deepStrictEqual(math2.reshape([1, 2, 3, 4, 5, 6], [3, 2]), [
      [1, 2],
      [3, 4],
      [5, 6]
    ])
  })

<<<<<<< HEAD
  it('should reshape 2d matrix into a vector', function () {
=======
  it('should reshape 2d matrix into a vector', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const math2 = math.create({ matrix: 'Array' })
    assert.deepStrictEqual(
      math2.reshape(
        [
          [1, 2],
          [3, 4],
          [5, 6]
        ],
        [6]
      ),
      [1, 2, 3, 4, 5, 6]
    )
  })

<<<<<<< HEAD
  it('should throw an error on invalid arguments', function () {
    assert.throws(function () {
      math.reshape()
    }, /Too few arguments/)
    assert.throws(function () {
      math.reshape([])
    }, /Too few arguments/)
    assert.throws(function () {
      math.reshape([], 2)
    }, TypeError)
    assert.throws(function () {
      math.reshape([], [], 4)
    }, /Too many arguments/)

    assert.throws(function () {
      math.reshape([], ['no number'])
    }, /Cannot convert/)
    assert.throws(function () {
      math.reshape([], [2.3])
    }, /Invalid size/)

    assert.throws(function () {
      math.reshape([1, 2], [])
    }, DimensionError)
    assert.throws(function () {
      math.reshape([1, 2], [0])
    }, DimensionError)
    assert.throws(function () {
      math.reshape([1, 2], [0, 0])
    }, DimensionError)
    assert.throws(function () {
=======
  it('should throw an error on invalid arguments', function (): void {
    assert.throws(function (): void {
      math.reshape()
    }, /Too few arguments/)
    assert.throws(function (): void {
      math.reshape([])
    }, /Too few arguments/)
    assert.throws(function (): void {
      math.reshape([], 2)
    }, TypeError)
    assert.throws(function (): void {
      math.reshape([], [], 4)
    }, /Too many arguments/)

    assert.throws(function (): void {
      math.reshape([], ['no number'])
    }, /Cannot convert/)
    assert.throws(function (): void {
      math.reshape([], [2.3])
    }, /Invalid size/)

    assert.throws(function (): void {
      math.reshape([1, 2], [])
    }, DimensionError)
    assert.throws(function (): void {
      math.reshape([1, 2], [0])
    }, DimensionError)
    assert.throws(function (): void {
      math.reshape([1, 2], [0, 0])
    }, DimensionError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.reshape([[1, 2]], [0])
    }, DimensionError)
    assert.doesNotThrow(function () {
      math.reshape([[1, 2]], [2, 1])
    })
    assert.doesNotThrow(function () {
      math.reshape([[1, 2]], [2])
    })
  })

<<<<<<< HEAD
  it('should LaTeX reshape', function () {
=======
  it('should LaTeX reshape', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('reshape([1,2],1)')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{reshape}\\left(\\begin{bmatrix}1\\\\2\\end{bmatrix},1\\right)'
    )
  })

<<<<<<< HEAD
  it('should reshape a SparseMatrix', function () {
=======
  it('should reshape a SparseMatrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    /*
     * Must use toArray because SparseMatrix.reshape currently does not preserve
     * the order of the _index and _values arrays (this does not matter?)
     */

    let matrix = math.matrix(
      [
        [0, 1, 2],
        [3, 4, 5]
      ],
      'sparse'
    )
    assert.deepStrictEqual(math.reshape(matrix, [3, 2]).toArray(), [
      [0, 1],
      [2, 3],
      [4, 5]
    ])

    assert.deepStrictEqual(math.reshape(matrix, [6, 1]).toArray(), [
      [0],
      [1],
      [2],
      [3],
      [4],
      [5]
    ])

    assert.deepStrictEqual(math.reshape(matrix, [1, 6]).toArray(), [
      [0, 1, 2, 3, 4, 5]
    ])

    matrix = math.matrix([[0, 1, 2, 3, 4, 5]], 'sparse')
    assert.deepStrictEqual(math.reshape(matrix, [3, 2]).toArray(), [
      [0, 1],
      [2, 3],
      [4, 5]
    ])

    matrix = math.matrix([[0], [1], [2], [3], [4], [5]], 'sparse')
    assert.deepStrictEqual(math.reshape(matrix, [3, 2]).toArray(), [
      [0, 1],
      [2, 3],
      [4, 5]
    ])
  })

<<<<<<< HEAD
  it('should throw on attempting to reshape an ImmutableDenseMatrix', function () {
=======
  it('should throw on attempting to reshape an ImmutableDenseMatrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const immutableMatrix = new math.ImmutableDenseMatrix([
      [1, 2],
      [3, 4]
    ])
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.reshape(immutableMatrix, [1, 4])
    }, /Cannot invoke reshape on an Immutable Matrix instance/)
  })

<<<<<<< HEAD
  it('should throw on attempting to reshape a Matrix (abstract type)', function () {
=======
  it('should throw on attempting to reshape a Matrix (abstract type)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const matrix = new math.Matrix([
      [1, 2],
      [3, 4]
    ])
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.reshape(matrix, [1, 4])
    }, /Cannot invoke reshape on a Matrix interface/)
  })

<<<<<<< HEAD
  it('should support only one wildcard', function () {
=======
  it('should support only one wildcard', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.reshape([1, 2, 3, 4], [-1, 2]), [
      [1, 2],
      [3, 4]
    ])
    assert.deepStrictEqual(
      math.reshape(
        [
          [1, 2],
          [3, 4]
        ],
        [-1]
      ),
      [1, 2, 3, 4]
    )
<<<<<<< HEAD
    assert.throws(function () {
      math.reshape([1, 2], [-1, -1])
    })
    assert.throws(function () {
=======
    assert.throws(function (): void {
      math.reshape([1, 2], [-1, -1])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.reshape([1], [-1, -1])
    })
  })

<<<<<<< HEAD
  it('should throw an error when wildcard cannot be replaced', function () {
    assert.throws(function () {
      math.reshape([1, 2, 3, 4], [-1, 3])
    })
    assert.throws(function () {
=======
  it('should throw an error when wildcard cannot be replaced', function (): void {
    assert.throws(function (): void {
      math.reshape([1, 2, 3, 4], [-1, 3])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.reshape(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        [4, -1]
      )
    })
  })

<<<<<<< HEAD
  it('should use wildcard with DenseMatrix', function () {
=======
  it('should use wildcard with DenseMatrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const matrix = math.matrix([
      [0, 1, 2],
      [3, 4, 5]
    ])
    assert.deepStrictEqual(
      math.reshape(matrix, [-1, 2]),
      math.matrix([
        [0, 1],
        [2, 3],
        [4, 5]
      ])
    )
    assert.deepStrictEqual(
      math.reshape(matrix, math.matrix([-1, 2])),
      math.matrix([
        [0, 1],
        [2, 3],
        [4, 5]
      ])
    )
  })

<<<<<<< HEAD
  it('should use wildcard with SparseArray', function () {
=======
  it('should use wildcard with SparseArray', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const matrix = math.matrix(
      [
        [0, 1, 2],
        [3, 4, 5]
      ],
      'sparse'
    )
    assert.deepStrictEqual(math.reshape(matrix, [-1, 2]).toArray(), [
      [0, 1],
      [2, 3],
      [4, 5]
    ])
    assert.deepStrictEqual(math.reshape(matrix, [3, -1]).toArray(), [
      [0, 1],
      [2, 3],
      [4, 5]
    ])
  })

<<<<<<< HEAD
  it("should update a matrix's size correctly when using wildcard", function () {
=======
  it("should update a matrix's size correctly when using wildcard", function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const matrix = math.matrix([
      [0, 1, 2],
      [3, 4, 5]
    ])
    const size = math.reshape(matrix, [-1, 2])._size
    assert.deepStrictEqual(size, [3, 2])
  })

<<<<<<< HEAD
  it('should be parseable', function () {
=======
  it('should be parseable', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.evaluate('reshape([0,1,2,3,4,5], [-1,2])'),
      math.matrix([
        [0, 1],
        [2, 3],
        [4, 5]
      ])
    )
  })
})
