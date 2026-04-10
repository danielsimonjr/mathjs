import { factory } from '../../utils/factory.js'

const name = 'curl'
const dependencies = ['typed', 'parse', 'derivative', 'simplify']

export const createCurl = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  parse,
  derivative,
  simplify
}) => {
  /**
   * Compute the symbolic curl of a 3D vector field.
   * curl F = [dF3/dy - dF2/dz, dF1/dz - dF3/dx, dF2/dx - dF1/dy]
   *
   * Syntax:
   *
   *     math.curl(field, variables)
   *
   * Examples:
   *
   *     math.curl(['y*z', 'x*z', 'x*y'], ['x', 'y', 'z'])    // ['0', '0', '0']
   *     math.curl(['y', '-x', '0'], ['x', 'y', 'z'])          // ['0', '0', '-2']
   *
   * See also:
   *
   *     divergence, gradientSymbolic, derivative
   *
   * @param  {Array.<string | Node>}  field      Array of 3 component expressions [F1, F2, F3]
   * @param  {Array.<string>}         variables  Array of 3 variable names [x, y, z]
   * @return {Array.<string>}                    The curl as an array of 3 strings
   */
  return typed(name, {
    'Array, Array': function (field, variables) {
      if (field.length !== 3 || variables.length !== 3) {
        throw new Error('curl: field and variables must each have exactly 3 components')
      }

      const [f1, f2, f3] = field.map(function (component) {
        return typeof component === 'string' ? parse(component) : component
      })
      const [x, y, z] = variables

      // curl components
      const c1 = simplify(`(${derivative(f3, y).toString()}) - (${derivative(f2, z).toString()})`)
      const c2 = simplify(`(${derivative(f1, z).toString()}) - (${derivative(f3, x).toString()})`)
      const c3 = simplify(`(${derivative(f2, x).toString()}) - (${derivative(f1, y).toString()})`)

      return [c1.toString(), c2.toString(), c3.toString()]
    }
  })
})
