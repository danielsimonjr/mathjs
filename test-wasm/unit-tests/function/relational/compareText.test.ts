<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for compareText - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test compareText
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const matrix = math.matrix
const sparse = math.sparse
const compareText = math.compareText

<<<<<<< HEAD
describe('compareText', function () {
  it('should perform lexical comparison for two strings', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('compareText', function (): void {
  it('should perform lexical comparison for two strings', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(compareText('abd', 'abc'), 1)
    assert.strictEqual(compareText('abc', 'abc'), 0)
    assert.strictEqual(compareText('abc', 'abd'), -1)

    // lexical sorting of strings
    assert.strictEqual(compareText('2', '10'), 1)
    assert.strictEqual(compareText('10', '2'), -1)
    assert.strictEqual(compareText('10', '10'), 0)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should compare array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(compareText('B', ['A', 'B', 'C']), [1, 0, -1])
      assert.deepStrictEqual(compareText(['A', 'B', 'C'], 'B'), [-1, 0, 1])
    })

<<<<<<< HEAD
    it('should compare array - array', function () {
=======
    it('should compare array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        compareText(
          [
            ['D', 'E', 'C'],
            ['B', 'C', 'E']
          ],
          [
            ['F', 'B', 'C'],
            ['A', 'D', 'C']
          ]
        ),
        [
          [-1, 1, 0],
          [1, -1, 1]
        ]
      )
    })

<<<<<<< HEAD
    it('should compare broadcastable arrays', function () {
=======
    it('should compare broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(compareText([['D', 'E', 'C']], [['F'], ['D']]), [
        [-1, -1, -1],
        [0, 1, -1]
      ])
    })

<<<<<<< HEAD
    it('should compare array - dense matrix', function () {
=======
    it('should compare array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        compareText(
          [
            ['D', 'E', 'C'],
            ['B', 'C', 'E']
          ],
          matrix([
            ['F', 'B', 'C'],
            ['A', 'D', 'C']
          ])
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should compare dense matrix - scalar', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should compare dense matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        compareText('B', matrix(['A', 'B', 'C'])),
        matrix([1, 0, -1])
      )
      assert.deepStrictEqual(
        compareText(matrix(['A', 'B', 'C']), 'B'),
        matrix([-1, 0, 1])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - array', function () {
=======
    it('should compare dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        compareText(
          matrix([
            ['D', 'E', 'C'],
            ['B', 'C', 'E']
          ]),
          [
            ['F', 'B', 'C'],
            ['A', 'D', 'C']
          ]
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - dense matrix', function () {
=======
    it('should compare dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        compareText(
          matrix([
            ['D', 'E', 'C'],
            ['B', 'C', 'E']
          ]),
          matrix([
            ['F', 'B', 'C'],
            ['A', 'D', 'C']
          ])
        ),
        matrix([
          [-1, 1, 0],
          [1, -1, 1]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
      compareText(1, 2)
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      compareText(1, 2)
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      compareText(
        'A',
        sparse([
          ['A', 'B'],
          ['C', 'D']
        ])
      )
    }, /Cannot convert "A" to a number/)
<<<<<<< HEAD
    assert.throws(function () {
      compareText(bignumber(1), '2')
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function () {
=======
    assert.throws(function (): void {
      compareText(bignumber(1), '2')
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      compareText('2', bignumber(1))
    }, /TypeError: Unexpected type of argument in function compareText/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      compareText(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      compareText(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      compareText(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX compare', function () {
=======
  it('should LaTeX compare', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('compareText(1,2)')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{compareText}\\left(1,2\\right)'
    )
  })
})
