import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'
import { multiplyNumber } from '../../plain/number/index.js'

const name = 'multiplyScalar'
const dependencies = ['typed'] as const

export const createMultiplyScalar: FactoryFunction<
  { typed: TypedFunction },
  TypedFunction
> = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Multiply two scalar values, `x * y`.
   * This function is meant for internal use: it is used by the public function
   * `multiply`
   *
   * This function does not support collections (Array or Matrix).
   *
   * @param  {number | BigNumber | bigint | Fraction | Complex | Unit} x   First value to multiply
   * @param  {number | BigNumber | bigint | Fraction | Complex} y          Second value to multiply
   * @return {number | BigNumber | bigint | Fraction | Complex | Unit}     Multiplication of `x` and `y`
   * @private
   */
  return typed('multiplyScalar', {

    'number, number': multiplyNumber,

    'Complex, Complex': function (x: any, y: any): any {
      return x.mul(y)
    },

    'BigNumber, BigNumber': function (x: any, y: any): any {
      return x.times(y)
    },

    'bigint, bigint': function (x: bigint, y: bigint): bigint {
      return x * y
    },

    'Fraction, Fraction': function (x: any, y: any): any {
      return x.mul(y)
    },

    'number | Fraction | BigNumber | Complex, Unit': (x: any, y: any): any => y.multiply(x),

    'Unit, number | Fraction | BigNumber | Complex | Unit': (x: any, y: any): any => x.multiply(y)
  })
})
