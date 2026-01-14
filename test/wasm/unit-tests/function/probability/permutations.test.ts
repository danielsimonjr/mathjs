/**
 * Test for permutations - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const permutations = math.permutations

interface MathNode {
  type: string
  toTex(): string
}

describe('permutations', function (): void {
  it('should calculate the permutations of a number', function (): void {
    assert.strictEqual(permutations(0), 1)
    assert.strictEqual(permutations(1), 1)
    assert.strictEqual(permutations(2), 2)
    assert.strictEqual(permutations(3), 6)
    assert.strictEqual(permutations(4), 24)
    assert.strictEqual(permutations(5), 120)
  })

  it('should calculate the permutations of a BigNumber', function (): void {
    assert.deepStrictEqual(permutations(math.bignumber(4)), math.bignumber(24))
    assert.deepStrictEqual(permutations(math.bignumber(5)), math.bignumber(120))
    assert.deepStrictEqual(
      permutations(math.bignumber(8)),
      math.bignumber(40320)
    )
  })

  it('should calculate the permutations of a BigNumber, taking k at a time', function (): void {
    assert.deepStrictEqual(
      permutations(math.bignumber(5), math.bignumber(4)),
      math.bignumber(120)
    )
    assert.deepStrictEqual(
      permutations(math.bignumber(6), math.bignumber(3)),
      math.bignumber(120)
    )
    assert.deepStrictEqual(
      permutations(math.bignumber(9), math.bignumber(8)),
      math.bignumber(362880)
    )
  })

  it('should calculate the permutations of a number, taking k at a time', function (): void {
    assert.strictEqual(permutations(5, 4), 120)
    assert.strictEqual(permutations(9, 8), 362880)
    assert.strictEqual(permutations(7, 5), 2520)
  })

  it('should fail loudly when k is larger than x', function (): void {
    assert.throws(function (): void {
      permutations(5, 6)
    }, TypeError)
    assert.throws(function (): void {
      permutations(math.bignumber(5), math.bignumber(6))
    }, TypeError)
  })

  it('should not accept negative or non-integer arguments', function (): void {
    assert.throws(function (): void {
      permutations(12, -6)
    }, TypeError)
    assert.throws(function (): void {
      permutations(-12, 6)
    }, TypeError)
    assert.throws(function (): void {
      permutations(4.5, 2)
    }, TypeError)
    assert.throws(function (): void {
      permutations(4, 0.5)
    }, TypeError)
    assert.throws(function (): void {
      permutations(math.bignumber(-12), -6)
    }, TypeError)
    assert.throws(function (): void {
      permutations(math.bignumber(12.5), math.bignumber(6))
    }, TypeError)
    assert.throws(function (): void {
      permutations(math.bignumber(12.5), math.pi)
    }, TypeError)
  })

  it('should not accept more than two arguments', function (): void {
    assert.throws(function (): void {
      permutations(12, 6, 13)
    })
    assert.throws(function (): void {
      permutations(-12, 6, 13)
    })
  })

  it('should not accept arguments of the wrong type', function (): void {
    assert.throws(function (): void {
      permutations('baa baa black sheep', true)
    })
    assert.throws(function (): void {
      permutations(new Array(12))
    })
  })

  it('should LaTeX permutations', function (): void {
    const expression = math.parse('permutations(2)') as MathNode
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{permutations}\\left(2\\right)'
    )
  })
})
