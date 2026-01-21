/**
 * Test for im - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

describe('im', function (): void {
  it('should return the imaginary part of a complex number', function (): void {
    assert.strictEqual(math.im(math.complex(2, 3)), 3)
    assert.strictEqual(math.im(math.complex(-2, -3)), -3)
    assert.strictEqual(math.im(math.i), 1)
  })

  it('should return the imaginary part of a real number', function (): void {
    assert.strictEqual(math.im(2), 0)
  })

  it('should return the imaginary part of a big number', function (): void {
    assert.deepStrictEqual(math.im(math.bignumber(2)), math.bignumber(0))
  })

  it('should return the imaginary part of a boolean', function (): void {
    assert.strictEqual(math.im(true), 0)
    assert.strictEqual(math.im(false), 0)
  })

  it('should return the imaginary part of a boolean', function (): void {
    assert.strictEqual(math.im(true), 0)
    assert.strictEqual(math.im(false), 0)
  })

  it('should return the imaginary part for each element in a matrix', function (): void {
    assert.deepStrictEqual(math.im([2, math.complex('3-6i')]), [0, -6])
    assert.deepStrictEqual(
      math.im(math.matrix([2, math.complex('3-6i')])).valueOf(),
      [0, -6]
    )
  })

  it('should throw an error when called with an unsupported type of argument', function (): void {
    assert.throws(function (): void {
      math.im(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      math.im(math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      math.im()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      math.im(1, 2)
    }, /TypeError: Too many arguments/)
  })

  it('should LaTeX im', function (): void {
    const expression = math.parse('im(1+i)')
    assert.strictEqual(
      expression.toTex(),
      '\\Im\\left\\lbrace1+ i\\right\\rbrace'
    )
  })
})
