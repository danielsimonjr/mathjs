/**
 * Rational Arithmetic for AssemblyScript/WASM
 *
 * WASM-compatible rational number arithmetic using i64.
 * This provides exact arithmetic within precision limits as an
 * alternative to the Fraction class (which uses BigInt/OOP).
 *
 * Rationals are represented as pairs of i64: [numerator, denominator]
 * Stored in Float64Array as [num1, den1, num2, den2, ...] for batch operations
 * or StaticArray<i64> for single rationals.
 *
 * Note: i64 limits: -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
 * For large numerators/denominators, overflow checking is critical.
 */

// ============================================================================
// GCD AND REDUCTION
// ============================================================================

/**
 * Greatest Common Divisor using binary GCD (Stein's algorithm)
 * More efficient than Euclidean for i64
 * @param a First integer (absolute value used)
 * @param b Second integer (absolute value used)
 * @returns GCD(|a|, |b|)
 */
export function gcd(a: i64, b: i64): i64 {
  // Handle absolute values
  if (a < 0) a = -a
  if (b < 0) b = -b

  if (a === 0) return b
  if (b === 0) return a

  // Find common powers of 2
  let shift: i64 = 0
  while (((a | b) & 1) === 0) {
    a >>= 1
    b >>= 1
    shift++
  }

  // Remove remaining factors of 2 from a
  while ((a & 1) === 0) {
    a >>= 1
  }

  // Binary GCD main loop
  while (b !== 0) {
    // Remove factors of 2 from b
    while ((b & 1) === 0) {
      b >>= 1
    }

    // Ensure a <= b
    if (a > b) {
      const temp = a
      a = b
      b = temp
    }

    b = b - a
  }

  return a << shift
}

/**
 * Least Common Multiple
 * @param a First integer
 * @param b Second integer
 * @returns LCM(|a|, |b|)
 */
export function lcm(a: i64, b: i64): i64 {
  if (a === 0 || b === 0) return 0
  const g = gcd(a, b)
  // Divide first to prevent overflow
  return (a / g) * b
}

/**
 * Reduce a rational to lowest terms
 * Returns [numerator, denominator] with denominator > 0
 * @param num Numerator
 * @param den Denominator
 * @returns Reduced [numerator, denominator]
 */
export function reduce(num: i64, den: i64): StaticArray<i64> {
  const result = new StaticArray<i64>(2)

  if (den === 0) {
    // Return [sign, 0] for infinity representation
    result[0] = num > 0 ? 1 : (num < 0 ? -1 : 0)
    result[1] = 0
    return result
  }

  if (num === 0) {
    result[0] = 0
    result[1] = 1
    return result
  }

  // Make denominator positive
  if (den < 0) {
    num = -num
    den = -den
  }

  const g = gcd(num, den)
  result[0] = num / g
  result[1] = den / g
  return result
}

// ============================================================================
// BASIC ARITHMETIC
// ============================================================================

/**
 * Add two rationals: a/b + c/d = (a*d + c*b) / (b*d)
 * Returns reduced result
 * @param num1 Numerator of first rational
 * @param den1 Denominator of first rational
 * @param num2 Numerator of second rational
 * @param den2 Denominator of second rational
 * @returns [numerator, denominator]
 */
export function add(num1: i64, den1: i64, num2: i64, den2: i64): StaticArray<i64> {
  // Use LCM to minimize overflow risk
  const g = gcd(den1, den2)
  const d1 = den1 / g
  const d2 = den2 / g

  const num = num1 * d2 + num2 * d1
  const den = den1 * d2

  return reduce(num, den)
}

/**
 * Subtract two rationals: a/b - c/d
 * @returns [numerator, denominator]
 */
export function subtract(num1: i64, den1: i64, num2: i64, den2: i64): StaticArray<i64> {
  return add(num1, den1, -num2, den2)
}

/**
 * Multiply two rationals: (a/b) * (c/d) = (a*c) / (b*d)
 * Cross-reduces to minimize overflow
 * @returns [numerator, denominator]
 */
export function multiply(num1: i64, den1: i64, num2: i64, den2: i64): StaticArray<i64> {
  // Cross-reduce to minimize overflow
  const g1 = gcd(num1, den2)
  const g2 = gcd(num2, den1)

  const num = (num1 / g1) * (num2 / g2)
  const den = (den1 / g2) * (den2 / g1)

  return reduce(num, den)
}

/**
 * Divide two rationals: (a/b) / (c/d) = (a*d) / (b*c)
 * @returns [numerator, denominator]
 */
export function divide(num1: i64, den1: i64, num2: i64, den2: i64): StaticArray<i64> {
  return multiply(num1, den1, den2, num2)
}

/**
 * Negate a rational: -(a/b) = -a/b
 * @returns [numerator, denominator]
 */
export function negate(num: i64, den: i64): StaticArray<i64> {
  const result = new StaticArray<i64>(2)
  result[0] = -num
  result[1] = den
  return result
}

/**
 * Absolute value of rational
 * @returns [numerator, denominator]
 */
export function abs(num: i64, den: i64): StaticArray<i64> {
  const result = new StaticArray<i64>(2)
  result[0] = num < 0 ? -num : num
  result[1] = den < 0 ? -den : den
  return result
}

/**
 * Reciprocal: (a/b) → (b/a)
 * @returns [numerator, denominator]
 */
export function reciprocal(num: i64, den: i64): StaticArray<i64> {
  const result = new StaticArray<i64>(2)
  if (num < 0) {
    result[0] = -den
    result[1] = -num
  } else {
    result[0] = den
    result[1] = num
  }
  return result
}

// ============================================================================
// COMPARISON
// ============================================================================

/**
 * Compare two rationals
 * @returns -1 if a/b < c/d, 0 if equal, 1 if a/b > c/d
 */
export function compare(num1: i64, den1: i64, num2: i64, den2: i64): i32 {
  // Handle special cases
  if (den1 === 0 && den2 === 0) {
    if (num1 === num2) return 0
    return num1 > num2 ? 1 : -1
  }
  if (den1 === 0) return num1 >= 0 ? 1 : -1
  if (den2 === 0) return num2 >= 0 ? -1 : 1

  // Normalize signs
  if (den1 < 0) { num1 = -num1; den1 = -den1 }
  if (den2 < 0) { num2 = -num2; den2 = -den2 }

  // Cross multiply (be careful with overflow)
  // a/b vs c/d → a*d vs c*b
  const lhs = num1 * den2
  const rhs = num2 * den1

  if (lhs < rhs) return -1
  if (lhs > rhs) return 1
  return 0
}

/**
 * Check equality of two rationals
 */
export function equals(num1: i64, den1: i64, num2: i64, den2: i64): bool {
  return compare(num1, den1, num2, den2) === 0
}

/**
 * Check if rational is zero
 */
export function isZero(num: i64, den: i64): bool {
  return num === 0 && den !== 0
}

/**
 * Check if rational is positive
 */
export function isPositive(num: i64, den: i64): bool {
  if (den === 0) return num > 0
  return (num > 0 && den > 0) || (num < 0 && den < 0)
}

/**
 * Check if rational is negative
 */
export function isNegative(num: i64, den: i64): bool {
  if (den === 0) return num < 0
  return (num > 0 && den < 0) || (num < 0 && den > 0)
}

/**
 * Check if rational represents an integer
 */
export function isInteger(num: i64, den: i64): bool {
  if (den === 0) return false
  const r = reduce(num, den)
  return r[1] === 1 || r[1] === -1
}

// ============================================================================
// CONVERSION
// ============================================================================

/**
 * Convert rational to f64
 */
export function toFloat(num: i64, den: i64): f64 {
  if (den === 0) {
    if (num > 0) return Infinity
    if (num < 0) return -Infinity
    return NaN
  }
  return f64(num) / f64(den)
}

/**
 * Convert f64 to rational approximation using continued fractions
 * @param value The float value
 * @param maxDenom Maximum allowed denominator
 * @returns [numerator, denominator]
 */
export function fromFloat(value: f64, maxDenom: i64): StaticArray<i64> {
  const result = new StaticArray<i64>(2)

  if (!isFinite(value)) {
    result[0] = value > 0 ? 1 : (value < 0 ? -1 : 0)
    result[1] = 0
    return result
  }

  if (value === 0.0) {
    result[0] = 0
    result[1] = 1
    return result
  }

  const neg = value < 0
  if (neg) value = -value

  // Continued fraction approximation
  let h0: i64 = 0, h1: i64 = 1
  let k0: i64 = 1, k1: i64 = 0

  let x = value

  for (let i: i32 = 0; i < 64; i++) {
    const a = i64(Math.floor(x))

    const h2 = a * h1 + h0
    const k2 = a * k1 + k0

    // Check for overflow or exceeding max denominator
    if (k2 > maxDenom || k2 < 0) break

    h0 = h1; h1 = h2
    k0 = k1; k1 = k2

    const remainder = x - f64(a)
    if (Math.abs(remainder) < 1e-15) break

    x = 1.0 / remainder
    if (!isFinite(x)) break
  }

  result[0] = neg ? -h1 : h1
  result[1] = k1
  return result
}

/**
 * Parse integer string to rational
 * @param str Integer string
 * @returns [numerator, 1]
 */
export function fromInteger(value: i64): StaticArray<i64> {
  const result = new StaticArray<i64>(2)
  result[0] = value
  result[1] = 1
  return result
}

// ============================================================================
// POWER AND ROOTS
// ============================================================================

/**
 * Raise rational to integer power
 * @param num Numerator
 * @param den Denominator
 * @param exp Integer exponent (can be negative)
 * @returns [numerator, denominator]
 */
export function pow(num: i64, den: i64, exp: i32): StaticArray<i64> {
  if (exp === 0) {
    const result = new StaticArray<i64>(2)
    result[0] = 1
    result[1] = 1
    return result
  }

  if (exp < 0) {
    const tmp = num
    num = den
    den = tmp
    exp = -exp
  }

  // Binary exponentiation
  let resNum: i64 = 1
  let resDen: i64 = 1

  while (exp > 0) {
    if ((exp & 1) === 1) {
      resNum *= num
      resDen *= den
    }
    num *= num
    den *= den
    exp >>= 1
  }

  return reduce(resNum, resDen)
}

/**
 * Integer square root (floor)
 * @param n Non-negative integer
 * @returns floor(sqrt(n))
 */
export function isqrt(n: i64): i64 {
  if (n < 0) return -1 // Invalid
  if (n < 2) return n

  // Newton's method for integer square root
  let x = n
  let y = (x + 1) >> 1

  while (y < x) {
    x = y
    y = (x + n / x) >> 1
  }

  return x
}

/**
 * Check if integer is a perfect square
 */
export function isPerfectSquare(n: i64): bool {
  if (n < 0) return false
  const s = isqrt(n)
  return s * s === n
}

/**
 * Simplify square root: sqrt(n) = a * sqrt(b) where b is square-free
 * @param n The radicand
 * @returns [a, b] such that sqrt(n) = a * sqrt(b)
 */
export function simplifySqrt(n: i64): StaticArray<i64> {
  const result = new StaticArray<i64>(2)

  if (n <= 0) {
    result[0] = 0
    result[1] = n < 0 ? -n : 0
    return result
  }

  let a: i64 = 1
  let b = n

  // Extract perfect square factors
  let d: i64 = 2
  while (d * d <= b) {
    while (b % (d * d) === 0) {
      a *= d
      b /= d * d
    }
    d++
  }

  result[0] = a
  result[1] = b
  return result
}

// ============================================================================
// MODULAR ARITHMETIC (for extended rationals)
// ============================================================================

/**
 * Modular inverse using extended Euclidean algorithm
 * @param a The number
 * @param m The modulus
 * @returns a^(-1) mod m, or 0 if no inverse exists
 */
export function modInverse(a: i64, m: i64): i64 {
  if (m <= 0) return 0

  a = ((a % m) + m) % m // Ensure positive

  let t: i64 = 0, newt: i64 = 1
  let r = m, newr = a

  while (newr !== 0) {
    const q = r / newr

    const tempt = t
    t = newt
    newt = tempt - q * newt

    const tempr = r
    r = newr
    newr = tempr - q * newr
  }

  if (r > 1) return 0 // No inverse

  if (t < 0) t += m
  return t
}

/**
 * Rational modulo (floor definition)
 * (a/b) mod n = (a mod (b*n)) / b
 */
export function mod(num: i64, den: i64, n: i64): StaticArray<i64> {
  if (n === 0) {
    const result = new StaticArray<i64>(2)
    result[0] = num
    result[1] = den
    return result
  }

  // Convert to same denominator
  const r = reduce(num, den)
  const rNum = r[0]
  const rDen = r[1]

  // Compute floor((a/b) / n) * n
  const floored = rNum / (rDen * n) * n * rDen
  const newNum = rNum - floored

  return reduce(newNum, rDen)
}

// ============================================================================
// BATCH OPERATIONS (for array processing)
// ============================================================================

/**
 * Add array of rationals
 * Input format: [num1, den1, num2, den2, ...]
 * @param rationals Flat array of [num, den] pairs
 * @param count Number of rationals
 * @returns [sum_numerator, sum_denominator]
 */
export function sumArray(rationals: Float64Array, count: i32): StaticArray<i64> {
  if (count === 0) {
    const result = new StaticArray<i64>(2)
    result[0] = 0
    result[1] = 1
    return result
  }

  let resNum: i64 = i64(rationals[0])
  let resDen: i64 = i64(rationals[1])

  for (let i: i32 = 1; i < count; i++) {
    const num = i64(rationals[i * 2])
    const den = i64(rationals[i * 2 + 1])
    const r = add(resNum, resDen, num, den)
    resNum = r[0]
    resDen = r[1]
  }

  return reduce(resNum, resDen)
}

/**
 * Multiply array of rationals
 * @param rationals Flat array of [num, den] pairs
 * @param count Number of rationals
 * @returns [product_numerator, product_denominator]
 */
export function productArray(rationals: Float64Array, count: i32): StaticArray<i64> {
  if (count === 0) {
    const result = new StaticArray<i64>(2)
    result[0] = 1
    result[1] = 1
    return result
  }

  let resNum: i64 = i64(rationals[0])
  let resDen: i64 = i64(rationals[1])

  for (let i: i32 = 1; i < count; i++) {
    const num = i64(rationals[i * 2])
    const den = i64(rationals[i * 2 + 1])
    const r = multiply(resNum, resDen, num, den)
    resNum = r[0]
    resDen = r[1]
  }

  return reduce(resNum, resDen)
}

/**
 * Compute continued fraction representation
 * @param num Numerator
 * @param den Denominator
 * @param maxTerms Maximum number of terms
 * @returns Array of continued fraction coefficients
 */
export function toContinuedFraction(num: i64, den: i64, maxTerms: i32): Int32Array {
  const terms = new Int32Array(maxTerms)
  let count: i32 = 0

  if (den < 0) {
    num = -num
    den = -den
  }

  while (den !== 0 && count < maxTerms) {
    const q = num / den
    terms[count] = i32(q)
    count++

    const r = num - q * den
    num = den
    den = r
  }

  // Return only the used portion
  const result = new Int32Array(count)
  for (let i: i32 = 0; i < count; i++) {
    result[i] = terms[i]
  }
  return result
}

/**
 * Convert continued fraction back to rational
 * @param terms Continued fraction coefficients
 * @param n Number of terms
 * @returns [numerator, denominator]
 */
export function fromContinuedFraction(terms: Int32Array, n: i32): StaticArray<i64> {
  if (n === 0) {
    const result = new StaticArray<i64>(2)
    result[0] = 0
    result[1] = 1
    return result
  }

  let h0: i64 = 1, h1: i64 = i64(terms[0])
  let k0: i64 = 0, k1: i64 = 1

  for (let i: i32 = 1; i < n; i++) {
    const a = i64(terms[i])
    const h2 = a * h1 + h0
    const k2 = a * k1 + k0

    h0 = h1; h1 = h2
    k0 = k1; k1 = k2
  }

  return reduce(h1, k1)
}

// ============================================================================
// MEDIANT AND FAREY SEQUENCE
// ============================================================================

/**
 * Compute mediant of two fractions: (a+c)/(b+d)
 * Used in Stern-Brocot tree and Farey sequences
 */
export function mediant(num1: i64, den1: i64, num2: i64, den2: i64): StaticArray<i64> {
  return reduce(num1 + num2, den1 + den2)
}

/**
 * Find best rational approximation with denominator <= maxDenom
 * Uses Stern-Brocot tree search
 */
export function bestApproximation(value: f64, maxDenom: i64): StaticArray<i64> {
  if (!isFinite(value)) {
    const result = new StaticArray<i64>(2)
    result[0] = value > 0 ? 1 : (value < 0 ? -1 : 0)
    result[1] = 0
    return result
  }

  const neg = value < 0
  if (neg) value = -value

  // Bounds: 0/1 <= value <= value_ceil/1
  let aNum: i64 = 0, aDen: i64 = 1
  let bNum: i64 = 1, bDen: i64 = 0

  while (true) {
    const mNum = aNum + bNum
    const mDen = aDen + bDen

    if (mDen > maxDenom) break

    const mVal = f64(mNum) / f64(mDen)

    if (Math.abs(mVal - value) < 1e-15) {
      const result = new StaticArray<i64>(2)
      result[0] = neg ? -mNum : mNum
      result[1] = mDen
      return result
    }

    if (mVal < value) {
      aNum = mNum
      aDen = mDen
    } else {
      bNum = mNum
      bDen = mDen
    }
  }

  // Return the closer of a or b
  const aErr = Math.abs(f64(aNum) / f64(aDen) - value)
  const bErr = bDen > 0 ? Math.abs(f64(bNum) / f64(bDen) - value) : Infinity

  const result = new StaticArray<i64>(2)
  if (aErr <= bErr) {
    result[0] = neg ? -aNum : aNum
    result[1] = aDen
  } else {
    result[0] = neg ? -bNum : bNum
    result[1] = bDen
  }
  return result
}
