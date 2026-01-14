/**
 * Test for ResultSet - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const Complex = math.Complex
const ResultSet = math.ResultSet

describe('ResultSet', function (): void {
  it('should create a ResultSet without entries', function (): void {
    const r = new ResultSet()
    assert.deepStrictEqual(r.entries, [])
  })

  it('should create a ResultSet with entries', function (): void {
    const r = new ResultSet([1, 2, 3])
    assert.deepStrictEqual(r.entries, [1, 2, 3])
  })

  it('should throw an error when called without the new operator', function (): void {
    assert.throws(function (): void {
      ResultSet([1, 2, 3])
    })
  })

  it('should return an Array when calling valueOf()', function (): void {
    const r = new ResultSet([1, 2, 3])
    assert.deepStrictEqual(r.valueOf(), [1, 2, 3])
  })

  it('should return a string when calling toString()', function (): void {
    const r = new ResultSet([1, 2, 3, new Complex(4, 5)])
    assert.deepStrictEqual(r.toString(), '[1, 2, 3, 4 + 5i]')
  })

  it('should have a property isResultSet', function (): void {
    const a = new math.ResultSet([])
    assert.strictEqual(a.isResultSet, true)
  })

  it('should have a property type', function (): void {
    const a = new math.ResultSet([])
    assert.strictEqual(a.type, 'ResultSet')
  })

  it('toJSON', function (): void {
    const r = new ResultSet([1, 2, 3])
    const json = { mathjs: 'ResultSet', entries: [1, 2, 3] }
    assert.deepStrictEqual(r.toJSON(), json)
  })

  it('fromJSON', function (): void {
    const r1 = new ResultSet([1, 2, 3])
    const json = { mathjs: 'ResultSet', entries: [1, 2, 3] }
    const r2 = ResultSet.fromJSON(json)
    assert(r2 instanceof ResultSet)
    assert.deepStrictEqual(r2, r1)
  })
})
