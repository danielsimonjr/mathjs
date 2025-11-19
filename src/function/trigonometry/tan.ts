import { factory } from '../../utils/factory.js'
import { createTrigUnit } from './trigUnit.js'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
  referTo<U>(signature: string, fn: (ref: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
  referToSelf<U>(fn: (self: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
}

interface BigNumber {
  tan(): BigNumber
}

interface Complex {
  tan(): Complex
}

interface Dependencies {
  typed: TypedFunction
}

const name = 'tan'
const dependencies = ['typed']

export const createTan = /* #__PURE__ */ factory(name, dependencies, ({ typed }: Dependencies) => {
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
  return typed(name, {
    number: Math.tan,
    'Complex | BigNumber': (x: Complex | BigNumber) => x.tan()
  }, trigUnit)
})
