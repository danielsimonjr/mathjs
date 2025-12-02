import { factory, FactoryFunction } from '../../utils/factory.js'
import type { TypedFunction } from '../../core/function/typed.js'

const name = 'divideScalar'
const dependencies = ['typed', 'numeric']

export const createDivideScalar: FactoryFunction<
  { typed: TypedFunction, numeric: any },
  TypedFunction
> = /* #__PURE__ */ factory(name, dependencies, ({ typed, numeric }) => {
  /**
   * Divide two scalar values, `x / y`.
   * This function is meant for internal use: it is used by the public functions
   * `divide` and `inv`.
   *
   * This function does not support collections (Array or Matrix).
   *
   * @param  {number | BigNumber | bigint | Fraction | Complex | Unit} x   Numerator
   * @param  {number | BigNumber | bigint | Fraction | Complex} y          Denominator
   * @return {number | BigNumber | bigint | Fraction | Complex | Unit}     Quotient, `x / y`
   * @private
   */
  return typed(name, {
    'number, number': function (x: number, y: number): number {
      return x / y
    },

    'Complex, Complex': function (x: any, y: any): any {
      return x.div(y)
    },

    'BigNumber, BigNumber': function (x: any, y: any): any {
      return x.div(y)
    },

    'bigint, bigint': function (x: bigint, y: bigint): bigint {
      return x / y
    },

    'Fraction, Fraction': function (x: any, y: any): any {
      return x.div(y)
    },

    'Unit, number | Complex | Fraction | BigNumber | Unit':
      (x: any, y: any): any => x.divide(y),

    'number | Fraction | Complex | BigNumber, Unit':
    (x: any, y: any): any => y.divideInto(x)
  })
})
