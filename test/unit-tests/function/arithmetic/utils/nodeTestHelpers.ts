/**
 * Test Helpers for Node Operator Testing
 *
 * Provides reusable test utilities for testing arithmetic operators
 * with Node operands.
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

const { parse, ConstantNode, SymbolNode } = math

// Type definitions for test data
interface TestCase {
  left: unknown
  right: unknown
  desc: string
}

/**
 * Test data generators for various numeric and Node types.
 */
export const testData = {
  // Primitive numbers for testing
  numbers: [0, 1, -1, 0.5, 100, -100, Math.PI],

  // BigNumber values (lazy evaluation to avoid issues if BigNumber not available)
  bigNumbers: () => [
    math.bignumber(0),
    math.bignumber(1),
    math.bignumber(-1),
    math.bignumber('1e50')
  ],

  // Complex number values
  complexNumbers: () => [
    math.complex(0, 0),
    math.complex(1, 0),
    math.complex(0, 1),
    math.complex(2, 3)
  ],

  // Fraction values
  fractions: () => [
    math.fraction(1, 2),
    math.fraction(1, 3),
    math.fraction(-1, 4)
  ],

  // Simple Node expressions for testing
  simpleNodes: () => [
    new ConstantNode(5),
    new SymbolNode('x'),
    new SymbolNode('y'),
    parse('2 * x'),
    parse('x + 1')
  ],

  // Node expressions that can be evaluated with a scope
  evaluableNodes: () => [
    { node: new SymbolNode('x'), scope: { x: 10 }, expected: 10 },
    { node: new SymbolNode('y'), scope: { y: 5 }, expected: 5 },
    { node: parse('x + 1'), scope: { x: 3 }, expected: 4 },
    { node: parse('2 * x'), scope: { x: 7 }, expected: 14 }
  ]
}

/**
 * Helper function to check if a value is a Node type.
 */
function isNode(value: unknown): boolean {
  return value !== null && typeof value === 'object' && (value as any).isNode === true
}

/**
 * Helper function to check node type by property.
 */
function isOperatorNode(value: unknown): boolean {
  return value !== null && typeof value === 'object' && (value as any).type === 'OperatorNode'
}

/**
 * Specialized assertions for Node operator testing.
 */
export const nodeAssert = {
  /**
   * Assert that result is an OperatorNode with expected operator and function name.
   */
  isOperatorNode(result: unknown, expectedOp: string, expectedFn: string): void {
    assert.ok(
      isOperatorNode(result),
      `Expected OperatorNode, got ${(result as any)?.type || typeof result}`
    )
    assert.strictEqual((result as any).op, expectedOp, `Expected operator '${expectedOp}', got '${(result as any).op}'`)
    assert.strictEqual((result as any).fn, expectedFn, `Expected function '${expectedFn}', got '${(result as any).fn}'`)
  },

  /**
   * Assert that an OperatorNode has the expected number of arguments.
   */
  hasArgs(result: unknown, count: number): void {
    assert.ok(isOperatorNode(result), 'Expected OperatorNode')
    assert.strictEqual(
      (result as any).args.length,
      count,
      `Expected ${count} args, got ${(result as any).args.length}`
    )
  },

  /**
   * Assert that a Node evaluates to the expected value.
   */
  evaluatesTo(result: unknown, expected: number, scope: Record<string, unknown> = {}): void {
    assert.ok(isNode(result), 'Expected a Node')
    const value = (result as any).compile().evaluate(scope)
    assert.strictEqual(value, expected, `Expected evaluation to be ${expected}, got ${value}`)
  },

  /**
   * Assert that a Node's toString() equals the expected string.
   */
  toStringEquals(result: unknown, expected: string): void {
    assert.ok(isNode(result), 'Expected a Node')
    assert.strictEqual(
      (result as any).toString(),
      expected,
      `Expected toString() to be '${expected}', got '${(result as any).toString()}'`
    )
  },

  /**
   * Assert that the result is a numeric value (not a Node).
   */
  isNumeric(result: unknown): void {
    assert.ok(
      typeof result === 'number' || math.isBigNumber(result) || math.isComplex(result) || math.isFraction(result),
      `Expected numeric result, got ${typeof result}`
    )
  }
}

/**
 * Generates a comprehensive test matrix for a binary operator.
 * Creates test cases for all combinations of Node with other types.
 */
export function generateTestMatrix(
  operator: string,
  _fn: string
): TestCase[] {
  const matrix: TestCase[] = []
  const nodes = testData.simpleNodes()
  const nums = testData.numbers.slice(0, 3) // Use first 3 numbers

  // number, Node combinations
  for (const num of nums) {
    for (const node of nodes) {
      matrix.push({
        left: num,
        right: node,
        desc: `${num} ${operator} ${(node as any).toString()}`
      })
    }
  }

  // Node, number combinations
  for (const node of nodes) {
    for (const num of nums) {
      matrix.push({
        left: node,
        right: num,
        desc: `${(node as any).toString()} ${operator} ${num}`
      })
    }
  }

  // Node, Node combinations
  for (const left of nodes) {
    for (const right of nodes) {
      matrix.push({
        left,
        right,
        desc: `${(left as any).toString()} ${operator} ${(right as any).toString()}`
      })
    }
  }

  return matrix
}

/**
 * Runs backwards compatibility tests to ensure existing behavior is preserved.
 */
export function runBackwardsCompatibilityTests(
  mathFn: (...args: unknown[]) => unknown,
  fnName: string
): void {
  describe(`${fnName} backwards compatibility`, function () {
    it('should still work with two numbers', function () {
      const result = mathFn(5, 3)
      assert.strictEqual(typeof result, 'number')
    })

    it('should still work with BigNumbers', function () {
      const result = mathFn(math.bignumber(5), math.bignumber(3))
      assert.ok(math.isBigNumber(result))
    })

    it('should still work with Complex numbers', function () {
      const result = mathFn(math.complex(1, 2), math.complex(3, 4))
      assert.ok(math.isComplex(result))
    })

    it('should still work with Fractions', function () {
      const result = mathFn(math.fraction(1, 2), math.fraction(1, 3))
      assert.ok(math.isFraction(result))
    })
  })
}

/**
 * Creates a test scope with common variable values.
 */
export function createTestScope(): Record<string, number> {
  return {
    x: 10,
    y: 5,
    z: 2,
    a: 3,
    b: 7
  }
}

// Export the math instance for use in tests
export { math }
