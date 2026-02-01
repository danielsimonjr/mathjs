import { isSymbolNode } from '../../../utils/is.ts'
import { PartitionedMap } from '../../../utils/map.ts'
import type { ExpressionNode, EvaluationScope, MathJsLike } from '../types.ts'

/**
 * Compile an inline expression like "x > 0"
 * @param expression - The AST node representing the expression
 * @param math - The mathjs instance
 * @param scope - The evaluation scope
 * @returns A function with one argument which fills in the
 *          undefined variable (like "x") and evaluates the expression
 */
export function compileInlineExpression(
  expression: ExpressionNode,
  math: MathJsLike,
  scope: EvaluationScope | Map<string, unknown>
): (x: unknown) => unknown {
  // find an undefined symbol
  const filterFn = expression.filter
  if (!filterFn) {
    throw new Error('Expression does not support filter')
  }

  const symbols = filterFn.call(
    expression,
    function (node: ExpressionNode): boolean {
      return (
        isSymbolNode(node) &&
        node.name !== undefined &&
        !(node.name in math) &&
        !scope.has(node.name)
      )
    }
  )

  const symbol = symbols[0]

  if (!symbol) {
    throw new Error(
      'No undefined variable found in inline expression "' + expression + '"'
    )
  }

  // create a test function for this equation
  const name = symbol.name as string // variable name
  const argsScope = new Map<string, unknown>()
  const subScope = new PartitionedMap(scope, argsScope, new Set([name]))
  const eq = expression.compile()

  return function inlineExpression(x: unknown): unknown {
    argsScope.set(name, x)
    return eq.evaluate(subScope)
  }
}
