import { isBigNumber, isNumber, isObject } from './is.ts'

/**
 * Split value representation with sign, coefficients, and exponent
 */
export interface SplitValue {
  sign: '+' | '-' | ''
  coefficients: number[]
  exponent: number
}

/**
 * Configuration for number type handling
 */
export interface NumberTypeConfig {
  number: 'number' | 'BigNumber' | 'bigint' | 'Fraction'
  numberFallback: 'number' | 'BigNumber'
}

/**
 * Format options for number formatting
 */
export interface FormatOptions {
  notation?: 'auto' | 'exponential' | 'fixed' | 'engineering' | 'bin' | 'oct' | 'hex'
  precision?: number
  wordSize?: number
  lowerExp?: number
  upperExp?: number
}

/**
 * Normalized format options
 */
export interface NormalizedFormatOptions {
  notation: 'auto' | 'exponential' | 'fixed' | 'engineering' | 'bin' | 'oct' | 'hex'
  precision: number | undefined
  wordSize: number | undefined
}

/**
 * Check if a number is integer
 * @param value The value to check
 * @return true if value is an integer
 */
export function isInteger(value: number | boolean): boolean {
  if (typeof value === 'boolean') {
    return true
  }

  return isFinite(value) ? value === Math.round(value) : false
}

/**
 * Ensure the number type is compatible with the provided value.
 * If not, return 'number' instead.
 *
 * For example:
 *
 *     safeNumberType('2.3', { number: 'bigint', numberFallback: 'number' })
 *
 * will return 'number' and not 'bigint' because trying to create a bigint with
 * value 2.3 would throw an exception.
 *
 * @param numberStr The number as a string
 * @param config    Configuration with number type preferences
 * @returns The safe number type to use
 */
export function safeNumberType(
  numberStr: string,
  config: NumberTypeConfig
): 'number' | 'BigNumber' | 'bigint' | 'Fraction' {
  if (config.number === 'bigint') {
    try {
      BigInt(numberStr)
    } catch {
      return config.numberFallback
    }
  }

  return config.number
}

/**
 * Calculate the sign of a number
 * @param x The number
 * @returns 1 for positive, -1 for negative, 0 for zero
 */
export const sign =
  Math.sign ||
  function (x: number): number {
    if (x > 0) {
      return 1
    } else if (x < 0) {
      return -1
    } else {
      return 0
    }
  }

/**
 * Calculate the base-2 logarithm of a number
 * @param x The number
 * @returns The base-2 logarithm
 */
export const log2 =
  Math.log2 ||
  function log2(x: number): number {
    return Math.log(x) / Math.LN2
  }

/**
 * Calculate the base-10 logarithm of a number
 * @param x The number
 * @returns The base-10 logarithm
 */
export const log10 =
  Math.log10 ||
  function log10(x: number): number {
    return Math.log(x) / Math.LN10
  }

/**
 * Calculate the natural logarithm of a number + 1
 * @param x The number
 * @returns ln(x + 1)
 */
export const log1p =
  Math.log1p ||
  function (x: number): number {
    return Math.log(x + 1)
  }

/**
 * Calculate cubic root for a number
 *
 * Code from es6-shim.js:
 *   https://github.com/paulmillr/es6-shim/blob/master/es6-shim.js#L1564-L1577
 *
 * @param x The number
 * @returns The cubic root of x
 */
export const cbrt =
  Math.cbrt ||
  function cbrt(x: number): number {
    if (x === 0) {
      return x
    }

    const negate = x < 0
    let result: number
    if (negate) {
      x = -x
    }

    if (isFinite(x)) {
      result = Math.exp(Math.log(x) / 3)
      // from https://en.wikipedia.org/wiki/Cube_root#Numerical_methods
      result = (x / (result * result) + 2 * result) / 3
    } else {
      result = x
    }

    return negate ? -result : result
  }

/**
 * Calculates exponentiation minus 1
 * @param x The exponent
 * @return exp(x) - 1
 */
export const expm1 =
  Math.expm1 ||
  function expm1(x: number): number {
    return x >= 2e-4 || x <= -2e-4
      ? Math.exp(x) - 1
      : x + (x * x) / 2 + (x * x * x) / 6
  }

/**
 * Formats a number in a given base
 * @param n    The number to format
 * @param base The base (2, 8, or 16)
 * @param size Optional word size for signed integer formatting
 * @returns The formatted string
 */
function formatNumberToBase(n: number, base: 2 | 8 | 16, size?: number): string {
  const prefixes: Record<number, string> = { 2: '0b', 8: '0o', 16: '0x' }
  const prefix = prefixes[base]
  let suffix = ''
  if (size) {
    if (size < 1) {
      throw new Error('size must be in greater than 0')
    }
    if (!isInteger(size)) {
      throw new Error('size must be an integer')
    }
    if (n > 2 ** (size - 1) - 1 || n < -(2 ** (size - 1))) {
      throw new Error(`Value must be in range [-2^${size - 1}, 2^${size - 1}-1]`)
    }
    if (!isInteger(n)) {
      throw new Error('Value must be an integer')
    }
    if (n < 0) {
      n = n + 2 ** size
    }
    suffix = `i${size}`
  }
  let sign = ''
  if (n < 0) {
    n = -n
    sign = '-'
  }
  return `${sign}${prefix}${n.toString(base)}${suffix}`
}

/**
 * Convert a number to a formatted string representation.
 *
 * Syntax:
 *
 *    format(value)
 *    format(value, options)
 *    format(value, precision)
 *    format(value, fn)
 *
 * Where:
 *
 *    {number} value   The value to be formatted
 *    {Object} options An object with formatting options. Available options:
 *                     {string} notation
 *                         Number notation. Choose from:
 *                         'fixed'          Always use regular number notation.
 *                                          For example '123.40' and '14000000'
 *                         'exponential'    Always use exponential notation.
 *                                          For example '1.234e+2' and '1.4e+7'
 *                         'engineering'    Always use engineering notation.
 *                                          For example '123.4e+0' and '14.0e+6'
 *                         'auto' (default) Regular number notation for numbers
 *                                          having an absolute value between
 *                                          `lowerExp` and `upperExp` bounds, and
 *                                          uses exponential notation elsewhere.
 *                                          Lower bound is included, upper bound
 *                                          is excluded.
 *                                          For example '123.4' and '1.4e7'.
 *                         'bin', 'oct, or
 *                         'hex'            Format the number using binary, octal,
 *                                          or hexadecimal notation.
 *                                          For example '0b1101' and '0x10fe'.
 *                     {number} wordSize    The word size in bits to use for formatting
 *                                          in binary, octal, or hexadecimal notation.
 *                                          To be used only with 'bin', 'oct', or 'hex'
 *                                          values for 'notation' option. When this option
 *                                          is defined the value is formatted as a signed
 *                                          twos complement integer of the given word size
 *                                          and the size suffix is appended to the output.
 *                                          For example
 *                                          format(-1, {notation: 'hex', wordSize: 8}) === '0xffi8'.
 *                                          Default value is undefined.
 *                     {number} precision   A number between 0 and 16 to round
 *                                          the digits of the number.
 *                                          In case of notations 'exponential',
 *                                          'engineering', and 'auto',
 *                                          `precision` defines the total
 *                                          number of significant digits returned.
 *                                          In case of notation 'fixed',
 *                                          `precision` defines the number of
 *                                          significant digits after the decimal
 *                                          point.
 *                                          `precision` is undefined by default,
 *                                          not rounding any digits.
 *                     {number} lowerExp    Exponent determining the lower boundary
 *                                          for formatting a value with an exponent
 *                                          when `notation='auto`.
 *                                          Default value is `-3`.
 *                     {number} upperExp    Exponent determining the upper boundary
 *                                          for formatting a value with an exponent
 *                                          when `notation='auto`.
 *                                          Default value is `5`.
 *    {Function} fn    A custom formatting function. Can be used to override the
 *                     built-in notations. Function `fn` is called with `value` as
 *                     parameter and must return a string. Is useful for example to
 *                     format all values inside a matrix in a particular way.
 *
 * Examples:
 *
 *    format(6.4)                                        // '6.4'
 *    format(1240000)                                    // '1.24e6'
 *    format(1/3)                                        // '0.3333333333333333'
 *    format(1/3, 3)                                     // '0.333'
 *    format(21385, 2)                                   // '21000'
 *    format(12.071, {notation: 'fixed'})                // '12'
 *    format(2.3,    {notation: 'fixed', precision: 2})  // '2.30'
 *    format(52.8,   {notation: 'exponential'})          // '5.28e+1'
 *    format(12345678, {notation: 'engineering'})        // '12.345678e+6'
 *
 * @param value   The number to format
 * @param options Optional formatting options or custom formatter function or precision
 * @return The formatted value
 */
export function format(
  value: number,
  options?: FormatOptions | ((value: number) => string) | number
): string {
  if (typeof options === 'function') {
    // handle format(value, fn)
    return options(value)
  }

  // handle special cases
  if (value === Infinity) {
    return 'Infinity'
  } else if (value === -Infinity) {
    return '-Infinity'
  } else if (isNaN(value)) {
    return 'NaN'
  }

  const { notation, precision, wordSize } = normalizeFormatOptions(options)

  // handle the various notations
  switch (notation) {
    case 'fixed':
      return toFixed(value, precision)

    case 'exponential':
      return toExponential(value, precision)

    case 'engineering':
      return toEngineering(value, precision)

    case 'bin':
      return formatNumberToBase(value, 2, wordSize)

    case 'oct':
      return formatNumberToBase(value, 8, wordSize)

    case 'hex':
      return formatNumberToBase(value, 16, wordSize)

    case 'auto':
      // remove trailing zeros after the decimal point
      return toPrecision(value, precision, options as FormatOptions).replace(
        /((\.\d*?)(0+))($|e)/,
        function () {
          const digits = arguments[2]
          const e = arguments[4]
          return digits !== '.' ? digits + e : e
        }
      )

    default:
      throw new Error(
        'Unknown notation "' +
          notation +
          '". ' +
          'Choose "auto", "exponential", "fixed", "bin", "oct", or "hex.'
      )
  }
}

/**
 * Normalize format options into an object:
 *   {
 *     notation: string,
 *     precision: number | undefined,
 *     wordSize: number | undefined
 *   }
 * @param options The input options
 * @returns Normalized format options
 */
export function normalizeFormatOptions(
  options?: FormatOptions | number
): NormalizedFormatOptions {
  // default values for options
  let notation: NormalizedFormatOptions['notation'] = 'auto'
  let precision: number | undefined
  let wordSize: number | undefined

  if (options !== undefined) {
    if (isNumber(options)) {
      precision = options
    } else if (isBigNumber(options)) {
      precision = (options as any).toNumber()
    } else if (isObject(options)) {
      if (options.precision !== undefined) {
        precision = _toNumberOrThrow(options.precision, () => {
          throw new Error('Option "precision" must be a number or BigNumber')
        })
      }

      if (options.wordSize !== undefined) {
        wordSize = _toNumberOrThrow(options.wordSize, () => {
          throw new Error('Option "wordSize" must be a number or BigNumber')
        })
      }

      if (options.notation) {
        notation = options.notation
      }
    } else {
      throw new Error('Unsupported type of options, number, BigNumber, or object expected')
    }
  }

  return { notation, precision, wordSize }
}

/**
 * Split a number into sign, coefficients, and exponent
 * @param value The number or string to split
 * @return Object containing sign, coefficients, and exponent
 */
export function splitNumber(value: number | string): SplitValue {
  // parse the input value
  const match = String(value)
    .toLowerCase()
    .match(/^(-?)(\d+\.?\d*)(e([+-]?\d+))?$/)
  if (!match) {
    throw new SyntaxError('Invalid number ' + value)
  }

  const sign = match[1] as '' | '-'
  const digits = match[2]
  let exponent = parseFloat(match[4] || '0')

  const dot = digits.indexOf('.')
  exponent += dot !== -1 ? dot - 1 : digits.length - 1

  const coefficients = digits
    .replace('.', '') // remove the dot (must be removed before removing leading zeros)
    .replace(/^0*/, function (zeros) {
      // remove leading zeros, add their count to the exponent
      exponent -= zeros.length
      return ''
    })
    .replace(/0*$/, '') // remove trailing zeros
    .split('')
    .map(function (d) {
      return parseInt(d)
    })

  if (coefficients.length === 0) {
    coefficients.push(0)
    exponent++
  }

  return { sign: sign as SplitValue['sign'], coefficients, exponent }
}

/**
 * Format a number in engineering notation. Like '1.23e+6', '2.3e+0', '3.500e-3'
 * @param value     The number or string to format
 * @param precision Optional number of significant figures to return
 * @returns The formatted string
 */
export function toEngineering(value: number | string, precision?: number): string {
  if (isNaN(value as number) || !isFinite(value as number)) {
    return String(value)
  }

  const split = splitNumber(value)
  const rounded = roundDigits(split, precision)

  const e = rounded.exponent
  const c = rounded.coefficients

  // find nearest lower multiple of 3 for exponent
  const newExp = e % 3 === 0 ? e : e < 0 ? e - 3 - (e % 3) : e - (e % 3)

  if (isNumber(precision)) {
    // add zeroes to give correct sig figs
    while (precision > c.length || e - newExp + 1 > c.length) {
      c.push(0)
    }
  } else {
    // concatenate coefficients with necessary zeros
    // add zeros if necessary (for example: 1e+8 -> 100e+6)
    const missingZeros = Math.abs(e - newExp) - (c.length - 1)
    for (let i = 0; i < missingZeros; i++) {
      c.push(0)
    }
  }

  // find difference in exponents
  let expDiff = Math.abs(e - newExp)
  let decimalIdx = 1

  // push decimal index over by expDiff times
  while (expDiff > 0) {
    decimalIdx++
    expDiff--
  }

  // if all coefficient values are zero after the decimal point and precision is unset, don't add a decimal value.
  // otherwise concat with the rest of the coefficients
  const decimals = c.slice(decimalIdx).join('')
  const decimalVal =
    (isNumber(precision) && decimals.length) || decimals.match(/[1-9]/)
      ? '.' + decimals
      : ''

  const str =
    c.slice(0, decimalIdx).join('') +
    decimalVal +
    'e' +
    (e >= 0 ? '+' : '') +
    newExp.toString()
  return rounded.sign + str
}

/**
 * Format a number with fixed notation.
 * @param value     The number or string to format
 * @param precision Optional number of decimals after the decimal point
 * @returns The formatted string
 */
export function toFixed(value: number | string, precision?: number): string {
  if (isNaN(value as number) || !isFinite(value as number)) {
    return String(value)
  }

  const splitValue = splitNumber(value)
  const rounded =
    typeof precision === 'number'
      ? roundDigits(splitValue, splitValue.exponent + 1 + precision)
      : splitValue
  let c: Array<number | string> = rounded.coefficients
  let p = rounded.exponent + 1 // exponent may have changed

  // append zeros if needed
  const pp = p + (precision || 0)
  if (c.length < pp) {
    c = c.concat(zeros(pp - c.length))
  }

  // prepend zeros if needed
  if (p < 0) {
    c = zeros(-p + 1).concat(c as any)
    p = 1
  }

  // insert a dot if needed
  if (p < c.length) {
    c.splice(p, 0, p === 0 ? '0.' : '.')
  }

  return rounded.sign + c.join('')
}

/**
 * Format a number in exponential notation. Like '1.23e+5', '2.3e+0', '3.500e-3'
 * @param value     The number or string to format
 * @param precision Number of digits in formatted output
 * @returns The formatted string
 */
export function toExponential(value: number | string, precision?: number): string {
  if (isNaN(value as number) || !isFinite(value as number)) {
    return String(value)
  }

  // round if needed, else create a clone
  const split = splitNumber(value)
  const rounded = precision ? roundDigits(split, precision) : split
  let c = rounded.coefficients
  const e = rounded.exponent

  // append zeros if needed
  if (precision && c.length < precision) {
    c = c.concat(zeros(precision - c.length))
  }

  // format as `C.CCCe+EEE` or `C.CCCe-EEE`
  const first = c.shift()!
  return (
    rounded.sign +
    first +
    (c.length > 0 ? '.' + c.join('') : '') +
    'e' +
    (e >= 0 ? '+' : '') +
    e
  )
}

/**
 * Format a number with a certain precision
 * @param value     The number or string to format
 * @param precision Optional number of digits
 * @param options   Optional formatting options (lowerExp, upperExp)
 * @return The formatted string
 */
export function toPrecision(
  value: number | string,
  precision?: number,
  options?: FormatOptions
): string {
  if (isNaN(value as number) || !isFinite(value as number)) {
    return String(value)
  }

  // determine lower and upper bound for exponential notation.
  const lowerExp = _toNumberOrDefault(options?.lowerExp, -3)
  const upperExp = _toNumberOrDefault(options?.upperExp, 5)

  const split = splitNumber(value)
  const rounded = precision ? roundDigits(split, precision) : split
  if (rounded.exponent < lowerExp || rounded.exponent >= upperExp) {
    // exponential notation
    return toExponential(value, precision)
  } else {
    let c: Array<number | string> = rounded.coefficients
    const e = rounded.exponent

    // append trailing zeros
    if (precision && c.length < precision) {
      c = c.concat(zeros(precision - c.length))
    }

    // append trailing zeros
    // TODO: simplify the next statement
    c = c.concat(
      zeros(e - c.length + 1 + (precision && c.length < precision ? precision - c.length : 0))
    )

    // prepend zeros
    c = zeros(-e).concat(c as any)

    const dot = e > 0 ? e : 0
    if (dot < c.length - 1) {
      c.splice(dot + 1, 0, '.')
    }

    return rounded.sign + c.join('')
  }
}

/**
 * Round the number of digits of a number
 * @param split     A value split with .splitNumber(value)
 * @param precision A positive integer
 * @return Object containing sign, coefficients, and exponent with rounded digits
 */
export function roundDigits(split: SplitValue, precision?: number): SplitValue {
  // create a clone
  const rounded: SplitValue = {
    sign: split.sign,
    coefficients: split.coefficients.slice(),
    exponent: split.exponent
  }
  const c = rounded.coefficients

  if (precision !== undefined) {
    // prepend zeros if needed
    while (precision <= 0) {
      c.unshift(0)
      rounded.exponent++
      precision++
    }

    if (c.length > precision) {
      const removed = c.splice(precision, c.length - precision)

      if (removed[0] >= 5) {
        let i = precision - 1
        c[i]++
        while (c[i] === 10) {
          c.pop()
          if (i === 0) {
            c.unshift(0)
            rounded.exponent++
            i++
          }
          i--
          c[i]++
        }
      }
    }
  }

  return rounded
}

/**
 * Create an array filled with zeros.
 * @param length The length of the array
 * @return Array of zeros
 */
function zeros(length: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < length; i++) {
    arr.push(0)
  }
  return arr
}

/**
 * Count the number of significant digits of a number.
 *
 * For example:
 *   2.34 returns 3
 *   0.0034 returns 2
 *   120.5e+30 returns 4
 *
 * @param value The number
 * @return Number of significant digits
 */
export function digits(value: number): number {
  return value
    .toExponential()
    .replace(/e.*$/, '') // remove exponential notation
    .replace(/^0\.?0*|\./, '') // remove decimal point and leading zeros
    .length
}

/**
 * Compares two floating point numbers.
 * @param a      First value to compare
 * @param b      Second value to compare
 * @param relTol The relative tolerance, indicating the maximum allowed difference relative to the larger absolute value. Must be greater than 0.
 * @param absTol The minimum absolute tolerance, useful for comparisons near zero. Must be at least 0.
 * @return whether the two numbers are nearly equal
 *
 * @throws Error If `relTol` is less than or equal to 0.
 * @throws Error If `absTol` is less than 0.
 *
 * @example
 * nearlyEqual(1.000000001, 1.0, 1e-8);            // true
 * nearlyEqual(1.000000002, 1.0, 0);               // false
 * nearlyEqual(1.0, 1.009, undefined, 0.01);       // true
 * nearlyEqual(0.000000001, 0.0, undefined, 1e-8); // true
 */
export function nearlyEqual(
  a: number,
  b: number,
  relTol: number = 1e-8,
  absTol: number = 0
): boolean {
  if (relTol <= 0) {
    throw new Error('Relative tolerance must be greater than 0')
  }

  if (absTol < 0) {
    throw new Error('Absolute tolerance must be at least 0')
  }

  // NaN
  if (isNaN(a) || isNaN(b)) {
    return false
  }

  if (!isFinite(a) || !isFinite(b)) {
    return a === b
  }

  if (a === b) {
    return true
  }

  // abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)
  return Math.abs(a - b) <= Math.max(relTol * Math.max(Math.abs(a), Math.abs(b)), absTol)
}

/**
 * Calculate the hyperbolic arccos of a number
 * @param x The number
 * @return The hyperbolic arccosine
 */
export const acosh =
  Math.acosh ||
  function (x: number): number {
    return Math.log(Math.sqrt(x * x - 1) + x)
  }

/**
 * Calculate the hyperbolic arcsine of a number
 * @param x The number
 * @return The hyperbolic arcsine
 */
export const asinh =
  Math.asinh ||
  function (x: number): number {
    return Math.log(Math.sqrt(x * x + 1) + x)
  }

/**
 * Calculate the hyperbolic arctangent of a number
 * @param x The number
 * @return The hyperbolic arctangent
 */
export const atanh =
  Math.atanh ||
  function (x: number): number {
    return Math.log((1 + x) / (1 - x)) / 2
  }

/**
 * Calculate the hyperbolic cosine of a number
 * @param x The number
 * @returns The hyperbolic cosine
 */
export const cosh =
  Math.cosh ||
  function (x: number): number {
    return (Math.exp(x) + Math.exp(-x)) / 2
  }

/**
 * Calculate the hyperbolic sine of a number
 * @param x The number
 * @returns The hyperbolic sine
 */
export const sinh =
  Math.sinh ||
  function (x: number): number {
    return (Math.exp(x) - Math.exp(-x)) / 2
  }

/**
 * Calculate the hyperbolic tangent of a number
 * @param x The number
 * @returns The hyperbolic tangent
 */
export const tanh =
  Math.tanh ||
  function (x: number): number {
    const e = Math.exp(2 * x)
    return (e - 1) / (e + 1)
  }

/**
 * Returns a value with the magnitude of x and the sign of y.
 * @param x The value providing the magnitude
 * @param y The value providing the sign
 * @returns Value with magnitude of x and sign of y
 */
export function copysign(x: number, y: number): number {
  const signx = x > 0 ? true : x < 0 ? false : 1 / x === Infinity
  const signy = y > 0 ? true : y < 0 ? false : 1 / y === Infinity
  return signx !== signy ? -x : x
}

/**
 * Convert value to number or throw error
 * @param value   The value to convert
 * @param onError Callback to execute on error
 * @returns The numeric value
 */
function _toNumberOrThrow(value: any, onError: () => void): number {
  if (isNumber(value)) {
    return value
  } else if (isBigNumber(value)) {
    return (value as any).toNumber()
  } else {
    onError()
    return 0 // unreachable but TypeScript needs a return
  }
}

/**
 * Convert value to number or return default
 * @param value        The value to convert
 * @param defaultValue The default value to return if conversion fails
 * @returns The numeric value or default
 */
function _toNumberOrDefault(value: any, defaultValue: number): number {
  if (isNumber(value)) {
    return value
  } else if (isBigNumber(value)) {
    return (value as any).toNumber()
  } else {
    return defaultValue
  }
}
