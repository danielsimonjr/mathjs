/**
 * Test for hasNumericValue function - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

const hasNumericValue = math.hasNumericValue
const bignumber = math.bignumber
const bigint = math.bigint
const fraction = math.fraction

describe('hasNumericValue', function (): void {
  it('should test whether a value is numeric', function (): void {
    assert.strictEqual(hasNumericValue(2), true)
    assert.strictEqual(hasNumericValue(true), true)
    assert.strictEqual(hasNumericValue(bignumber(2.3)), true)
    assert.strictEqual(hasNumericValue(bigint('42')), true)
    assert.strictEqual(hasNumericValue(42n), true)
    assert.strictEqual(hasNumericValue(fraction(1, 3)), true)

    assert.strictEqual(hasNumericValue('2'), true)
    assert.strictEqual(hasNumericValue(' 2'), true)
    assert.strictEqual(hasNumericValue('2.3'), true)
    assert.strictEqual(hasNumericValue(true), true)
    assert.strictEqual(hasNumericValue(false), true)
    assert.strictEqual(hasNumericValue('100a'), false)
    assert.strictEqual(hasNumericValue('0x11'), true)
    // The following two tests are not working on IE11
    // assert.strictEqual(hasNumericValue('0b11'), true)
    // assert.strictEqual(hasNumericValue('0o11'), true)
    assert.strictEqual(hasNumericValue('123e-1'), true)
    assert.strictEqual(hasNumericValue(''), false)
    assert.strictEqual(hasNumericValue('foo'), false)
    assert.strictEqual(hasNumericValue(math.complex(2, 3)), false)
    assert.strictEqual(hasNumericValue(math.unit('5 cm')), false)
    assert.strictEqual(hasNumericValue(null), false)
    assert.strictEqual(hasNumericValue(undefined), false)
    assert.strictEqual(hasNumericValue(math.parse('2+4')), false)
  })

  it('should test hasNumericValue element wise on an Array', function (): void {
    assert.deepStrictEqual(hasNumericValue([2, 'foo', true]), [
      true,
      false,
      true
    ])
  })

  it('should test hasNumericValue element wise on a Matrix', function (): void {
    assert.deepStrictEqual(
      hasNumericValue(math.matrix([2, 'foo', true])),
      math.matrix([true, false, true])
    )
  })

  it('should throw an error in case of unsupported data types', function (): void {
    assert.throws(function (): void {
      hasNumericValue(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      hasNumericValue({})
    }, /TypeError: Unexpected type of argument/)
  })
})
