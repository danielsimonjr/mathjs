/**
 * Test for chain - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'
const Chain = math.Chain

interface MathNode {
  type: string
  toTex(): string
}

describe('chain', function (): void {
  it('should construct a chain', function (): void {
    assert.ok(math.chain(45) instanceof Chain)
    assert.ok(math.chain(math.complex(2, 3)) instanceof Chain)
    assert.ok(math.chain() instanceof Chain)
  })

  it('should LaTeX chain', function (): void {
    const expression = math.parse('chain(1)') as MathNode
    assert.strictEqual(expression.toTex(), '\\mathrm{chain}\\left(1\\right)')
  })
})
