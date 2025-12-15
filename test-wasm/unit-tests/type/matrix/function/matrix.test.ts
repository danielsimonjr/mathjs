/**
 * Test for matrix - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'
const matrix = math.matrix

interface MathNode {
  type: string
  toTex(): string
}

describe('matrix', function (): void {
  it('should create an empty matrix with one dimension if called without argument', function (): void {
    const a = matrix()
    assert.ok(a instanceof math.Matrix)
    assert.deepStrictEqual(math.size(a), [0]) // TODO: wouldn't it be nicer if an empty matrix has zero dimensions?
  })

  it('should create empty matrix, dense format', function (): void {
    const a = matrix('dense')
    assert.ok(a instanceof math.Matrix)
    assert.deepStrictEqual(math.size(a), [0])
  })

  it('should create empty matrix, dense format, number datatype', function (): void {
    const a = matrix('dense', 'number')
    assert.ok(a instanceof math.Matrix)
    assert.deepStrictEqual(math.size(a), [0])
    assert(a.datatype(), 'number')
  })

  it('should create empty matrix, sparse', function (): void {
    const a = matrix('sparse')
    assert.ok(a instanceof math.Matrix)
  })

  it('should create a matrix from an array', function (): void {
    const b = matrix([
      [1, 2],
      [3, 4]
    ])
    assert.ok(b instanceof math.Matrix)
    assert.deepStrictEqual(
      b,
      matrix([
        [1, 2],
        [3, 4]
      ])
    )
    assert.deepStrictEqual(math.size(b), [2, 2])
  })

  it('should be the identity if called with a matrix, dense format', function (): void {
    const b = matrix(
      [
        [1, 2],
        [3, 4]
      ],
      'dense'
    )
    const c = matrix(b, 'dense')
    assert.ok(c._data !== b._data) // data should be cloned
    assert.deepStrictEqual(
      c,
      matrix(
        [
          [1, 2],
          [3, 4]
        ],
        'dense'
      )
    )
    assert.deepStrictEqual(math.size(c), [2, 2])
  })

  it('should be the identity if called with a matrix, dense format, number datatype', function (): void {
    const b = matrix(
      [
        [1, 2],
        [3, 4]
      ],
      'dense',
      'number'
    )
    const c = matrix(b, 'dense')
    assert.ok(c._data !== b._data) // data should be cloned
    assert.ok(c._size !== b._size)
    assert.deepStrictEqual(c._data, b._data)
    assert.deepStrictEqual(c._size, b._size)
    assert.ok(c.datatype() === 'number')
  })

  it('should be the identity if called with a matrix, sparse', function (): void {
    const b = matrix(
      [
        [1, 2],
        [3, 4]
      ],
      'sparse'
    )
    const c = matrix(b, 'sparse')
    assert.ok(c._values !== b._values) // data should be cloned
    assert.deepStrictEqual(
      c,
      matrix(
        [
          [1, 2],
          [3, 4]
        ],
        'sparse'
      )
    )
  })

  it('should be the identity if called with a matrix, sparse, number datatype', function (): void {
    const b = matrix(
      [
        [1, 2],
        [3, 4]
      ],
      'sparse',
      'number'
    )
    const c = matrix(b, 'sparse')
    assert.ok(c._values !== b._values) // data should be cloned
    assert.deepStrictEqual(c.valueOf(), b.valueOf())
    assert.ok(c.datatype() === 'number')
  })

  it('should create a matrix from a range correctly', function (): void {
    const d = matrix(math.range(1, 6))
    assert.ok(d instanceof math.Matrix)
    assert.deepStrictEqual(d, matrix([1, 2, 3, 4, 5]))
    assert.deepStrictEqual(math.size(d), [5])
  })

  it('should throw an error if called with an invalid argument', function (): void {
    assert.throws(function (): void {
      matrix(new Date())
    }, TypeError)
  })

  it('should throw an error if called with a unit', function (): void {
    assert.throws(function (): void {
      matrix(math.unit('5cm'))
    }, TypeError)
  })

  it('should throw an error if called with too many arguments', function (): void {
    assert.throws(function (): void {
      matrix([], 'dense', 'number', 7)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error when called with an invalid storage format', function (): void {
    assert.throws(function (): void {
      math.matrix([], '1')
    }, /TypeError: Unknown matrix type "1"/)
  })

  it('should throw an error when called with an unknown storage format', function (): void {
    assert.throws(function (): void {
      math.matrix([], '123')
    }, /TypeError: Unknown matrix type "123"/)
  })

  it('should LaTeX matrix', function (): void {
    const expr1 = math.parse('matrix()') as MathNode
    const expr2 = math.parse('matrix([1])') as MathNode

    assert.strictEqual(expr1.toTex(), '\\begin{bmatrix}\\end{bmatrix}')
    assert.strictEqual(
      expr2.toTex(),
      '\\left(\\begin{bmatrix}1\\end{bmatrix}\\right)'
    )
  })
})
