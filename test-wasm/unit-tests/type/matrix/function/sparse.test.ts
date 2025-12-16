/**
 * Test for sparse - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'
const sparse = math.sparse

interface MathNode {
  type: string
  toTex(): string
}

describe('sparse', function (): void {
  it('should create empty matrix', function (): void {
    const a = sparse()
    assert.ok(a instanceof math.Matrix)
  })

  it('should create empty matrix, number datatype', function (): void {
    const a = sparse('number')
    assert.ok(a instanceof math.Matrix)
    assert.ok(a.datatype() === 'number')
  })

  it('should be the identity if called with a matrix', function (): void {
    const b = sparse([
      [1, 2],
      [3, 4]
    ])
    const c = sparse(b)
    assert.ok(c._values !== b._values) // data should be cloned
    assert.deepStrictEqual(
      c,
      sparse([
        [1, 2],
        [3, 4]
      ])
    )
  })

  it('should be the identity if called with a matrix, number datatype', function (): void {
    const b = sparse(
      [
        [1, 2],
        [3, 4]
      ],
      'number'
    )
    const c = sparse(b)
    assert.ok(c._values !== b._values) // data should be cloned
    assert.deepStrictEqual(c.valueOf(), b.valueOf())
    assert.ok(c.datatype() === 'number')
  })

  it('should throw an error if called with an invalid argument', function (): void {
    assert.throws(function (): void {
      sparse(new Date())
    }, TypeError)
  })

  it('should throw an error if called with a unit', function (): void {
    assert.throws(function (): void {
      sparse(math.unit('5cm'))
    }, TypeError)
  })

  it('should throw an error if called with too many arguments', function (): void {
    assert.throws(function (): void {
      sparse([], 'number', 3)
    }, /TypeError: Too many arguments/)
  })

  it('should LaTeX matrix', function (): void {
    const expr1 = math.parse('sparse()') as MathNode
    const expr2 = math.parse('sparse([1])') as MathNode

    assert.strictEqual(expr1.toTex(), '\\begin{bsparse}\\end{bsparse}')
    assert.strictEqual(
      expr2.toTex(),
      '\\left(\\begin{bmatrix}1\\end{bmatrix}\\right)'
    )
  })
})
