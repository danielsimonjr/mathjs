/**
 * Test for compile - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

describe('compile', function (): void {
  it('should compile an expression', function (): void {
    const code = math.compile('(5+3)/4')
    assert.ok(code instanceof Object)
    assert.ok(code.evaluate instanceof Function)
    assert.strictEqual(code.evaluate(), 2)
  })

  it('should parse multiple expressions', function (): void {
    const codes = math.compile(['2+3', '4+5'])
    assert.ok(Array.isArray(codes))
    assert.strictEqual(codes.length, 2)

    assert.strictEqual(codes[0].evaluate(), 5)
    assert.strictEqual(codes[1].evaluate(), 9)
  })

  it('should throw an error on wrong number of arguments', function () {
    assert.throws(function (): void {
      math.compile()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      math.compile('2+3', '3+4')
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error on wrong type of argument', function () {
    assert.throws(function (): void {
      math.compile(math.complex(2, 3))
    }, TypeError)
  })

  it('should LaTeX compile', function (): void {
    const expression = math.parse('compile(1)')
    assert.strictEqual(expression.toTex(), '\\mathrm{compile}\\left(1\\right)')
  })
})
