import { factory } from '../../utils/factory.js'

const name = 'partialDerivative'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createPartialDerivative = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute higher-order and mixed partial derivatives of an expression.
   * The variables array specifies the order of differentiation.
   *
   * Syntax:
   *
   *     math.partialDerivative(expr, variable)
   *     math.partialDerivative(expr, variables)
   *
   * Examples:
   *
   *     math.partialDerivative('x^2 * y^3', 'x')         // '2 * x * y^3'
   *     math.partialDerivative('x^2 * y^3', ['x', 'y'])  // '6 * x * y^2'
   *     math.partialDerivative('x^3 * y^2', ['x', 'x'])  // '6 * x * y^2'
   *
   * See also:
   *
   *     derivative, gradientSymbolic, implicitDiff
   *
   * @param  {string | Node}        expr       The expression to differentiate
   * @param  {string | Array.<string>} variables  Variable(s) to differentiate with respect to (in order)
   * @return {string}                            The partial derivative as a string
   */
  return typed(name, {
    'string | Node, string': function (expr, variable) {
      const exprNode = typeof expr === 'string' ? parse(expr) : expr
      const result = derivative(exprNode, variable)
      return simplify(result).toString()
    },

    'string | Node, Array': function (expr, variables) {
      let current = typeof expr === 'string' ? parse(expr) : expr

      for (const variable of variables) {
        current = derivative(current, variable)
      }

      return simplify(current).toString()
    }
  })
})
