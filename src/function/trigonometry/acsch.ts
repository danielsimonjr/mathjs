import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import { acschNumber } from '../../plain/number/index.ts'

const name = 'acsch'
const dependencies = ['typed', 'BigNumber']

export const createAcsch = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, BigNumber }: { typed: TypedFunction; BigNumber: any }) => {
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
  }
)
