/**
 * Local Fraction implementation for arbitrary precision rational numbers.
 * Replaces the external 'fraction.js' library.
 */

export interface FractionJSON {
  mathjs: 'Fraction'
  n: string
  d: string
}

export interface FractionLike {
  n: bigint
  d: bigint
  s?: number
}

/**
 * Computes the greatest common divisor of two bigints using Euclidean algorithm.
 */
function gcdBigint(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b !== 0n) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

/**
 * Computes the least common multiple of two bigints.
 */
function lcmBigint(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  return (a / gcdBigint(a, b)) * b
}

/**
 * Computes the absolute value of a bigint.
 */
function absBigint(x: bigint): bigint {
  return x < 0n ? -x : x
}

/**
 * Parses a string or number into numerator and denominator bigints.
 */
function parseValue(value: string | number | bigint): {
  n: bigint
  d: bigint
  s: number
} {
  if (typeof value === 'bigint') {
    return {
      n: absBigint(value),
      d: 1n,
      s: value < 0n ? -1 : value === 0n ? 0 : 1
    }
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Cannot convert non-finite number to Fraction')
    }
    if (Number.isInteger(value)) {
      return {
        n: BigInt(Math.abs(value)),
        d: 1n,
        s: value < 0 ? -1 : value === 0 ? 0 : 1
      }
    }
    // Convert decimal to fraction
    const str = value.toString()
    return parseString(str)
  }

  if (typeof value === 'string') {
    return parseString(value.trim())
  }

  throw new Error(`Cannot convert ${typeof value} to Fraction`)
}

/**
 * Parses a string representation into fraction components.
 */
function parseString(str: string): { n: bigint; d: bigint; s: number } {
  // Handle sign
  let sign = 1
  if (str.startsWith('-')) {
    sign = -1
    str = str.slice(1)
  } else if (str.startsWith('+')) {
    str = str.slice(1)
  }

  // Handle fraction notation: "1/2"
  if (str.includes('/')) {
    const [numStr, denStr] = str.split('/')
    const num = BigInt(numStr.trim())
    const den = BigInt(denStr.trim())
    if (den === 0n) throw new Error('Division by zero')
    return {
      n: absBigint(num),
      d: absBigint(den),
      s: sign * (num === 0n ? 0 : 1)
    }
  }

  // Handle scientific notation: "1.5e-3"
  const eIndex = str.toLowerCase().indexOf('e')
  if (eIndex !== -1) {
    const mantissa = str.slice(0, eIndex)
    const exponent = parseInt(str.slice(eIndex + 1), 10)
    const { n, d } = parseString(mantissa)
    if (exponent >= 0) {
      return { n: n * 10n ** BigInt(exponent), d, s: sign * (n === 0n ? 0 : 1) }
    } else {
      return {
        n,
        d: d * 10n ** BigInt(-exponent),
        s: sign * (n === 0n ? 0 : 1)
      }
    }
  }

  // Handle decimal notation: "1.5"
  const dotIndex = str.indexOf('.')
  if (dotIndex !== -1) {
    const intPart = str.slice(0, dotIndex) || '0'
    const fracPart = str.slice(dotIndex + 1)
    const decimalPlaces = fracPart.length
    const num = BigInt(intPart + fracPart)
    const den = 10n ** BigInt(decimalPlaces)
    return { n: absBigint(num), d: den, s: sign * (num === 0n ? 0 : 1) }
  }

  // Handle integer: "123"
  const num = BigInt(str)
  return { n: absBigint(num), d: 1n, s: sign * (num === 0n ? 0 : 1) }
}

/**
 * Fraction class for arbitrary precision rational arithmetic.
 */
export class Fraction {
  /** Numerator (always non-negative) */
  public readonly n: bigint
  /** Denominator (always positive) */
  public readonly d: bigint
  /** Sign: -1, 0, or 1 */
  public readonly s: number
  /** Type marker */
  public readonly type: string = 'Fraction'
  /** Type check flag */
  public readonly isFraction: boolean = true

  constructor(value: number | string | bigint | Fraction | FractionLike)
  constructor(numerator: number | bigint, denominator: number | bigint)
  constructor(
    valueOrNumerator: number | string | bigint | Fraction | FractionLike,
    denominator?: number | bigint
  ) {
    let n: bigint
    let d: bigint
    let s: number

    if (denominator !== undefined) {
      // Two-argument form: numerator, denominator
      const num =
        typeof valueOrNumerator === 'bigint'
          ? valueOrNumerator
          : BigInt(valueOrNumerator as number)
      const den =
        typeof denominator === 'bigint' ? denominator : BigInt(denominator)
      if (den === 0n) throw new Error('Division by zero')

      const numSign = num < 0n ? -1 : num === 0n ? 0 : 1
      const denSign = den < 0n ? -1 : 1
      s = num === 0n ? 0 : numSign * denSign
      n = absBigint(num)
      d = absBigint(den)
    } else if (valueOrNumerator instanceof Fraction) {
      // Clone existing Fraction
      n = valueOrNumerator.n
      d = valueOrNumerator.d
      s = valueOrNumerator.s
    } else if (
      typeof valueOrNumerator === 'object' &&
      valueOrNumerator !== null &&
      'n' in valueOrNumerator &&
      'd' in valueOrNumerator
    ) {
      // Object form: {n, d, s?}
      const obj = valueOrNumerator as FractionLike
      n =
        typeof obj.n === 'bigint'
          ? absBigint(obj.n)
          : BigInt(Math.abs(Number(obj.n)))
      d =
        typeof obj.d === 'bigint'
          ? absBigint(obj.d)
          : BigInt(Math.abs(Number(obj.d)))
      if (d === 0n) throw new Error('Division by zero')
      s = obj.s !== undefined ? obj.s : n === 0n ? 0 : 1
    } else {
      // Parse value
      const parsed = parseValue(valueOrNumerator as number | string | bigint)
      n = parsed.n
      d = parsed.d
      s = parsed.s
    }

    // Simplify to lowest terms
    if (n === 0n) {
      this.n = 0n
      this.d = 1n
      this.s = 0
    } else {
      const g = gcdBigint(n, d)
      this.n = n / g
      this.d = d / g
      this.s = s
    }
  }

  /**
   * Addition
   */
  add(other: Fraction | number | string | bigint): Fraction {
    const b = other instanceof Fraction ? other : new Fraction(other)
    const lcm = lcmBigint(this.d, b.d)
    const thisNum = BigInt(this.s) * this.n * (lcm / this.d)
    const otherNum = BigInt(b.s) * b.n * (lcm / b.d)
    const resultNum = thisNum + otherNum
    return new Fraction(resultNum, lcm)
  }

  /**
   * Subtraction
   */
  sub(other: Fraction | number | string | bigint): Fraction {
    const b = other instanceof Fraction ? other : new Fraction(other)
    const lcm = lcmBigint(this.d, b.d)
    const thisNum = BigInt(this.s) * this.n * (lcm / this.d)
    const otherNum = BigInt(b.s) * b.n * (lcm / b.d)
    const resultNum = thisNum - otherNum
    return new Fraction(resultNum, lcm)
  }

  /**
   * Multiplication
   */
  mul(other: Fraction | number | string | bigint): Fraction {
    const b = other instanceof Fraction ? other : new Fraction(other)
    return new Fraction(BigInt(this.s * b.s) * this.n * b.n, this.d * b.d)
  }

  /**
   * Division
   */
  div(other: Fraction | number | string | bigint): Fraction {
    const b = other instanceof Fraction ? other : new Fraction(other)
    if (b.n === 0n) throw new Error('Division by zero')
    return new Fraction(BigInt(this.s * b.s) * this.n * b.d, this.d * b.n)
  }

  /**
   * Modulo operation
   */
  mod(other: Fraction | number | string | bigint): Fraction {
    const b = other instanceof Fraction ? other : new Fraction(other)
    if (b.n === 0n) throw new Error('Division by zero')
    // a mod b = a - b * floor(a/b)
    const quotient = this.div(b)
    const floored = quotient.floor()
    return this.sub(b.mul(floored))
  }

  /**
   * Power (integer exponent only returns Fraction, otherwise may return null)
   */
  pow(exp: number | Fraction): Fraction | null {
    let e: number
    if (exp instanceof Fraction) {
      if (exp.d !== 1n) {
        // Non-integer exponent - result may not be rational
        // For now, we only support integer exponents
        return null
      }
      e = Number(exp.s) * Number(exp.n)
    } else {
      if (!Number.isInteger(exp)) return null
      e = exp
    }

    if (e === 0) return new Fraction(1)
    if (this.n === 0n) return new Fraction(0)

    const absExp = Math.abs(e)
    let n = this.n ** BigInt(absExp)
    let d = this.d ** BigInt(absExp)
    let s = this.s

    // Handle negative base with odd exponent
    if (this.s < 0 && absExp % 2 === 1) {
      s = -1
    } else if (this.s < 0) {
      s = 1
    }

    if (e < 0) {
      // Invert for negative exponent
      ;[n, d] = [d, n]
    }

    return new Fraction(BigInt(s) * n, d)
  }

  /**
   * Greatest Common Divisor
   */
  gcd(other: Fraction | number | string | bigint): Fraction {
    const b = other instanceof Fraction ? other : new Fraction(other)
    // GCD of a/b and c/d = GCD(a*d, c*b) / (b*d)
    const num = gcdBigint(this.n * b.d, b.n * this.d)
    const den = this.d * b.d
    return new Fraction(num, den)
  }

  /**
   * Least Common Multiple
   */
  lcm(other: Fraction | number | string | bigint): Fraction {
    const b = other instanceof Fraction ? other : new Fraction(other)
    if (this.n === 0n || b.n === 0n) return new Fraction(0)
    // LCM of a/b and c/d = LCM(a,c) / GCD(b,d)
    const num = lcmBigint(this.n, b.n)
    const den = gcdBigint(this.d, b.d)
    return new Fraction(num, den)
  }

  /**
   * Absolute value
   */
  abs(): Fraction {
    return new Fraction(this.n, this.d)
  }

  /**
   * Negate
   */
  neg(): Fraction {
    return new Fraction(BigInt(-this.s) * this.n, this.d)
  }

  /**
   * Floor
   */
  floor(): Fraction {
    if (this.d === 1n) return this
    const quotient = this.n / this.d
    if (this.s >= 0) {
      return new Fraction(quotient)
    } else {
      return new Fraction(-(quotient + 1n))
    }
  }

  /**
   * Ceiling
   */
  ceil(): Fraction {
    if (this.d === 1n) return this
    const quotient = this.n / this.d
    if (this.s >= 0) {
      return new Fraction(quotient + 1n)
    } else {
      return new Fraction(-quotient)
    }
  }

  /**
   * Round to nearest integer
   */
  round(): Fraction {
    const floor = this.floor()
    const ceil = this.ceil()
    const toFloor = this.sub(floor).abs()
    const toCeil = ceil.sub(this).abs()

    if (toFloor.compare(toCeil) <= 0) {
      return floor
    }
    return ceil
  }

  /**
   * Equality check
   */
  equals(other: Fraction | number | string | bigint): boolean {
    const b = other instanceof Fraction ? other : new Fraction(other)
    return this.n === b.n && this.d === b.d && this.s === b.s
  }

  /**
   * Comparison: returns -1, 0, or 1
   */
  compare(other: Fraction | number | string | bigint): number {
    const b = other instanceof Fraction ? other : new Fraction(other)

    // Handle zeros
    if (this.n === 0n && b.n === 0n) return 0
    if (this.n === 0n) return -b.s
    if (b.n === 0n) return this.s

    // Different signs
    if (this.s !== b.s) return this.s > b.s ? 1 : -1

    // Same sign, compare absolute values
    const diff = this.n * b.d - b.n * this.d
    if (diff === 0n) return 0
    const cmp = diff > 0n ? 1 : -1
    return this.s * cmp
  }

  /**
   * Clone
   */
  clone(): Fraction {
    return new Fraction(this)
  }

  /**
   * Convert to number
   */
  valueOf(): number {
    return (this.s * Number(this.n)) / Number(this.d)
  }

  /**
   * Convert to number (alias)
   */
  toNumber(): number {
    return this.valueOf()
  }

  /**
   * Convert to string
   */
  toString(): string {
    if (this.n === 0n) return '0'
    const sign = this.s < 0 ? '-' : ''
    if (this.d === 1n) {
      return `${sign}${this.n}`
    }
    return `${sign}${this.n}/${this.d}`
  }

  /**
   * Convert to JSON
   */
  toJSON(): FractionJSON {
    return {
      mathjs: 'Fraction',
      n: String(BigInt(this.s) * this.n),
      d: String(this.d)
    }
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: FractionJSON): Fraction {
    return new Fraction(BigInt(json.n), BigInt(json.d))
  }
}

export default Fraction
