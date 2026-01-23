/**
 * WASM-optimized string/number operations using AssemblyScript
 * Note: Full string manipulation is better handled in JavaScript.
 * This module focuses on numeric parsing, formatting, and character operations.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
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
 * @param codesPtr - Pointer to array of character codes (i32)
 * @param n - Array length
 * @returns Parsed integer value, or NaN if invalid
 */
export function parseIntFromCodes(codesPtr: usize, n: i32): f64 {
  if (n === 0) return f64.NaN

  let i: i32 = 0
  let sign: f64 = 1.0

  // Skip leading whitespace
  while (i < n && isWhitespace(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
    i++
  }

  if (i >= n) return f64.NaN

  // Check for sign
  const firstCode: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
  if (firstCode === CHAR_MINUS) {
    sign = -1.0
    i++
  } else if (firstCode === CHAR_PLUS) {
    i++
  }

  if (i >= n || isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 0)
    return f64.NaN

  let result: f64 = 0.0

  while (i < n && isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
    result =
      result * 10.0 + <f64>(load<i32>(codesPtr + ((<usize>i) << 2)) - CHAR_0)
    i++
  }

  return sign * result
}

/**
 * Parse a float from character codes
 * @param codesPtr - Pointer to array of character codes (i32)
 * @param n - Array length
 * @returns Parsed float value, or NaN if invalid
 */
export function parseFloatFromCodes(codesPtr: usize, n: i32): f64 {
  if (n === 0) return f64.NaN

  let i: i32 = 0
  let sign: f64 = 1.0

  // Skip leading whitespace
  while (i < n && isWhitespace(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
    i++
  }

  if (i >= n) return f64.NaN

  // Check for sign
  const firstCode: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
  if (firstCode === CHAR_MINUS) {
    sign = -1.0
    i++
  } else if (firstCode === CHAR_PLUS) {
    i++
  }

  if (i >= n) return f64.NaN

  // Parse integer part
  let intPart: f64 = 0.0
  let hasIntPart: bool = false

  while (i < n && isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
    intPart =
      intPart * 10.0 + <f64>(load<i32>(codesPtr + ((<usize>i) << 2)) - CHAR_0)
    hasIntPart = true
    i++
  }

  // Parse decimal part
  let fracPart: f64 = 0.0
  let fracDiv: f64 = 1.0
  let hasFracPart: bool = false

  if (i < n && load<i32>(codesPtr + ((<usize>i) << 2)) === CHAR_DOT) {
    i++
    while (i < n && isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
      fracPart =
        fracPart * 10.0 +
        <f64>(load<i32>(codesPtr + ((<usize>i) << 2)) - CHAR_0)
      fracDiv *= 10.0
      hasFracPart = true
      i++
    }
  }

  if (!hasIntPart && !hasFracPart) return f64.NaN

  let result: f64 = intPart + fracPart / fracDiv

  // Parse exponent
  if (i < n) {
    const expChar: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
    if (expChar === CHAR_E || expChar === CHAR_e) {
      i++

      let expSign: f64 = 1.0
      if (i < n) {
        const expSignChar: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
        if (expSignChar === CHAR_MINUS) {
          expSign = -1.0
          i++
        } else if (expSignChar === CHAR_PLUS) {
          i++
        }
      }

      let exp: f64 = 0.0
      while (i < n && isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
        exp =
          exp * 10.0 + <f64>(load<i32>(codesPtr + ((<usize>i) << 2)) - CHAR_0)
        i++
      }

      result *= Math.pow(10.0, expSign * exp)
    }
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
 * @param resultPtr - Pointer to output array (i32)
 * @returns Number of characters written
 */
export function formatIntToCodes(value: i64, resultPtr: usize): i32 {
  if (value === 0) {
    store<i32>(resultPtr, CHAR_0)
    return 1
  }

  const negative: bool = value < 0
  if (negative) value = -value

  const numDigits: i32 = countDigits(value)
  const totalLen: i32 = negative ? numDigits + 1 : numDigits

  let i: i32 = totalLen - 1
  while (value > 0) {
    store<i32>(resultPtr + ((<usize>i) << 2), CHAR_0 + <i32>(value % 10))
    value = value / 10
    i--
  }

  if (negative) {
    store<i32>(resultPtr, CHAR_MINUS)
  }

  return totalLen
}

/**
 * Format a float with fixed decimal places as character codes
 * @param value - Float value
 * @param decimals - Number of decimal places
 * @param resultPtr - Pointer to output array (i32)
 * @returns Number of characters written
 */
export function formatFloatToCodes(
  value: f64,
  decimals: i32,
  resultPtr: usize
): i32 {
  // Handle special cases
  if (value !== value) {
    // NaN
    store<i32>(resultPtr, 78) // 'N'
    store<i32>(resultPtr + 4, 97) // 'a'
    store<i32>(resultPtr + 8, 78) // 'N'
    return 3
  }

  if (value === f64.POSITIVE_INFINITY) {
    store<i32>(resultPtr, 73) // 'I'
    store<i32>(resultPtr + 4, 110) // 'n'
    store<i32>(resultPtr + 8, 102) // 'f'
    store<i32>(resultPtr + 12, 105) // 'i'
    store<i32>(resultPtr + 16, 110) // 'n'
    store<i32>(resultPtr + 20, 105) // 'i'
    store<i32>(resultPtr + 24, 116) // 't'
    store<i32>(resultPtr + 28, 121) // 'y'
    return 8
  }

  if (value === f64.NEGATIVE_INFINITY) {
    store<i32>(resultPtr, CHAR_MINUS)
    store<i32>(resultPtr + 4, 73)
    store<i32>(resultPtr + 8, 110)
    store<i32>(resultPtr + 12, 102)
    store<i32>(resultPtr + 16, 105)
    store<i32>(resultPtr + 20, 110)
    store<i32>(resultPtr + 24, 105)
    store<i32>(resultPtr + 28, 116)
    store<i32>(resultPtr + 32, 121)
    return 9
  }

  const negative: bool = value < 0
  if (negative) value = -value

  // Round to specified decimal places
  const multiplier: f64 = Math.pow(10.0, <f64>decimals)
  value = Math.round(value * multiplier) / multiplier

  // Split into integer and fractional parts
  const intPart: i64 = <i64>Math.floor(value)
  const fracPart: f64 = value - <f64>intPart

  let pos: i32 = 0

  if (negative) {
    store<i32>(resultPtr, CHAR_MINUS)
    pos++
  }

  // Format integer part
  const intLen: i32 = formatIntToCodes(intPart, resultPtr + ((<usize>pos) << 2))
  pos += intLen

  // Add decimal part
  if (decimals > 0) {
    store<i32>(resultPtr + ((<usize>pos) << 2), CHAR_DOT)
    pos++

    let frac: f64 = fracPart
    for (let i: i32 = 0; i < decimals; i++) {
      frac *= 10.0
      const digit: i32 = <i32>Math.floor(frac) % 10
      store<i32>(resultPtr + ((<usize>pos) << 2), CHAR_0 + digit)
      pos++
    }
  }

  return pos
}

/**
 * Compare two character code arrays lexicographically
 * @param aPtr - Pointer to first array (i32)
 * @param na - Length of first array
 * @param bPtr - Pointer to second array (i32)
 * @param nb - Length of second array
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareCodeArrays(
  aPtr: usize,
  na: i32,
  bPtr: usize,
  nb: i32
): i32 {
  const minLen: i32 = na < nb ? na : nb

  for (let i: i32 = 0; i < minLen; i++) {
    const offset: usize = (<usize>i) << 2
    const aVal: i32 = load<i32>(aPtr + offset)
    const bVal: i32 = load<i32>(bPtr + offset)
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
  }

  if (na < nb) return -1
  if (na > nb) return 1
  return 0
}

/**
 * Hash a character code array (simple FNV-1a hash)
 * @param codesPtr - Pointer to array of character codes (i32)
 * @param n - Array length
 * @returns Hash value
 */
export function hashCodes(codesPtr: usize, n: i32): u32 {
  const FNV_PRIME: u32 = 16777619
  const FNV_OFFSET: u32 = 2166136261

  let hash: u32 = FNV_OFFSET

  for (let i: i32 = 0; i < n; i++) {
    hash ^= <u32>load<i32>(codesPtr + ((<usize>i) << 2))
    hash *= FNV_PRIME
  }

  return hash
}

/**
 * Find pattern in text (character code arrays)
 * Returns index of first occurrence or -1 if not found
 * @param textPtr - Pointer to text array (i32)
 * @param textLen - Length of text
 * @param patternPtr - Pointer to pattern array (i32)
 * @param patternLen - Length of pattern
 * @returns Index of first occurrence, or -1
 */
export function findPattern(
  textPtr: usize,
  textLen: i32,
  patternPtr: usize,
  patternLen: i32
): i32 {
  if (patternLen === 0) return 0
  if (patternLen > textLen) return -1

  // Simple brute force search (could be optimized with KMP or Boyer-Moore)
  for (let i: i32 = 0; i <= textLen - patternLen; i++) {
    let match: bool = true

    for (let j: i32 = 0; j < patternLen; j++) {
      if (
        load<i32>(textPtr + ((<usize>(i + j)) << 2)) !==
        load<i32>(patternPtr + ((<usize>j) << 2))
      ) {
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
 * @param textPtr - Pointer to text array (i32)
 * @param textLen - Length of text
 * @param patternPtr - Pointer to pattern array (i32)
 * @param patternLen - Length of pattern
 * @returns Number of occurrences
 */
export function countPattern(
  textPtr: usize,
  textLen: i32,
  patternPtr: usize,
  patternLen: i32
): i32 {
  if (patternLen === 0) return 0
  if (patternLen > textLen) return 0

  let count: i32 = 0
  let i: i32 = 0

  while (i <= textLen - patternLen) {
    let match: bool = true

    for (let j: i32 = 0; j < patternLen; j++) {
      if (
        load<i32>(textPtr + ((<usize>(i + j)) << 2)) !==
        load<i32>(patternPtr + ((<usize>j) << 2))
      ) {
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
 * @param codesPtr - Pointer to array of Unicode code points (i32)
 * @param n - Array length
 * @returns Byte length in UTF-8 encoding
 */
export function utf8ByteLength(codesPtr: usize, n: i32): i32 {
  let byteLen: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    const code: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
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
 * @param codesPtr - Pointer to array of character codes (i32)
 * @param n - Array length
 * @returns 1 if valid number, 0 otherwise
 */
export function isNumericString(codesPtr: usize, n: i32): i32 {
  if (n === 0) return 0

  let i: i32 = 0

  // Skip whitespace
  while (i < n && isWhitespace(load<i32>(codesPtr + ((<usize>i) << 2))) === 1)
    i++
  if (i >= n) return 0

  // Optional sign
  const signChar: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
  if (signChar === CHAR_MINUS || signChar === CHAR_PLUS) i++
  if (i >= n) return 0

  let hasDigit: bool = false

  // Integer part
  while (i < n && isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
    hasDigit = true
    i++
  }

  // Decimal part
  if (i < n && load<i32>(codesPtr + ((<usize>i) << 2)) === CHAR_DOT) {
    i++
    while (i < n && isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 1) {
      hasDigit = true
      i++
    }
  }

  if (!hasDigit) return 0

  // Exponent
  if (i < n) {
    const expChar: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
    if (expChar === CHAR_E || expChar === CHAR_e) {
      i++
      if (i < n) {
        const expSignChar: i32 = load<i32>(codesPtr + ((<usize>i) << 2))
        if (expSignChar === CHAR_MINUS || expSignChar === CHAR_PLUS) i++
      }
      if (i >= n || isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 0)
        return 0
      while (i < n && isDigit(load<i32>(codesPtr + ((<usize>i) << 2))) === 1)
        i++
    }
  }

  // Skip trailing whitespace
  while (i < n && isWhitespace(load<i32>(codesPtr + ((<usize>i) << 2))) === 1)
    i++

  return i === n ? 1 : 0
}
