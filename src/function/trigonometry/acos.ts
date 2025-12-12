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
  acos(): BigNumber
}

interface Complex {
  acos(): Complex
}

interface ComplexConstructor {
  new(re: number, im: number): Complex
}

interface Dependencies {
  typed: TypedFunction
  config: Config
  Complex: ComplexConstructor
}

const name = 'acos'
const dependencies = ['typed', 'config', 'Complex']

export const createAcos = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, Complex }: Dependencies) => {
  /**
   * Calculate the inverse cosine of a value.
   *
   * To avoid confusion with the matrix arccosine, this function does not
   * apply to matrices.
   *
   * Syntax:
   *
   *    math.acos(x)
   *
   * Examples:
   *
   *    math.acos(0.5)           // returns number 1.0471975511965979
   *    math.acos(math.cos(1.5)) // returns number 1.5
   *
   *    math.acos(2)             // returns Complex 0 + 1.3169578969248166 i
   *
   * See also:
   *
   *    cos, atan, asin
   *
   * @param {number | BigNumber | Complex} x  Function input
   * @return {number | BigNumber | Complex} The arc cosine of x
   */
  return typed(name, {
    number: function (x: number): number | Complex {
      if ((x >= -1 && x <= 1) || config.predictable) {
        return Math.acos(x)
      } else {
        return new Complex(x, 0).acos()
      }
    },

    Complex: function (x: Complex): Complex {
      return x.acos()
    },

    BigNumber: function (x: BigNumber): BigNumber {
      return x.acos()
    }
  })
})
