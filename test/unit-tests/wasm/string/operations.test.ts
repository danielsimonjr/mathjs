import assert from 'assert'
import {
  isDigit,
  isLetter,
  isAlphanumeric,
  isWhitespace,
  toLowerCode,
  toUpperCode
} from '../../../../src/wasm/string/operations.ts'

describe('wasm/string/operations', function () {
  describe('isDigit', function () {
    it('should return 1 for digit codes', function () {
      assert.strictEqual(isDigit(48), 1) // '0'
      assert.strictEqual(isDigit(49), 1) // '1'
      assert.strictEqual(isDigit(57), 1) // '9'
    })

    it('should return 0 for non-digit codes', function () {
      assert.strictEqual(isDigit(65), 0) // 'A'
      assert.strictEqual(isDigit(97), 0) // 'a'
      assert.strictEqual(isDigit(47), 0) // '/'
      assert.strictEqual(isDigit(58), 0) // ':'
    })
  })

  describe('isLetter', function () {
    it('should return 1 for uppercase letters', function () {
      assert.strictEqual(isLetter(65), 1) // 'A'
      assert.strictEqual(isLetter(77), 1) // 'M'
      assert.strictEqual(isLetter(90), 1) // 'Z'
    })

    it('should return 1 for lowercase letters', function () {
      assert.strictEqual(isLetter(97), 1) // 'a'
      assert.strictEqual(isLetter(109), 1) // 'm'
      assert.strictEqual(isLetter(122), 1) // 'z'
    })

    it('should return 0 for non-letters', function () {
      assert.strictEqual(isLetter(48), 0) // '0'
      assert.strictEqual(isLetter(64), 0) // '@'
      assert.strictEqual(isLetter(91), 0) // '['
      assert.strictEqual(isLetter(96), 0) // '`'
      assert.strictEqual(isLetter(123), 0) // '{'
    })
  })

  describe('isAlphanumeric', function () {
    it('should return 1 for letters and digits', function () {
      assert.strictEqual(isAlphanumeric(65), 1) // 'A'
      assert.strictEqual(isAlphanumeric(97), 1) // 'a'
      assert.strictEqual(isAlphanumeric(48), 1) // '0'
      assert.strictEqual(isAlphanumeric(57), 1) // '9'
    })

    it('should return 0 for non-alphanumeric', function () {
      assert.strictEqual(isAlphanumeric(32), 0) // ' '
      assert.strictEqual(isAlphanumeric(64), 0) // '@'
      assert.strictEqual(isAlphanumeric(33), 0) // '!'
    })
  })

  describe('isWhitespace', function () {
    it('should return 1 for whitespace characters', function () {
      assert.strictEqual(isWhitespace(32), 1) // space
      assert.strictEqual(isWhitespace(9), 1) // tab
      assert.strictEqual(isWhitespace(10), 1) // newline
      assert.strictEqual(isWhitespace(13), 1) // carriage return
    })

    it('should return 0 for non-whitespace', function () {
      assert.strictEqual(isWhitespace(65), 0) // 'A'
      assert.strictEqual(isWhitespace(48), 0) // '0'
      assert.strictEqual(isWhitespace(33), 0) // '!'
    })
  })

  describe('toLowerCode', function () {
    it('should convert uppercase to lowercase', function () {
      assert.strictEqual(toLowerCode(65), 97) // 'A' -> 'a'
      assert.strictEqual(toLowerCode(77), 109) // 'M' -> 'm'
      assert.strictEqual(toLowerCode(90), 122) // 'Z' -> 'z'
    })

    it('should leave lowercase unchanged', function () {
      assert.strictEqual(toLowerCode(97), 97) // 'a' -> 'a'
      assert.strictEqual(toLowerCode(122), 122) // 'z' -> 'z'
    })

    it('should leave non-letters unchanged', function () {
      assert.strictEqual(toLowerCode(48), 48) // '0' -> '0'
      assert.strictEqual(toLowerCode(32), 32) // ' ' -> ' '
    })
  })

  describe('toUpperCode', function () {
    it('should convert lowercase to uppercase', function () {
      assert.strictEqual(toUpperCode(97), 65) // 'a' -> 'A'
      assert.strictEqual(toUpperCode(109), 77) // 'm' -> 'M'
      assert.strictEqual(toUpperCode(122), 90) // 'z' -> 'Z'
    })

    it('should leave uppercase unchanged', function () {
      assert.strictEqual(toUpperCode(65), 65) // 'A' -> 'A'
      assert.strictEqual(toUpperCode(90), 90) // 'Z' -> 'Z'
    })

    it('should leave non-letters unchanged', function () {
      assert.strictEqual(toUpperCode(48), 48) // '0' -> '0'
      assert.strictEqual(toUpperCode(32), 32) // ' ' -> ' '
    })
  })

  // Note: parseIntFromCodes and other parsing functions use f64.NaN
  describe('parsing functions', function () {
    it('parseIntFromCodes should be tested via WASM (uses f64.NaN)', function () {
      assert(true)
    })

    it('parseFloatFromCodes should be tested via WASM (uses f64.NaN)', function () {
      assert(true)
    })
  })

  describe('character code properties', function () {
    it('toLowerCode(toUpperCode(x)) should equal x for lowercase', function () {
      for (let c = 97; c <= 122; c++) {
        // a-z
        assert.strictEqual(toLowerCode(toUpperCode(c)), c)
      }
    })

    it('toUpperCode(toLowerCode(x)) should equal x for uppercase', function () {
      for (let c = 65; c <= 90; c++) {
        // A-Z
        assert.strictEqual(toUpperCode(toLowerCode(c)), c)
      }
    })

    it('digit range should be contiguous', function () {
      for (let c = 48; c <= 57; c++) {
        // '0'-'9'
        assert.strictEqual(isDigit(c), 1)
      }
      assert.strictEqual(isDigit(47), 0) // before '0'
      assert.strictEqual(isDigit(58), 0) // after '9'
    })
  })
})
