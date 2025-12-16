/**
 * Test for boolean - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../src/defaultInstance.ts'
const bool = math.boolean

interface MathNode {
  type: string
  toTex(): string
}

describe('boolean', function (): void {
  it('should convert a boolean to a boolean', function (): void {
    assert.strictEqual(bool(true), true)
    assert.strictEqual(bool(false), false)
  })

  it('should convert null to a boolean', function (): void {
    assert.strictEqual(bool(null), false)
  })

  it('should convert a number into a boolean', function (): void {
    assert.strictEqual(bool(-2), true)
    assert.strictEqual(bool(-1), true)
    assert.strictEqual(bool(0), false)
    assert.strictEqual(bool(1), true)
    assert.strictEqual(bool(2), true)
  })

  it('should convert a bignumber into a boolean', function (): void {
    assert.strictEqual(bool(math.bignumber(-2)), true)
    assert.strictEqual(bool(math.bignumber(-1)), true)
    assert.strictEqual(bool(math.bignumber(0)), false)
    assert.strictEqual(bool(math.bignumber(1)), true)
    assert.strictEqual(bool(math.bignumber(2)), true)
  })

  it('should convert the elements of a matrix or array to booleans', function (): void {
    assert.deepStrictEqual(
      bool(math.matrix([1, 0, 1, 1])),
      math.matrix([true, false, true, true])
    )
    assert.deepStrictEqual(bool([1, 0, 1, 1]), [true, false, true, true])
  })

  it('should convert a string into a boolean', function (): void {
    assert.strictEqual(bool('true'), true)
    assert.strictEqual(bool('false'), false)

    assert.strictEqual(bool('True'), true)
    assert.strictEqual(bool('False'), false)

    assert.strictEqual(bool('1'), true)
    assert.strictEqual(bool('0'), false)
    assert.strictEqual(bool(' 0 '), false)

    assert.strictEqual(bool('2'), true)
    assert.strictEqual(bool(' 4e2 '), true)
    assert.strictEqual(bool(' -4e2 '), true)
  })

  it('should throw an error if the string is not a valid number', function (): void {
    assert.throws(function (): void {
      bool('')
    }, /Error: Cannot convert/)
    assert.throws(function (): void {
      bool('23a')
    }, /Error: Cannot convert/)
  })

  it("should throw an error if there's a wrong number of arguments", function (): void {
    assert.throws(function (): void {
      bool(1, 2)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error if used with a complex', function (): void {
    assert.throws(function (): void {
      bool(math.complex(2, 3))
    }, /TypeError: Unexpected type of argument/)
  })

  it('should throw an error if used with a unit', function (): void {
    assert.throws(function (): void {
      bool(math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX boolean', function (): void {
    const expression = math.parse('boolean(1)') as MathNode
    assert.strictEqual(expression.toTex(), '\\mathrm{boolean}\\left(1\\right)')
  })
})
