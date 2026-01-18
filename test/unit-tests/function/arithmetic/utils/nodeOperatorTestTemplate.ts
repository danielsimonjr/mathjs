/**
 * Test Template for Node-aware Arithmetic Operators
 *
 * This file serves as a template for testing arithmetic operators with Node support.
 * Copy this file and customize the marked sections for each operator.
 *
 * USAGE:
 * 1. Copy this file to the appropriate test directory
 * 2. Rename to match the operator (e.g., add.nodetest.ts)
 * 3. Update OPERATOR, FUNCTION_NAME, and mathFn constants
 * 4. Customize test cases as needed for the specific operator
 */

import assert from 'assert'
import {
  testData,
  nodeAssert,
  generateTestMatrix,
  runBackwardsCompatibilityTests,
  createTestScope,
  math
} from './nodeTestHelpers.ts'

const { parse, ConstantNode, SymbolNode } = math

// ============================================================================
// CUSTOMIZE THESE FOR YOUR OPERATOR
// ============================================================================
const OPERATOR = '+'           // The operator symbol: '+', '-', '*', '/'
const FUNCTION_NAME = 'add'    // The function name: 'add', 'subtract', 'multiply', 'divide'
const mathFn = math.add        // The math function to test
const IS_VARIADIC = true       // true for add/multiply, false for subtract/divide

// ============================================================================
// TEST SUITE
// ============================================================================

describe(`${FUNCTION_NAME} with Nodes`, function () {
  // Create isolated math instance for testing
  const mathInstance = math.create()

  describe('basic Node operations', function () {
    it('should return OperatorNode for number + Node', function () {
      const x = new SymbolNode('x')
      const result = mathFn(5, x)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      nodeAssert.hasArgs(result, 2)
    })

    it('should return OperatorNode for Node + number', function () {
      const x = new SymbolNode('x')
      const result = mathFn(x, 5)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for Node + Node', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = mathFn(x, y)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for ConstantNode + number', function () {
      const five = new ConstantNode(5)
      const result = mathFn(five, 3)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for parsed expression + number', function () {
      const expr = parse('x + 1')
      const result = mathFn(expr, 5)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })
  })

  describe('type combinations', function () {
    it('should return OperatorNode for BigNumber + Node', function () {
      const big = math.bignumber(5)
      const x = new SymbolNode('x')
      const result = mathFn(big, x)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for Node + BigNumber', function () {
      const x = new SymbolNode('x')
      const big = math.bignumber(5)
      const result = mathFn(x, big)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for Complex + Node', function () {
      const c = math.complex(2, 3)
      const x = new SymbolNode('x')
      const result = mathFn(c, x)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for Node + Complex', function () {
      const x = new SymbolNode('x')
      const c = math.complex(2, 3)
      const result = mathFn(x, c)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for Fraction + Node', function () {
      const f = math.fraction(1, 2)
      const x = new SymbolNode('x')
      const result = mathFn(f, x)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })

    it('should return OperatorNode for Node + Fraction', function () {
      const x = new SymbolNode('x')
      const f = math.fraction(1, 2)
      const result = mathFn(x, f)
      nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
    })
  })

  // Only include variadic tests for add/multiply
  if (IS_VARIADIC) {
    describe('variadic operations', function () {
      it('should return OperatorNode for multiple args with Node', function () {
        const x = new SymbolNode('x')
        const result = mathFn(1, x, 3)
        nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      })

      it('should return OperatorNode for 4 args with Node in middle', function () {
        const x = new SymbolNode('x')
        const result = mathFn(1, 2, x, 4)
        nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      })

      it('should return OperatorNode for multiple Nodes', function () {
        const x = new SymbolNode('x')
        const y = new SymbolNode('y')
        const result = mathFn(x, 1, y)
        nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      })

      it('should still return number for all numeric args', function () {
        const result = mathFn(1, 2, 3, 4)
        nodeAssert.isNumeric(result)
      })
    })
  }

  describe('evaluation', function () {
    const scope = createTestScope()

    it('should produce correct evaluation for number + symbol', function () {
      const x = new SymbolNode('x')
      const result = mathFn(5, x)

      // For add: 5 + 10 = 15
      // Customize expected value based on operator
      let expected: number
      switch (FUNCTION_NAME) {
        case 'add': expected = 15; break
        case 'subtract': expected = -5; break
        case 'multiply': expected = 50; break
        case 'divide': expected = 0.5; break
        default: expected = 15
      }

      nodeAssert.evaluatesTo(result, expected, scope)
    })

    it('should produce correct evaluation for symbol + number', function () {
      const x = new SymbolNode('x')
      const result = mathFn(x, 5)

      let expected: number
      switch (FUNCTION_NAME) {
        case 'add': expected = 15; break
        case 'subtract': expected = 5; break
        case 'multiply': expected = 50; break
        case 'divide': expected = 2; break
        default: expected = 15
      }

      nodeAssert.evaluatesTo(result, expected, scope)
    })

    it('should produce correct evaluation for symbol + symbol', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = mathFn(x, y)

      // x = 10, y = 5
      let expected: number
      switch (FUNCTION_NAME) {
        case 'add': expected = 15; break
        case 'subtract': expected = 5; break
        case 'multiply': expected = 50; break
        case 'divide': expected = 2; break
        default: expected = 15
      }

      nodeAssert.evaluatesTo(result, expected, scope)
    })
  })

  describe('toString output', function () {
    it('should produce correct string for number + symbol', function () {
      const x = new SymbolNode('x')
      const result = mathFn(5, x)
      nodeAssert.toStringEquals(result, `5 ${OPERATOR} x`)
    })

    it('should produce correct string for symbol + number', function () {
      const x = new SymbolNode('x')
      const result = mathFn(x, 5)
      nodeAssert.toStringEquals(result, `x ${OPERATOR} 5`)
    })

    it('should produce correct string for symbol + symbol', function () {
      const x = new SymbolNode('x')
      const y = new SymbolNode('y')
      const result = mathFn(x, y)
      nodeAssert.toStringEquals(result, `x ${OPERATOR} y`)
    })
  })

  // Run backwards compatibility tests
  runBackwardsCompatibilityTests(mathFn, FUNCTION_NAME)

  describe('comprehensive test matrix', function () {
    const testMatrix = generateTestMatrix(OPERATOR, FUNCTION_NAME)

    // Run a subset of the matrix to keep test times reasonable
    const matrixSubset = testMatrix.slice(0, 20)

    matrixSubset.forEach(({ left, right, desc }) => {
      it(`should handle: ${desc}`, function () {
        const result = mathFn(left, right)
        nodeAssert.isOperatorNode(result, OPERATOR, FUNCTION_NAME)
      })
    })
  })
})
