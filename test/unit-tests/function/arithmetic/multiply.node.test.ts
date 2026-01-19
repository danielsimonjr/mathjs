/**
 * Tests for multiply function with Node operands.
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const { parse, ConstantNode, SymbolNode } = math

function isOperatorNode(value: unknown): boolean {
  return value !== null && typeof value === 'object' && (value as any).type === 'OperatorNode'
}

describe('multiply with Node operands', function () {
  describe('basic operations', function () {
    it('should return OperatorNode for multiply(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(3, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '*')
      assert.strictEqual((result as any).fn, 'multiply')
      assert.strictEqual(result.toString(), '3 * x')
    })

    it('should return OperatorNode for multiply(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(x, 5)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x * 5')
    })

    it('should return OperatorNode for multiply(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.multiply(x, y)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x * y')
    })
  })

  describe('type combinations', function () {
    it('should return OperatorNode for BigNumber * Node', function () {
      const big = math.bignumber(100)
      const x = new SymbolNode('x')
      const result = math.multiply(big, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Complex * Node', function () {
      const c = math.complex(2, 3)
      const x = new SymbolNode('x')
      const result = math.multiply(c, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Fraction * Node', function () {
      const f = math.fraction(1, 2)
      const x = new SymbolNode('x')
      const result = math.multiply(f, x)

      assert.ok(isOperatorNode(result))
    })
  })

  describe('variadic operations', function () {
    it('should return OperatorNode for multiply(number, Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(2, x, 3)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '2 * x * 3')
    })
  })

  describe('evaluation', function () {
    it('should evaluate multiply(number, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const result = math.multiply(5, x)
      const value = result.compile().evaluate({ x: 3 })

      assert.strictEqual(value, 15)
    })

    it('should evaluate multiply(symbol, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.multiply(x, y)
      const value = result.compile().evaluate({ x: 4, y: 5 })

      assert.strictEqual(value, 20)
    })
  })

  describe('backwards compatibility', function () {
    it('should still return number for multiply(number, number)', function () {
      const result = math.multiply(5, 3)
      assert.strictEqual(typeof result, 'number')
      assert.strictEqual(result, 15)
    })

    it('should still work with matrices', function () {
      const result = math.multiply([[1, 2], [3, 4]], [[5], [6]])
      const arr = math.isMatrix(result) ? (result as any).toArray() : result
      assert.deepStrictEqual(arr, [[17], [39]])
    })
  })
})
