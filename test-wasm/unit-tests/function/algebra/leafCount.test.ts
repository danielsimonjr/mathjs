<<<<<<< HEAD
// @ts-nocheck
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

describe('leafCount', function () {
  it('handles nodes', function () {
=======
/**
 * Test for leafCount - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}

describe('leafCount', function (): void {
  it('handles nodes', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.leafCount(new math.SymbolNode('x')), 1)
    assert.strictEqual(math.leafCount(math.parse('2+y')), 2)
    assert.strictEqual(math.leafCount(math.parse('[3,a+5,2/2,z]')), 6)
  })

<<<<<<< HEAD
  it('handles strings', function () {
=======
  it('handles strings', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.leafCount('3x^2-7x+2'), 6)
    assert.strictEqual(math.leafCount('13 < m+n < abs(n^2-m^2)'), 8)
  })

<<<<<<< HEAD
  it('can be used in an expression', function () {
=======
  it('can be used in an expression', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert(math.evaluate('leafCount("identity(2)[0,1]") == 4'))
    assert.strictEqual(math.evaluate('leafCount("{a: 7, b: x}.b")'), 3)
  })
})
