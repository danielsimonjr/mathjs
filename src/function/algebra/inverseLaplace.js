import { factory } from '../../utils/factory.js'

const name = 'inverseLaplace'
const dependencies = [
  'typed',
  'inverseLaplaceTransform'
]

export const createInverseLaplace = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  inverseLaplaceTransform
}) => {
  /**
   * Convenience alias for `inverseLaplaceTransform`.
   *
   * Compute the inverse Laplace transform using a lookup table.
   * Given an expression F(s) in the s-domain, returns the time-domain
   * function f(t) by matching known Laplace transform pairs.
   *
   * Supported patterns:
   *   - 1/s               → 1          (unit step)
   *   - 1/s^2             → t          (ramp)
   *   - c/s^n             → c*t^(n-1)/(n-1)!
   *   - 1/(s - a)         → e^(at)     (exponential)
   *   - s/(s^2 + b^2)     → cos(b*t)
   *   - b/(s^2 + b^2)     → sin(b*t)
   *
   * Syntax:
   *
   *     math.inverseLaplace(expr, sVar, tVar)
   *
   * Examples:
   *
   *     math.inverseLaplace('1/s', 's', 't')
   *     math.inverseLaplace('1/s^2', 's', 't')
   *     math.inverseLaplace('1/(s - 2)', 's', 't')
   *
   * See also:
   *
   *     inverseLaplaceTransform, laplace, apart
   *
   * @param {string|Node} expr  Expression in the s-domain
   * @param {string} sVar       The s-domain variable (e.g. 's')
   * @param {string} tVar       The time variable (e.g. 't')
   * @return {string}           Time-domain expression as a string
   */
  return typed(name, {
    'string, string, string': (expr, sVar, tVar) =>
      inverseLaplaceTransform(expr, sVar, tVar),
    'Node, string, string': (expr, sVar, tVar) =>
      inverseLaplaceTransform(expr, sVar, tVar)
  })
})
