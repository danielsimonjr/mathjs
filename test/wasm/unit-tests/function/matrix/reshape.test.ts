/**
 * Test for reshape - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
import { DimensionError } from '../../../../src/error/DimensionError.js'

interface MathNode {
  type: string
  toTex(): string
}

describe('reshape', function (): void {
  it('should reshape an array', function (): void {
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

  it('should reshape an array with bignumbers', function (): void {
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

  it('should reshape a matrix', function (): void {
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

  it('should reshape a flat single-element array into multiple dimensions', function (): void {
    const array = [3]
    assert.deepStrictEqual(math.reshape(array, [1, 1, 1]), [[[3]]])
  })

  it('should reshape a vector into a 2d matrix', function (): void {
    const math2 = math.create({ matrix: 'Array' })
    assert.deepStrictEqual(math2.reshape([1, 2, 3, 4, 5, 6], [3, 2]), [
      [1, 2],
      [3, 4],
      [5, 6]
    ])
  })

  it('should reshape 2d matrix into a vector', function (): void {
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
      math.reshape([[1, 2]], [0])
    }, DimensionError)
    assert.doesNotThrow(function () {
      math.reshape([[1, 2]], [2, 1])
    })
    assert.doesNotThrow(function () {
      math.reshape([[1, 2]], [2])
    })
  })

  it('should LaTeX reshape', function (): void {
    const expression = math.parse('reshape([1,2],1)')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{reshape}\\left(\\begin{bmatrix}1\\\\2\\end{bmatrix},1\\right)'
    )
  })

  it('should reshape a SparseMatrix', function (): void {
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

  it('should throw on attempting to reshape an ImmutableDenseMatrix', function (): void {
    const immutableMatrix = new math.ImmutableDenseMatrix([
      [1, 2],
      [3, 4]
    ])
    assert.throws(function (): void {
      math.reshape(immutableMatrix, [1, 4])
    }, /Cannot invoke reshape on an Immutable Matrix instance/)
  })

  it('should throw on attempting to reshape a Matrix (abstract type)', function (): void {
    const matrix = new math.Matrix([
      [1, 2],
      [3, 4]
    ])
    assert.throws(function (): void {
      math.reshape(matrix, [1, 4])
    }, /Cannot invoke reshape on a Matrix interface/)
  })

  it('should support only one wildcard', function (): void {
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
    assert.throws(function (): void {
      math.reshape([1, 2], [-1, -1])
    })
    assert.throws(function (): void {
      math.reshape([1], [-1, -1])
    })
  })

  it('should throw an error when wildcard cannot be replaced', function (): void {
    assert.throws(function (): void {
      math.reshape([1, 2, 3, 4], [-1, 3])
    })
    assert.throws(function (): void {
      math.reshape(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        [4, -1]
      )
    })
  })

  it('should use wildcard with DenseMatrix', function (): void {
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

  it('should use wildcard with SparseArray', function (): void {
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

  it("should update a matrix's size correctly when using wildcard", function (): void {
    const matrix = math.matrix([
      [0, 1, 2],
      [3, 4, 5]
    ])
    const size = math.reshape(matrix, [-1, 2])._size
    assert.deepStrictEqual(size, [3, 2])
  })

  it('should be parseable', function (): void {
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
