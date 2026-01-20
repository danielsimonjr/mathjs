/**
 * Direct tests for WASM-exported functions from src/wasm
 * These tests import directly from the compiled WASM module
 */
import assert from 'assert'
import * as wasm from '../../../../lib/wasm/index.js'

// Tolerance for floating point comparisons
const EPSILON = 1e-10

function approxEqual(actual: number, expected: number, tolerance = EPSILON): void {
  const diff = Math.abs(actual - expected)
  assert.ok(
    diff <= tolerance,
    `Expected ${actual} to be approximately equal to ${expected} (diff: ${diff})`
  )
}

describe('WASM Direct Tests', function () {
  describe('Complex Operations', function () {
    it('should compute arg (argument/phase)', function () {
      approxEqual(wasm.arg(1, 0), 0) // positive real
      approxEqual(wasm.arg(0, 1), Math.PI / 2) // positive imaginary
      approxEqual(wasm.arg(-1, 0), Math.PI) // negative real
      approxEqual(wasm.arg(0, -1), -Math.PI / 2) // negative imaginary
      approxEqual(wasm.arg(1, 1), Math.PI / 4) // 45 degrees
    })

    it('should compute conj (conjugate)', function () {
      const result = wasm.conj(3, 4)
      assert.strictEqual(result[0], 3) // real unchanged
      assert.strictEqual(result[1], -4) // imaginary negated
    })

    it('should compute re (real part)', function () {
      assert.strictEqual(wasm.re(3, 4), 3)
      assert.strictEqual(wasm.re(-5, 0), -5)
    })

    it('should compute im (imaginary part)', function () {
      assert.strictEqual(wasm.im(3, 4), 4)
      assert.strictEqual(wasm.im(0, -7), -7)
    })

    it('should compute abs (magnitude)', function () {
      approxEqual(wasm.abs(3, 4), 5) // 3-4-5 triangle
      approxEqual(wasm.abs(0, 1), 1)
      approxEqual(wasm.abs(1, 0), 1)
    })

    it('should multiply complex numbers', function () {
      // (2+3i) * (4+5i) = 8 + 10i + 12i + 15i^2 = 8 + 22i - 15 = -7 + 22i
      const result = wasm.mulComplex(2, 3, 4, 5)
      approxEqual(result[0], -7)
      approxEqual(result[1], 22)
    })

    it('should divide complex numbers', function () {
      // (1+0i) / (1+0i) = 1+0i
      const result = wasm.divComplex(1, 0, 1, 0)
      approxEqual(result[0], 1)
      approxEqual(result[1], 0)
    })
  })

  describe('Geometry Operations', function () {
    it('should compute 2D distance', function () {
      approxEqual(wasm.distance2D(0, 0, 3, 4), 5) // 3-4-5 triangle
      approxEqual(wasm.distance2D(1, 1, 4, 5), 5) // shifted
    })

    it('should compute 3D distance', function () {
      approxEqual(wasm.distance3D(0, 0, 0, 1, 2, 2), 3) // 1^2 + 2^2 + 2^2 = 9
    })

    it('should compute cross product', function () {
      // i x j = k: (1,0,0) x (0,1,0) = (0,0,1)
      const result = wasm.cross3D(1, 0, 0, 0, 1, 0)
      approxEqual(result[0], 0)
      approxEqual(result[1], 0)
      approxEqual(result[2], 1)
    })
  })

  describe('Logical Operations', function () {
    it('should compute AND', function () {
      assert.strictEqual(wasm.and(1, 1), 1)
      assert.strictEqual(wasm.and(1, 0), 0)
      assert.strictEqual(wasm.and(0, 1), 0)
      assert.strictEqual(wasm.and(0, 0), 0)
    })

    it('should compute OR', function () {
      assert.strictEqual(wasm.or(1, 1), 1)
      assert.strictEqual(wasm.or(1, 0), 1)
      assert.strictEqual(wasm.or(0, 1), 1)
      assert.strictEqual(wasm.or(0, 0), 0)
    })

    it('should compute NOT', function () {
      assert.strictEqual(wasm.not(1), 0)
      assert.strictEqual(wasm.not(0), 1)
    })

    it('should compute XOR', function () {
      assert.strictEqual(wasm.xor(1, 1), 0)
      assert.strictEqual(wasm.xor(1, 0), 1)
      assert.strictEqual(wasm.xor(0, 1), 1)
      assert.strictEqual(wasm.xor(0, 0), 0)
    })
  })

  describe('Relational Operations', function () {
    it('should compare values', function () {
      assert.strictEqual(wasm.compare(5, 3), 1) // 5 > 3
      assert.strictEqual(wasm.compare(3, 5), -1) // 3 < 5
      assert.strictEqual(wasm.compare(4, 4), 0) // 4 == 4
    })

    it('should check equal', function () {
      assert.strictEqual(wasm.equal(5, 5), 1)
      assert.strictEqual(wasm.equal(5, 3), 0)
    })

    it('should check larger', function () {
      assert.strictEqual(wasm.larger(5, 3), 1)
      assert.strictEqual(wasm.larger(3, 5), 0)
      assert.strictEqual(wasm.larger(5, 5), 0)
    })

    it('should check smaller', function () {
      assert.strictEqual(wasm.smaller(3, 5), 1)
      assert.strictEqual(wasm.smaller(5, 3), 0)
      assert.strictEqual(wasm.smaller(5, 5), 0)
    })

    it('should clamp values', function () {
      assert.strictEqual(wasm.clamp(5, 0, 10), 5) // within range
      assert.strictEqual(wasm.clamp(-5, 0, 10), 0) // below min
      assert.strictEqual(wasm.clamp(15, 0, 10), 10) // above max
    })
  })

  describe('Set Operations', function () {
    it('should create a set (sorted unique)', function () {
      const arr = new Float64Array([3, 1, 2, 1, 3])
      const set = wasm.createSet(arr)
      assert.strictEqual(set.length, 3)
      assert.strictEqual(set[0], 1)
      assert.strictEqual(set[1], 2)
      assert.strictEqual(set[2], 3)
    })

    it('should compute union', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const result = wasm.setUnion(a, b)
      assert.strictEqual(result.length, 4)
      assert.deepStrictEqual(Array.from(result), [1, 2, 3, 4])
    })

    it('should compute intersection', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const result = wasm.setIntersect(a, b)
      assert.strictEqual(result.length, 2)
      assert.deepStrictEqual(Array.from(result), [2, 3])
    })

    it('should compute difference', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const result = wasm.setDifference(a, b)
      assert.strictEqual(result.length, 1)
      assert.deepStrictEqual(Array.from(result), [1])
    })

    it('should check subset', function () {
      const a = new Float64Array([2, 3])
      const b = new Float64Array([1, 2, 3, 4])
      assert.strictEqual(wasm.setIsSubset(a, b), 1)
      assert.strictEqual(wasm.setIsSubset(b, a), 0)
    })
  })

  describe('Special Functions', function () {
    it('should compute erf (error function)', function () {
      approxEqual(wasm.erf(0), 0, 1e-7)
      approxEqual(wasm.erf(1), 0.8427007929497149, 1e-6)
      approxEqual(wasm.erf(-1), -0.8427007929497149, 1e-6)
    })

    it('should compute erfc (complementary error function)', function () {
      approxEqual(wasm.erfc(0), 1, 1e-7)
      approxEqual(wasm.erfc(1), 0.1572992070502851, 1e-6)
    })

    it('should compute gamma function', function () {
      approxEqual(wasm.gamma(1), 1, 1e-10) // gamma(1) = 0! = 1
      approxEqual(wasm.gamma(2), 1, 1e-10) // gamma(2) = 1! = 1
      approxEqual(wasm.gamma(3), 2, 1e-10) // gamma(3) = 2! = 2
      approxEqual(wasm.gamma(4), 6, 1e-10) // gamma(4) = 3! = 6
      approxEqual(wasm.gamma(5), 24, 1e-10) // gamma(5) = 4! = 24
    })

    it('should compute zeta function', function () {
      approxEqual(wasm.zeta(2), Math.PI * Math.PI / 6, 1e-3) // pi^2/6
      approxEqual(wasm.zeta(4), Math.pow(Math.PI, 4) / 90, 1e-3) // pi^4/90
    })

    it('should compute Bessel J0', function () {
      approxEqual(wasm.besselJ0(0), 1, 1e-8)
    })

    it('should compute Bessel J1', function () {
      approxEqual(wasm.besselJ1(0), 0, 1e-10)
    })
  })

  describe('String Operations', function () {
    it('should check if digit', function () {
      assert.strictEqual(wasm.isDigit(48), 1) // '0'
      assert.strictEqual(wasm.isDigit(57), 1) // '9'
      assert.strictEqual(wasm.isDigit(65), 0) // 'A'
    })

    it('should check if letter', function () {
      assert.strictEqual(wasm.isLetter(65), 1) // 'A'
      assert.strictEqual(wasm.isLetter(90), 1) // 'Z'
      assert.strictEqual(wasm.isLetter(97), 1) // 'a'
      assert.strictEqual(wasm.isLetter(122), 1) // 'z'
      assert.strictEqual(wasm.isLetter(48), 0) // '0'
    })

    it('should convert to lowercase code', function () {
      assert.strictEqual(wasm.toLowerCode(65), 97) // 'A' -> 'a'
      assert.strictEqual(wasm.toLowerCode(90), 122) // 'Z' -> 'z'
      assert.strictEqual(wasm.toLowerCode(97), 97) // 'a' -> 'a' (unchanged)
    })

    it('should convert to uppercase code', function () {
      assert.strictEqual(wasm.toUpperCode(97), 65) // 'a' -> 'A'
      assert.strictEqual(wasm.toUpperCode(122), 90) // 'z' -> 'Z'
      assert.strictEqual(wasm.toUpperCode(65), 65) // 'A' -> 'A' (unchanged)
    })

    it('should parse float from codes', function () {
      // "123.45" = [49, 50, 51, 46, 52, 53]
      const codes = new Int32Array([49, 50, 51, 46, 52, 53])
      approxEqual(wasm.parseFloatFromCodes(codes), 123.45)
    })

    it('should parse int from codes', function () {
      // "42" = [52, 50]
      const codes = new Int32Array([52, 50])
      assert.strictEqual(wasm.parseIntFromCodes(codes), 42)
    })
  })
})
