/**
 * Test for count - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

const { count, matrix, sparse } = math

interface MathNode {
  type: string
  toTex(): string
}

describe('count', function (): void {
  it('should count arrays', function (): void {
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

  it('should count dense matrices', function (): void {
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

  it('should count sparse matrices', function (): void {
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

  it('should count strings', function (): void {
    assert.strictEqual(count('123456'), 6)
    assert.strictEqual(count(''), 0)
  })

  it('should throw an error if called with an invalid number of arguments', function (): void {
    assert.throws(function (): void {
      count()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      count([1], 2)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error if called with invalid type of arguments', function (): void {
    assert.throws(function (): void {
      count(new Date())
    }, /TypeError: Unexpected type of argument/)
  })
})
