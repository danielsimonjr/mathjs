/**
 * Tests for add function with Node operands.
 * Verifies that add returns OperatorNode when any operand is a Node.
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

describe('add with Node operands', function () {
  describe('basic operations', function () {
    it('should return OperatorNode for add(number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.add(5, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual((result as any).op, '+')
      assert.strictEqual((result as any).fn, 'add')
      assert.strictEqual(result.toString(), '5 + x')
    })

    it('should return OperatorNode for add(Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.add(x, 5)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x + 5')
    })

    it('should return OperatorNode for add(Node, Node)', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.add(x, y)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x + y')
    })

    it('should return OperatorNode for add(ConstantNode, number)', function () {
      const five = new ConstantNode(5)
      const result = math.add(five, 3)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '5 + 3')
    })

    it('should return OperatorNode for parsed expression + number', function () {
      const expr = parse('x + 1')
      const result = math.add(expr, 5)

      assert.ok(isOperatorNode(result))
      // Note: toString doesn't add parentheses for same-precedence operators
      assert.strictEqual(result.toString(), 'x + 1 + 5')
    })

    it('should return OperatorNode for number + parsed expression', function () {
      const expr = parse('2 * x')
      const result = math.add(5, expr)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '5 + 2 * x')
    })
  })

  describe('type combinations', function () {
    it('should return OperatorNode for BigNumber + Node', function () {
      const big = math.bignumber(100)
      const x = new SymbolNode('x')
      const result = math.add(big, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Node + BigNumber', function () {
      const x = new SymbolNode('x')
      const big = math.bignumber(100)
      const result = math.add(x, big)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Complex + Node', function () {
      const c = math.complex(2, 3)
      const x = new SymbolNode('x')
      const result = math.add(c, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Node + Complex', function () {
      const x = new SymbolNode('x')
      const c = math.complex(2, 3)
      const result = math.add(x, c)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Fraction + Node', function () {
      const f = math.fraction(1, 2)
      const x = new SymbolNode('x')
      const result = math.add(f, x)

      assert.ok(isOperatorNode(result))
    })

    it('should return OperatorNode for Node + Fraction', function () {
      const x = new SymbolNode('x')
      const f = math.fraction(1, 2)
      const result = math.add(x, f)

      assert.ok(isOperatorNode(result))
    })
  })

  describe('variadic operations', function () {
    it('should return OperatorNode for add(number, Node, number)', function () {
      const x = new SymbolNode('x')
      const result = math.add(1, x, 2)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '1 + x + 2')
    })

    it('should return OperatorNode for add(number, number, Node)', function () {
      const x = new SymbolNode('x')
      const result = math.add(1, 2, x)

      assert.ok(isOperatorNode(result))
      // Note: numbers are reduced first (1+2=3), then Node is added
      assert.strictEqual(result.toString(), '3 + x')
    })

    it('should return OperatorNode for add(Node, number, number)', function () {
      const x = new SymbolNode('x')
      const result = math.add(x, 1, 2)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x + 1 + 2')
    })

    it('should return OperatorNode for add with multiple Nodes', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.add(x, 1, y)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x + 1 + y')
    })

    it('should return OperatorNode for add with 4 arguments including Node', function () {
      const x = new SymbolNode('x')
      const result = math.add(1, x, 3, 4)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '1 + x + 3 + 4')
    })
  })

  describe('evaluation', function () {
    it('should evaluate add(number, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const result = math.add(5, x)
      const value = result.compile().evaluate({ x: 3 })

      assert.strictEqual(value, 8)
    })

    it('should evaluate add(symbol, number) correctly', function () {
      const x = new SymbolNode('x')
      const result = math.add(x, 5)
      const value = result.compile().evaluate({ x: 10 })

      assert.strictEqual(value, 15)
    })

    it('should evaluate add(symbol, symbol) correctly', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = math.add(x, y)
      const value = result.compile().evaluate({ x: 10, y: 5 })

      assert.strictEqual(value, 15)
    })

    it('should evaluate variadic add with Node correctly', function () {
      const x = new SymbolNode('x')
      const result = math.add(1, x, 3)
      const value = result.compile().evaluate({ x: 2 })

      assert.strictEqual(value, 6)
    })

    it('should evaluate complex expression correctly', function () {
      const expr = parse('x * 2')
      const result = math.add(10, expr)
      const value = result.compile().evaluate({ x: 5 })

      assert.strictEqual(value, 20)
    })
  })

  describe('backwards compatibility', function () {
    it('should still return number for add(number, number)', function () {
      const result = math.add(5, 3)
      assert.strictEqual(typeof result, 'number')
      assert.strictEqual(result, 8)
    })

    it('should still return BigNumber for add(BigNumber, BigNumber)', function () {
      const result = math.add(math.bignumber(5), math.bignumber(3))
      assert.ok(math.isBigNumber(result))
    })

    it('should still return Complex for add(Complex, Complex)', function () {
      const result = math.add(math.complex(1, 2), math.complex(3, 4))
      assert.ok(math.isComplex(result))
    })

    it('should still return Fraction for add(Fraction, Fraction)', function () {
      const result = math.add(math.fraction(1, 2), math.fraction(1, 3))
      assert.ok(math.isFraction(result))
    })

    it('should still work with matrices', function () {
      const result = math.add([[1, 2]], [[3, 4]])
      const arr = math.isMatrix(result) ? (result as any).toArray() : result
      assert.deepStrictEqual(arr, [[4, 6]])
    })

    it('should still work with variadic numbers', function () {
      const result = math.add(1, 2, 3, 4)
      assert.strictEqual(result, 10)
    })
  })

  describe('edge cases', function () {
    it('should handle zero + Node', function () {
      const x = new SymbolNode('x')
      const result = math.add(0, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '0 + x')
    })

    it('should handle negative number + Node', function () {
      const x = new SymbolNode('x')
      const result = math.add(-5, x)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), '-5 + x')
    })

    it('should handle Node + ConstantNode', function () {
      const x = new SymbolNode('x')
      const five = new ConstantNode(5)
      const result = math.add(x, five)

      assert.ok(isOperatorNode(result))
      assert.strictEqual(result.toString(), 'x + 5')
    })

    it('should handle deeply nested expressions', function () {
      const expr1 = parse('x + 1')
      const expr2 = parse('y * 2')
      const result = math.add(expr1, expr2)

      assert.ok(isOperatorNode(result))
      const value = result.compile().evaluate({ x: 5, y: 3 })
      assert.strictEqual(value, 12) // (5+1) + (3*2) = 6 + 6 = 12
    })
  })
})
