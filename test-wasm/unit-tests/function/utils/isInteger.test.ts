/**
 * Test for isInteger function - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const isInteger = math.isInteger
const bignumber = math.bignumber
const fraction = math.fraction

describe('isInteger', function (): void {
  it('should test whether a number is an integer', function (): void {
    assert.strictEqual(isInteger(2), true)
    assert.strictEqual(isInteger(0), true)
    assert.strictEqual(isInteger(-3), true)
    assert.strictEqual(isInteger(-0.5), false)
    assert.strictEqual(isInteger(0.5), false)
    assert.strictEqual(isInteger(Infinity), false)
    assert.strictEqual(isInteger(-Infinity), false)
    assert.strictEqual(isInteger(NaN), false)
    assert.strictEqual(isInteger(0.1 + 0.2), false)
    assert.strictEqual(isInteger((0.1 + 0.2) * 10), true)
    assert.strictEqual(isInteger((0.1 + 0.2) * 10 - 3), true)
  })

  it('should test whether a bigint is an integer', function (): void {
    assert.strictEqual(isInteger(2n), true)
    assert.strictEqual(isInteger(0n), true)
    assert.strictEqual(isInteger(-3n), true)
  })

  it('should test whether a boolean is an integer', function (): void {
    assert.strictEqual(isInteger(true), true)
    assert.strictEqual(isInteger(false), true)
  })

  it('should test whether a BigNumber is an integer', function (): void {
    assert.strictEqual(isInteger(bignumber(2)), true)
    assert.strictEqual(isInteger(bignumber(0)), true)
    assert.strictEqual(isInteger(bignumber(-3)), true)
    assert.strictEqual(isInteger(bignumber(-0.5)), false)
    assert.strictEqual(isInteger(bignumber(0.5)), false)
    assert.strictEqual(isInteger(bignumber(Infinity)), false)
    assert.strictEqual(isInteger(bignumber(-Infinity)), false)
    assert.strictEqual(isInteger(bignumber(NaN)), false)
    assert.strictEqual(isInteger(bignumber((0.1 + 0.2) * 10)), true)
    assert.strictEqual(isInteger(bignumber((0.1 + 0.2) * 10 - 3)), true)
  })

  it('should test whether a Fraction is an integer', function (): void {
    assert.strictEqual(isInteger(fraction(2)), true)
    assert.strictEqual(isInteger(fraction(0)), true)
    assert.strictEqual(isInteger(fraction(-3)), true)
    assert.strictEqual(isInteger(fraction(-0.5)), false)
    assert.strictEqual(isInteger(fraction(0.5)), false)
  })

  it('should test whether a string contains an integer', function (): void {
    assert.strictEqual(isInteger('2'), true)
    assert.strictEqual(isInteger('0'), true)
    assert.strictEqual(isInteger('-3'), true)
    assert.strictEqual(isInteger('-0.5'), false)
    assert.strictEqual(isInteger('0.5'), false)
  })

  it('should test isInteger element wise on an Array', function (): void {
    assert.deepStrictEqual(isInteger([2, 5, 0.5, 3]), [true, true, false, true])
  })

  it('should test isInteger element wise on a Matrix', function (): void {
    assert.deepStrictEqual(
      isInteger(math.matrix([2, 5, 0.5, 3])),
      math.matrix([true, true, false, true])
    )
  })

  it('should throw an error in case of unsupported data types', function (): void {
    assert.throws(function (): void {
      isInteger(math.complex(2, 3))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      isInteger(math.unit('5 cm'))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      isInteger(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      isInteger({})
    }, /TypeError: Unexpected type of argument/)
  })
})
