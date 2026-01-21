/**
 * Test for isNegative function - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

const isNegative = math.isNegative
const bignumber = math.bignumber
const fraction = math.fraction
const complex = math.complex
const unit = math.unit

describe('isNegative', function (): void {
  it('should test whether a number is negative', function (): void {
    assert.strictEqual(isNegative(0), false)
    assert.strictEqual(isNegative(-0), false)
    assert.strictEqual(isNegative(2), false)
    assert.strictEqual(isNegative(-3), true)
    assert.strictEqual(isNegative(Infinity), false)
    assert.strictEqual(isNegative(-Infinity), true)
    assert.strictEqual(isNegative(NaN), false)
  })

  it('should test whether a bigint is negative', function (): void {
    assert.strictEqual(isNegative(0n), false)
    assert.strictEqual(isNegative(-0n), false)
    assert.strictEqual(isNegative(2n), false)
    assert.strictEqual(isNegative(-3n), true)
  })

  it('should test whether a number is near negative', function (): void {
    assert.strictEqual(isNegative(1e-17), false)
    assert.strictEqual(isNegative(-1e-17), false)
    assert.strictEqual(isNegative(1e-14), false)
    assert.strictEqual(isNegative(-1e-14), true)
  })

  it('should test whether a boolean is negative', function (): void {
    assert.strictEqual(isNegative(true), false)
    assert.strictEqual(isNegative(false), false)
  })

  it('should test whether a BigNumber is negative', function (): void {
    assert.strictEqual(isNegative(bignumber(0)), false)
    assert.strictEqual(isNegative(bignumber(-0)), false)
    assert.strictEqual(isNegative(bignumber(2)), false)
    assert.strictEqual(isNegative(bignumber(-3)), true)
    assert.strictEqual(isNegative(bignumber(Infinity)), false)
    assert.strictEqual(isNegative(bignumber(-Infinity)), true)
    assert.strictEqual(isNegative(bignumber(NaN)), false)
  })

  it('should test whether a Fraction is negative', function (): void {
    assert.strictEqual(isNegative(fraction(2)), false)
    assert.strictEqual(isNegative(fraction(-3)), true)
    assert.strictEqual(isNegative(fraction(0)), false)
    assert.strictEqual(isNegative(fraction(-0)), false)
  })

  it('should test whether a unit is negative', function (): void {
    assert.strictEqual(isNegative(unit('0 m')), false)
    assert.strictEqual(isNegative(unit('0 kB')), false)
    assert.strictEqual(isNegative(unit('5 cm')), false)
    assert.strictEqual(isNegative(unit('-3 inch')), true)
  })

  it('should test whether a string contains a negative value', function (): void {
    assert.strictEqual(isNegative('2'), false)
    assert.strictEqual(isNegative('-2'), true)
    assert.strictEqual(isNegative('0'), false)
  })

  it('should test isNegative element wise on an Array', function (): void {
    assert.deepStrictEqual(isNegative([0, 5, 0, -3]), [
      false,
      false,
      false,
      true
    ])
  })

  it('should test isNegative element wise on a Matrix', function (): void {
    assert.deepStrictEqual(
      isNegative(math.matrix([0, 5, 0, -3])),
      math.matrix([false, false, false, true])
    )
  })

  it('should throw an error in case of unsupported data types', function (): void {
    assert.throws(function (): void {
      isNegative(complex(2, 3))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      isNegative(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      isNegative({})
    }, /TypeError: Unexpected type of argument/)
  })
})
