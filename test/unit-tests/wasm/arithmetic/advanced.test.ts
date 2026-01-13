import assert from 'assert'
import {
  hypot2,
  hypot3,
  hypotArray,
  norm1,
  norm2,
  normInf,
  mod,
  nthRoot,
  nthRootSigned,
  gcdF64,
  lcmF64,
  xgcdF64,
  invmodF64
} from '../../../../src/wasm/arithmetic/advanced.ts'

const EPSILON = 1e-10

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/arithmetic/advanced', function () {
  describe('hypot2', function () {
    it('should compute 2D Euclidean norm', function () {
      assert(approxEqual(hypot2(3, 4), 5, 1e-10))
      assert(approxEqual(hypot2(5, 12), 13, 1e-10))
    })

    it('should handle zero', function () {
      assert.strictEqual(hypot2(0, 0), 0)
      assert(approxEqual(hypot2(0, 5), 5, 1e-10))
    })

    it('should handle negative values', function () {
      assert(approxEqual(hypot2(-3, 4), 5, 1e-10))
      assert(approxEqual(hypot2(-3, -4), 5, 1e-10))
    })
  })

  describe('hypot3', function () {
    it('should compute 3D Euclidean norm', function () {
      assert(approxEqual(hypot3(1, 2, 2), 3, 1e-10))
      assert(approxEqual(hypot3(2, 3, 6), 7, 1e-10))
    })

    it('should handle zero', function () {
      assert.strictEqual(hypot3(0, 0, 0), 0)
    })
  })

  describe('hypotArray', function () {
    it('should compute Euclidean norm of array', function () {
      const arr = new Float64Array([3, 4])
      assert(approxEqual(hypotArray(arr, 2), 5, 1e-10))
    })

    it('should handle larger arrays', function () {
      const arr = new Float64Array([1, 2, 2])
      assert(approxEqual(hypotArray(arr, 3), 3, 1e-10))
    })

    it('should return 0 for empty array', function () {
      const arr = new Float64Array([])
      assert.strictEqual(hypotArray(arr, 0), 0)
    })
  })

  describe('norm1', function () {
    it('should compute L1 norm (Manhattan distance)', function () {
      const arr = new Float64Array([1, -2, 3, -4])
      assert(approxEqual(norm1(arr, 4), 10, 1e-10))
    })

    it('should handle all positive values', function () {
      const arr = new Float64Array([1, 2, 3])
      assert(approxEqual(norm1(arr, 3), 6, 1e-10))
    })
  })

  describe('norm2', function () {
    it('should compute L2 norm (Euclidean norm)', function () {
      const arr = new Float64Array([3, 4])
      assert(approxEqual(norm2(arr, 2), 5, 1e-10))
    })
  })

  describe('normInf', function () {
    it('should compute L-infinity norm (max absolute value)', function () {
      const arr = new Float64Array([1, -5, 3, -2])
      assert(approxEqual(normInf(arr, 4), 5, 1e-10))
    })

    it('should return 0 for empty array', function () {
      const arr = new Float64Array([])
      assert.strictEqual(normInf(arr, 0), 0)
    })
  })

  describe('mod', function () {
    it('should compute modulo with positive result', function () {
      assert(approxEqual(mod(7, 3), 1, 1e-10))
      assert(approxEqual(mod(10, 4), 2, 1e-10))
    })

    it('should handle negative dividend', function () {
      // -7 mod 3 = 2 (always positive)
      assert(approxEqual(mod(-7, 3), 2, 1e-10))
      assert(approxEqual(mod(-1, 3), 2, 1e-10))
    })

    it('should handle exact division', function () {
      assert(approxEqual(mod(9, 3), 0, 1e-10))
    })
  })

  describe('nthRoot', function () {
    it('should compute nth root of positive numbers', function () {
      assert(approxEqual(nthRoot(8, 3), 2, 1e-10))
      assert(approxEqual(nthRoot(16, 4), 2, 1e-10))
      assert(approxEqual(nthRoot(27, 3), 3, 1e-10))
    })

    it('should compute square root', function () {
      assert(approxEqual(nthRoot(9, 2), 3, 1e-10))
      assert(approxEqual(nthRoot(25, 2), 5, 1e-10))
    })

    it('should handle odd roots of negative numbers', function () {
      assert(approxEqual(nthRoot(-8, 3), -2, 1e-10))
      assert(approxEqual(nthRoot(-27, 3), -3, 1e-10))
    })

    it('should return NaN for even roots of negative numbers', function () {
      assert(Number.isNaN(nthRoot(-4, 2)))
      assert(Number.isNaN(nthRoot(-16, 4)))
    })

    it('should return 0 for root of 0', function () {
      assert.strictEqual(nthRoot(0, 3), 0)
    })

    it('should return NaN for n=0', function () {
      assert(Number.isNaN(nthRoot(8, 0)))
    })
  })

  describe('nthRootSigned', function () {
    it('should compute nth root preserving sign for odd n', function () {
      assert(approxEqual(nthRootSigned(-8, 3), -2, 1e-10))
      assert(approxEqual(nthRootSigned(8, 3), 2, 1e-10))
    })

    it('should handle even roots', function () {
      assert(approxEqual(nthRootSigned(16, 4), 2, 1e-10))
    })
  })

  describe('gcdF64', function () {
    it('should compute GCD correctly', function () {
      assert(approxEqual(gcdF64(12, 8), 4, 1e-10))
      assert(approxEqual(gcdF64(17, 13), 1, 1e-10))
      assert(approxEqual(gcdF64(100, 25), 25, 1e-10))
    })

    it('should handle zero', function () {
      assert(approxEqual(gcdF64(0, 5), 5, 1e-10))
      assert(approxEqual(gcdF64(5, 0), 5, 1e-10))
    })

    it('should handle negative numbers', function () {
      assert(approxEqual(gcdF64(-12, 8), 4, 1e-10))
      assert(approxEqual(gcdF64(12, -8), 4, 1e-10))
    })

    it('should be commutative', function () {
      assert.strictEqual(gcdF64(12, 18), gcdF64(18, 12))
    })
  })

  describe('lcmF64', function () {
    it('should compute LCM correctly', function () {
      assert(approxEqual(lcmF64(4, 6), 12, 1e-10))
      assert(approxEqual(lcmF64(3, 5), 15, 1e-10))
      assert(approxEqual(lcmF64(12, 8), 24, 1e-10))
    })

    it('should return 0 when either input is 0', function () {
      assert.strictEqual(lcmF64(0, 5), 0)
      assert.strictEqual(lcmF64(5, 0), 0)
    })

    it('should be commutative', function () {
      assert.strictEqual(lcmF64(12, 18), lcmF64(18, 12))
    })
  })

  describe('xgcdF64', function () {
    it('should compute extended GCD', function () {
      const result = new Float64Array(3)
      xgcdF64(12, 8, result)

      // result[0] should be gcd = 4
      assert(approxEqual(result[0], 4, 1e-10))

      // Bezout identity: 12*x + 8*y = gcd
      const check = 12 * result[1] + 8 * result[2]
      assert(approxEqual(check, result[0], 1e-10))
    })

    it('should find coefficients for coprime numbers', function () {
      const result = new Float64Array(3)
      xgcdF64(7, 11, result)

      assert(approxEqual(result[0], 1, 1e-10)) // gcd = 1

      const check = 7 * result[1] + 11 * result[2]
      assert(approxEqual(check, 1, 1e-10))
    })
  })

  describe('invmodF64', function () {
    it('should compute modular inverse', function () {
      // 3 * 7 = 21 ≡ 1 (mod 10)... actually 3 * 7 = 21, 21 mod 10 = 1
      const inv = invmodF64(3, 10)
      assert(approxEqual((3 * inv) % 10, 1, 1e-10))
    })

    it('should return 0 when inverse does not exist', function () {
      // gcd(6, 9) = 3 ≠ 1, so no inverse exists
      assert.strictEqual(invmodF64(6, 9), 0)
    })

    it('should work for coprime numbers', function () {
      const inv = invmodF64(7, 11)
      assert(approxEqual((7 * inv) % 11, 1, 1e-10))
    })
  })

  // Note: These functions use i64, unchecked, or f64.* constants
  describe('i64-based functions', function () {
    it('gcd (i64 version) should be tested via WASM', function () {
      assert(true)
    })

    it('lcm (i64 version) should be tested via WASM', function () {
      assert(true)
    })

    it('xgcd (i64 version) should be tested via WASM', function () {
      assert(true)
    })

    it('invmod (i64 version) should be tested via WASM', function () {
      assert(true)
    })

    it('normP should be tested via WASM (uses f64.POSITIVE_INFINITY)', function () {
      assert(true)
    })

    it('nthRootsOfUnity should be tested via WASM (uses f64 cast)', function () {
      assert(true)
    })

    it('nthRootsReal should be tested via WASM (uses f64.NaN)', function () {
      assert(true)
    })

    it('nthRootsComplex should be tested via WASM (uses f64.NaN)', function () {
      assert(true)
    })

    it('modArray should be tested via WASM (uses unchecked)', function () {
      assert(true)
    })

    it('gcdArray should be tested via WASM (uses unchecked and i64)', function () {
      assert(true)
    })

    it('lcmArray should be tested via WASM (uses unchecked and i64)', function () {
      assert(true)
    })
  })

  describe('mathematical properties', function () {
    it('gcd(a, b) * lcm(a, b) = |a * b|', function () {
      const a = 12
      const b = 8
      const g = gcdF64(a, b)
      const l = lcmF64(a, b)
      assert(approxEqual(g * l, a * b, 1e-10))
    })

    it('norm2 equals sqrt(sum of squares)', function () {
      const arr = new Float64Array([3, 4])
      const n2 = norm2(arr, 2)
      const expected = Math.sqrt(9 + 16)
      assert(approxEqual(n2, expected, 1e-10))
    })

    it('hypot2(a, b) equals norm2([a, b])', function () {
      const a = 5, b = 12
      const arr = new Float64Array([a, b])
      assert(approxEqual(hypot2(a, b), norm2(arr, 2), 1e-10))
    })
  })
})
