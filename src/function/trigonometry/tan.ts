import { factory } from '../../utils/factory.ts'
import { createTrigUnit } from './trigUnit.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for tan
interface BigNumberType {
  tan(): BigNumberType
}

interface ComplexType {
  tan(): ComplexType
}

interface TanDependencies {
  typed: TypedFunction
}

const name = 'tan'
const dependencies = ['typed']

export const createTan = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: TanDependencies) => {
    const trigUnit = createTrigUnit({ typed })

    /**
     * Calculate the tangent of a value. `tan(x)` is equal to `sin(x) / cos(x)`.
     *
     * To avoid confusion with the matrix tangent, this function does not apply
     * to matrices.
     *
     * Syntax:
     *
     *    math.tan(x)
     *
     * Examples:
     *
     *    math.tan(0.5)                    // returns number 0.5463024898437905
     *    math.sin(0.5) / math.cos(0.5)    // returns number 0.5463024898437905
     *    math.tan(math.pi / 4)            // returns number 1
     *    math.tan(math.unit(45, 'deg'))   // returns number 1
     *
     * See also:
     *
     *    atan, sin, cos
     *
     * @param {number | BigNumber | Complex | Unit} x  Function input
     * @return {number | BigNumber | Complex} Tangent of x
     */
    return typed(
      name,
      {
        number: Math.tan,
        'Complex | BigNumber': (
          x: ComplexType | BigNumberType
        ): ComplexType | BigNumberType => x.tan()
      },
      trigUnit
    )
  }
)
