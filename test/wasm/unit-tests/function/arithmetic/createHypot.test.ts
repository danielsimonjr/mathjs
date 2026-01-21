/**
 * Test for createHypot - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import { approxEqual } from '../../../../../tools/approx.js'
import math from '../../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
const hypot = math.hypot
const bignumber = math.bignumber

describe('hypot', function (): void {
  it('should return the hypot of numbers', function (): void {
    assert.strictEqual(hypot(3, 4), 5)
    assert.strictEqual(hypot(3, -4), 5)
    approxEqual(hypot(3, 4, 5), 7.0710678118654755)
    assert.strictEqual(hypot(-2), 2)
    assert.strictEqual(hypot(0), 0)
    assert.strictEqual(hypot(Infinity), Infinity)
  })

  it('should return the hypot of BigNumbers', function (): void {
    assert.deepStrictEqual(hypot(bignumber(3), bignumber(4)), bignumber(5))
    assert.deepStrictEqual(hypot(bignumber(3), bignumber(-4)), bignumber(5))
    assert.deepStrictEqual(
      hypot(bignumber(3), bignumber(4), bignumber(5)),
      bignumber(
        '7.07106781186547524400844362104849039284835937688474036588339869'
      )
    )
    assert.deepStrictEqual(hypot(bignumber(-2)), bignumber(2))
  })

  it('should return the hypot of an Array with numbers', function (): void {
    assert.strictEqual(hypot([3, 4]), 5)
  })

  it('should return the hypot of an Matrix with numbers', function (): void {
    assert.strictEqual(hypot(math.matrix([3, 4])), 5)
  })

  it('should return the hypot of an Array with mixed numbers and BigNumbers', function (): void {
    assert.deepStrictEqual(hypot([3, bignumber(4)]), bignumber(5))
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      hypot()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      hypot([], 2)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error in case of unsupported types', function (): void {
    assert.throws(function (): void {
      hypot(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      hypot([new Date()])
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      hypot([2, 3, math.complex()])
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      hypot(undefined)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX hypot', function (): void {
    const expression = math.parse('hypot(3,4)')
    assert.strictEqual(expression.toTex(), '\\hypot\\left(3,4\\right)')
  })
})
