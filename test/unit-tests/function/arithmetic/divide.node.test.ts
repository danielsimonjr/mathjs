/**
 * Tests for divide function with Node operands.
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const { parse, ConstantNode, SymbolNode } = math

function isOperatorNode(value: unknown): boolean {
  return value !== null && typeof value === 'object' && (value as any).type === 'OperatorNode'
}

describe('divide with Node operands', function () {
  describe('basic operations', function () {
    it('should return OperatorNode for divide(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.divide(10, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '/')
      assert.strictEqual((result as any).fn, 'divide')
      assert.strictEqual(result.toString(), '10 / x')
    })

    it('should return OperatorNode for divide(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.divide(x, 5)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x / 5')
    })

    it('should return OperatorNode for divide(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.divide(x, y)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x / y')
    })
  })

  describe('type combinations', function () {
    it('should return OperatorNode for BigNumber / Node', function () {
      const big = math.bignumber(100)
      const x = new SymbolNode('x')
      const result = math.divide(big, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Complex / Node', function () {
      const c = math.complex(2, 3)
      const x = new SymbolNode('x')
      const result = math.divide(c, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Fraction / Node', function () {
      const f = math.fraction(1, 2)
      const x = new SymbolNode('x')
      const result = math.divide(f, x)

      assert.ok(isOperatorNode(result))
    })
  })

  describe('evaluation', function () {
    it('should evaluate divide(number, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const result = math.divide(20, x)
      const value = result.compile().evaluate({ x: 4 })

      assert.strictEqual(value, 5)
    })

    it('should evaluate divide(symbol, number) correctly', function () {
      const x = new SymbolNode('x')
      const result = math.divide(x, 2)
      const value = result.compile().evaluate({ x: 10 })

      assert.strictEqual(value, 5)
    })

    it('should evaluate divide(symbol, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.divide(x, y)
      const value = result.compile().evaluate({ x: 15, y: 3 })

      assert.strictEqual(value, 5)
    })
  })

  describe('backwards compatibility', function () {
    it('should still return number for divide(number, number)', function () {
      const result = math.divide(15, 3)
      assert.strictEqual(typeof result, 'number')
      assert.strictEqual(result, 5)
    })

    it('should still work with matrices', function () {
      const result = math.divide([[4, 8]], 2)
      const arr = math.isMatrix(result) ? (result as any).toArray() : result
      assert.deepStrictEqual(arr, [[2, 4]])
    })
  })
})
