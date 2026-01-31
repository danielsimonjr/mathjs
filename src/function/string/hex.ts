import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for hex formatting
interface BigNumberType {
  // BigNumber placeholder
}

type NumericValue = number | bigint | BigNumberType

interface FormatOptions {
  notation: string
  wordSize?: number | bigint
}

interface HexDependencies {
  typed: TypedFunction
  format: (value: NumericValue, options: FormatOptions) => string
}

const name = 'hex'
const dependencies = ['typed', 'format']

/**
 * Format a number as hexadecimal.
 *
 * Syntax:
 *
 *    math.hex(value)
 *
 * Examples:
 *
 *    math.hex(240) // returns "0xf0"
 *
 * See also:
 *
 *    oct
 *    bin
 *
 * @param {number | BigNumber} value    Value to be stringified
 * @param {number | BigNumber} wordSize Optional word size (see `format`)
 * @return {string}         The formatted value
 */
export const createHex = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, format }: HexDependencies) => {
    return typed(name, {
      'number | BigNumber': function (n: number | bigint): string {
        return format(n, { notation: 'hex' })
      },
      'number | BigNumber, number | BigNumber': function (
        n: number | bigint,
        wordSize: number | bigint
      ): string {
        return format(n, { notation: 'hex', wordSize })
      }
    })
  }
)
