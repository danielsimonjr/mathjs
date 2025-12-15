import { factory } from '../../utils/factory.ts'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface FormatOptions {
  notation: string
  wordSize?: number | bigint
}

interface Dependencies {
  typed: TypedFunction
  format: (value: any, options: FormatOptions) => string
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
  ({ typed, format }: Dependencies): TypedFunction => {
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
