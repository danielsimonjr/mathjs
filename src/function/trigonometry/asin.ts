import { factory } from '../../utils/factory.ts'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
  referTo<U>(signature: string, fn: (ref: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
  referToSelf<U>(fn: (self: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
}

interface Config {
  predictable: boolean
}

interface BigNumber {
  asin(): BigNumber
}

interface Complex {
  asin(): Complex
}

interface ComplexConstructor {
  new(re: number, im: number): Complex
}

interface Dependencies {
  typed: TypedFunction
  config: Config
  Complex: ComplexConstructor
}

const name = 'asin'
const dependencies = ['typed', 'config', 'Complex']

export const createAsin = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex }: Dependencies) => {
  /**
   * Calculate the inverse sine of a value.
   *
   * To avoid confusion with the matric arcsine, this function does not apply
   * to matrices.
   *
   * Syntax:
   *
   *    math.asin(x)
   *
   * Examples:
   *
   *    math.asin(0.5)           // returns number 0.5235987755982989
   *    math.asin(math.sin(1.5)) // returns number 1.5
   *
   *    math.asin(2)             // returns Complex 1.5707963267948966 -1.3169578969248166i
   *
   * See also:
   *
   *    sin, atan, acos
   *
   * @param {number | BigNumber | Complex} x   Function input
   * @return {number | BigNumber | Complex} The arc sine of x
   */
  return typed(name, {
    number: function (x: number): number | Complex {
      if ((x >= -1 && x <= 1) || config.predictable) {
        return Math.asin(x)
      } else {
        return new Complex(x, 0).asin()
      }
    },

    Complex: function (x: Complex): Complex {
      return x.asin()
    },

    BigNumber: function (x: BigNumber): BigNumber {
      return x.asin()
    }
  })
})
