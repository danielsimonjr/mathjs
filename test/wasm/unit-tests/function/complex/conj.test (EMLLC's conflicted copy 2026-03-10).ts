/**
 * Test for conj - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'
const conj = math.conj

interface MathNode {
  type: string
  toTex(): string
}

describe('conj', function (): void {
  it('should compute the conjugate of a boolean', function (): void {
    assert.strictEqual(conj(true), 1)
    assert.strictEqual(conj(false), 0)
  })

  it('should compute the conjugate of a number', function (): void {
    assert.strictEqual(conj(1), 1)
    assert.strictEqual(conj(2), 2)
    assert.strictEqual(conj(0), 0)
    assert.strictEqual(conj(-2), -2)
  })

  it('should compute the conjugate of a bignumber', function (): void {
    assert.deepStrictEqual(conj(math.bignumber(2)), math.bignumber(2))
  })

  it('should calculate the conjugate of a complex number correctly', function (): void {
    assert.strictEqual(conj(math.complex('2 + 3i')).toString(), '2 - 3i')
    assert.strictEqual(conj(123).toString(), '123')
    assert.strictEqual(conj(math.complex('2 - 3i')).toString(), '2 + 3i')
    assert.strictEqual(conj(math.complex('2')).toString(), '2')
    assert.strictEqual(conj(math.complex('-4i')).toString(), '4i')
    assert.strictEqual(conj(math.i).toString(), '-i')
    assert.strictEqual(conj(math.unit('5cm')).toString(), '5 cm')
  })

  it('should calculate the conjugate of a units with complex, Fraction and BigNumber values', function (): void {
    assert.strictEqual(
      conj(math.unit(math.complex('300+250i'), 'ohm')).toString(),
      '(300 - 250i) ohm'
    )
    assert.strictEqual(
      conj(math.unit(math.bignumber('0.3'), 'm/s')).toString(),
      '0.3 m / s'
    )
    assert.strictEqual(
      conj(math.unit(math.fraction('0.(285714)'), 'fahrenheit')).toString(),
      '2/7 fahrenheit'
    )
    assert.strictEqual(
      conj(math.unit(math.fraction(0.125), 'hp')).toString(),
      '1/8 hp'
    )
  })

  it('should calculate the conjugate for each element in a matrix', function (): void {
    assert.strictEqual(
      math.format(conj([math.complex('2+3i'), math.complex('3-4i')])),
      '[2 - 3i, 3 + 4i]'
    )
    assert.strictEqual(
      conj(
        math.matrix([math.complex('2+3i'), math.complex('3-4i')])
      ).toString(),
      '[2 - 3i, 3 + 4i]'
    )
  })

  it('should throw an error when called with an unsupported type of argument', function (): void {
    assert.throws(function (): void {
      conj(new Date())
    }, /TypeError: Unexpected type of argument/)
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      conj()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      conj(1, 2)
    }, /TypeError: Too many arguments/)
  })

  it('should LaTeX conj', function (): void {
    const expression = math.parse('conj(1+i)')
    assert.strictEqual(expression.toTex(), '\\left(1+ i\\right)^*')
  })
})
