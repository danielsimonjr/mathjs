<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for count - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const { count, matrix, sparse } = math

<<<<<<< HEAD
describe('count', function () {
  it('should count arrays', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('count', function (): void {
  it('should count arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      count([
        [1, 2, 3],
        [4, 5, 6]
      ]),
      6
    )
    assert.strictEqual(
      count([
        [
          [1, 2],
          [3, 4]
        ],
        [
          [5, 6],
          [7, 8]
        ]
      ]),
      8
    )
    assert.strictEqual(count([]), 0)
    assert.strictEqual(count([[]]), 0)
  })

<<<<<<< HEAD
  it('should count dense matrices', function () {
=======
  it('should count dense matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      count(
        matrix([
          [1, 2, 3],
          [4, 5, 6]
        ])
      ),
      6
    )
    assert.strictEqual(
      count(
        matrix([
          [
            [1, 2],
            [3, 4]
          ],
          [
            [5, 6],
            [7, 8]
          ]
        ])
      ),
      8
    )
    assert.strictEqual(count(matrix([])), 0)
    assert.strictEqual(count(matrix([[]])), 0)
  })

<<<<<<< HEAD
  it('should count sparse matrices', function () {
=======
  it('should count sparse matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(
      count(
        sparse([
          [1, 2, 3],
          [4, 5, 6]
        ])
      ),
      6
    )
    assert.strictEqual(count(sparse([])), 0)
    assert.strictEqual(count(sparse([[]])), 0)
  })

<<<<<<< HEAD
  it('should count strings', function () {
=======
  it('should count strings', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(count('123456'), 6)
    assert.strictEqual(count(''), 0)
  })

<<<<<<< HEAD
  it('should throw an error if called with an invalid number of arguments', function () {
    assert.throws(function () {
      count()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error if called with an invalid number of arguments', function (): void {
    assert.throws(function (): void {
      count()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      count([1], 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error if called with invalid type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with invalid type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      count(new Date())
    }, /TypeError: Unexpected type of argument/)
  })
})
