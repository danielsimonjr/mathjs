import { factory } from '../../utils/factory.js'

const name = 'jacobian'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createJacobian = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the symbolic Jacobian matrix of a vector of expressions
   * with respect to a list of variables.
   * J[i][j] = d(exprs[i]) / d(variables[j])
   *
   * Syntax:
   *
   *     math.jacobian(exprs, variables)
   *
   * Examples:
   *
   *     math.jacobian(['x*y', 'x+y'], ['x', 'y'])    // [['y', 'x'], ['1', '1']]
   *     math.jacobian(['x^2', 'y^2'], ['x', 'y'])    // [['2 * x', '0'], ['0', '2 * y']]
   *
   * See also:
   *
   *     gradientSymbolic, divergence, derivative, partialDerivative
   *
   * @param  {Array.<string | Node>}  exprs      Array of expressions
   * @param  {Array.<string>}         variables  Array of variable names
   * @return {Array.<Array.<string>>}            2D array of partial derivatives
   */
  return typed(name, {
    'Array, Array': function (exprs, variables) {
      return exprs.map(function (expr) {
        const exprNode = typeof expr === 'string' ? parse(expr) : expr

        return variables.map(function (variable) {
          const partialNode = derivative(exprNode, variable)
          return simplify(partialNode).toString()
        })
      })
    }
  })
})
