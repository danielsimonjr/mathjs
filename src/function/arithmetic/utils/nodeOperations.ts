/**
 * Node Operations Utility Module
 *
 * Provides shared functionality for arithmetic operators to work with
 * expression Node objects, creating symbolic operation results.
 *
 * This module enables arithmetic operators (add, subtract, multiply, divide)
 * to accept Node objects as operands and return OperatorNode results for
 * symbolic computation.
 */

import { factory } from '../../../utils/factory.js'
import { isNode } from '../../../utils/is.js'

// Type definitions
interface MathNode {
  type: string
  isNode: boolean
  toString: () => string
}

interface ConstantNodeConstructor {
  new (value: unknown): MathNode
}

interface OperatorNodeConstructor {
  new (op: string, fn: string, args: MathNode[], implicit?: boolean): MathNode
}

interface Dependencies {
  ConstantNode: ConstantNodeConstructor
  OperatorNode: OperatorNodeConstructor
}

export const name = 'nodeOperations'
export const dependencies = ['ConstantNode', 'OperatorNode']

export const createNodeOperations = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ ConstantNode, OperatorNode }: Dependencies) => {
    /**
     * Operator symbol mapping for arithmetic functions.
     */
    const OPERATOR_MAP: Record<string, string> = {
      add: '+',
      subtract: '-',
      multiply: '*',
      divide: '/',
      pow: '^',
      mod: '%'
    }

    /**
     * Gets the operator symbol for a function name.
     * @param fn - The function name (e.g., 'add', 'multiply')
     * @returns The operator symbol (e.g., '+', '*')
     */
    function getOperator(fn: string): string {
      return OPERATOR_MAP[fn] || fn
    }

    /**
     * Wraps a value in a ConstantNode if it's not already a Node.
     * @param value - The value to wrap
     * @returns A Node representing the value
     */
    function wrapInNode(value: unknown): MathNode {
      if (isNode(value)) {
        return value as MathNode
      }
      return new ConstantNode(value)
    }

    /**
     * Creates an OperatorNode for a binary operation.
     * @param op - The operator symbol ('+', '-', '*', '/')
     * @param fn - The function name ('add', 'subtract', 'multiply', 'divide')
     * @param left - Left operand (will be wrapped if not a Node)
     * @param right - Right operand (will be wrapped if not a Node)
     * @returns The resulting OperatorNode
     */
    function createBinaryNode(
      op: string,
      fn: string,
      left: unknown,
      right: unknown
    ): MathNode {
      const leftNode = wrapInNode(left)
      const rightNode = wrapInNode(right)
      return new OperatorNode(op, fn, [leftNode, rightNode])
    }

    /**
     * Creates an OperatorNode for an n-ary operation (variadic).
     * Builds left-associative tree: ((a op b) op c) op d
     * @param op - The operator symbol
     * @param fn - The function name
     * @param args - Array of operands
     * @returns The resulting OperatorNode
     */
    function createNaryNode(op: string, fn: string, args: unknown[]): MathNode {
      if (args.length < 2) {
        throw new Error(`${fn} requires at least 2 arguments`)
      }
      let result = createBinaryNode(op, fn, args[0], args[1])
      for (let i = 2; i < args.length; i++) {
        result = createBinaryNode(op, fn, result, args[i])
      }
      return result
    }

    /**
     * Checks if any argument is a Node.
     * @param args - Arguments to check
     * @returns True if any argument is a Node
     */
    function hasNodeArg(...args: unknown[]): boolean {
      return args.some((arg) => isNode(arg))
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
