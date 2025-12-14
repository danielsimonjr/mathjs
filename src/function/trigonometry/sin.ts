import { factory } from '../../utils/factory.ts'
import { createTrigUnit } from './trigUnit.ts'

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
  sin(): BigNumber
}

interface Complex {
  sin(): Complex
}

interface Dependencies {
  typed: TypedFunction
}

const name = 'sin'
const dependencies = ['typed']

export const createSin = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: Dependencies) => {
    const trigUnit = createTrigUnit({ typed })

    /**
     * Calculate the sine of a value.
     *
     * To avoid confusion with the matrix sine, this function does not apply
     * to matrices.
     *
     * Syntax:
     *
     *    math.sin(x)
     *
     * Examples:
     *
     *    math.sin(2)                      // returns number 0.9092974268256813
     *    math.sin(math.pi / 4)            // returns number 0.7071067811865475
     *    math.sin(math.unit(90, 'deg'))   // returns number 1
     *    math.sin(math.unit(30, 'deg'))   // returns number 0.5
     *
     *    const angle = 0.2
     *    math.pow(math.sin(angle), 2) + math.pow(math.cos(angle), 2) // returns number 1
     *
     * See also:
     *
     *    cos, tan
     *
     * @param {number | BigNumber | Complex | Unit} x  Function input
     * @return {number | BigNumber | Complex} Sine of x
     */
    return typed(
      name,
      {
        number: Math.sin,
        'Complex | BigNumber': (x: Complex | BigNumber) => x.sin()
      },
      trigUnit
    )
  }
)
