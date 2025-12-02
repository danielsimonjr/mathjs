import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import type { BigNumber } from '../../type/bigNumber/BigNumber.js'
import type { Complex } from '../../type/complex/Complex.js'
import { cschNumber } from '../../plain/number/index.js'

const name = 'csch'
const dependencies = ['typed', 'BigNumber']

export const createCsch: FactoryFunction<'csch', typeof dependencies> = /* #__PURE__ */ factory(name, dependencies, ({ typed, BigNumber }) => {
  /**
   * Calculate the hyperbolic cosecant of a value,
   * defined as `csch(x) = 1 / sinh(x)`.
   *
   * To avoid confusion with the matrix hyperbolic cosecant, this function
   * does not apply to matrices.
   *
   * Syntax:
   *
   *    math.csch(x)
   *
   * Examples:
   *
   *    // csch(x) = 1/ sinh(x)
   *    math.csch(0.5)       // returns 1.9190347513349437
   *    1 / math.sinh(0.5)   // returns 1.9190347513349437
   *
   * See also:
   *
   *    sinh, sech, coth
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} Hyperbolic cosecant of x
   */
  return typed(name, {
    number: cschNumber,
    Complex: (x: Complex) => x.csch(),
    BigNumber: (x: BigNumber) => new BigNumber(1).div(x.sinh())
  }) as TypedFunction
})
