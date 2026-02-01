import { factory } from '../../utils/factory.ts'
import { multiplyNumber } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for multiplyScalar
interface HasMulMethod {
  mul(other: unknown): unknown
}

interface HasTimesMethod {
  times(other: unknown): unknown
}

interface HasMultiplyMethod {
  multiply(other: unknown): unknown
}

interface MultiplyScalarDependencies {
  typed: TypedFunction
}

const name = 'multiplyScalar'
const dependencies = ['typed']

export const createMultiplyScalar = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: MultiplyScalarDependencies) => {
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

      'Complex, Complex': function (x: HasMulMethod, y: HasMulMethod): unknown {
        return x.mul(y)
      },

      'BigNumber, BigNumber': function (
        x: HasTimesMethod,
        y: HasTimesMethod
      ): unknown {
        return x.times(y)
      },

      'bigint, bigint': function (x: bigint, y: bigint): bigint {
        return x * y
      },

      'Fraction, Fraction': function (
        x: HasMulMethod,
        y: HasMulMethod
      ): unknown {
        return x.mul(y)
      },

      'number | Fraction | Complex, Unit': (
        x: unknown,
        y: HasMultiplyMethod
      ): unknown => y.multiply(x),

      'Unit, number | Fraction | Complex | Unit': (
        x: HasMultiplyMethod,
        y: unknown
      ): unknown => x.multiply(y)
    })
  }
)
