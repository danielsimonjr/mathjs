// @ts-nocheck
/**
 * WASM-optimized string/number operations using AssemblyScript
 * Note: Full string manipulation is better handled in JavaScript.
 * This module focuses on numeric parsing, formatting, and character operations.
 */

// ASCII code constants
const CHAR_0: i32 = 48 // '0'
const CHAR_9: i32 = 57 // '9'
const CHAR_A: i32 = 65 // 'A'
const CHAR_Z: i32 = 90 // 'Z'
const CHAR_a: i32 = 97 // 'a'
const CHAR_z: i32 = 122 // 'z'
const CHAR_MINUS: i32 = 45 // '-'
const CHAR_PLUS: i32 = 43 // '+'
const CHAR_DOT: i32 = 46 // '.'
const CHAR_E: i32 = 69 // 'E'
const CHAR_e: i32 = 101 // 'e'
const CHAR_SPACE: i32 = 32 // ' '

/**
 * Check if a character code is a digit (0-9)
 * @param code - Character code
 * @returns 1 if digit, 0 otherwise
 */
export function isDigit(code: i32): i32 {
  return code >= CHAR_0 && code <= CHAR_9 ? 1 : 0
}

/**
 * Check if a character code is a letter (A-Z or a-z)
 * @param code - Character code
 * @returns 1 if letter, 0 otherwise
 */
export function isLetter(code: i32): i32 {
  return (code >= CHAR_A && code <= CHAR_Z) ||
    (code >= CHAR_a && code <= CHAR_z)
    ? 1
    : 0
}

/**
 * Check if a character code is alphanumeric
 * @param code - Character code
 * @returns 1 if alphanumeric, 0 otherwise
 */
export function isAlphanumeric(code: i32): i32 {
  return isDigit(code) === 1 || isLetter(code) === 1 ? 1 : 0
}

/**
 * Check if a character code is whitespace
 * @param code - Character code
 * @returns 1 if whitespace, 0 otherwise
 */
export function isWhitespace(code: i32): i32 {
  return code === 32 || code === 9 || code === 10 || code === 13 ? 1 : 0
}

/**
 * Convert uppercase letter to lowercase
 * @param code - Character code
 * @returns Lowercase character code (or original if not uppercase)
 */
export function toLowerCode(code: i32): i32 {
  if (code >= CHAR_A && code <= CHAR_Z) {
    return code + 32
  }
  return code
}

/**
 * Convert lowercase letter to uppercase
 * @param code - Character code
 * @returns Uppercase character code (or original if not lowercase)
 */
export function toUpperCode(code: i32): i32 {
  if (code >= CHAR_a && code <= CHAR_z) {
    return code - 32
  }
  return code
}

/**
 * Parse an integer from character codes
 * @param codes - Array of character codes
 * @returns Parsed integer value, or NaN if invalid
 */
export function parseIntFromCodes(codes: Int32Array): f64 {
  const n: i32 = codes.length
  if (n === 0) return f64.NaN

  let i: i32 = 0
  let sign: f64 = 1.0

  // Skip leading whitespace
  while (i < n && isWhitespace(codes[i]) === 1) {
    i++
  }

  if (i >= n) return f64.NaN

  // Check for sign
  if (codes[i] === CHAR_MINUS) {
    sign = -1.0
    i++
  } else if (codes[i] === CHAR_PLUS) {
    i++
  }

  if (i >= n || isDigit(codes[i]) === 0) return f64.NaN

  let result: f64 = 0.0

  while (i < n && isDigit(codes[i]) === 1) {
    result = result * 10.0 + <f64>(codes[i] - CHAR_0)
    i++
  }

  return sign * result
}

/**
 * Parse a float from character codes
 * @param codes - Array of character codes
 * @returns Parsed float value, or NaN if invalid
 */
export function parseFloatFromCodes(codes: Int32Array): f64 {
  const n: i32 = codes.length
  if (n === 0) return f64.NaN

  let i: i32 = 0
  let sign: f64 = 1.0

  // Skip leading whitespace
  while (i < n && isWhitespace(codes[i]) === 1) {
    i++
  }

  if (i >= n) return f64.NaN

  // Check for sign
  if (codes[i] === CHAR_MINUS) {
    sign = -1.0
    i++
  } else if (codes[i] === CHAR_PLUS) {
    i++
  }

  if (i >= n) return f64.NaN

  // Parse integer part
  let intPart: f64 = 0.0
  let hasIntPart: bool = false

  while (i < n && isDigit(codes[i]) === 1) {
    intPart = intPart * 10.0 + <f64>(codes[i] - CHAR_0)
    hasIntPart = true
    i++
  }

  // Parse decimal part
  let fracPart: f64 = 0.0
  let fracDiv: f64 = 1.0
  let hasFracPart: bool = false

  if (i < n && codes[i] === CHAR_DOT) {
    i++
    while (i < n && isDigit(codes[i]) === 1) {
      fracPart = fracPart * 10.0 + <f64>(codes[i] - CHAR_0)
      fracDiv *= 10.0
      hasFracPart = true
      i++
    }
  }

  if (!hasIntPart && !hasFracPart) return f64.NaN

  let result: f64 = intPart + fracPart / fracDiv

  // Parse exponent
  if (i < n && (codes[i] === CHAR_E || codes[i] === CHAR_e)) {
    i++

    let expSign: f64 = 1.0
    if (i < n && codes[i] === CHAR_MINUS) {
      expSign = -1.0
      i++
    } else if (i < n && codes[i] === CHAR_PLUS) {
      i++
    }

    let exp: f64 = 0.0
    while (i < n && isDigit(codes[i]) === 1) {
      exp = exp * 10.0 + <f64>(codes[i] - CHAR_0)
      i++
    }

    result *= Math.pow(10.0, expSign * exp)
  }

  return sign * result
}

/**
 * Count the number of digits needed to represent an integer
 * @param value - Integer value
 * @returns Number of digits
 */
export function countDigits(value: i64): i32 {
  if (value === 0) return 1
  if (value < 0) value = -value

  let count: i32 = 0
  while (value > 0) {
    count++
    value = value / 10
  }

  return count
}

/**
 * Format an integer as character codes
 * @param value - Integer value
 * @returns Array of character codes
 */
export function formatIntToCodes(value: i64): Int32Array {
  if (value === 0) {
    const result = new Int32Array(1)
    result[0] = CHAR_0
    return result
  }

  const negative: bool = value < 0
  if (negative) value = -value

  const numDigits: i32 = countDigits(value)
  const totalLen: i32 = negative ? numDigits + 1 : numDigits
  const result = new Int32Array(totalLen)

  let i: i32 = totalLen - 1
  while (value > 0) {
    result[i] = CHAR_0 + <i32>(value % 10)
    value = value / 10
    i--
  }

  if (negative) {
    result[0] = CHAR_MINUS
  }

  return result
}

/**
 * Format a float with fixed decimal places as character codes
 * @param value - Float value
 * @param decimals - Number of decimal places
 * @returns Array of character codes
 */
export function formatFloatToCodes(value: f64, decimals: i32): Int32Array {
  // Handle special cases
  if (value !== value) {
    // NaN
    const result = new Int32Array(3)
    result[0] = 78 // 'N'
    result[1] = 97 // 'a'
    result[2] = 78 // 'N'
    return result
  }

  if (value === f64.POSITIVE_INFINITY) {
    const result = new Int32Array(8)
    result[0] = 73 // 'I'
    result[1] = 110 // 'n'
    result[2] = 102 // 'f'
    result[3] = 105 // 'i'
    result[4] = 110 // 'n'
    result[5] = 105 // 'i'
    result[6] = 116 // 't'
    result[7] = 121 // 'y'
    return result
  }

  if (value === f64.NEGATIVE_INFINITY) {
    const result = new Int32Array(9)
    result[0] = CHAR_MINUS
    result[1] = 73
    result[2] = 110
    result[3] = 102
    result[4] = 105
    result[5] = 110
    result[6] = 105
    result[7] = 116
    result[8] = 121
    return result
  }

  const negative: bool = value < 0
  if (negative) value = -value

  // Round to specified decimal places
  const multiplier: f64 = Math.pow(10.0, <f64>decimals)
  value = Math.round(value * multiplier) / multiplier

  // Split into integer and fractional parts
  const intPart: i64 = <i64>Math.floor(value)
  const fracPart: f64 = value - <f64>intPart

  // Format integer part
  const intCodes = formatIntToCodes(intPart)
  const intLen: i32 = intCodes.length

  // Calculate total length
  let totalLen: i32 = intLen
  if (negative) totalLen++
  if (decimals > 0) totalLen += 1 + decimals // dot + decimal digits

  const result = new Int32Array(totalLen)
  let pos: i32 = 0

  if (negative) {
    result[pos] = CHAR_MINUS
    pos++
  }

  // Copy integer digits
  for (let i: i32 = 0; i < intLen; i++) {
    result[pos] = intCodes[i]
    pos++
  }

  // Add decimal part
  if (decimals > 0) {
    result[pos] = CHAR_DOT
    pos++

    let frac: f64 = fracPart
    for (let i: i32 = 0; i < decimals; i++) {
      frac *= 10.0
      const digit: i32 = <i32>Math.floor(frac) % 10
      result[pos] = CHAR_0 + digit
      pos++
    }
  }

  return result
}

/**
 * Compare two character code arrays lexicographically
 * @param a - First array
 * @param b - Second array
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareCodeArrays(a: Int32Array, b: Int32Array): i32 {
  const na: i32 = a.length
  const nb: i32 = b.length
  const minLen: i32 = na < nb ? na : nb

  for (let i: i32 = 0; i < minLen; i++) {
    if (a[i] < b[i]) return -1
    if (a[i] > b[i]) return 1
  }

  if (na < nb) return -1
  if (na > nb) return 1
  return 0
}

/**
 * Hash a character code array (simple FNV-1a hash)
 * @param codes - Array of character codes
 * @returns Hash value
 */
export function hashCodes(codes: Int32Array): u32 {
  const FNV_PRIME: u32 = 16777619
  const FNV_OFFSET: u32 = 2166136261

  let hash: u32 = FNV_OFFSET
  const n: i32 = codes.length

  for (let i: i32 = 0; i < n; i++) {
    hash ^= <u32>codes[i]
    hash *= FNV_PRIME
  }

  return hash
}

/**
 * Find pattern in text (character code arrays)
 * Returns index of first occurrence or -1 if not found
 * @param text - Text to search in
 * @param pattern - Pattern to search for
 * @returns Index of first occurrence, or -1
 */
export function findPattern(text: Int32Array, pattern: Int32Array): i32 {
  const textLen: i32 = text.length
  const patternLen: i32 = pattern.length

  if (patternLen === 0) return 0
  if (patternLen > textLen) return -1

  // Simple brute force search (could be optimized with KMP or Boyer-Moore)
  for (let i: i32 = 0; i <= textLen - patternLen; i++) {
    let match: bool = true

    for (let j: i32 = 0; j < patternLen; j++) {
      if (text[i + j] !== pattern[j]) {
        match = false
        break
      }
    }

    if (match) return i
  }

  return -1
}

/**
 * Count occurrences of pattern in text
 * @param text - Text to search in
 * @param pattern - Pattern to count
 * @returns Number of occurrences
 */
export function countPattern(text: Int32Array, pattern: Int32Array): i32 {
  const textLen: i32 = text.length
  const patternLen: i32 = pattern.length

  if (patternLen === 0) return 0
  if (patternLen > textLen) return 0

  let count: i32 = 0
  let i: i32 = 0

  while (i <= textLen - patternLen) {
    let match: bool = true

    for (let j: i32 = 0; j < patternLen; j++) {
      if (text[i + j] !== pattern[j]) {
        match = false
        break
      }
    }

    if (match) {
      count++
      i += patternLen // Non-overlapping
    } else {
      i++
    }
  }

  return count
}

/**
 * Get the byte length of a string when encoded as UTF-8
 * @param codes - Array of Unicode code points
 * @returns Byte length in UTF-8 encoding
 */
export function utf8ByteLength(codes: Int32Array): i32 {
  let byteLen: i32 = 0
  const n: i32 = codes.length

  for (let i: i32 = 0; i < n; i++) {
    const code: i32 = codes[i]
    if (code <= 0x7f) {
      byteLen += 1
    } else if (code <= 0x7ff) {
      byteLen += 2
    } else if (code <= 0xffff) {
      byteLen += 3
    } else {
      byteLen += 4
    }
  }

  return byteLen
}

/**
 * Check if string (as codes) represents a valid number
 * @param codes - Array of character codes
 * @returns 1 if valid number, 0 otherwise
 */
export function isNumericString(codes: Int32Array): i32 {
  const n: i32 = codes.length
  if (n === 0) return 0

  let i: i32 = 0

  // Skip whitespace
  while (i < n && isWhitespace(codes[i]) === 1) i++
  if (i >= n) return 0

  // Optional sign
  if (codes[i] === CHAR_MINUS || codes[i] === CHAR_PLUS) i++
  if (i >= n) return 0

  let hasDigit: bool = false

  // Integer part
  while (i < n && isDigit(codes[i]) === 1) {
    hasDigit = true
    i++
  }

  // Decimal part
  if (i < n && codes[i] === CHAR_DOT) {
    i++
    while (i < n && isDigit(codes[i]) === 1) {
      hasDigit = true
      i++
    }
  }

  if (!hasDigit) return 0

  // Exponent
  if (i < n && (codes[i] === CHAR_E || codes[i] === CHAR_e)) {
    i++
    if (i < n && (codes[i] === CHAR_MINUS || codes[i] === CHAR_PLUS)) i++
    if (i >= n || isDigit(codes[i]) === 0) return 0
    while (i < n && isDigit(codes[i]) === 1) i++
  }

  // Skip trailing whitespace
  while (i < n && isWhitespace(codes[i]) === 1) i++

  return i === n ? 1 : 0
}
