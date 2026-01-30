import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import { absNumber } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for abs
interface HasAbsMethod {
  abs(): unknown
}

interface AbsDependencies {
  typed: TypedFunction
}

const name = 'abs'
const dependencies = ['typed']

export const createAbs = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: AbsDependencies) => {
    /**
     * Calculate the absolute value of a number. For matrices, the function is
     * evaluated element wise.
     *
     * Syntax:
     *
     *    math.abs(x)
     *
     * Examples:
     *
     *    math.abs(3.5)                // returns number 3.5
     *    math.abs(-4.2)               // returns number 4.2
     *
     *    math.abs([3, -5, -1, 0, 2])  // returns Array [3, 5, 1, 0, 2]
     *
     * See also:
     *
     *    sign
     *
     * @param  {number | BigNumber | bigint | Fraction | Complex | Array | Matrix | Unit} x
     *            A number or matrix for which to get the absolute value
     * @return {number | BigNumber | bigint | Fraction | Complex | Array | Matrix | Unit}
     *            Absolute value of `x`
     */
    return typed(name, {
      number: absNumber,

      'Complex | BigNumber | Fraction | Unit': (x: HasAbsMethod): unknown =>
        x.abs(),

      bigint: (x: bigint): bigint => (x < 0n ? -x : x),

      // deep map collection, skip zeros since abs(0) = 0
      'Array | Matrix': typed.referToSelf(
        (self: TypedFunction) =>
          (x: unknown): unknown =>
            deepMap(x, self, true)
      )
    })
  }
)
