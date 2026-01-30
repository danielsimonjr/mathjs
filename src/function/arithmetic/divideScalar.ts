import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for divideScalar
interface HasDivMethod {
  div(other: unknown): unknown
}

interface HasDivideMethod {
  divide(other: unknown): unknown
}

interface HasDivideIntoMethod {
  divideInto(other: unknown): unknown
}

interface DivideScalarDependencies {
  typed: TypedFunction
  numeric: (value: unknown, type: string) => unknown
}

const name = 'divideScalar'
const dependencies = ['typed', 'numeric']

export const createDivideScalar = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, numeric: _numeric }: DivideScalarDependencies) => {
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

      'Complex, Complex': function (x: HasDivMethod, y: HasDivMethod): unknown {
        return x.div(y)
      },

      'BigNumber, BigNumber': function (x: HasDivMethod, y: HasDivMethod): unknown {
        return x.div(y)
      },

      'bigint, bigint': function (x: bigint, y: bigint): bigint {
        return x / y
      },

      'Fraction, Fraction': function (x: HasDivMethod, y: HasDivMethod): unknown {
        return x.div(y)
      },

      'Unit, number | Complex | Fraction | BigNumber | Unit': (
        x: HasDivideMethod,
        y: unknown
      ): unknown => x.divide(y),

      'number | Fraction | Complex | BigNumber, Unit': (x: unknown, y: HasDivideIntoMethod): unknown =>
        y.divideInto(x)
    })
  }
)
