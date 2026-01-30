import { factory } from '../../utils/factory.ts'
import { subtractNumber } from '../../plain/number/index.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for subtractScalar
interface HasSubMethod {
  sub(other: unknown): unknown
}

interface HasMinusMethod {
  minus(other: unknown): unknown
}

interface UnitType {
  value: unknown
  equalBase(other: UnitType): boolean
  clone(): UnitType
  valueType(): string
  fixPrefix: boolean
}

interface SubtractScalarDependencies {
  typed: TypedFunction
}

const name = 'subtractScalar'
const dependencies = ['typed']

export const createSubtractScalar = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: SubtractScalarDependencies) => {
    /**
     * Subtract two scalar values, `x - y`.
     * This function is meant for internal use: it is used by the public function
     * `subtract`
     *
     * This function does not support collections (Array or Matrix).
     *
     * @param  {number | BigNumber | bigint | Fraction | Complex | Unit} x   First value
     * @param  {number | BigNumber | bigint | Fraction | Complex} y          Second value to be subtracted from `x`
     * @return {number | BigNumber | bigint | Fraction | Complex | Unit}     Difference of `x` and `y`
     * @private
     */
    return typed(name, {
      'number, number': subtractNumber,

      'Complex, Complex': function (x: HasSubMethod, y: HasSubMethod): unknown {
        return x.sub(y)
      },

      'BigNumber, BigNumber': function (x: HasMinusMethod, y: HasMinusMethod): unknown {
        return x.minus(y)
      },

      'bigint, bigint': function (x: bigint, y: bigint): bigint {
        return x - y
      },

      'Fraction, Fraction': function (x: HasSubMethod, y: HasSubMethod): unknown {
        return x.sub(y)
      },

      'Unit, Unit': typed.referToSelf((self: TypedFunction) => (x: UnitType, y: UnitType): UnitType => {
        if (x.value === null || x.value === undefined) {
          throw new Error('Parameter x contains a unit with undefined value')
        }
        if (y.value === null || y.value === undefined) {
          throw new Error('Parameter y contains a unit with undefined value')
        }
        if (!x.equalBase(y)) throw new Error('Units do not match')

        const res = x.clone()
        res.value = typed.find(self, [res.valueType(), y.valueType()])(
          res.value,
          y.value
        )
        res.fixPrefix = false
        return res
      })
    })
  }
)
