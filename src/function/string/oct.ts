import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for oct formatting
interface BigNumberType {
  // BigNumber placeholder
}

type NumericValue = number | bigint | BigNumberType

interface FormatOptions {
  notation: string
  wordSize?: number | bigint
}

interface OctDependencies {
  typed: TypedFunction
  format: (value: NumericValue, options: FormatOptions) => string
}

const name = 'oct'
const dependencies = ['typed', 'format']

/**
 * Format a number as octal.
 *
 * Syntax:
 *
 *    math.oct(value)
 *
 * Examples:
 *
 *    //the following outputs "0o70"
 *    math.oct(56)
 *
 * See also:
 *
 *    bin
 *    hex
 *
 * @param {number | BigNumber} value    Value to be stringified
 * @param {number | BigNumber} wordSize Optional word size (see `format`)
 * @return {string}         The formatted value
 */

export const createOct = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, format }: OctDependencies) => {
    return typed(name, {
      'number | BigNumber': function (n: number | bigint): string {
        return format(n, { notation: 'oct' })
      },
      'number | BigNumber, number | BigNumber': function (
        n: number | bigint,
        wordSize: number | bigint
      ): string {
        return format(n, { notation: 'oct', wordSize })
      }
    })
  }
)
