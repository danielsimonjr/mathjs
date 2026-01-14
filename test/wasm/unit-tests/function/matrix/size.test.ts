/**
 * Test for size - AssemblyScript-friendly TypeScript
 */
// test size
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const size = math.size
const matrix = math.matrix

interface MathNode {
  type: string
  toTex(): string
}

describe('size', function (): void {
  it('should calculate the size of an array', function (): void {
    assert.deepStrictEqual(
      size([
        [1, 2, 3],
        [4, 5, 6]
      ]),
      [2, 3]
    )
    assert.deepStrictEqual(
      size([
        [
          [1, 2],
          [3, 4]
        ],
        [
          [5, 6],
          [7, 8]
        ]
      ]),
      [2, 2, 2]
    )
    assert.deepStrictEqual(size([1, 2, 3]), [3])
    assert.deepStrictEqual(size([[1], [2], [3]]), [3, 1])
    assert.deepStrictEqual(size([100]), [1])
    assert.deepStrictEqual(size([[100]]), [1, 1])
    assert.deepStrictEqual(size([[[100]]]), [1, 1, 1])
    assert.deepStrictEqual(size([]), [0])
    assert.deepStrictEqual(size([[]]), [1, 0])
    assert.deepStrictEqual(size([[[]]]), [1, 1, 0])
    assert.deepStrictEqual(size([[[], []]]), [1, 2, 0])
  })

  it('should calculate the size of a DenseMatrix', function (): void {
    assert.deepStrictEqual(size(matrix()), [0])
    assert.deepStrictEqual(
      size(
        matrix([
          [1, 2, 3],
          [4, 5, 6]
        ])
      ),
      [2, 3]
    )
    assert.deepStrictEqual(size(matrix([[], []])), [2, 0])
  })

  it('should calculate the size of a SparseMatrix', function (): void {
    assert.deepStrictEqual(size(matrix('sparse')), [0, 0])
    assert.deepStrictEqual(
      size(
        matrix(
          [
            [1, 2, 3],
            [4, 5, 6]
          ],
          'sparse'
        )
      ),
      [2, 3]
    )
    assert.deepStrictEqual(size(matrix([[], []], 'sparse')), [2, 0])
  })

  it('should calculate the size of a range', function (): void {
    assert.deepStrictEqual(size(math.range(2, 6)), [4])
  })

  it('should calculate the size of a scalar', function (): void {
    assert.deepStrictEqual(size(2), [])
    assert.deepStrictEqual(size(math.bignumber(2)), [])
    assert.deepStrictEqual(size(math.complex(2, 3)), [])
    assert.deepStrictEqual(size(true), [])
    assert.deepStrictEqual(size(null), [])
  })

  it('should calculate the size of a scalar with setting matrix=="array"', function (): void {
    const math2 = math.create({ matrix: 'Array' })
    assert.deepStrictEqual(math2.size(2), [])
    assert.deepStrictEqual(math2.size(math2.bignumber(2)), [])
    assert.deepStrictEqual(math2.size(math2.complex(2, 3)), [])
    assert.deepStrictEqual(math2.size('string'), [6])
  })

  it('should calculate the size of a string', function (): void {
    assert.deepStrictEqual(size('hello'), [5])
    assert.deepStrictEqual(size(''), [0])
  })

  it('should throw an error if called with an invalid number of arguments', function (): void {
    assert.throws(function (): void {
      size()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      size(1, 2)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error if called with invalid type of arguments', function (): void {
    assert.throws(function (): void {
      size(new Date())
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX size', function (): void {
    const expression = math.parse('size(1)')
    assert.strictEqual(expression.toTex(), '\\mathrm{size}\\left(1\\right)')
  })
})
