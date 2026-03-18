/**
 * Test for error/DimensionError - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import { DimensionError } from '../../../src/error/DimensionError.js'

describe('DimensionError', function (): void {
  it('should construct a DimensionError with numbers', function (): void {
    const err = new DimensionError(3, 5)
    assert(err instanceof Error)
    assert(err instanceof RangeError)
    assert(err instanceof DimensionError)
    assert.strictEqual(err.actual, 3)
    assert.strictEqual(err.expected, 5)
    assert.strictEqual(err.relation, undefined)
    assert.strictEqual(
      err.toString(),
      'DimensionError: Dimension mismatch (3 != 5)'
    )
  })

  it('should construct a DimensionError with numbers and a custom relation', function (): void {
    const err = new DimensionError(3, 5, '<')
    assert(err instanceof Error)
    assert(err instanceof RangeError)
    assert(err instanceof DimensionError)
    assert.strictEqual(err.actual, 3)
    assert.strictEqual(err.expected, 5)
    assert.strictEqual(err.relation, '<')
    assert.strictEqual(
      err.toString(),
      'DimensionError: Dimension mismatch (3 < 5)'
    )
  })

  it('should construct a DimensionError with arrays', function (): void {
    const err = new DimensionError([2, 3], [1, 3])
    assert(err instanceof Error)
    assert(err instanceof RangeError)
    assert(err instanceof DimensionError)
    assert.deepStrictEqual(err.actual, [2, 3])
    assert.deepStrictEqual(err.expected, [1, 3])
    assert.strictEqual(err.relation, undefined)
    assert.strictEqual(
      err.toString(),
      'DimensionError: Dimension mismatch ([2, 3] != [1, 3])'
    )
  })

  it('should construct a DimensionError with arrays and a custom relation', function (): void {
    const err = new DimensionError([2, 3], [1, 3], '<')
    assert(err instanceof Error)
    assert(err instanceof RangeError)
    assert(err instanceof DimensionError)
    assert.deepStrictEqual(err.actual, [2, 3])
    assert.deepStrictEqual(err.expected, [1, 3])
    assert.strictEqual(err.relation, '<')
    assert.strictEqual(
      err.toString(),
      'DimensionError: Dimension mismatch ([2, 3] < [1, 3])'
    )
  })

  it('should throw an error when operator new is missing', function (): void {
    assert.throws(function (): void {
      DimensionError(3, 5)
    }, SyntaxError)
  })
})
