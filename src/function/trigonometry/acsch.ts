import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { BigNumber } from '../../type/bigNumber/BigNumber.js'
import type { Complex } from '../../type/complex/Complex.js'
import { acschNumber } from '../../plain/number/index.js'

const name = 'acsch'
const dependencies = ['typed', 'BigNumber']

export const createAcsch: FactoryFunction<'acsch', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, BigNumber }) => {
  /**
   * Calculate the inverse hyperbolic cosecant of a value,
   * defined as `acsch(x) = asinh(1/x) = ln(1/x + sqrt(1/x^2 + 1))`.
   *
   * To avoid confusion with the matrix inverse hyperbolic cosecant, this function
   * does not apply to matrices.
   *
   * Syntax:
   *
   *    math.acsch(x)
   *
   * Examples:
   *
   *    math.acsch(0.5)       // returns 1.4436354751788103
   *
   * See also:
   *
   *    asech, acoth
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} Hyperbolic arccosecant of x
   */
  return typed(name, {
    number: acschNumber,

    Complex: function (x: Complex) {
      return x.acsch()
    },

    BigNumber: function (x: BigNumber) {
      return new BigNumber(1).div(x).asinh()
    }
  }) as TypedFunction
})
