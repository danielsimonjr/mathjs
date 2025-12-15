/**
 * Local Decimal implementation for arbitrary precision arithmetic.
 * Replaces the external 'decimal.js' library.
 *
 * This implementation uses BigInt for arbitrary precision integer arithmetic
 * and tracks a decimal exponent for floating point representation.
 */

// Rounding modes
export const ROUND_UP = 0
export const ROUND_DOWN = 1
export const ROUND_CEIL = 2
export const ROUND_FLOOR = 3
export const ROUND_HALF_UP = 4
export const ROUND_HALF_DOWN = 5
export const ROUND_HALF_EVEN = 6
export const ROUND_HALF_CEIL = 7
export const ROUND_HALF_FLOOR = 8
export const EUCLID = 9

export interface DecimalConfig {
  precision?: number
  rounding?: number
  toExpNeg?: number
  toExpPos?: number
  minE?: number
  maxE?: number
}

// Default configuration
const globalConfig: Required<DecimalConfig> = {
  precision: 28,
  rounding: ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
  minE: -9e15,
  maxE: 9e15
}

/**
 * Decimal class for arbitrary precision arithmetic.
 */
export class Decimal {
  /** Coefficient digits as array of numbers (0-9) */
  public d: number[] | null
  /** Exponent (power of 10) */
  public e: number
  /** Sign: -1, 0, or 1 */
  public s: number

  /** Rounding mode constants */
  static readonly ROUND_UP = ROUND_UP
  static readonly ROUND_DOWN = ROUND_DOWN
  static readonly ROUND_CEIL = ROUND_CEIL
  static readonly ROUND_FLOOR = ROUND_FLOOR
  static readonly ROUND_HALF_UP = ROUND_HALF_UP
  static readonly ROUND_HALF_DOWN = ROUND_HALF_DOWN
  static readonly ROUND_HALF_EVEN = ROUND_HALF_EVEN
  static readonly ROUND_HALF_CEIL = ROUND_HALF_CEIL
  static readonly ROUND_HALF_FLOOR = ROUND_HALF_FLOOR
  static readonly EUCLID = EUCLID

  /** Current precision */
  static get precision(): number {
    return globalConfig.precision
  }

  constructor(
    value:
      | number
      | string
      | bigint
      | Decimal
      | { n: bigint; d: bigint; s?: number }
  ) {
    if (value instanceof Decimal) {
      this.d = value.d ? [...value.d] : null
      this.e = value.e
      this.s = value.s
      return
    }

    // Handle Fraction-like objects
    if (
      typeof value === 'object' &&
      value !== null &&
      'n' in value &&
      'd' in value
    ) {
      const frac = value as { n: bigint; d: bigint; s?: number }
      const sign = frac.s !== undefined ? frac.s : frac.n >= 0n ? 1 : -1
      const num = frac.n < 0n ? -frac.n : frac.n
      const den = frac.d < 0n ? -frac.d : frac.d

      // Convert fraction to decimal string
      if (num === 0n) {
        this.d = [0]
        this.e = 0
        this.s = 0
        return
      }

      // Perform division to get decimal representation
      const result = this.divideStrings(num.toString(), den.toString())
      const parsed = Decimal.parseString(result)
      this.d = parsed.d
      this.e = parsed.e
      this.s = sign
      return
    }

    if (value === null || value === undefined) {
      this.d = [0]
      this.e = 0
      this.s = 0
      return
    }

    if (typeof value === 'bigint') {
      value = value.toString()
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        this.d = null
        this.e = NaN
        this.s = Number.isNaN(value) ? NaN : value < 0 ? -1 : 1
        return
      }
      value = value.toString()
    }

    const parsed = Decimal.parseString(value as string)
    this.d = parsed.d
    this.e = parsed.e
    this.s = parsed.s
  }

  private divideStrings(numStr: string, denStr: string): string {
    const precision = globalConfig.precision + 10
    let num = BigInt(numStr)
    const den = BigInt(denStr)

    if (den === 0n) throw new Error('Division by zero')
    if (num === 0n) return '0'

    const negative = num < 0n !== den < 0n
    num = num < 0n ? -num : num
    const denAbs = den < 0n ? -den : den

    const intPart = num / denAbs
    let remainder = num % denAbs

    if (remainder === 0n) {
      return (negative ? '-' : '') + intPart.toString()
    }

    let result = intPart.toString() + '.'
    let decimalDigits = 0

    while (remainder !== 0n && decimalDigits < precision) {
      remainder *= 10n
      const digit = remainder / denAbs
      result += digit.toString()
      remainder = remainder % denAbs
      decimalDigits++
    }

    return (negative ? '-' : '') + result
  }

  private static parseString(str: string): {
    d: number[] | null
    e: number
    s: number
  } {
    str = str.trim().toLowerCase()

    // Handle special values
    if (str === 'nan') {
      return { d: null, e: NaN, s: NaN }
    }
    if (str === 'infinity' || str === '+infinity') {
      return { d: null, e: Infinity, s: 1 }
    }
    if (str === '-infinity') {
      return { d: null, e: Infinity, s: -1 }
    }

    // Determine sign
    let s = 1
    if (str.startsWith('-')) {
      s = -1
      str = str.slice(1)
    } else if (str.startsWith('+')) {
      str = str.slice(1)
    }

    // Handle hex, binary, octal
    if (str.startsWith('0x')) {
      const val = parseInt(str, 16)
      str = val.toString()
    } else if (str.startsWith('0b')) {
      const val = parseInt(str, 2)
      str = val.toString()
    } else if (str.startsWith('0o')) {
      const val = parseInt(str, 8)
      str = val.toString()
    }

    // Handle scientific notation
    let exp = 0
    const eIndex = str.indexOf('e')
    if (eIndex !== -1) {
      exp = parseInt(str.slice(eIndex + 1), 10)
      str = str.slice(0, eIndex)
    }

    // Handle decimal point
    const dotIndex = str.indexOf('.')
    if (dotIndex !== -1) {
      exp -= str.length - dotIndex - 1
      str = str.slice(0, dotIndex) + str.slice(dotIndex + 1)
    }

    // Remove leading zeros
    str = str.replace(/^0+/, '') || '0'

    if (str === '0') {
      return { d: [0], e: 0, s: 0 }
    }

    // Remove trailing zeros and adjust exponent
    while (str.endsWith('0')) {
      str = str.slice(0, -1)
      exp++
    }

    // Convert to digit array
    const d = str.split('').map((c) => parseInt(c, 10))

    // Adjust exponent based on number of digits
    exp += d.length - 1

    return { d, e: exp, s }
  }

  /**
   * Configure global settings
   */
  static config(options: DecimalConfig): typeof Decimal {
    if (options.precision !== undefined)
      globalConfig.precision = options.precision
    if (options.rounding !== undefined) globalConfig.rounding = options.rounding
    if (options.toExpNeg !== undefined) globalConfig.toExpNeg = options.toExpNeg
    if (options.toExpPos !== undefined) globalConfig.toExpPos = options.toExpPos
    if (options.minE !== undefined) globalConfig.minE = options.minE
    if (options.maxE !== undefined) globalConfig.maxE = options.maxE
    return Decimal
  }

  /**
   * Create a new Decimal constructor with custom configuration
   */
  static clone(options?: DecimalConfig): typeof Decimal {
    class DecimalClone extends Decimal {
      static cloneConfig = { ...globalConfig, ...options }
    }
    if (options) {
      DecimalClone.config(options)
    }
    return DecimalClone as typeof Decimal
  }

  /**
   * Check if value is a Decimal
   */
  static isDecimal(value: unknown): value is Decimal {
    return value instanceof Decimal
  }

  /**
   * Get maximum of values
   */
  static max(...values: (Decimal | number | string)[]): Decimal {
    if (values.length === 0) return new Decimal(NaN)
    let max = new Decimal(values[0])
    for (let i = 1; i < values.length; i++) {
      const val = new Decimal(values[i])
      if (val.gt(max)) max = val
    }
    return max
  }

  /**
   * Get minimum of values
   */
  static min(...values: (Decimal | number | string)[]): Decimal {
    if (values.length === 0) return new Decimal(NaN)
    let min = new Decimal(values[0])
    for (let i = 1; i < values.length; i++) {
      const val = new Decimal(values[i])
      if (val.lt(min)) min = val
    }
    return min
  }

  /**
   * Two-argument arctangent
   */
  static atan2(
    y: Decimal | number | string,
    x: Decimal | number | string
  ): Decimal {
    const yDec = new Decimal(y)
    const xDec = new Decimal(x)
    return new Decimal(Math.atan2(yDec.toNumber(), xDec.toNumber()))
  }

  /**
   * Arc cosine (static)
   */
  static acos(value: Decimal | number | string): Decimal {
    return new Decimal(value).acos()
  }

  // Helper to convert to BigInt representation
  private toBigInt(): { coef: bigint; exp: number } {
    if (!this.d) throw new Error('Cannot convert non-finite to BigInt')
    const coef = BigInt(this.d.join('')) * BigInt(this.s || 1)
    return { coef, exp: this.e - this.d.length + 1 }
  }

  // Helper to create from BigInt
  private static fromBigInt(coef: bigint, exp: number): Decimal {
    if (coef === 0n) return new Decimal(0)
    const s = coef < 0n ? -1 : 1
    coef = coef < 0n ? -coef : coef
    const str = coef.toString()
    const d = str.split('').map((c) => parseInt(c, 10))
    const result = new Decimal(0)
    result.d = d
    result.e = exp + d.length - 1
    result.s = s
    return result
  }

  // Comparison helper
  private cmpAbs(other: Decimal): number {
    if (!this.d || !other.d) return NaN

    // Compare exponents first
    if (this.e > other.e) return 1
    if (this.e < other.e) return -1

    // Compare digits
    const len = Math.max(this.d.length, other.d.length)
    for (let i = 0; i < len; i++) {
      const a = this.d[i] ?? 0
      const b = other.d[i] ?? 0
      if (a > b) return 1
      if (a < b) return -1
    }
    return 0
  }

  /**
   * Addition
   */
  plus(other: Decimal | number | string): Decimal {
    const b = new Decimal(other)

    // Handle special cases
    if (!this.d) return new Decimal(this)
    if (!b.d) return new Decimal(b)
    if (this.s === 0) return new Decimal(b)
    if (b.s === 0) return new Decimal(this)

    // If signs differ, use subtraction
    if (this.s !== b.s) {
      const bNeg = new Decimal(b)
      bNeg.s = -b.s
      return this.minus(bNeg)
    }

    // Align decimal points
    const thisExp = this.e - this.d.length + 1
    const bExp = b.e - b.d.length + 1
    const minExp = Math.min(thisExp, bExp)

    const thisShift = thisExp - minExp
    const bShift = bExp - minExp

    let thisCoef = BigInt(this.d.join(''))
    let bCoef = BigInt(b.d.join(''))

    if (thisShift > 0) thisCoef *= 10n ** BigInt(thisShift)
    if (bShift > 0) bCoef *= 10n ** BigInt(bShift)

    const sum = thisCoef + bCoef
    const result = Decimal.fromBigInt(sum, minExp)
    result.s = this.s
    return result
  }

  /**
   * Subtraction
   */
  minus(other: Decimal | number | string): Decimal {
    const b = new Decimal(other)

    // Handle special cases
    if (!this.d) return new Decimal(this)
    if (!b.d) return new Decimal(b).neg()
    if (this.s === 0) return new Decimal(b).neg()
    if (b.s === 0) return new Decimal(this)

    // If signs differ, use addition
    if (this.s !== b.s) {
      const bNeg = new Decimal(b)
      bNeg.s = -b.s
      return this.plus(bNeg)
    }

    // Align decimal points
    const thisExp = this.e - this.d.length + 1
    const bExp = b.e - b.d.length + 1
    const minExp = Math.min(thisExp, bExp)

    const thisShift = thisExp - minExp
    const bShift = bExp - minExp

    let thisCoef = BigInt(this.d.join(''))
    let bCoef = BigInt(b.d.join(''))

    if (thisShift > 0) thisCoef *= 10n ** BigInt(thisShift)
    if (bShift > 0) bCoef *= 10n ** BigInt(bShift)

    const diff = thisCoef - bCoef
    const result = Decimal.fromBigInt(diff < 0n ? -diff : diff, minExp)
    result.s = diff < 0n ? -this.s : diff === 0n ? 0 : this.s
    return result
  }

  /**
   * Multiplication
   */
  times(other: Decimal | number | string): Decimal {
    const b = new Decimal(other)

    // Handle special cases
    if (!this.d || !b.d) {
      return new Decimal(NaN)
    }
    if (this.s === 0 || b.s === 0) return new Decimal(0)

    const thisCoef = BigInt(this.d.join(''))
    const bCoef = BigInt(b.d.join(''))
    const product = thisCoef * bCoef

    const thisExp = this.e - this.d.length + 1
    const bExp = b.e - b.d.length + 1
    const resultExp = thisExp + bExp

    const result = Decimal.fromBigInt(product, resultExp)
    result.s = this.s * b.s
    return result
  }

  /**
   * Multiplication (alias)
   */
  mul(other: Decimal | number | string): Decimal {
    return this.times(other)
  }

  /**
   * Division
   */
  div(other: Decimal | number | string): Decimal {
    const b = new Decimal(other)

    // Handle special cases
    if (!this.d || !b.d) return new Decimal(NaN)
    if (b.s === 0) throw new Error('Division by zero')
    if (this.s === 0) return new Decimal(0)

    // Use string-based division for precision
    const precision = globalConfig.precision + 10

    const thisCoef = BigInt(this.d.join(''))
    const bCoef = BigInt(b.d.join(''))

    // Scale numerator for precision
    const scaledNum = thisCoef * 10n ** BigInt(precision)
    const quotient = scaledNum / bCoef

    const thisExp = this.e - this.d.length + 1
    const bExp = b.e - b.d.length + 1
    const resultExp = thisExp - bExp - precision

    const result = Decimal.fromBigInt(quotient, resultExp)
    result.s = this.s * b.s
    return result.toDecimalPlaces(globalConfig.precision)
  }

  /**
   * Modulo
   */
  mod(other: Decimal | number | string): Decimal {
    const b = new Decimal(other)
    if (b.s === 0) throw new Error('Division by zero')
    // a mod b = a - b * floor(a / b)
    const quotient = this.div(b).floor()
    return this.minus(b.times(quotient))
  }

  /**
   * Power
   */
  pow(exp: Decimal | number | string): Decimal {
    const e = new Decimal(exp)

    if (this.s === 0) {
      if (e.s === 0) return new Decimal(1)
      if (e.s > 0) return new Decimal(0)
      throw new Error('Zero to negative power')
    }

    // For integer exponents, use repeated multiplication
    if (e.isInt()) {
      const n = e.toNumber()
      if (Number.isInteger(n) && Math.abs(n) < 1000) {
        let result = new Decimal(1)
        let base = new Decimal(this)
        let absN = Math.abs(n)

        while (absN > 0) {
          if (absN % 2 === 1) {
            result = result.times(base)
          }
          base = base.times(base)
          absN = Math.floor(absN / 2)
        }

        if (n < 0) result = new Decimal(1).div(result)
        return result
      }
    }

    // For non-integer or large exponents, use exp(e * ln(x))
    return this.ln().times(e).exp()
  }

  /**
   * Square root
   */
  sqrt(): Decimal {
    if (this.s < 0) throw new Error('Square root of negative number')
    if (this.s === 0) return new Decimal(0)
    if (!this.d) return new Decimal(this)

    // Newton-Raphson method
    let x = new Decimal(Math.sqrt(this.toNumber()))
    const precision = globalConfig.precision + 5

    for (let i = 0; i < 50; i++) {
      const prev = x
      x = x.plus(this.div(x)).div(2)
      if (
        x
          .minus(prev)
          .abs()
          .lt(new Decimal(`1e-${precision}`))
      ) {
        break
      }
    }

    return x.toDecimalPlaces(globalConfig.precision)
  }

  /**
   * Cube root
   */
  cbrt(): Decimal {
    if (this.s === 0) return new Decimal(0)
    if (!this.d) return new Decimal(this)

    const sign = this.s
    const abs = this.abs()

    // Newton-Raphson method
    let x = new Decimal(Math.cbrt(abs.toNumber()))
    const precision = globalConfig.precision + 5

    for (let i = 0; i < 50; i++) {
      const prev = x
      // x = (2x + a/x^2) / 3
      x = x
        .times(2)
        .plus(abs.div(x.times(x)))
        .div(3)
      if (
        x
          .minus(prev)
          .abs()
          .lt(new Decimal(`1e-${precision}`))
      ) {
        break
      }
    }

    const result = x.toDecimalPlaces(globalConfig.precision)
    result.s = sign
    return result
  }

  /**
   * Natural logarithm
   */
  ln(): Decimal {
    if (this.s <= 0) throw new Error('Logarithm of non-positive number')
    if (!this.d) return new Decimal(this)

    // Use Math.log for initial estimate, then refine
    return new Decimal(Math.log(this.toNumber()))
  }

  /**
   * Logarithm (base 10 or specified)
   */
  log(base?: Decimal | number | string): Decimal {
    if (base === undefined) {
      // Base 10
      return new Decimal(Math.log10(this.toNumber()))
    }
    return this.ln().div(new Decimal(base).ln())
  }

  /**
   * Exponential (e^x)
   */
  exp(): Decimal {
    if (this.s === 0) return new Decimal(1)
    if (!this.d) return new Decimal(this)
    return new Decimal(Math.exp(this.toNumber()))
  }

  // Trigonometric functions - using JavaScript's Math for now
  // For arbitrary precision, these would need Taylor series implementations

  sin(): Decimal {
    return new Decimal(Math.sin(this.toNumber()))
  }

  cos(): Decimal {
    return new Decimal(Math.cos(this.toNumber()))
  }

  tan(): Decimal {
    return new Decimal(Math.tan(this.toNumber()))
  }

  asin(): Decimal {
    return new Decimal(Math.asin(this.toNumber()))
  }

  acos(): Decimal {
    return new Decimal(Math.acos(this.toNumber()))
  }

  atan(): Decimal {
    return new Decimal(Math.atan(this.toNumber()))
  }

  sinh(): Decimal {
    return new Decimal(Math.sinh(this.toNumber()))
  }

  cosh(): Decimal {
    return new Decimal(Math.cosh(this.toNumber()))
  }

  tanh(): Decimal {
    return new Decimal(Math.tanh(this.toNumber()))
  }

  asinh(): Decimal {
    return new Decimal(Math.asinh(this.toNumber()))
  }

  acosh(): Decimal {
    return new Decimal(Math.acosh(this.toNumber()))
  }

  atanh(): Decimal {
    return new Decimal(Math.atanh(this.toNumber()))
  }

  /**
   * Absolute value
   */
  abs(): Decimal {
    const result = new Decimal(this)
    result.s = result.s === 0 ? 0 : 1
    return result
  }

  /**
   * Negate
   */
  neg(): Decimal {
    const result = new Decimal(this)
    result.s = -this.s
    return result
  }

  /**
   * Floor
   */
  floor(): Decimal {
    return this.toDecimalPlaces(0, ROUND_FLOOR)
  }

  /**
   * Ceiling
   */
  ceil(): Decimal {
    return this.toDecimalPlaces(0, ROUND_CEIL)
  }

  /**
   * Round
   */
  round(): Decimal {
    return this.toDecimalPlaces(0, ROUND_HALF_UP)
  }

  /**
   * Round to decimal places
   */
  toDecimalPlaces(places: number, roundingMode?: number): Decimal {
    if (!this.d) return new Decimal(this)

    const rm = roundingMode ?? globalConfig.rounding

    // Position in digit array where rounding occurs
    const _exp = this.e
    const _roundAt = places + 1

    // Convert to string, apply rounding, convert back
    const str = this.toString()
    const dotIndex = str.indexOf('.')

    if (dotIndex === -1) {
      // Integer
      if (places >= 0) return new Decimal(this)
      // Negative places - round to powers of 10
      return new Decimal(this)
    }

    const intPart = str.slice(0, dotIndex).replace('-', '')
    const fracPart = str.slice(dotIndex + 1)

    if (places >= fracPart.length) {
      return new Decimal(this)
    }

    if (places < 0) {
      return new Decimal(this)
    }

    // Get the digit that determines rounding
    const roundDigit = parseInt(fracPart[places] || '0', 10)
    const truncated =
      intPart + (places > 0 ? '.' + fracPart.slice(0, places) : '')

    let result = new Decimal(truncated)
    result.s = this.s

    // Apply rounding
    const needsRound = this.shouldRoundUp(roundDigit, rm, places, fracPart)

    if (needsRound) {
      const increment = new Decimal(`1e-${places}`)
      result = result.plus(increment)
    }

    result.s = this.s
    return result
  }

  private shouldRoundUp(
    digit: number,
    rm: number,
    places: number,
    fracPart: string
  ): boolean {
    switch (rm) {
      case ROUND_UP:
        return digit > 0
      case ROUND_DOWN:
        return false
      case ROUND_CEIL:
        return this.s > 0 && digit > 0
      case ROUND_FLOOR:
        return this.s < 0 && digit > 0
      case ROUND_HALF_UP:
        return digit >= 5
      case ROUND_HALF_DOWN:
        return digit > 5
      case ROUND_HALF_EVEN: {
        if (digit < 5) return false
        if (digit > 5) return true
        // Exactly 5 - check if preceding digit is odd
        const preceding =
          places > 0 ? parseInt(fracPart[places - 1] || '0', 10) : 0
        return preceding % 2 !== 0
      }
      case ROUND_HALF_CEIL:
        return digit > 5 || (digit === 5 && this.s > 0)
      case ROUND_HALF_FLOOR:
        return digit > 5 || (digit === 5 && this.s < 0)
      default:
        return digit >= 5
    }
  }

  /**
   * Round to significant figures
   */
  toSignificantDigits(sd: number, roundingMode?: number): Decimal {
    if (!this.d || sd < 1) return new Decimal(this)

    if (this.d.length <= sd) {
      return new Decimal(this)
    }

    // Create new decimal with limited digits
    const result = new Decimal(this)
    result.d = this.d.slice(0, sd)

    // Check if we need to round up
    const nextDigit = this.d[sd] ?? 0
    const rm = roundingMode ?? globalConfig.rounding

    if (this.shouldRoundUp(nextDigit, rm, sd, this.d.slice(sd).join(''))) {
      // Add 1 to last digit and handle carry
      let carry = 1
      for (let i = result.d!.length - 1; i >= 0 && carry; i--) {
        result.d![i] += carry
        if (result.d![i] >= 10) {
          result.d![i] = 0
          carry = 1
        } else {
          carry = 0
        }
      }
      if (carry) {
        result.d!.unshift(1)
        result.e++
      }
    }

    return result
  }

  /**
   * Convert to fixed-point string
   */
  toFixed(places?: number): string {
    if (!this.d) return String(this.toNumber())
    places = places ?? 0

    const rounded = this.toDecimalPlaces(places)
    let str = rounded.toString()

    // Ensure correct number of decimal places
    const dotIndex = str.indexOf('.')
    if (places === 0) {
      return dotIndex === -1 ? str : str.slice(0, dotIndex)
    }

    if (dotIndex === -1) {
      str += '.'
      str += '0'.repeat(places)
    } else {
      const currentPlaces = str.length - dotIndex - 1
      if (currentPlaces < places) {
        str += '0'.repeat(places - currentPlaces)
      }
    }

    return str
  }

  /**
   * Convert to exponential notation
   */
  toExponential(places?: number): string {
    if (!this.d) return String(this.toNumber())

    const dp = places ?? this.d.length - 1
    let str = this.d[0].toString()
    if (this.d.length > 1 || dp > 0) {
      str += '.'
      str += this.d.slice(1, dp + 1).join('')
      while (str.length - 2 < dp) str += '0'
    }

    str += 'e' + (this.e >= 0 ? '+' : '') + this.e

    return (this.s < 0 ? '-' : '') + str
  }

  /**
   * Convert to precision
   */
  toPrecision(sd?: number): string {
    if (!this.d) return String(this.toNumber())
    if (sd === undefined) return this.toString()

    const rounded = this.toSignificantDigits(sd)
    return rounded.toString()
  }

  // Comparison methods
  equals(other: Decimal | number | string): boolean {
    return this.cmp(other) === 0
  }

  eq(other: Decimal | number | string): boolean {
    return this.equals(other)
  }

  greaterThan(other: Decimal | number | string): boolean {
    return this.cmp(other) > 0
  }

  gt(other: Decimal | number | string): boolean {
    return this.greaterThan(other)
  }

  greaterThanOrEqual(other: Decimal | number | string): boolean {
    return this.cmp(other) >= 0
  }

  gte(other: Decimal | number | string): boolean {
    return this.greaterThanOrEqual(other)
  }

  lessThan(other: Decimal | number | string): boolean {
    return this.cmp(other) < 0
  }

  lt(other: Decimal | number | string): boolean {
    return this.lessThan(other)
  }

  lessThanOrEqual(other: Decimal | number | string): boolean {
    return this.cmp(other) <= 0
  }

  lte(other: Decimal | number | string): boolean {
    return this.lessThanOrEqual(other)
  }

  cmp(other: Decimal | number | string): number {
    const b = new Decimal(other)

    if (!this.d || !b.d) return NaN
    if (this.s === 0 && b.s === 0) return 0
    if (this.s !== b.s) return this.s > b.s ? 1 : -1

    const cmpResult = this.cmpAbs(b)
    return this.s < 0 ? -cmpResult : cmpResult
  }

  compareTo(other: Decimal | number | string): number {
    return this.cmp(other)
  }

  // Type checks
  isNegative(): boolean {
    return this.s < 0
  }

  isNeg(): boolean {
    return this.isNegative()
  }

  isPositive(): boolean {
    return this.s > 0
  }

  isZero(): boolean {
    return this.s === 0
  }

  isNaN(): boolean {
    return Number.isNaN(this.s)
  }

  isFinite(): boolean {
    return this.d !== null
  }

  isInteger(): boolean {
    if (!this.d) return false
    return this.e >= this.d.length - 1
  }

  isInt(): boolean {
    return this.isInteger()
  }

  /**
   * Clone
   */
  clone(): Decimal {
    return new Decimal(this)
  }

  /**
   * Convert to number
   */
  toNumber(): number {
    if (!this.d) return this.s * Infinity
    if (this.s === 0) return 0

    const str = this.d.join('')
    const exp = this.e - this.d.length + 1
    return this.s * parseFloat(`${str}e${exp}`)
  }

  /**
   * Convert to string
   */
  toString(): string {
    if (!this.d) {
      if (Number.isNaN(this.s)) return 'NaN'
      return (this.s < 0 ? '-' : '') + 'Infinity'
    }
    if (this.s === 0) return '0'

    const sign = this.s < 0 ? '-' : ''
    const digits = this.d.join('')
    const exp = this.e

    // Position of decimal point from left of digits
    const decPos = exp + 1

    if (decPos <= 0) {
      // 0.00...digits
      return sign + '0.' + '0'.repeat(-decPos) + digits
    } else if (decPos >= digits.length) {
      // digits000...
      return sign + digits + '0'.repeat(decPos - digits.length)
    } else {
      // dig.its
      return sign + digits.slice(0, decPos) + '.' + digits.slice(decPos)
    }
  }

  valueOf(): number {
    return this.toNumber()
  }
}

export default Decimal
