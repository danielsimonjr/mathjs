import { typeOf } from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import { noBignumber, noFraction } from '../../utils/noop.ts'

// Type definitions for numeric
type NumericValue = string | number | bigint | unknown
type NumericOutput = number | bigint | unknown

interface NumericDependencies {
  number: (x: NumericValue) => number
  bignumber?: (x: NumericValue) => unknown
  fraction?: (x: NumericValue) => unknown
}

const name = 'numeric'
const dependencies = ['number', '?bignumber', '?fraction']

export const createNumeric = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ number, bignumber, fraction }: NumericDependencies) => {
    const validInputTypes: Record<string, boolean> = {
      string: true,
      number: true,
      BigNumber: true,
      Fraction: true
    }

    // Load the conversion functions for each output type
    const validOutputTypes: Record<string, (x: NumericValue) => NumericOutput> =
      {
        number: (x: NumericValue) => number(x),
        BigNumber: bignumber ? (x: NumericValue) => bignumber(x) : noBignumber,
        bigint: (x: NumericValue) => BigInt(x as string | number | bigint),
        Fraction: fraction ? (x: NumericValue) => fraction(x) : noFraction
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
    return function numeric(
      value: NumericValue,
      outputType: string = 'number',
      check?: unknown
    ): NumericOutput {
      if (check !== undefined) {
        throw new SyntaxError('numeric() takes one or two arguments')
      }
      const inputType = typeOf(value)

      if (!(inputType in validInputTypes)) {
        throw new TypeError(
          'Cannot convert ' +
            value +
            ' of type "' +
            inputType +
            '"; valid input types are ' +
            Object.keys(validInputTypes).join(', ')
        )
      }
      if (!(outputType in validOutputTypes)) {
        throw new TypeError(
          'Cannot convert ' +
            value +
            ' to type "' +
            outputType +
            '"; valid output types are ' +
            Object.keys(validOutputTypes).join(', ')
        )
      }

      if (outputType === inputType) {
        return value
      } else {
        return validOutputTypes[outputType](value)
      }
    }
  }
)
