import { factory } from '../../utils/factory.js'

const name = 'laplacian'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createLaplacian = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the scalar Laplacian of an expression with respect to a list of variables.
   * The Laplacian is the sum of second partial derivatives: Δf = ∂²f/∂x² + ∂²f/∂y² + ...
   *
   * Syntax:
   *
   *     math.laplacian(expr, variables)
   *
   * Examples:
   *
   *     math.laplacian('x^2 + y^2', ['x', 'y'])      // '4'
   *     math.laplacian('x^3 + y^3', ['x', 'y'])      // '6 * x + 6 * y'
   *     math.laplacian('sin(x) + cos(y)', ['x', 'y']) // '-sin(x) - cos(y)'
   *
   * See also:
   *
   *     derivative, gradientSymbolic, divergence
   *
   * @param  {string | Node}   expr       The scalar expression
   * @param  {Array.<string>}  variables  The variable names
   * @return {string}                     The Laplacian as a string
   */
  return typed(name, {
    'string | Node, Array': function (expr, variables) {
      if (!Array.isArray(variables) || variables.length === 0) {
        throw new Error('laplacian: variables must be a non-empty array')
      }
      for (let i = 0; i < variables.length; i++) {
        if (typeof variables[i] !== 'string') {
          throw new Error('laplacian: each variable must be a string, got ' + typeof variables[i] + ' at index ' + i)
        }
      }

      const exprNode = typeof expr === 'string' ? parse(expr) : expr

      const secondDerivatives = variables.map(function (variable) {
        const firstDeriv = derivative(exprNode, variable)
        const secondDeriv = derivative(firstDeriv, variable)
        return simplify(secondDeriv).toString()
      })

      const sumExpr = secondDerivatives.join(' + ')
      return simplify(sumExpr).toString()
    }
  })
})
