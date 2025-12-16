import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'
import type { Complex } from '../../type/complex/Complex.ts'
import { acotNumber } from '../../plain/number/index.ts'

const name = 'acot'
const dependencies = ['typed', 'BigNumber']

export const createAcot = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, BigNumber }: { typed: TypedFunction; BigNumber: any }) => {
    /**
     * Calculate the inverse cotangent of a value, defined as `acot(x) = atan(1/x)`.
     *
     * To avoid confusion with the matrix arccotanget, this function does not
     * apply to matrices.
     *
     * Syntax:
     *
     *    math.acot(x)
     *
     * Examples:
     *
     *    math.acot(0.5)           // returns number 1.1071487177940904
     *    math.acot(2)             // returns number 0.4636476090008061
     *    math.acot(math.cot(1.5)) // returns number 1.5
     *
     * See also:
     *
     *    cot, atan
     *
     * @param {number | BigNumber| Complex} x   Function input
     * @return {number | BigNumber| Complex} The arc cotangent of x
     */
    return typed(name, {
      number: acotNumber,

      Complex: function (x: Complex) {
        return x.acot()
      },

      BigNumber: function (x: BigNumber) {
        return new BigNumber(1).div(x).atan()
      }
    }) as TypedFunction
  }
)
