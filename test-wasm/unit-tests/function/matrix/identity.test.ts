<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for identity - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const matrix = math.matrix
const identity = math.identity

<<<<<<< HEAD
describe('identity', function () {
  it('should create an empty matrix', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('identity', function (): void {
  it('should create an empty matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(identity(), matrix())
    assert.deepStrictEqual(identity([]), [])
    assert.deepStrictEqual(identity(matrix([])), matrix())
  })

<<<<<<< HEAD
  it('should create an empty sparse matrix', function () {
=======
  it('should create an empty sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(identity('sparse'), matrix('sparse'))
    assert.deepStrictEqual(identity(matrix([], 'sparse')), matrix('sparse'))
  })

<<<<<<< HEAD
  it('should create an identity matrix of the given size', function () {
=======
  it('should create an identity matrix of the given size', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(identity(1), matrix([[1]]))
    assert.deepStrictEqual(
      identity(2),
      matrix([
        [1, 0],
        [0, 1]
      ])
    )
    assert.deepStrictEqual(identity([2]), [
      [1, 0],
      [0, 1]
    ])
    assert.deepStrictEqual(
      identity(2, 3),
      matrix([
        [1, 0, 0],
        [0, 1, 0]
      ])
    )
    assert.deepStrictEqual(
      identity(3, 2),
      matrix([
        [1, 0],
        [0, 1],
        [0, 0]
      ])
    )
    assert.deepStrictEqual(identity([3, 2]), [
      [1, 0],
      [0, 1],
      [0, 0]
    ])
    assert.deepStrictEqual(
      identity(math.matrix([3, 2])),
      matrix([
        [1, 0],
        [0, 1],
        [0, 0]
      ])
    )
    assert.deepStrictEqual(
      identity(3, 3),
      matrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ])
    )
  })

<<<<<<< HEAD
  it('should create an identity matrix with storage type css of the given size', function () {
=======
  it('should create an identity matrix with storage type css of the given size', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(identity(1, 'sparse'), matrix([[1]], 'sparse'))
    assert.deepStrictEqual(
      identity(2, 'sparse'),
      matrix(
        [
          [1, 0],
          [0, 1]
        ],
        'sparse'
      )
    )
    assert.deepStrictEqual(
      identity(2, 3, 'sparse'),
      matrix(
        [
          [1, 0, 0],
          [0, 1, 0]
        ],
        'sparse'
      )
    )
    assert.deepStrictEqual(
      identity(3, 2, 'sparse'),
      matrix(
        [
          [1, 0],
          [0, 1],
          [0, 0]
        ],
        'sparse'
      )
    )
    assert.deepStrictEqual(
      identity(3, 3, 'sparse'),
      matrix(
        [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1]
        ],
        'sparse'
      )
    )
  })

<<<<<<< HEAD
  it('should create an identity matrix with bignumbers', function () {
=======
  it('should create an identity matrix with bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const zero = math.bignumber(0)
    const one = math.bignumber(1)
    const two = math.bignumber(2)
    const three = math.bignumber(3)
    assert.deepStrictEqual(
      identity(two),
      matrix([
        [one, zero],
        [zero, one]
      ])
    )
    // assert.deepStrictEqual(identity(two, 'sparse'), matrix([[one,zero],[zero,one]], 'sparse')); // FIXME: identity css
    assert.deepStrictEqual(
      identity(two, three),
      matrix([
        [one, zero, zero],
        [zero, one, zero]
      ])
    )
    // assert.deepStrictEqual(identity(two, three, 'sparse'), matrix([[one,zero,zero],[zero,one,zero]], 'sparse')); // FIXME: identity css
  })

<<<<<<< HEAD
  it('should return an array when setting matrix=="array"', function () {
=======
  it('should return an array when setting matrix=="array"', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const math2 = math.create({ matrix: 'Array' })
    assert.deepStrictEqual(math2.identity(2), [
      [1, 0],
      [0, 1]
    ])
  })

<<<<<<< HEAD
  it('should throw an error with an invalid input', function () {
    assert.throws(function () {
      identity(3, 3, 2)
    })
    assert.throws(function () {
      identity([3, 3, 2])
    })
    assert.throws(function () {
      identity([3, 3], 2)
    })
    assert.throws(function () {
      identity([3.2, 3])
    })
    assert.throws(function () {
      identity([3, 3.2])
    })
    assert.throws(function () {
      identity([3.2, 3.2])
    })
    assert.throws(function () {
      identity([2, 'str'])
    })
    assert.throws(function () {
      identity(['str', 2])
    })
    assert.throws(function () {
      identity([-2, 2])
    })
    assert.throws(function () {
=======
  it('should throw an error with an invalid input', function (): void {
    assert.throws(function (): void {
      identity(3, 3, 2)
    })
    assert.throws(function (): void {
      identity([3, 3, 2])
    })
    assert.throws(function (): void {
      identity([3, 3], 2)
    })
    assert.throws(function (): void {
      identity([3.2, 3])
    })
    assert.throws(function (): void {
      identity([3, 3.2])
    })
    assert.throws(function (): void {
      identity([3.2, 3.2])
    })
    assert.throws(function (): void {
      identity([2, 'str'])
    })
    assert.throws(function (): void {
      identity(['str', 2])
    })
    assert.throws(function (): void {
      identity([-2, 2])
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      identity([2, -2])
    })
  })

<<<<<<< HEAD
  it('should LaTeX identity', function () {
=======
  it('should LaTeX identity', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('identity(2)')
    assert.strictEqual(expression.toTex(), '\\mathrm{identity}\\left(2\\right)')
  })
})
