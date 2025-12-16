<<<<<<< HEAD
// @ts-nocheck
// test compile
=======
/**
 * Test for compile - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('compile', function () {
  it('should compile an expression', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('compile', function (): void {
  it('should compile an expression', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const code = math.compile('(5+3)/4')
    assert.ok(code instanceof Object)
    assert.ok(code.evaluate instanceof Function)
    assert.strictEqual(code.evaluate(), 2)
  })

<<<<<<< HEAD
  it('should parse multiple expressions', function () {
=======
  it('should parse multiple expressions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const codes = math.compile(['2+3', '4+5'])
    assert.ok(Array.isArray(codes))
    assert.strictEqual(codes.length, 2)

    assert.strictEqual(codes[0].evaluate(), 5)
    assert.strictEqual(codes[1].evaluate(), 9)
  })

  it('should throw an error on wrong number of arguments', function () {
<<<<<<< HEAD
    assert.throws(function () {
      math.compile()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
    assert.throws(function (): void {
      math.compile()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.compile('2+3', '3+4')
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error on wrong type of argument', function () {
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.compile(math.complex(2, 3))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should LaTeX compile', function () {
=======
  it('should LaTeX compile', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('compile(1)')
    assert.strictEqual(expression.toTex(), '\\mathrm{compile}\\left(1\\right)')
  })
})
