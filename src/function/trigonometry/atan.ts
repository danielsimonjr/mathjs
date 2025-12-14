import { factory } from '../../utils/factory.ts'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
  referTo<U>(
    signature: string,
    fn: (ref: TypedFunction<U>) => TypedFunction<U>
  ): TypedFunction<U>
  referToSelf<U>(
    fn: (self: TypedFunction<U>) => TypedFunction<U>
  ): TypedFunction<U>
}

interface BigNumber {
  atan(): BigNumber
}

interface Complex {
  atan(): Complex
}

interface Dependencies {
  typed: TypedFunction
}

const name = 'atan'
const dependencies = ['typed']

export const createAtan = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: Dependencies) => {
    /**
     * Calculate the inverse tangent of a value.
     *
     * To avoid confusion with matrix arctangent, this function does not apply
     * to matrices.
     *
     * Syntax:
     *
     *    math.atan(x)
     *
     * Examples:
     *
     *    math.atan(0.5)           // returns number 0.4636476090008061
     *    math.atan(2)             // returns number 1.1071487177940904
     *    math.atan(math.tan(1.5)) // returns number 1.5
     *
     * See also:
     *
     *    tan, asin, acos
     *
     * @param {number | BigNumber | Complex} x   Function input
     * @return {number | BigNumber | Complex} The arc tangent of x
     */
    return typed('atan', {
      number: function (x: number): number {
        return Math.atan(x)
      },

      Complex: function (x: Complex): Complex {
        return x.atan()
      },

      BigNumber: function (x: BigNumber): BigNumber {
        return x.atan()
      }
    })
  }
)
