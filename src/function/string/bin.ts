import { factory } from '../../utils/factory.js'

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
export const createBin = /* #__PURE__ */ factory(name, dependencies, ({ typed, format }: Dependencies): TypedFunction => {
  return typed(name, {
    'number | BigNumber': function (n: number | bigint): string {
      return format(n, { notation: 'bin' })
    },
    'number | BigNumber, number | BigNumber': function (n: number | bigint, wordSize: number | bigint): string {
      return format(n, { notation: 'bin', wordSize })
    }
  })
})
