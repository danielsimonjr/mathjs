<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for equalText - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test equalText
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const matrix = math.matrix
const sparse = math.sparse
const equalText = math.equalText

<<<<<<< HEAD
describe('equalText', function () {
  it('should perform lexical comparison for two strings', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('equalText', function (): void {
  it('should perform lexical comparison for two strings', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(equalText('abd', 'abc'), false)
    assert.strictEqual(equalText('abc', 'abc'), true)
    assert.strictEqual(equalText('abc', 'abd'), false)

    // lexical sorting of strings
    assert.strictEqual(equalText('2', '10'), false)
    assert.strictEqual(equalText('10', '2'), false)
    assert.strictEqual(equalText('10', '10'), true)
    assert.strictEqual(equalText('2e3', '2000'), false)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should compare array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should compare array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(equalText('B', ['A', 'B', 'C']), [
        false,
        true,
        false
      ])
      assert.deepStrictEqual(equalText(['A', 'B', 'C'], 'B'), [
        false,
        true,
        false
      ])
    })

<<<<<<< HEAD
    it('should compare array - array', function () {
=======
    it('should compare array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        equalText(
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
          [false, false, true],
          [false, false, false]
        ]
      )
    })

<<<<<<< HEAD
    it('should compare array - dense matrix', function () {
=======
    it('should compare array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        equalText(
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
          [false, false, true],
          [false, false, false]
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
        equalText('B', matrix(['A', 'B', 'C'])),
        matrix([false, true, false])
      )
      assert.deepStrictEqual(
        equalText(matrix(['A', 'B', 'C']), 'B'),
        matrix([false, true, false])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - array', function () {
=======
    it('should compare dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        equalText(
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
          [false, false, true],
          [false, false, false]
        ])
      )
    })

<<<<<<< HEAD
    it('should compare dense matrix - dense matrix', function () {
=======
    it('should compare dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        equalText(
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
          [false, false, true],
          [false, false, false]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
      equalText(1, 2)
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      equalText(1, 2)
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      equalText(
        'A',
        sparse([
          ['A', 'B'],
          ['C', 'D']
        ])
      )
    }, /Cannot convert "A" to a number/)
<<<<<<< HEAD
    assert.throws(function () {
      equalText(bignumber(1), '2')
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function () {
=======
    assert.throws(function (): void {
      equalText(bignumber(1), '2')
    }, /TypeError: Unexpected type of argument in function compareText/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      equalText('2', bignumber(1))
    }, /TypeError: Unexpected type of argument in function compareText/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      equalText(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      equalText(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      equalText(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should LaTeX compare', function () {
=======
  it('should LaTeX compare', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('equalText(1,2)')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{equalText}\\left(1,2\\right)'
    )
  })
})
