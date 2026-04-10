import { factory } from '../../utils/factory.js'

const name = 'divergence'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createDivergence = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the symbolic divergence of a vector field.
   * The divergence is the sum of partial derivatives: div F = dF1/dx1 + dF2/dx2 + ...
   *
   * Syntax:
   *
   *     math.divergence(field, variables)
   *
   * Examples:
   *
   *     math.divergence(['x^2', 'y^2', 'z^2'], ['x', 'y', 'z'])  // '2 * x + 2 * y + 2 * z'
   *     math.divergence(['x*y', 'y*z', 'x*z'], ['x', 'y', 'z'])  // 'y + z + x'
   *
   * See also:
   *
   *     curl, gradientSymbolic, derivative, jacobian
   *
   * @param  {Array.<string | Node>}  field      Array of component expressions
   * @param  {Array.<string>}         variables  Array of variable names (same length as field)
   * @return {string}                            The divergence as a string
   */
  return typed(name, {
    'Array, Array': function (field, variables) {
      if (field.length !== variables.length) {
        throw new Error('divergence: field and variables arrays must have the same length')
      }

      const terms = field.map(function (component, i) {
        const componentNode = typeof component === 'string' ? parse(component) : component
        const partialNode = derivative(componentNode, variables[i])
        return simplify(partialNode).toString()
      })

      // Sum all terms
      const sumExpr = terms.join(' + ')
      return simplify(sumExpr).toString()
    }
  })
})
