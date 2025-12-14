import { isSymbolNode } from '../../../utils/is.ts'
import { PartitionedMap } from '../../../utils/map.ts'

/**
 * Compile an inline expression like "x > 0"
 * @param {Node} expression
 * @param {Object} math
 * @param {Map} scope
 * @return {function} Returns a function with one argument which fills in the
 *                    undefined variable (like "x") and evaluates the expression
 */
export function compileInlineExpression(
  expression: any,
  math: any,
  scope: any
) {
  // find an undefined symbol
  const symbol = expression.filter(function (node: any) {
    return (
      isSymbolNode(node) &&
      !((node as any).name in math) &&
      !scope.has((node as any).name)
    )
  })[0]

  if (!symbol) {
    throw new Error(
      'No undefined variable found in inline expression "' + expression + '"'
    )
  }

  // create a test function for this equation
  const name = symbol.name // variable name
  const argsScope = new Map()
  const subScope = new PartitionedMap(scope, argsScope, new Set([name]))
  const eq = expression.compile()
  return function inlineExpression(x: any) {
    argsScope.set(name, x)
    return eq.evaluate(subScope)
  }
}
