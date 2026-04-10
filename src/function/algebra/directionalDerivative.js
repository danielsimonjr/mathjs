import { factory } from '../../utils/factory.js'

const name = 'directionalDerivative'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createDirectionalDerivative = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the directional derivative of a scalar expression.
   * D_v f = (gradient f) · (v / |v|)
   * where v is the direction vector.
   *
   * Syntax:
   *
   *     math.directionalDerivative(expr, variables, direction)
   *
   * Examples:
   *
   *     math.directionalDerivative('x * y', ['x', 'y'], [1, 0])        // 'y'
   *     math.directionalDerivative('x^2 + y^2', ['x', 'y'], [1, 1])   // '2 * x + 2 * y' (unnormalized direction)
   *     math.directionalDerivative('x*y*z', ['x','y','z'], [1, 0, 0]) // 'y * z'
   *
   * See also:
   *
   *     derivative, gradientSymbolic, divergence
   *
   * @param  {string | Node}   expr       The scalar expression
   * @param  {Array.<string>}  variables  Array of variable names
   * @param  {Array.<number>}  direction  Direction vector components
   * @return {string}                     The directional derivative as a string
   */
  return typed(name, {
    'string | Node, Array, Array': function (expr, variables, direction) {
      if (variables.length !== direction.length) {
        throw new Error('directionalDerivative: variables and direction arrays must have the same length')
      }

      const exprNode = typeof expr === 'string' ? parse(expr) : expr

      // Compute the magnitude of the direction vector
      const magnitudeSq = direction.reduce(function (sum, v) { return sum + v * v }, 0)
      const magnitude = Math.sqrt(magnitudeSq)

      if (magnitude < 1e-14) {
        throw new Error('directionalDerivative: direction vector must be non-zero')
      }

      // Compute gradient components and dot product with normalized direction
      const gradTerms = variables.map(function (variable, i) {
        const partialNode = derivative(exprNode, variable)
        const simplifiedPartial = simplify(partialNode).toString()
        const normalizedComponent = direction[i] / magnitude
        if (Math.abs(normalizedComponent) < 1e-14) return null
        if (Math.abs(normalizedComponent - 1) < 1e-14) return simplifiedPartial
        if (Math.abs(normalizedComponent + 1) < 1e-14) return '-(' + simplifiedPartial + ')'
        return '(' + normalizedComponent + ') * (' + simplifiedPartial + ')'
      })

      const nonNullTerms = gradTerms.filter(function (t) { return t !== null })

      if (nonNullTerms.length === 0) return '0'

      const sumExpr = nonNullTerms.join(' + ')
      return simplify(sumExpr).toString()
    }
  })
})
