import { isConstantNode, isFunctionNode, isOperatorNode, isParenthesisNode } from '../../../utils/is.js'
export { isConstantNode, isSymbolNode as isVariableNode } from '../../../utils/is.js'
import type { MathNode, ConstantNode, OperatorNode } from '../../../utils/node.js'

export function isNumericNode (x: MathNode): boolean {
  return isConstantNode(x) || (isOperatorNode(x) && x.isUnary() && isConstantNode(x.args[0]))
}

export function isConstantExpression (x: MathNode): boolean {
  if (isConstantNode(x)) { // Basic Constant types
    return true
  }
  if ((isFunctionNode(x) || isOperatorNode(x)) && x.args.every(isConstantExpression)) { // Can be constant depending on arguments
    return true
  }
  if (isParenthesisNode(x) && isConstantExpression(x.content)) { // Parenthesis are transparent
    return true
  }
  return false // Probably missing some edge cases
}
