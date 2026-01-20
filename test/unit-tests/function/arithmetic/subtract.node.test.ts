/**
 * Tests for subtract function with Node operands.
 * Verifies that subtract returns OperatorNode when any operand is a Node.
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const { parse, ConstantNode, SymbolNode } = math

// Helper to check node type
function isOperatorNode(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value as any).type === 'OperatorNode'
  )
}

describe('subtract with Node operands', function () {
  describe('basic operations', function () {
    it('should return OperatorNode for subtract(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(10, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '-')
      assert.strictEqual((result as any).fn, 'subtract')
      assert.strictEqual(result.toString(), '10 - x')
    })

    it('should return OperatorNode for subtract(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(x, 5)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x - 5')
    })

    it('should return OperatorNode for subtract(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.subtract(x, y)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x - y')
    })

    it('should return OperatorNode for subtract(ConstantNode, number)', function () {
      const five = new ConstantNode(10)
      const result = math.subtract(five, 3)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '10 - 3')
    })

    it('should return OperatorNode for parsed expression - number', function () {
      const expr = parse('x + 1')
      const result = math.subtract(expr, 5)

      assert.ok(isOperatorNode(result))
      // Note: parentheses may or may not be included depending on precedence
      assert.ok(result.toString().includes('- 5'))
    })
  })

  describe('type combinations', function () {
    it('should return OperatorNode for BigNumber - Node', function () {
      const big = math.bignumber(100)
      const x = new SymbolNode('x')
      const result = math.subtract(big, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Node - BigNumber', function () {
      const x = new SymbolNode('x')
      const big = math.bignumber(100)
      const result = math.subtract(x, big)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Complex - Node', function () {
      const c = math.complex(2, 3)
      const x = new SymbolNode('x')
      const result = math.subtract(c, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Node - Complex', function () {
      const x = new SymbolNode('x')
      const c = math.complex(2, 3)
      const result = math.subtract(x, c)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Fraction - Node', function () {
      const f = math.fraction(1, 2)
      const x = new SymbolNode('x')
      const result = math.subtract(f, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Node - Fraction', function () {
      const x = new SymbolNode('x')
      const f = math.fraction(1, 2)
      const result = math.subtract(x, f)

      assert.ok(isOperatorNode(result))
    })
  })

  describe('evaluation', function () {
    it('should evaluate subtract(number, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(10, x)
      const value = result.compile().evaluate({ x: 3 })

      assert.strictEqual(value, 7)
    })

    it('should evaluate subtract(symbol, number) correctly', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(x, 5)
      const value = result.compile().evaluate({ x: 12 })

      assert.strictEqual(value, 7)
    })

    it('should evaluate subtract(symbol, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.subtract(x, y)
      const value = result.compile().evaluate({ x: 10, y: 3 })

      assert.strictEqual(value, 7)
    })

    it('should evaluate complex expression correctly', function () {
      const expr = parse('x * 2')
      const result = math.subtract(20, expr)
      const value = result.compile().evaluate({ x: 5 })

      assert.strictEqual(value, 10) // 20 - (5*2) = 20 - 10 = 10
    })
  })

  describe('backwards compatibility', function () {
    it('should still return number for subtract(number, number)', function () {
      const result = math.subtract(10, 3)
      assert.strictEqual(typeof result, 'number')
      assert.strictEqual(result, 7)
    })

    it('should still return BigNumber for subtract(BigNumber, BigNumber)', function () {
      const result = math.subtract(math.bignumber(10), math.bignumber(3))
      assert.ok(math.isBigNumber(result))
    })

    it('should still return Complex for subtract(Complex, Complex)', function () {
      const result = math.subtract(math.complex(5, 4), math.complex(2, 1))
      assert.ok(math.isComplex(result))
    })

    it('should still return Fraction for subtract(Fraction, Fraction)', function () {
      const result = math.subtract(math.fraction(3, 4), math.fraction(1, 4))
      assert.ok(math.isFraction(result))
    })

    it('should still work with matrices', function () {
      const result = math.subtract([[5, 6]], [[1, 2]])
      const arr = math.isMatrix(result) ? (result as any).toArray() : result
      assert.deepStrictEqual(arr, [[4, 4]])
    })
  })

  describe('edge cases', function () {
    it('should handle zero - Node', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(0, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '0 - x')
    })

    it('should handle Node - zero', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(x, 0)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x - 0')
    })

    it('should handle negative number - Node', function () {
      const x = new SymbolNode('x')
      const result = math.subtract(-5, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '-5 - x')
    })

    it('should handle Node - ConstantNode', function () {
      const x = new SymbolNode('x')
      const five = new ConstantNode(5)
      const result = math.subtract(x, five)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x - 5')
    })
  })
})
