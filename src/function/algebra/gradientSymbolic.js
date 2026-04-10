import { factory } from '../../utils/factory.js'

const name = 'gradientSymbolic'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createGradientSymbolic = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the symbolic gradient of an expression with respect to a list of variables.
   * Returns an array of strings, one for each partial derivative.
   *
   * Syntax:
   *
   *     math.gradientSymbolic(expr, variables)
   *
   * Examples:
   *
   *     math.gradientSymbolic('x^2 + y^2', ['x', 'y'])    // ['2 * x', '2 * y']
   *     math.gradientSymbolic('x*y*z', ['x', 'y', 'z'])   // ['y * z', 'x * z', 'x * y']
   *
   * See also:
   *
   *     derivative, partialDerivative, divergence, jacobian
   *
   * @param  {string | Node}   expr       The scalar expression
   * @param  {Array.<string>}  variables  The variable names
   * @return {Array.<string>}             Array of partial derivative strings
   */
  return typed(name, {
    'string | Node, Array': function (expr, variables) {
      const exprNode = typeof expr === 'string' ? parse(expr) : expr

      return variables.map(function (variable) {
        const partialNode = derivative(exprNode, variable)
        return simplify(partialNode).toString()
      })
    }
  })
})
