import { factory } from '../../utils/factory.js'

const name = 'tangentLine'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createTangentLine = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the tangent line of an expression at a given point.
   * Returns the tangent line as a string expression:
   *   y = f(a) + f'(a) * (x - a)
   *
   * Syntax:
   *
   *     math.tangentLine(expr, variable, point)
   *
   * Examples:
   *
   *     math.tangentLine('x^2', 'x', 2)        // '4 * x - 4'
   *     math.tangentLine('sin(x)', 'x', 0)      // 'x'
   *
   * See also:
   *
   *     derivative, simplify, evaluate
   *
   * @param  {string | Node} expr      The expression to differentiate
   * @param  {string}        variable  The variable name
   * @param  {number}        point     The point at which to compute the tangent
   * @return {string}                  The tangent line expression as a string
   */
  return typed(name, {
    'string | Node, string, number': function (expr, variable, point) {
      const exprNode = typeof expr === 'string' ? parse(expr) : expr
      const derivNode = derivative(exprNode, variable)

      const scope = {}
      scope[variable] = point

      const fa = exprNode.evaluate(scope)
      const dfa = derivNode.evaluate(scope)

      // y = fa + dfa * (x - point)
      // => dfa * x + (fa - dfa * point)
      const intercept = fa - dfa * point

      const resultExpr = simplify(`${dfa} * ${variable} + ${intercept}`)
      return resultExpr.toString()
    }
  })
})
