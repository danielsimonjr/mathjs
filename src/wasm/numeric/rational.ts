/**
 * Rational Arithmetic for AssemblyScript/WASM
 *
 * WASM-compatible rational number arithmetic using i64.
 * This provides exact arithmetic within precision limits as an
 * alternative to the Fraction class (which uses BigInt/OOP).
 *
 * Rationals are represented as pairs of i64: [numerator, denominator]
 * Stored as [num1, den1, num2, den2, ...] for batch operations.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
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
 * Stores [numerator, denominator] with denominator > 0
 * @param num Numerator
 * @param den Denominator
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function reduce(num: i64, den: i64, resultPtr: usize): void {
  if (den === 0) {
    // Store [sign, 0] for infinity representation
    store<i64>(resultPtr, num > 0 ? 1 : num < 0 ? -1 : 0)
    store<i64>(resultPtr + 8, 0)
    return
  }

  if (num === 0) {
    store<i64>(resultPtr, 0)
    store<i64>(resultPtr + 8, 1)
    return
  }

  // Make denominator positive
  if (den < 0) {
    num = -num
    den = -den
  }

  const g = gcd(num, den)
  store<i64>(resultPtr, num / g)
  store<i64>(resultPtr + 8, den / g)
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
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function add(
  num1: i64,
  den1: i64,
  num2: i64,
  den2: i64,
  resultPtr: usize
): void {
  // Use LCM to minimize overflow risk
  const g = gcd(den1, den2)
  const d1 = den1 / g
  const d2 = den2 / g

  const num = num1 * d2 + num2 * d1
  const den = den1 * d2

  reduce(num, den, resultPtr)
}

/**
 * Subtract two rationals: a/b - c/d
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function subtract(
  num1: i64,
  den1: i64,
  num2: i64,
  den2: i64,
  resultPtr: usize
): void {
  add(num1, den1, -num2, den2, resultPtr)
}

/**
 * Multiply two rationals: (a/b) * (c/d) = (a*c) / (b*d)
 * Cross-reduces to minimize overflow
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function multiply(
  num1: i64,
  den1: i64,
  num2: i64,
  den2: i64,
  resultPtr: usize
): void {
  // Cross-reduce to minimize overflow
  const g1 = gcd(num1, den2)
  const g2 = gcd(num2, den1)

  const num = (num1 / g1) * (num2 / g2)
  const den = (den1 / g2) * (den2 / g1)

  reduce(num, den, resultPtr)
}

/**
 * Divide two rationals: (a/b) / (c/d) = (a*d) / (b*c)
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function divide(
  num1: i64,
  den1: i64,
  num2: i64,
  den2: i64,
  resultPtr: usize
): void {
  multiply(num1, den1, den2, num2, resultPtr)
}

/**
 * Negate a rational: -(a/b) = -a/b
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function negate(num: i64, den: i64, resultPtr: usize): void {
  store<i64>(resultPtr, -num)
  store<i64>(resultPtr + 8, den)
}

/**
 * Absolute value of rational
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function abs(num: i64, den: i64, resultPtr: usize): void {
  store<i64>(resultPtr, num < 0 ? -num : num)
  store<i64>(resultPtr + 8, den < 0 ? -den : den)
}

/**
 * Reciprocal: (a/b) → (b/a)
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function reciprocal(num: i64, den: i64, resultPtr: usize): void {
  if (num < 0) {
    store<i64>(resultPtr, -den)
    store<i64>(resultPtr + 8, -num)
  } else {
    store<i64>(resultPtr, den)
    store<i64>(resultPtr + 8, num)
  }
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
  if (den1 < 0) {
    num1 = -num1
    den1 = -den1
  }
  if (den2 < 0) {
    num2 = -num2
    den2 = -den2
  }

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
 * @param workPtr Pointer to 16 bytes for temporary storage
 */
export function isInteger(num: i64, den: i64, workPtr: usize): bool {
  if (den === 0) return false
  reduce(num, den, workPtr)
  const rDen = load<i64>(workPtr + 8)
  return rDen === 1 || rDen === -1
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
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function fromFloat(value: f64, maxDenom: i64, resultPtr: usize): void {
  if (!isFinite(value)) {
    store<i64>(resultPtr, value > 0 ? 1 : value < 0 ? -1 : 0)
    store<i64>(resultPtr + 8, 0)
    return
  }

  if (value === 0.0) {
    store<i64>(resultPtr, 0)
    store<i64>(resultPtr + 8, 1)
    return
  }

  const neg = value < 0
  if (neg) value = -value

  // Continued fraction approximation
  let h0: i64 = 0,
    h1: i64 = 1
  let k0: i64 = 1,
    k1: i64 = 0

  let x = value

  for (let i: i32 = 0; i < 64; i++) {
    const a = i64(Math.floor(x))

    const h2 = a * h1 + h0
    const k2 = a * k1 + k0

    // Check for overflow or exceeding max denominator
    if (k2 > maxDenom || k2 < 0) break

    h0 = h1
    h1 = h2
    k0 = k1
    k1 = k2

    const remainder = x - f64(a)
    if (Math.abs(remainder) < 1e-15) break

    x = 1.0 / remainder
    if (!isFinite(x)) break
  }

  store<i64>(resultPtr, neg ? -h1 : h1)
  store<i64>(resultPtr + 8, k1)
}

/**
 * Create rational from integer
 * @param value Integer value
 * @param resultPtr Pointer to store 2 i64 values [numerator, 1]
 */
export function fromInteger(value: i64, resultPtr: usize): void {
  store<i64>(resultPtr, value)
  store<i64>(resultPtr + 8, 1)
}

// ============================================================================
// POWER AND ROOTS
// ============================================================================

/**
 * Raise rational to integer power
 * @param num Numerator
 * @param den Denominator
 * @param exp Integer exponent (can be negative)
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function pow(num: i64, den: i64, exp: i32, resultPtr: usize): void {
  if (exp === 0) {
    store<i64>(resultPtr, 1)
    store<i64>(resultPtr + 8, 1)
    return
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

  reduce(resNum, resDen, resultPtr)
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
 * @param resultPtr Pointer to store 2 i64 values [a, b] such that sqrt(n) = a * sqrt(b)
 */
export function simplifySqrt(n: i64, resultPtr: usize): void {
  if (n <= 0) {
    store<i64>(resultPtr, 0)
    store<i64>(resultPtr + 8, n < 0 ? -n : 0)
    return
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

  store<i64>(resultPtr, a)
  store<i64>(resultPtr + 8, b)
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

  let t: i64 = 0,
    newt: i64 = 1
  let r = m,
    newr = a

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
 * @param workPtr Pointer to 16 bytes for temporary storage
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function mod(
  num: i64,
  den: i64,
  n: i64,
  workPtr: usize,
  resultPtr: usize
): void {
  if (n === 0) {
    store<i64>(resultPtr, num)
    store<i64>(resultPtr + 8, den)
    return
  }

  // Reduce first
  reduce(num, den, workPtr)
  const rNum = load<i64>(workPtr)
  const rDen = load<i64>(workPtr + 8)

  // Compute floor((a/b) / n) * n
  const floored = (rNum / (rDen * n)) * n * rDen
  const newNum = rNum - floored

  reduce(newNum, rDen, resultPtr)
}

// ============================================================================
// BATCH OPERATIONS (for array processing)
// ============================================================================

/**
 * Add array of rationals
 * Input format: [num1, den1, num2, den2, ...] as f64 values
 * @param rationalsPtr Pointer to flat array of [num, den] pairs as f64
 * @param count Number of rationals
 * @param resultPtr Pointer to store 2 i64 values [sum_numerator, sum_denominator]
 */
export function sumArray(
  rationalsPtr: usize,
  count: i32,
  resultPtr: usize
): void {
  if (count === 0) {
    store<i64>(resultPtr, 0)
    store<i64>(resultPtr + 8, 1)
    return
  }

  let resNum: i64 = i64(load<f64>(rationalsPtr))
  let resDen: i64 = i64(load<f64>(rationalsPtr + 8))

  for (let i: i32 = 1; i < count; i++) {
    const offset: usize = <usize>(i * 2) << 3
    const num = i64(load<f64>(rationalsPtr + offset))
    const den = i64(load<f64>(rationalsPtr + offset + 8))

    // Inline add logic to avoid temp storage
    const g = gcd(resDen, den)
    const d1 = resDen / g
    const d2 = den / g
    const newNum = resNum * d2 + num * d1
    const newDen = resDen * d2

    // Inline reduce
    if (newDen === 0) {
      resNum = newNum > 0 ? 1 : newNum < 0 ? -1 : 0
      resDen = 0
    } else if (newNum === 0) {
      resNum = 0
      resDen = 1
    } else {
      let rNum = newNum
      let rDen = newDen
      if (rDen < 0) {
        rNum = -rNum
        rDen = -rDen
      }
      const g2 = gcd(rNum, rDen)
      resNum = rNum / g2
      resDen = rDen / g2
    }
  }

  store<i64>(resultPtr, resNum)
  store<i64>(resultPtr + 8, resDen)
}

/**
 * Multiply array of rationals
 * @param rationalsPtr Pointer to flat array of [num, den] pairs as f64
 * @param count Number of rationals
 * @param resultPtr Pointer to store 2 i64 values [product_numerator, product_denominator]
 */
export function productArray(
  rationalsPtr: usize,
  count: i32,
  resultPtr: usize
): void {
  if (count === 0) {
    store<i64>(resultPtr, 1)
    store<i64>(resultPtr + 8, 1)
    return
  }

  let resNum: i64 = i64(load<f64>(rationalsPtr))
  let resDen: i64 = i64(load<f64>(rationalsPtr + 8))

  for (let i: i32 = 1; i < count; i++) {
    const offset: usize = <usize>(i * 2) << 3
    const num = i64(load<f64>(rationalsPtr + offset))
    const den = i64(load<f64>(rationalsPtr + offset + 8))

    // Inline multiply with cross-reduce
    const g1 = gcd(resNum, den)
    const g2 = gcd(num, resDen)
    const newNum = (resNum / g1) * (num / g2)
    const newDen = (resDen / g2) * (den / g1)

    // Inline reduce
    if (newDen === 0) {
      resNum = newNum > 0 ? 1 : newNum < 0 ? -1 : 0
      resDen = 0
    } else if (newNum === 0) {
      resNum = 0
      resDen = 1
    } else {
      let rNum = newNum
      let rDen = newDen
      if (rDen < 0) {
        rNum = -rNum
        rDen = -rDen
      }
      const g3 = gcd(rNum, rDen)
      resNum = rNum / g3
      resDen = rDen / g3
    }
  }

  store<i64>(resultPtr, resNum)
  store<i64>(resultPtr + 8, resDen)
}

/**
 * Compute continued fraction representation
 * @param num Numerator
 * @param den Denominator
 * @param maxTerms Maximum number of terms
 * @param resultPtr Pointer to store i32 terms
 * @returns Number of terms actually stored
 */
export function toContinuedFraction(
  num: i64,
  den: i64,
  maxTerms: i32,
  resultPtr: usize
): i32 {
  let count: i32 = 0

  if (den < 0) {
    num = -num
    den = -den
  }

  while (den !== 0 && count < maxTerms) {
    const q = num / den
    store<i32>(resultPtr + (<usize>count << 2), i32(q))
    count++

    const r = num - q * den
    num = den
    den = r
  }

  return count
}

/**
 * Convert continued fraction back to rational
 * @param termsPtr Pointer to i32 continued fraction coefficients
 * @param n Number of terms
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function fromContinuedFraction(
  termsPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  if (n === 0) {
    store<i64>(resultPtr, 0)
    store<i64>(resultPtr + 8, 1)
    return
  }

  let h0: i64 = 1,
    h1: i64 = i64(load<i32>(termsPtr))
  let k0: i64 = 0,
    k1: i64 = 1

  for (let i: i32 = 1; i < n; i++) {
    const a = i64(load<i32>(termsPtr + (<usize>i << 2)))
    const h2 = a * h1 + h0
    const k2 = a * k1 + k0

    h0 = h1
    h1 = h2
    k0 = k1
    k1 = k2
  }

  reduce(h1, k1, resultPtr)
}

// ============================================================================
// MEDIANT AND FAREY SEQUENCE
// ============================================================================

/**
 * Compute mediant of two fractions: (a+c)/(b+d)
 * Used in Stern-Brocot tree and Farey sequences
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function mediant(
  num1: i64,
  den1: i64,
  num2: i64,
  den2: i64,
  resultPtr: usize
): void {
  reduce(num1 + num2, den1 + den2, resultPtr)
}

/**
 * Find best rational approximation with denominator <= maxDenom
 * Uses Stern-Brocot tree search
 * @param resultPtr Pointer to store 2 i64 values [numerator, denominator]
 */
export function bestApproximation(
  value: f64,
  maxDenom: i64,
  resultPtr: usize
): void {
  if (!isFinite(value)) {
    store<i64>(resultPtr, value > 0 ? 1 : value < 0 ? -1 : 0)
    store<i64>(resultPtr + 8, 0)
    return
  }

  const neg = value < 0
  if (neg) value = -value

  // Bounds: 0/1 <= value <= value_ceil/1
  let aNum: i64 = 0,
    aDen: i64 = 1
  let bNum: i64 = 1,
    bDen: i64 = 0

  while (true) {
    const mNum = aNum + bNum
    const mDen = aDen + bDen

    if (mDen > maxDenom) break

    const mVal = f64(mNum) / f64(mDen)

    if (Math.abs(mVal - value) < 1e-15) {
      store<i64>(resultPtr, neg ? -mNum : mNum)
      store<i64>(resultPtr + 8, mDen)
      return
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

  if (aErr <= bErr) {
    store<i64>(resultPtr, neg ? -aNum : aNum)
    store<i64>(resultPtr + 8, aDen)
  } else {
    store<i64>(resultPtr, neg ? -bNum : bNum)
    store<i64>(resultPtr + 8, bDen)
  }
}

// ============================================================================
// F64 ALTERNATIVES FOR PRE-COMPILE TESTING
// These use f64 instead of i64 and raw pointers instead of typed arrays
// for compatibility with Node.js imports (pre-compile testing)
// Works correctly for integers up to Number.MAX_SAFE_INTEGER (2^53 - 1)
// ============================================================================

/**
 * Greatest Common Divisor using binary GCD (f64 version)
 * @param a First integer (as f64)
 * @param b Second integer (as f64)
 * @returns GCD(|a|, |b|)
 */
export function gcdF64(a: f64, b: f64): f64 {
  // Handle absolute values and round to integers
  a = Math.abs(Math.floor(a))
  b = Math.abs(Math.floor(b))

  if (a === 0) return b
  if (b === 0) return a

  // Euclidean algorithm (simpler and sufficient for f64)
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

/**
 * Least Common Multiple (f64 version)
 * @param a First integer (as f64)
 * @param b Second integer (as f64)
 * @returns LCM(|a|, |b|)
 */
export function lcmF64(a: f64, b: f64): f64 {
  a = Math.abs(Math.floor(a))
  b = Math.abs(Math.floor(b))
  if (a === 0 || b === 0) return 0
  const g = gcdF64(a, b)
  return (a / g) * b
}

/**
 * Reduce a rational to lowest terms (f64 version)
 * @param num Numerator (as f64)
 * @param den Denominator (as f64)
 * @param resultPtr Pointer to store 2 f64 values [numerator, denominator]
 */
export function reduceF64(num: f64, den: f64, resultPtr: usize): void {
  num = Math.floor(num)
  den = Math.floor(den)

  if (den === 0) {
    store<f64>(resultPtr, num > 0 ? 1 : num < 0 ? -1 : 0)
    store<f64>(resultPtr + 8, 0)
    return
  }

  if (num === 0) {
    store<f64>(resultPtr, 0)
    store<f64>(resultPtr + 8, 1)
    return
  }

  // Make denominator positive
  if (den < 0) {
    num = -num
    den = -den
  }

  const g = gcdF64(num < 0 ? -num : num, den)
  store<f64>(resultPtr, num / g)
  store<f64>(resultPtr + 8, den / g)
}

/**
 * Add two rationals (f64 version)
 * @param num1 Numerator of first rational
 * @param den1 Denominator of first rational
 * @param num2 Numerator of second rational
 * @param den2 Denominator of second rational
 * @param resultPtr Pointer to store 2 f64 values [numerator, denominator]
 */
export function addF64(
  num1: f64,
  den1: f64,
  num2: f64,
  den2: f64,
  resultPtr: usize
): void {
  const g = gcdF64(den1, den2)
  const d1 = den1 / g
  const d2 = den2 / g

  const num = num1 * d2 + num2 * d1
  const den = den1 * d2

  reduceF64(num, den, resultPtr)
}

/**
 * Multiply two rationals (f64 version)
 * @param num1 Numerator of first rational
 * @param den1 Denominator of first rational
 * @param num2 Numerator of second rational
 * @param den2 Denominator of second rational
 * @param resultPtr Pointer to store 2 f64 values [numerator, denominator]
 */
export function multiplyF64(
  num1: f64,
  den1: f64,
  num2: f64,
  den2: f64,
  resultPtr: usize
): void {
  // Cross-reduce to minimize overflow
  const g1 = gcdF64(Math.abs(num1), Math.abs(den2))
  const g2 = gcdF64(Math.abs(num2), Math.abs(den1))

  const num = (num1 / g1) * (num2 / g2)
  const den = (den1 / g2) * (den2 / g1)

  reduceF64(num, den, resultPtr)
}

/**
 * Compare two rationals (f64 version)
 * @returns -1 if a/b < c/d, 0 if equal, 1 if a/b > c/d
 */
export function compareF64(num1: f64, den1: f64, num2: f64, den2: f64): i32 {
  if (den1 === 0 && den2 === 0) {
    if (num1 === num2) return 0
    return num1 > num2 ? 1 : -1
  }
  if (den1 === 0) return num1 >= 0 ? 1 : -1
  if (den2 === 0) return num2 >= 0 ? -1 : 1

  // Normalize signs
  if (den1 < 0) {
    num1 = -num1
    den1 = -den1
  }
  if (den2 < 0) {
    num2 = -num2
    den2 = -den2
  }

  // Cross multiply
  const lhs = num1 * den2
  const rhs = num2 * den1

  if (lhs < rhs) return -1
  if (lhs > rhs) return 1
  return 0
}

/**
 * Convert f64 to rational approximation (f64 version)
 * Uses continued fraction expansion
 * @param value The floating-point value
 * @param maxDenom Maximum denominator
 * @param resultPtr Pointer to store 2 f64 values [numerator, denominator]
 */
export function fromFloatF64(
  value: f64,
  maxDenom: f64,
  resultPtr: usize
): void {
  if (!isFinite(value)) {
    store<f64>(resultPtr, value > 0 ? 1 : value < 0 ? -1 : 0)
    store<f64>(resultPtr + 8, 0)
    return
  }

  const neg = value < 0
  if (neg) value = -value

  let aNum: f64 = 0,
    aDen: f64 = 1
  let bNum: f64 = 1,
    bDen: f64 = 0

  while (true) {
    const mNum = aNum + bNum
    const mDen = aDen + bDen

    if (mDen > maxDenom) break

    const mVal = mNum / mDen

    if (Math.abs(mVal - value) < 1e-15) {
      store<f64>(resultPtr, neg ? -mNum : mNum)
      store<f64>(resultPtr + 8, mDen)
      return
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
  const aErr = Math.abs(aNum / aDen - value)
  const bErr = bDen > 0 ? Math.abs(bNum / bDen - value) : Infinity

  if (aErr <= bErr) {
    store<f64>(resultPtr, neg ? -aNum : aNum)
    store<f64>(resultPtr + 8, aDen)
  } else {
    store<f64>(resultPtr, neg ? -bNum : bNum)
    store<f64>(resultPtr + 8, bDen)
  }
}
