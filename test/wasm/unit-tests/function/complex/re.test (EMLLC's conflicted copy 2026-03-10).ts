/**
 * Test for re - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

describe('re', function (): void {
  it('should return the real part of a complex number', function (): void {
    assert.strictEqual(math.re(math.complex(2, 3)), 2)
    assert.strictEqual(math.re(math.complex(-2, -3)), -2)
    assert.strictEqual(math.re(math.i), 0)
  })

  it('should return the real part of a real number', function (): void {
    assert.strictEqual(math.re(2), 2)
  })

  it('should return the real part of a big number', function (): void {
    assert.deepStrictEqual(math.re(math.bignumber(2)), math.bignumber(2))
  })

  it('should return the real part of a boolean', function (): void {
    assert.strictEqual(math.re(true), 1)
    assert.strictEqual(math.re(false), 0)
  })

  it('should return the real part for each element in a matrix', function (): void {
    assert.deepStrictEqual(math.re([2, math.complex('3-6i')]), [2, 3])
    assert.deepStrictEqual(
      math.re(math.matrix([2, math.complex('3-6i')])).valueOf(),
      [2, 3]
    )
  })

  it('should throw an error when called with an unsupported type of argument', function (): void {
    assert.throws(function (): void {
      math.re(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      math.re(math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.re()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      math.re(1, 2)
    }, /TypeError: Too many arguments/)
  })

  it('should LaTeX re', function (): void {
    const expression = math.parse('re(1+i)')
    assert.strictEqual(
      expression.toTex(),
      '\\Re\\left\\lbrace1+ i\\right\\rbrace'
    )
  })
})
