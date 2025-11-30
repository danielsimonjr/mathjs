import { factory } from '../utils/factory.js'
import { deepMap } from '../utils/collection.js'

const name = 'number'
const dependencies = ['typed']

interface NonDecimalNumberParts {
  input: string
  radix: number
  integerPart: string
  fractionalPart: string
}

/**
 * Separates the radix, integer part, and fractional part of a non decimal number string
 * @param {string} input string to parse
 * @returns {object} the parts of the string or null if not a valid input
 */
function getNonDecimalNumberParts (input: string): NonDecimalNumberParts | null {
  const nonDecimalWithRadixMatch = input.match(/(0[box])([0-9a-fA-F]*)\.([0-9a-fA-F]*)/)
  if (nonDecimalWithRadixMatch) {
    const radix = ({ '0b': 2, '0o': 8, '0x': 16 } as Record<string, number>)[nonDecimalWithRadixMatch[1]]
    const integerPart = nonDecimalWithRadixMatch[2]
    const fractionalPart = nonDecimalWithRadixMatch[3]
    return { input, radix, integerPart, fractionalPart }
  } else {
    return null
  }
}

/**
 * Makes a number from a radix, and integer part, and a fractional part
 * @param {parts} [x] parts of the number string (from getNonDecimalNumberParts)
 * @returns {number} the number
 */
function makeNumberFromNonDecimalParts (parts: NonDecimalNumberParts): number {
  const n = parseInt(parts.integerPart, parts.radix)
  let f = 0
  for (let i = 0; i < parts.fractionalPart.length; i++) {
    const digitValue = parseInt(parts.fractionalPart[i], parts.radix)
    f += digitValue / Math.pow(parts.radix, i + 1)
  }
  const result = n + f
  if (isNaN(result)) {
    throw new SyntaxError('String "' + parts.input + '" is not a valid number')
  }
  return result
}

export const createNumber = /* #__PURE__ */ factory(name, dependencies, ({ typed }: { typed: any }) => {
  /**
   * Create a number or convert a string, boolean, or unit to a number.
   * When value is a matrix, all elements will be converted to number.
   *
   * Syntax:
   *
   *    math.number(value)
   *    math.number(unit, valuelessUnit)
   *
   * Examples:
   *
   *    math.number(2)                         // returns number 2
   *    math.number('7.2')                     // returns number 7.2
   *    math.number(true)                      // returns number 1
   *    math.number([true, false, true, true]) // returns [1, 0, 1, 1]
   *    math.number(math.unit('52cm'), 'm')    // returns 0.52
   *
   * See also:
   *
   *    bignumber, bigint, boolean, numeric, complex, index, matrix, string, unit
   *
   * @param {string | number | BigNumber | Fraction | boolean | Array | Matrix | Unit | null} [value]  Value to be converted
   * @param {Unit | string} [valuelessUnit] A valueless unit, used to convert a unit to a number
   * @return {number | Array | Matrix} The created number
   */
  const number = typed('number', {
    '': function (): number {
      return 0
    },

    number: function (x: number): number {
      return x
    },

    string: function (x: string): number {
      if (x === 'NaN') return NaN
      const nonDecimalNumberParts = getNonDecimalNumberParts(x)
      if (nonDecimalNumberParts) {
        return makeNumberFromNonDecimalParts(nonDecimalNumberParts)
      }
      let size = 0
      const wordSizeSuffixMatch = x.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/)
      if (wordSizeSuffixMatch) {
        // x includes a size suffix like 0xffffi32, so we extract
        // the suffix and remove it from x
        size = Number(wordSizeSuffixMatch[2])
        x = wordSizeSuffixMatch[1]
      }
      let num = Number(x)
      if (isNaN(num)) {
        throw new SyntaxError('String "' + x + '" is not a valid number')
      }
      if (wordSizeSuffixMatch) {
        // x is a signed bin, oct, or hex literal
        // num is the value of string x if x is interpreted as unsigned
        if (num > 2 ** size - 1) {
          // literal is too large for size suffix
          throw new SyntaxError(`String "${x}" is out of range`)
        }
        // check if the bit at index size - 1 is set and if so do the twos complement
        if (num >= 2 ** (size - 1)) {
          num = num - 2 ** size
        }
      }
      return num
    },

    BigNumber: function (x: any): number {
      return (x as any).toNumber()
    },

    bigint: function (x: bigint): number {
      return Number(x)
    },

    Fraction: function (x: { valueOf: () => number }): number {
      return x.valueOf()
    },

    Unit: typed.referToSelf((self: (x: any) => number) => (x: any) => {
      const clone = x.clone()
      clone.value = self(x.value)
      return clone
    }),

    null: function (x: null): number {
      return 0
    },

    'Unit, string | Unit': function (unit: any, valuelessUnit: string | any): number {
      return unit.toNumber(valuelessUnit)
    },

    'Array | Matrix': typed.referToSelf((self: (x: any) => any) => (x: any) => deepMap(x, self))
  })

  // reviver function to parse a JSON object like:
  //
  //     {"mathjs":"number","value":"2.3"}
  //
  // into a number 2.3
  number.fromJSON = function (json: { value: string }): number {
    return parseFloat(json.value)
  }

  return number
})
