/**
 * Test for isCollection - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'
import { isCollection } from '../../../../../src/utils/is.js'

const DenseMatrix = math.DenseMatrix

describe('isCollection', function (): void {
  it('should return true for simple arrays', function (): void {
    assert.strictEqual(isCollection([1, 2, 3]), true)
  })

  it('should return true for nested arrays', function (): void {
    assert.strictEqual(
      isCollection([
        [1, 2],
        [3, [4, 5]]
      ]),
      true
    )
  })

  it('should return true for empty arrays', function (): void {
    assert.strictEqual(isCollection([]), true)
  })

  it('should return true for DenseMatrix instances', function (): void {
    const matrix = new DenseMatrix([
      [1, 2],
      [3, 4]
    ])
    assert.strictEqual(isCollection(matrix), true)
  })

  it('should return true for SparseMatrix instances', function (): void {
    const matrix = math.sparse([
      [1, 2],
      [3, 4]
    ])
    assert.strictEqual(isCollection(matrix), true)
  })

  it('should return false for simple objects', function (): void {
    assert.strictEqual(isCollection({ a: 1, b: 2 }), false)
  })

  it('should return false for numbers', function (): void {
    assert.strictEqual(isCollection(123), false)
  })

  it('should return false for strings', function (): void {
    assert.strictEqual(isCollection('string'), false)
  })

  it('should return false for null', function (): void {
    assert.strictEqual(isCollection(null), false)
  })

  it('should return false for undefined', function (): void {
    assert.strictEqual(isCollection(undefined), false)
  })

  it('should return false for boolean values', function (): void {
    assert.strictEqual(isCollection(true), false)
    assert.strictEqual(isCollection(false), false)
  })

  it('should return false for complex numbers', function (): void {
    const complex = math.complex(2, 3)
    assert.strictEqual(isCollection(complex), false)
  })

  it('should return false for functions', function (): void {
    const func = () => {}
    assert.strictEqual(isCollection(func), false)
  })
})
