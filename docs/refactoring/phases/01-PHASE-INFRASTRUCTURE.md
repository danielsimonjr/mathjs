# Phase 1: Infrastructure

**Duration:** 2-3 days
**Risk Level:** Low
**Prerequisites:** None

---

## Phase Objectives

1. Create shared utility module for Node operations
2. Prepare type system infrastructure
3. Set up test infrastructure for Node operator testing
4. Establish patterns to be used in subsequent phases

---

## Sprint 1.1: Node Utility Module

**Duration:** 1 day
**Risk:** Low

### Objective
Create a shared utility module that provides helper functions for creating Node-based operation results. This module will be used by all arithmetic operators.

### Tasks

#### Task 1.1.1: Create nodeOperations.ts File

**File:** `src/function/arithmetic/utils/nodeOperations.ts`

```typescript
/**
 * Node Operations Utility Module
 *
 * Provides shared functionality for arithmetic operators to work with
 * expression Node objects, creating symbolic operation results.
 */

import { factory } from '../../../utils/factory.js'
import { isNode, isConstantNode } from '../../../utils/is.js'

export const name = 'nodeOperations'
export const dependencies = [
  'ConstantNode',
  'OperatorNode',
  'typed'
]

export const createNodeOperations = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ ConstantNode, OperatorNode, typed }) => {

    /**
     * Wraps a value in a ConstantNode if it's not already a Node.
     *
     * @param {*} value - The value to wrap
     * @returns {Node} - A Node representing the value
     *
     * @example
     * wrapInNode(5)           // ConstantNode(5)
     * wrapInNode(parse('x'))  // SymbolNode('x') (unchanged)
     */
    function wrapInNode(value: unknown): Node {
      if (isNode(value)) {
        return value
      }
      return new ConstantNode(value)
    }

    /**
     * Creates an OperatorNode for a binary operation.
     *
     * @param {string} op - The operator symbol ('+', '-', '*', '/')
     * @param {string} fn - The function name ('add', 'subtract', 'multiply', 'divide')
     * @param {*} left - Left operand (will be wrapped if not a Node)
     * @param {*} right - Right operand (will be wrapped if not a Node)
     * @returns {OperatorNode} - The resulting operation node
     *
     * @example
     * createBinaryNode('+', 'add', 5, parse('x'))
     * // Returns: OperatorNode('+', 'add', [ConstantNode(5), SymbolNode('x')])
     */
    function createBinaryNode(
      op: string,
      fn: string,
      left: unknown,
      right: unknown
    ): OperatorNode {
      const leftNode = wrapInNode(left)
      const rightNode = wrapInNode(right)
      return new OperatorNode(op, fn, [leftNode, rightNode])
    }

    /**
     * Creates an OperatorNode for an n-ary operation (variadic).
     *
     * @param {string} op - The operator symbol
     * @param {string} fn - The function name
     * @param {Array} args - Array of operands
     * @returns {OperatorNode} - The resulting operation node
     *
     * @example
     * createNaryNode('+', 'add', [1, parse('x'), parse('y')])
     * // Returns nested OperatorNodes: (1 + x) + y
     */
    function createNaryNode(
      op: string,
      fn: string,
      args: unknown[]
    ): OperatorNode {
      if (args.length < 2) {
        throw new Error(`${fn} requires at least 2 arguments`)
      }

      // Build left-associative tree: ((a op b) op c) op d
      let result = createBinaryNode(op, fn, args[0], args[1])
      for (let i = 2; i < args.length; i++) {
        result = createBinaryNode(op, fn, result, args[i])
      }
      return result
    }

    /**
     * Checks if any argument is a Node.
     * Used to determine if Node-based dispatch should be used.
     *
     * @param {...*} args - Arguments to check
     * @returns {boolean} - True if any argument is a Node
     */
    function hasNodeArg(...args: unknown[]): boolean {
      return args.some(arg => isNode(arg))
    }

    /**
     * Operator configuration for each arithmetic function.
     * Maps function names to their operator symbols.
     */
    const OPERATOR_MAP = {
      add: '+',
      subtract: '-',
      multiply: '*',
      divide: '/',
      pow: '^',
      mod: '%'
    } as const

    /**
     * Gets the operator symbol for a function name.
     *
     * @param {string} fn - Function name
     * @returns {string} - Operator symbol
     */
    function getOperator(fn: string): string {
      return OPERATOR_MAP[fn as keyof typeof OPERATOR_MAP] || fn
    }

    return {
      wrapInNode,
      createBinaryNode,
      createNaryNode,
      hasNodeArg,
      getOperator,
      OPERATOR_MAP
    }
  }
)
```

#### Task 1.1.2: Register in Factory System

**File:** `src/factoriesAny.js`

Add the following export:
```javascript
export { createNodeOperations } from './function/arithmetic/utils/nodeOperations.js'
```

#### Task 1.1.3: Create Unit Tests

**File:** `test/unit-tests/function/arithmetic/utils/nodeOperations.test.ts`

```typescript
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('nodeOperations', function () {
  const { parse, ConstantNode, OperatorNode, SymbolNode } = math

  // Access internal utilities (for testing)
  const nodeOps = math.nodeOperations

  describe('wrapInNode', function () {
    it('should wrap a number in ConstantNode', function () {
      const result = nodeOps.wrapInNode(5)
      assert.ok(result instanceof ConstantNode)
      assert.strictEqual(result.value, 5)
    })

    it('should wrap a string in ConstantNode', function () {
      const result = nodeOps.wrapInNode('hello')
      assert.ok(result instanceof ConstantNode)
      assert.strictEqual(result.value, 'hello')
    })

    it('should return Node unchanged', function () {
      const node = parse('x + 1')
      const result = nodeOps.wrapInNode(node)
      assert.strictEqual(result, node)
    })

    it('should wrap BigNumber in ConstantNode', function () {
      const big = math.bignumber(123)
      const result = nodeOps.wrapInNode(big)
      assert.ok(result instanceof ConstantNode)
      assert.deepStrictEqual(result.value, big)
    })

    it('should wrap Complex in ConstantNode', function () {
      const complex = math.complex(2, 3)
      const result = nodeOps.wrapInNode(complex)
      assert.ok(result instanceof ConstantNode)
    })

    it('should wrap Fraction in ConstantNode', function () {
      const frac = math.fraction(1, 3)
      const result = nodeOps.wrapInNode(frac)
      assert.ok(result instanceof ConstantNode)
    })
  })

  describe('createBinaryNode', function () {
    it('should create OperatorNode from two numbers', function () {
      const result = nodeOps.createBinaryNode('+', 'add', 5, 3)
      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.op, '+')
      assert.strictEqual(result.fn, 'add')
      assert.strictEqual(result.args.length, 2)
      assert.ok(result.args[0] instanceof ConstantNode)
      assert.ok(result.args[1] instanceof ConstantNode)
    })

    it('should create OperatorNode from number and Node', function () {
      const xNode = new SymbolNode('x')
      const result = nodeOps.createBinaryNode('+', 'add', 5, xNode)
      assert.ok(result instanceof OperatorNode)
      assert.ok(result.args[0] instanceof ConstantNode)
      assert.strictEqual(result.args[1], xNode)
    })

    it('should create OperatorNode from Node and number', function () {
      const xNode = new SymbolNode('x')
      const result = nodeOps.createBinaryNode('*', 'multiply', xNode, 3)
      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.args[0], xNode)
      assert.ok(result.args[1] instanceof ConstantNode)
    })

    it('should create OperatorNode from two Nodes', function () {
      const xNode = new SymbolNode('x')
      const yNode = new SymbolNode('y')
      const result = nodeOps.createBinaryNode('-', 'subtract', xNode, yNode)
      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.args[0], xNode)
      assert.strictEqual(result.args[1], yNode)
    })

    it('should handle nested expressions', function () {
      const expr = parse('x + 1')
      const result = nodeOps.createBinaryNode('*', 'multiply', 2, expr)
      assert.ok(result instanceof OperatorNode)
      assert.strictEqual(result.toString(), '2 * (x + 1)')
    })
  })

  describe('createNaryNode', function () {
    it('should create nested OperatorNodes for 3 arguments', function () {
      const result = nodeOps.createNaryNode('+', 'add', [1, 2, 3])
      // Should be ((1 + 2) + 3)
      assert.ok(result instanceof OperatorNode)
      assert.ok(result.args[0] instanceof OperatorNode)
      assert.ok(result.args[1] instanceof ConstantNode)
      assert.strictEqual(result.toString(), '1 + 2 + 3')
    })

    it('should create nested OperatorNodes for mixed types', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = nodeOps.createNaryNode('+', 'add', [1, x, y])
      assert.strictEqual(result.toString(), '1 + x + y')
    })

    it('should throw for less than 2 arguments', function () {
      assert.throws(() => {
        nodeOps.createNaryNode('+', 'add', [1])
      }, /requires at least 2 arguments/)
    })
  })

  describe('hasNodeArg', function () {
    it('should return true if any argument is a Node', function () {
      const x = new SymbolNode('x')
      assert.strictEqual(nodeOps.hasNodeArg(1, x, 3), true)
      assert.strictEqual(nodeOps.hasNodeArg(x, 2), true)
      assert.strictEqual(nodeOps.hasNodeArg(1, 2, x), true)
    })

    it('should return false if no arguments are Nodes', function () {
      assert.strictEqual(nodeOps.hasNodeArg(1, 2, 3), false)
      assert.strictEqual(nodeOps.hasNodeArg('a', 'b'), false)
    })
  })

  describe('getOperator', function () {
    it('should return correct operator symbols', function () {
      assert.strictEqual(nodeOps.getOperator('add'), '+')
      assert.strictEqual(nodeOps.getOperator('subtract'), '-')
      assert.strictEqual(nodeOps.getOperator('multiply'), '*')
      assert.strictEqual(nodeOps.getOperator('divide'), '/')
      assert.strictEqual(nodeOps.getOperator('pow'), '^')
    })

    it('should return function name for unknown operators', function () {
      assert.strictEqual(nodeOps.getOperator('unknown'), 'unknown')
    })
  })
})
```

### Acceptance Criteria

- [ ] `nodeOperations.ts` created and compiles without errors
- [ ] Module registered in `factoriesAny.js`
- [ ] All unit tests pass
- [ ] Functions are well-documented with JSDoc
- [ ] TypeScript types are correct

### Definition of Done

- [ ] Code reviewed
- [ ] Tests pass: `npm run test:src -- --grep "nodeOperations"`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Committed to branch: `feature/node-operators`

---

## Sprint 1.2: Type System Preparation

**Duration:** 0.5 days
**Risk:** Low

### Objective
Prepare the typed-function type system to properly handle Node types in arithmetic operations.

### Tasks

#### Task 1.2.1: Verify Node Type Registration

**File:** `src/core/function/typed.ts`

Verify these types are already registered (they should be):
```typescript
{ name: 'Node', test: isNode },
{ name: 'ConstantNode', test: isConstantNode },
{ name: 'SymbolNode', test: isSymbolNode },
{ name: 'OperatorNode', test: isOperatorNode },
{ name: 'FunctionNode', test: isFunctionNode },
```

#### Task 1.2.2: Document Type Precedence Rules

Create documentation for type precedence:

**File:** `docs/refactoring/phases/type-precedence.md`

```markdown
# Type Precedence for Node Operations

## Issue
typed-function dispatches to the first matching signature.
If 'any, any' appears before Node signatures, Nodes will never match.

## Solution
Node signatures MUST be declared BEFORE 'any, any':

### Correct Order:
```javascript
typed(name, {
  // SPECIFIC: Node signatures first
  'Node, Node': nodeHandler,
  'Node, number': nodeHandler,
  'number, Node': nodeHandler,
  'Node, BigNumber': nodeHandler,
  'BigNumber, Node': nodeHandler,
  // ... other Node combinations

  // GENERAL: Catch-all last
  'any, any': scalarHandler,
  'any, any, ...any': variadicHandler
})
```

### Incorrect Order (Nodes never match):
```javascript
typed(name, {
  'any, any': scalarHandler,  // This catches Nodes!
  'Node, Node': nodeHandler,  // Never reached
})
```

## Type Conversion Notes
- typed-function may auto-convert types
- Ensure no conversion path exists from Node to scalar types
- Node types should be "final" (no conversions defined)
```

#### Task 1.2.3: Create Type Signature Template

Create a template file showing the exact signature structure:

**File:** `docs/refactoring/phases/signature-template.ts`

```typescript
/**
 * Template for Node-aware arithmetic operator signatures.
 * Copy and adapt for each operator (add, subtract, multiply, divide).
 */

// Dependencies to add to each operator
const NODE_DEPENDENCIES = [
  'ConstantNode',
  'OperatorNode',
  'nodeOperations'
]

// Signature template - replace OPERATOR and FUNCTION_NAME
const NODE_SIGNATURES = {
  // Node + Node combinations
  'Node, Node': function (x: Node, y: Node) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },

  // Number + Node combinations
  'number, Node': function (x: number, y: Node) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },
  'Node, number': function (x: Node, y: number) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },

  // BigNumber + Node combinations
  'BigNumber, Node': function (x: BigNumber, y: Node) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },
  'Node, BigNumber': function (x: Node, y: BigNumber) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },

  // Complex + Node combinations
  'Complex, Node': function (x: Complex, y: Node) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },
  'Node, Complex': function (x: Node, y: Complex) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },

  // Fraction + Node combinations
  'Fraction, Node': function (x: Fraction, y: Node) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },
  'Node, Fraction': function (x: Node, y: Fraction) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },

  // String + Node (symbolic)
  'string, Node': function (x: string, y: Node) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  },
  'Node, string': function (x: Node, y: string) {
    return nodeOperations.createBinaryNode('OPERATOR', 'FUNCTION_NAME', x, y)
  }
}

// Total: 12 new signatures per operator
// 4 operators × 12 signatures = 48 new signatures total
```

### Acceptance Criteria

- [ ] Node types verified in typed-function registration
- [ ] Type precedence documentation created
- [ ] Signature template created and reviewed
- [ ] No changes to production code in this sprint

### Definition of Done

- [ ] Documentation reviewed
- [ ] Template approved for use in Phase 2
- [ ] No breaking changes introduced

---

## Sprint 1.3: Test Infrastructure

**Duration:** 0.5 days
**Risk:** Low

### Objective
Set up comprehensive test infrastructure that will be used across all operator implementations.

### Tasks

#### Task 1.3.1: Create Test Helper Module

**File:** `test/unit-tests/function/arithmetic/utils/nodeTestHelpers.ts`

```typescript
/**
 * Test helpers for Node operator testing.
 * Provides utilities for creating test cases and assertions.
 */

import assert from 'assert'
import math from '../../../../../src/defaultInstance.js'

const { parse, ConstantNode, SymbolNode, OperatorNode } = math

/**
 * Test data generators
 */
export const testData = {
  // Simple values
  numbers: [0, 1, -1, 0.5, 100, -100, Math.PI],
  bigNumbers: () => [
    math.bignumber(0),
    math.bignumber(1),
    math.bignumber(-1),
    math.bignumber('1e50')
  ],
  complexNumbers: () => [
    math.complex(0, 0),
    math.complex(1, 0),
    math.complex(0, 1),
    math.complex(2, 3)
  ],
  fractions: () => [
    math.fraction(1, 2),
    math.fraction(1, 3),
    math.fraction(-1, 4)
  ],

  // Node expressions
  simpleNodes: () => [
    new ConstantNode(5),
    new SymbolNode('x'),
    new SymbolNode('y'),
    parse('2 * x'),
    parse('x + 1')
  ],

  // Complex expressions
  complexNodes: () => [
    parse('x^2 + y^2'),
    parse('sin(x)'),
    parse('log(x, 10)'),
    parse('(a + b) * c')
  ]
}

/**
 * Assertion helpers
 */
export const nodeAssert = {
  /**
   * Assert result is an OperatorNode with expected properties
   */
  isOperatorNode(
    result: unknown,
    expectedOp: string,
    expectedFn: string
  ): void {
    assert.ok(result instanceof OperatorNode,
      `Expected OperatorNode, got ${result?.constructor?.name}`)
    assert.strictEqual((result as OperatorNode).op, expectedOp,
      `Expected operator '${expectedOp}', got '${(result as OperatorNode).op}'`)
    assert.strictEqual((result as OperatorNode).fn, expectedFn,
      `Expected function '${expectedFn}', got '${(result as OperatorNode).fn}'`)
  },

  /**
   * Assert result has correct number of arguments
   */
  hasArgs(result: OperatorNode, count: number): void {
    assert.strictEqual(result.args.length, count,
      `Expected ${count} arguments, got ${result.args.length}`)
  },

  /**
   * Assert the result can be evaluated (compile doesn't throw)
   */
  isEvaluable(result: Node): void {
    assert.doesNotThrow(() => {
      result.compile()
    }, 'Node should be compilable')
  },

  /**
   * Assert the result evaluates to expected value
   */
  evaluatesTo(result: Node, expected: number, scope: object = {}): void {
    const compiled = result.compile()
    const actual = compiled.evaluate(scope)
    assert.strictEqual(actual, expected,
      `Expected evaluation to ${expected}, got ${actual}`)
  },

  /**
   * Assert string representation matches
   */
  toStringEquals(result: Node, expected: string): void {
    assert.strictEqual(result.toString(), expected,
      `Expected toString '${expected}', got '${result.toString()}'`)
  }
}

/**
 * Test matrix generator - creates all combinations for testing
 */
export function generateTestMatrix(
  operator: string,
  fn: string
): Array<{ left: unknown; right: unknown; desc: string }> {
  const matrix: Array<{ left: unknown; right: unknown; desc: string }> = []

  // number, Node
  for (const num of testData.numbers.slice(0, 3)) {
    for (const node of testData.simpleNodes()) {
      matrix.push({
        left: num,
        right: node,
        desc: `${num} ${operator} ${node.toString()}`
      })
    }
  }

  // Node, number
  for (const node of testData.simpleNodes()) {
    for (const num of testData.numbers.slice(0, 3)) {
      matrix.push({
        left: node,
        right: num,
        desc: `${node.toString()} ${operator} ${num}`
      })
    }
  }

  // Node, Node
  for (const left of testData.simpleNodes()) {
    for (const right of testData.simpleNodes()) {
      matrix.push({
        left: left,
        right: right,
        desc: `${left.toString()} ${operator} ${right.toString()}`
      })
    }
  }

  return matrix
}

/**
 * Run backwards compatibility tests for an operator
 */
export function runBackwardsCompatibilityTests(
  mathFn: Function,
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
      const result = mathFn(math.fraction(1, 2), math.fraction(1, 4))
      assert.ok(math.isFraction(result))
    })

    it('should still work with matrices', function () {
      const result = mathFn([[1, 2], [3, 4]], [[5, 6], [7, 8]])
      assert.ok(math.isMatrix(result) || Array.isArray(result))
    })

    it('should still work with variadic arguments', function () {
      const result = mathFn(1, 2, 3, 4, 5)
      assert.strictEqual(typeof result, 'number')
    })
  })
}
```

#### Task 1.3.2: Create Test Template

**File:** `test/unit-tests/function/arithmetic/utils/nodeOperatorTestTemplate.ts`

```typescript
/**
 * Template for testing Node-aware arithmetic operators.
 * Copy and customize for each operator.
 */

import assert from 'assert'
import math from '../../../../../src/defaultInstance.js'
import {
  testData,
  nodeAssert,
  generateTestMatrix,
  runBackwardsCompatibilityTests
} from './nodeTestHelpers.js'

const { parse, ConstantNode, SymbolNode, OperatorNode } = math

// Replace these for each operator:
const OPERATOR = '+'
const FUNCTION_NAME = 'add'
const mathFn = math.add

describe(`${FUNCTION_NAME} with Nodes`, function () {

  // =========================================================================
  // Basic Node Operations
  // =========================================================================

  describe('basic Node operations', function () {

    it('should return OperatorNode for number + Node', function () {
      const x = new SymbolNode('x')
      const result = mathFn(5, x)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      nodeAssert.hasArgs(result, 2)
      assert.ok(result.args[0] instanceof ConstantNode)
      assert.strictEqual(result.args[1], x)
    })

    it('should return OperatorNode for Node + number', function () {
      const x = new SymbolNode('x')
      const result = mathFn(x, 5)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      assert.strictEqual(result.args[0], x)
      assert.ok(result.args[1] instanceof ConstantNode)
    })

    it('should return OperatorNode for Node + Node', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = mathFn(x, y)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      assert.strictEqual(result.args[0], x)
      assert.strictEqual(result.args[1], y)
    })

    it('should work with parsed expressions', function () {
      const expr = parse('2 * x + 1')
      const result = mathFn(5, expr)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      nodeAssert.toStringEquals(result, `5 ${OPERATOR} 2 * x + 1`)
    })

  })

  // =========================================================================
  // Type Combinations
  // =========================================================================

  describe('type combinations', function () {

    it('should work with BigNumber + Node', function () {
      const big = math.bignumber(100)
      const x = new SymbolNode('x')
      const result = mathFn(big, x)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should work with Node + BigNumber', function () {
      const x = new SymbolNode('x')
      const big = math.bignumber(100)
      const result = mathFn(x, big)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should work with Complex + Node', function () {
      const c = math.complex(2, 3)
      const x = new SymbolNode('x')
      const result = mathFn(c, x)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should work with Fraction + Node', function () {
      const f = math.fraction(1, 2)
      const x = new SymbolNode('x')
      const result = mathFn(f, x)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

  })

  // =========================================================================
  // Variadic Operations
  // =========================================================================

  describe('variadic operations', function () {

    it('should work with multiple arguments including Nodes', function () {
      const x = new SymbolNode('x')
      const result = mathFn(1, x, 3)

      // Result should be nested: (1 + x) + 3
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should work with all Node arguments', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const z = new SymbolNode('z')
      const result = mathFn(x, y, z)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should work with number, Node, number pattern', function () {
      const x = new SymbolNode('x')
      const result = mathFn(1, x, 2)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

  })

  // =========================================================================
  // Evaluation
  // =========================================================================

  describe('evaluation', function () {

    it('should evaluate correctly when variables are substituted', function () {
      const x = new SymbolNode('x')
      const result = mathFn(5, x)

      nodeAssert.evaluatesTo(result, /* expected result */, { x: 3 })
    })

    it('should be compilable', function () {
      const x = new SymbolNode('x')
      const result = mathFn(5, x)

      nodeAssert.isEvaluable(result)
    })

  })

  // =========================================================================
  // String Representation
  // =========================================================================

  describe('string representation', function () {

    it('should produce correct toString output', function () {
      const x = new SymbolNode('x')
      const result = mathFn(5, x)

      nodeAssert.toStringEquals(result, `5 ${OPERATOR} x`)
    })

    it('should handle complex expressions', function () {
      const expr = parse('x^2')
      const result = mathFn(1, expr)

      // Note: toString may add parentheses for clarity
      const str = result.toString()
      assert.ok(str.includes('1') && str.includes('x ^ 2'))
    })

  })

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('edge cases', function () {

    it('should handle ConstantNode as input', function () {
      const c = new ConstantNode(5)
      const result = mathFn(c, 3)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should handle zero', function () {
      const x = new SymbolNode('x')
      const result = mathFn(0, x)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should handle negative numbers', function () {
      const x = new SymbolNode('x')
      const result = mathFn(-5, x)

      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

  })

  // =========================================================================
  // Backwards Compatibility
  // =========================================================================

  runBackwardsCompatibilityTests(mathFn, FUNCTION_NAME)

  // =========================================================================
  // Comprehensive Test Matrix
  // =========================================================================

  describe('comprehensive test matrix', function () {
    const testMatrix = generateTestMatrix(OPERATOR, FUNCTION_NAME)

    testMatrix.forEach(({ left, right, desc }) => {
      it(`should handle: ${desc}`, function () {
        const result = mathFn(left, right)
        nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      })
    })
  })

})
```

### Acceptance Criteria

- [ ] Test helper module created
- [ ] Test template created
- [ ] Helpers tested independently
- [ ] Template can be instantiated for each operator

### Definition of Done

- [ ] All test infrastructure in place
- [ ] Documentation complete
- [ ] Ready to begin Phase 2

---

## Phase 1 Deliverables

| Deliverable | Status |
|-------------|--------|
| `src/function/arithmetic/utils/nodeOperations.ts` | [ ] |
| `test/unit-tests/function/arithmetic/utils/nodeOperations.test.ts` | [ ] |
| `test/unit-tests/function/arithmetic/utils/nodeTestHelpers.ts` | [ ] |
| `test/unit-tests/function/arithmetic/utils/nodeOperatorTestTemplate.ts` | [ ] |
| `docs/refactoring/phases/type-precedence.md` | [ ] |
| `docs/refactoring/phases/signature-template.ts` | [ ] |
| Factory registration in `factoriesAny.js` | [ ] |

---

## Exit Criteria

Before proceeding to Phase 2:

1. [ ] All Phase 1 code compiles without errors
2. [ ] All Phase 1 tests pass
3. [ ] nodeOperations module is accessible from math instance
4. [ ] Test infrastructure verified working
5. [ ] Phase 1 code committed to feature branch
6. [ ] Phase 1 reviewed and approved

---

## Next Phase

Proceed to [Phase 2: Simple Operators](./02-PHASE-SIMPLE-OPERATORS.md)
