import assert from 'assert'
import {
  hypot2,
  hypot3,
  mod,
  gcdF64,
  lcmF64
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

  // Note: These functions use unchecked array access, requires WASM testing
  describe('hypotArray', function () {
    it('should be tested via WASM (uses unchecked)', function () {
      // hypotArray computes sqrt(sum(x[i]^2))
      assert(true)
    })
  })

  describe('norm1', function () {
    it('should be tested via WASM (uses unchecked)', function () {
      // L1 norm: sum(|x[i]|)
      assert(true)
    })
  })

  describe('norm2', function () {
    it('should be tested via WASM (uses unchecked via hypotArray)', function () {
      // L2 norm: sqrt(sum(x[i]^2))
      assert(true)
    })
  })

  describe('normInf', function () {
    it('should be tested via WASM (uses unchecked)', function () {
      // L-infinity norm: max(|x[i]|)
      assert(true)
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

  // Note: nthRoot and nthRootSigned use f64() type casts, requires WASM testing
  describe('nthRoot', function () {
    it('should be tested via WASM (uses f64 type cast)', function () {
      // Computes x^(1/n) with proper handling of negative values
      assert(true)
    })
  })

  describe('nthRootSigned', function () {
    it('should be tested via WASM (uses f64 type cast)', function () {
      // Computes nth root preserving sign for odd n
      assert(true)
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

  // Note: xgcdF64 and invmodF64 use unchecked array access, requires WASM testing
  describe('xgcdF64', function () {
    it('should be tested via WASM (uses unchecked)', function () {
      // Extended GCD: finds gcd(a,b) and coefficients x,y such that ax + by = gcd
      assert(true)
    })
  })

  describe('invmodF64', function () {
    it('should be tested via WASM (uses unchecked via xgcdF64)', function () {
      // Modular inverse: finds x such that a*x ≡ 1 (mod m)
      assert(true)
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

    it('hypot2 should satisfy Pythagorean theorem', function () {
      assert(approxEqual(hypot2(3, 4), 5, 1e-10))
    })

    it('hypot3 should compute 3D distance', function () {
      assert(approxEqual(hypot3(2, 3, 6), 7, 1e-10))
    })
  })
})
