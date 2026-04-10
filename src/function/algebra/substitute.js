import { factory } from '../../utils/factory.js'

const name = 'substitute'
const dependencies = ['typed', 'parse', 'simplify']

export const createSubstitute = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  simplify
}) => {
  /**
   * Substitute a variable with a value or expression.
   *
   * Replaces all occurrences of the specified variable in an expression
   * with the given value (number or expression string).
   *
   * Syntax:
   *
   *     math.substitute(expr, variable, value)
   *
   * Examples:
   *
   *     math.substitute('x^2 + 2*x', 'x', 3)          // 15
   *     math.substitute('x^2 + 2*x + 1', 'x', 'a+b')  // '(a + b) ^ 2 + 2 * (a + b) + 1'
   *     math.substitute('sin(x) + x', 'x', 0)          // 0
   *
   * See also:
   *
   *     simplify, evaluate
   *
   * @param {Node|string} expr       The expression to substitute into
   * @param {string} variable        The variable name to replace
   * @param {number|string|Node} value  The replacement value or expression
   * @return {number|string}         Numeric result if value is a number, string otherwise
   */
  return typed(name, {
    'Node, string, number': function (node, variable, value) {
      return substituteNumeric(node, variable, value)
    },
    'Node, string, string': function (node, variable, value) {
      const valueNode = parse(value)
      return substituteExpr(node, variable, valueNode)
    },
    'Node, string, Node': function (node, variable, valueNode) {
      return substituteExpr(node, variable, valueNode)
    },
    'string, string, number': function (expr, variable, value) {
      const node = parse(expr)
      return substituteNumeric(node, variable, value)
    },
    'string, string, string': function (expr, variable, value) {
      const node = parse(expr)
      const valueNode = parse(value)
      return substituteExpr(node, variable, valueNode)
    },
    'string, string, Node': function (expr, variable, valueNode) {
      const node = parse(expr)
      return substituteExpr(node, variable, valueNode)
    }
  })

  /**
   * Substitute variable with a numeric value and evaluate.
   * @param {Node} node
   * @param {string} variable
   * @param {number} value
   * @return {number}
   */
  function substituteNumeric (node, variable, value) {
    const scope = {}
    scope[variable] = value
    return node.evaluate(scope)
  }

  /**
   * Substitute variable with an expression node, return simplified string.
   * @param {Node} node
   * @param {string} variable
   * @param {Node} valueNode
   * @return {string}
   */
  function substituteExpr (node, variable, valueNode) {
    const substituted = node.transform(function (n) {
      if (n.type === 'SymbolNode' && n.name === variable) {
        return valueNode.cloneDeep()
      }
      return n
    })
    const result = simplify(substituted, [], {}, { exactFractions: false })
    return result.toString()
  }
})
