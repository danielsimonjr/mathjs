/**
 * Test for catalan - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'
const catalan = math.catalan

interface MathNode {
  type: string
  toTex(): string
}

describe('catalan', function (): void {
  it('should calculate the nth catalan number', function (): void {
    assert.strictEqual(catalan(3), 5)
    assert.strictEqual(catalan(0), 1)
    assert.strictEqual(catalan(8), 1430)
  })

  it('should calculate the nth catalan number with BigNumbers', function (): void {
    assert.deepStrictEqual(catalan(math.bignumber(7)), math.bignumber(429))
    assert.deepStrictEqual(catalan(math.bignumber(13)), math.bignumber(742900))
  })

  it('should not work with non-integer and negative input', function (): void {
    assert.throws(function (): void {
      catalan(0.5)
    }, TypeError)
    assert.throws(function (): void {
      catalan(-1)
    }, TypeError)
    assert.throws(function (): void {
      catalan(math.bignumber(-3))
    }, TypeError)
    assert.throws(function (): void {
      catalan(math.bignumber(3.5))
    }, TypeError)
  })

  it('should throw an error in case of non-integer input', function (): void {
    assert.throws(function (): void {
      catalan(5.2)
    }, /Non-negative integer value expected/)
  })

  it('should throw an error in case of negative input', function (): void {
    assert.throws(function (): void {
      catalan(-2)
    }, /Non-negative integer value expected/)
  })

  it('should throw an error in case of wrong number or type of arguments', function (): void {
    assert.throws(function (): void {
      catalan(5, 3, 2)
    })
    assert.throws(function (): void {
      catalan(true, 'hello world')
    })
  })

  it('should LaTeX catalan', function (): void {
    const expression = math.parse('catalan(3)') as MathNode
    assert.strictEqual(expression.toTex(), '\\mathrm{C}_{3}')
  })
})
