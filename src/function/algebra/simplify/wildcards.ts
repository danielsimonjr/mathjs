import {
  isConstantNode,
  isFunctionNode,
  isOperatorNode,
  isParenthesisNode
} from '../../../utils/is.ts'
export {
  isConstantNode,
  isSymbolNode as isVariableNode
} from '../../../utils/is.ts'
import type { MathNode } from '../../../utils/node.ts'

export function isNumericNode(x: MathNode): boolean {
  return (
    isConstantNode(x) ||
    (isOperatorNode(x) &&
      (x as any).isUnary() &&
      isConstantNode((x as any).args[0]))
  )
}

export function isConstantExpression(x: MathNode): boolean {
  if (isConstantNode(x)) {
    // Basic Constant types
    return true
  }
  if (
    (isFunctionNode(x) || isOperatorNode(x)) &&
    (x as any).args.every(isConstantExpression)
  ) {
    // Can be constant depending on arguments
    return true
  }
  if (isParenthesisNode(x) && isConstantExpression((x as any).content)) {
    // Parenthesis are transparent
    return true
  }
  return false // Probably missing some edge cases
}
