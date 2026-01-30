import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for bin formatting
interface BigNumberType {
  // BigNumber placeholder
}

type NumericValue = number | bigint | BigNumberType

interface FormatOptions {
  notation: string
  wordSize?: number | bigint
}

interface BinDependencies {
  typed: TypedFunction
  format: (value: NumericValue, options: FormatOptions) => string
}

const name = 'bin'
const dependencies = ['typed', 'format']

/**
 * Format a number as binary.
 *
 * Syntax:
 *
 *    math.bin(value)
 *
 * Examples:
 *
 *    //the following outputs "0b10"
 *    math.bin(2)
 *
 * See also:
 *
 *    oct
 *    hex
 *
 * @param {number | BigNumber} value    Value to be stringified
 * @param {number | BigNumber} wordSize Optional word size (see `format`)
 * @return {string}         The formatted value
 */
export const createBin = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, format }: BinDependencies): TypedFunction => {
    return typed(name, {
      'number | BigNumber': function (n: number | bigint): string {
        return format(n, { notation: 'bin' })
      },
      'number | BigNumber, number | BigNumber': function (
        n: number | bigint,
        wordSize: number | bigint
      ): string {
        return format(n, { notation: 'bin', wordSize })
      }
    })
  }
)
