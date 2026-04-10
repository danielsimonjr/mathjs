import { factory } from '../../utils/factory.js'

const name = 'implicitDiff'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createImplicitDiff = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the implicit derivative dy/dx of F(x,y) = 0.
   * Uses the formula: dy/dx = -(dF/dx) / (dF/dy)
   *
   * Syntax:
   *
   *     math.implicitDiff(expr, y, x)
   *
   * Examples:
   *
   *     math.implicitDiff('x^2 + y^2 - 1', 'y', 'x')   // '-x / y'
   *     math.implicitDiff('x^3 + y^3 - 3*x*y', 'y', 'x') // '(x^2 - y) / (y^2 - x)'
   *
   * See also:
   *
   *     derivative, simplify, partialDerivative
   *
   * @param  {string | Node} expr  The expression F(x,y) where F = 0
   * @param  {string}        y     The dependent variable name
   * @param  {string}        x     The independent variable name
   * @return {string}              The derivative dy/dx as a string
   */
  return typed(name, {
    'string | Node, string, string': function (expr, y, x) {
      const exprNode = typeof expr === 'string' ? parse(expr) : expr

      const dFdx = derivative(exprNode, x)
      const dFdy = derivative(exprNode, y)

      // dy/dx = -(dF/dx) / (dF/dy)
      const resultExpr = simplify(`-(${dFdx.toString()}) / (${dFdy.toString()})`)
      return resultExpr.toString()
    }
  })
})
