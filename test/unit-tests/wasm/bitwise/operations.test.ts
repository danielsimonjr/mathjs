import assert from 'assert'
import {
  bitAnd,
  bitOr,
  bitXor,
  bitNot,
  leftShift,
  rightArithShift,
  rightLogShift,
  popcount
  // Functions using AssemblyScript built-ins (i32.ctz, i32.clz, i32.rotl, i32.rotr, unchecked)
  // are tested via compiled WASM modules:
  // ctz, clz, rotl, rotr, bitAndArray, bitOrArray, bitXorArray, bitNotArray,
  // leftShiftArray, rightArithShiftArray, rightLogShiftArray
} from '../../../../src/wasm/bitwise/operations.ts'

describe('wasm/bitwise/operations', function () {
  describe('bitAnd', function () {
    it('should AND two numbers', function () {
      assert.strictEqual(bitAnd(0b1100, 0b1010), 0b1000)
    })

    it('should return 0 when ANDing with 0', function () {
      assert.strictEqual(bitAnd(0xFF, 0), 0)
    })

    it('should return same value when ANDing with all 1s', function () {
      assert.strictEqual(bitAnd(0b1010, 0b1111), 0b1010)
    })

    it('should handle negative numbers', function () {
      assert.strictEqual(bitAnd(-1, 0xFF), 0xFF)
    })
  })

  describe('bitOr', function () {
    it('should OR two numbers', function () {
      assert.strictEqual(bitOr(0b1100, 0b1010), 0b1110)
    })

    it('should return same value when ORing with 0', function () {
      assert.strictEqual(bitOr(0b1010, 0), 0b1010)
    })

    it('should return all 1s when ORing with all 1s', function () {
      assert.strictEqual(bitOr(0, -1), -1)
    })
  })

  describe('bitXor', function () {
    it('should XOR two numbers', function () {
      assert.strictEqual(bitXor(0b1100, 0b1010), 0b0110)
    })

    it('should return same value when XORing with 0', function () {
      assert.strictEqual(bitXor(0b1010, 0), 0b1010)
    })

    it('should return 0 when XORing same numbers', function () {
      assert.strictEqual(bitXor(0b1010, 0b1010), 0)
    })

    it('should flip all bits when XORing with all 1s', function () {
      assert.strictEqual(bitXor(0b1010, 0b1111), 0b0101)
    })
  })

  describe('bitNot', function () {
    it('should flip all bits', function () {
      assert.strictEqual(bitNot(0), -1)
    })

    it('should flip bits of positive number', function () {
      assert.strictEqual(bitNot(0b1010), ~0b1010)
    })

    it('should be self-inverse', function () {
      assert.strictEqual(bitNot(bitNot(42)), 42)
    })
  })

  describe('leftShift', function () {
    it('should shift bits left', function () {
      assert.strictEqual(leftShift(1, 4), 16)
    })

    it('should multiply by powers of 2', function () {
      assert.strictEqual(leftShift(5, 3), 40) // 5 * 8
    })

    it('should return 0 when shifting 0', function () {
      assert.strictEqual(leftShift(0, 10), 0)
    })

    it('should handle shift by 0', function () {
      assert.strictEqual(leftShift(42, 0), 42)
    })
  })

  describe('rightArithShift', function () {
    it('should shift bits right', function () {
      assert.strictEqual(rightArithShift(16, 4), 1)
    })

    it('should divide by powers of 2', function () {
      assert.strictEqual(rightArithShift(40, 3), 5) // 40 / 8
    })

    it('should preserve sign for negative numbers', function () {
      assert.strictEqual(rightArithShift(-8, 2), -2)
    })

    it('should handle shift by 0', function () {
      assert.strictEqual(rightArithShift(42, 0), 42)
    })
  })

  describe('rightLogShift', function () {
    it('should shift bits right with zero fill', function () {
      assert.strictEqual(rightLogShift(16, 4), 1)
    })

    it('should not preserve sign', function () {
      // -1 in 32-bit is all 1s, shifting right by 1 gives a large positive number
      const result = rightLogShift(-1, 1)
      assert(result > 0)
      assert.strictEqual(result, 0x7FFFFFFF)
    })

    it('should handle shift by 0', function () {
      assert.strictEqual(rightLogShift(42, 0), 42)
    })
  })

  describe('popcount', function () {
    it('should count 0 bits in 0', function () {
      assert.strictEqual(popcount(0), 0)
    })

    it('should count 1 bit', function () {
      assert.strictEqual(popcount(1), 1)
      assert.strictEqual(popcount(2), 1)
      assert.strictEqual(popcount(4), 1)
    })

    it('should count multiple bits', function () {
      assert.strictEqual(popcount(0b1010), 2)
      assert.strictEqual(popcount(0b1111), 4)
      assert.strictEqual(popcount(0b11111111), 8)
    })

    it('should count all 32 bits for -1', function () {
      assert.strictEqual(popcount(-1), 32)
    })
  })

  // Note: ctz, clz, rotl, rotr use AssemblyScript's i32 built-ins
  // and array functions use `unchecked`. These must be tested via compiled WASM.
})
