/**
 * Integration tests for simplify with Node-aware arithmetic operators.
 * Tests the original use case that motivated the Node operand feature.
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const { parse, simplify, derivative, ConstantNode, SymbolNode, OperatorNode } =
  math

describe('simplify integration with Node operators', function () {
  describe('basic integration', function () {
    it('should simplify add(number, Node)', function () {
      const x = new SymbolNode('x')
      const expr = math.add(5, x)
      const result = simplify(expr)
      assert.ok(result && result.isNode)
    })

    it('should simplify subtract(Node, number)', function () {
      const x = new SymbolNode('x')
      const expr = math.subtract(x, 3)
      const result = simplify(expr)
      assert.ok(result && result.isNode)
    })

    it('should simplify multiply(number, Node)', function () {
      const x = new SymbolNode('x')
      const expr = math.multiply(2, x)
      const result = simplify(expr)
      assert.strictEqual(result.toString(), '2 * x')
    })

    it('should simplify divide(Node, number)', function () {
      const x = new SymbolNode('x')
      const expr = math.divide(x, 2)
      const result = simplify(expr)
      assert.ok(result && result.isNode)
    })
  })

  describe('derivative integration (ORIGINAL USE CASE)', function () {
    it('should handle add(number, derivative(...))', function () {
      const deriv = derivative(parse('x^2'), 'x') // 2 * x
      const combined = math.add(5, deriv)
      assert.ok(combined.type === 'OperatorNode')
      const simplified = simplify(combined)
      assert.ok(simplified && simplified.isNode)
    })

    it('should handle multiply(number, derivative(...))', function () {
      const deriv = derivative(parse('x^2'), 'x') // 2 * x
      const combined = math.multiply(3, deriv) // 3 * (2 * x)
      const simplified = simplify(combined)
      // Should simplify to 6 * x
      assert.strictEqual(simplified.toString(), '6 * x')
    })

    it('should handle subtract(derivative, number)', function () {
      const deriv = derivative(parse('x^3'), 'x') // 3 * x ^ 2
      const combined = math.subtract(deriv, 1) // 3x^2 - 1
      const simplified = simplify(combined)
      assert.ok(simplified && simplified.isNode)
    })

    it('should handle divide(derivative, number)', function () {
      const deriv = derivative(parse('x^2'), 'x') // 2 * x
      const combined = math.divide(deriv, 2) // (2 * x) / 2
      const simplified = simplify(combined)
      assert.strictEqual(simplified.toString(), 'x')
    })
  })

  describe('complex expressions', function () {
    it('should handle combined operations', function () {
      const x = new SymbolNode('x')
      const term1 = math.multiply(2, x) // 2 * x
      const term2 = math.multiply(3, x) // 3 * x
      const sum = math.add(term1, term2) // 2x + 3x
      const simplified = simplify(sum)
      assert.strictEqual(simplified.toString(), '5 * x')
    })

    it('should handle nested operations', function () {
      const x = new SymbolNode('x')
      const inner = math.add(x, 1) // x + 1
      const outer = math.multiply(2, inner) // 2 * (x + 1)
      const simplified = simplify(outer)
      assert.ok(simplified && simplified.isNode)
    })

    it('should chain add and subtract operations', function () {
      const x = new SymbolNode('x')
      const step1 = math.add(5, x) // 5 + x
      const step2 = math.subtract(step1, 3) // (5 + x) - 3
      const simplified = simplify(step2)
      // Should simplify to x + 2
      const value = simplified.compile().evaluate({ x: 10 })
      assert.strictEqual(value, 12) // (5 + 10) - 3 = 12
    })
  })

  describe('edge cases', function () {
    it('should simplify 0 + x to x', function () {
      const x = new SymbolNode('x')
      const expr = math.add(0, x)
      const simplified = simplify(expr)
      assert.strictEqual(simplified.toString(), 'x')
    })

    it('should simplify 1 * x to x', function () {
      const x = new SymbolNode('x')
      const expr = math.multiply(1, x)
      const simplified = simplify(expr)
      assert.strictEqual(simplified.toString(), 'x')
    })

    it('should simplify 0 * x to 0', function () {
      const x = new SymbolNode('x')
      const expr = math.multiply(0, x)
      const simplified = simplify(expr)
      assert.strictEqual(simplified.toString(), '0')
    })

    it('should simplify x / 1 to x', function () {
      const x = new SymbolNode('x')
      const expr = math.divide(x, 1)
      const simplified = simplify(expr)
      assert.strictEqual(simplified.toString(), 'x')
    })

    it('should simplify x - 0 to x', function () {
      const x = new SymbolNode('x')
      const expr = math.subtract(x, 0)
      const simplified = simplify(expr)
      assert.strictEqual(simplified.toString(), 'x')
    })
  })

  describe('evaluate integration', function () {
    it('should work with math.evaluate for simplify(parse(...))', function () {
      const result = math.evaluate('simplify(parse("5 + x"))')
      assert.ok(result && result.isNode)
    })

    it('should work with math.evaluate for simplify(derivative(...))', function () {
      const result = math.evaluate('simplify(derivative("x^2", "x"))')
      assert.ok(result && result.isNode)
      assert.strictEqual(result.toString(), '2 * x')
    })
  })
})
