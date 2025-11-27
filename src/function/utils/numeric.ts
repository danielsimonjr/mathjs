import { typeOf } from '../../utils/is.js'
import { factory } from '../../utils/factory.js'
import { noBignumber, noFraction } from '../../utils/noop.js'

const name = 'numeric'
const dependencies = ['number', '?bignumber', '?fraction']

export const createNumeric = /* #__PURE__ */ factory(name, dependencies, ({ number, bignumber, fraction }) => {
  const validInputTypes: Record<string, boolean> = {
    string: true,
    number: true,
    BigNumber: true,
    Fraction: true
  }

  // Load the conversion functions for each output type
  const validOutputTypes: Record<string, (x: any) => any> = {
    number: (x: any) => number(x),
    BigNumber: bignumber
      ? (x: any) => bignumber(x)
      : noBignumber,
    bigint: (x: any) => BigInt(x),
    Fraction: fraction
      ? (x: any) => fraction(x)
      : noFraction
  }

  /**
   * Convert a numeric input to a specific numeric type: number, BigNumber, bigint, or Fraction.
   *
   * Syntax:
   *
   *    math.numeric(x)
   *    math.numeric(value, outputType)
   *
   * Examples:
   *
   *    math.numeric('4')                           // returns 4
   *    math.numeric('4', 'number')                 // returns 4
   *    math.numeric('4', 'bigint')                 // returns 4n
   *    math.numeric('4', 'BigNumber')              // returns BigNumber 4
   *    math.numeric('4', 'Fraction')               // returns Fraction 4
   *    math.numeric(4, 'Fraction')                 // returns Fraction 4
   *    math.numeric(math.fraction(2, 5), 'number') // returns 0.4
   *
   * See also:
   *
   *    number, fraction, bignumber, bigint, string, format
   *
   * @param {string | number | BigNumber | bigint | Fraction } value
   *              A numeric value or a string containing a numeric value
   * @param {string} outputType
   *              Desired numeric output type.
   *              Available values: 'number', 'BigNumber', or 'Fraction'
   * @return {number | BigNumber | bigint | Fraction}
   *              Returns an instance of the numeric in the requested type
   */
  return function numeric (value: any, outputType: string = 'number', check?: any): any {
    if (check !== undefined) {
      throw new SyntaxError('numeric() takes one or two arguments')
    }
    const inputType = typeOf(value)

    if (!(inputType in validInputTypes)) {
      throw new TypeError('Cannot convert ' + value + ' of type "' + inputType + '"; valid input types are ' + Object.keys(validInputTypes).join(', '))
    }
    if (!(outputType in validOutputTypes)) {
      throw new TypeError('Cannot convert ' + value + ' to type "' + outputType + '"; valid output types are ' + Object.keys(validOutputTypes).join(', '))
    }

    if (outputType === inputType) {
      return value
    } else {
      return validOutputTypes[outputType](value)
    }
  }
})
