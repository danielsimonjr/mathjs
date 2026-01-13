import assert from 'assert'
import {
  exp,
  expm1,
  log,
  log10,
  log2,
  log1p,
  logBase,
  nthRoot,
  sqrt,
  pow
  // Array functions use AssemblyScript's `unchecked` and are tested via WASM:
  // expArray, logArray, log10Array, log2Array, sqrtArray, powConstantArray
} from '../../../../src/wasm/arithmetic/logarithmic.ts'

describe('wasm/arithmetic/logarithmic', function () {
  const EPSILON = 1e-10

  describe('exp', function () {
    it('should calculate e^0 = 1', function () {
      assert.strictEqual(exp(0), 1)
    })

    it('should calculate e^1 = e', function () {
      assert(Math.abs(exp(1) - Math.E) < EPSILON)
    })

    it('should calculate e^-1', function () {
      assert(Math.abs(exp(-1) - 1 / Math.E) < EPSILON)
    })

    it('should handle large values', function () {
      assert(Math.abs(exp(10) - Math.exp(10)) < 1e-5)
    })
  })

  describe('expm1', function () {
    it('should calculate e^0 - 1 = 0', function () {
      assert.strictEqual(expm1(0), 0)
    })

    it('should be accurate for small x', function () {
      const small = 1e-10
      assert(Math.abs(expm1(small) - small) < 1e-15)
    })

    it('should calculate expm1(1)', function () {
      assert(Math.abs(expm1(1) - (Math.E - 1)) < EPSILON)
    })
  })

  describe('log', function () {
    it('should calculate ln(1) = 0', function () {
      assert.strictEqual(log(1), 0)
    })

    it('should calculate ln(e) = 1', function () {
      assert(Math.abs(log(Math.E) - 1) < EPSILON)
    })

    it('should return NaN for negative values', function () {
      assert(isNaN(log(-1)))
    })

    it('should return -Infinity for 0', function () {
      assert.strictEqual(log(0), -Infinity)
    })
  })

  describe('log10', function () {
    it('should calculate log10(1) = 0', function () {
      assert.strictEqual(log10(1), 0)
    })

    it('should calculate log10(10) = 1', function () {
      assert(Math.abs(log10(10) - 1) < EPSILON)
    })

    it('should calculate log10(100) = 2', function () {
      assert(Math.abs(log10(100) - 2) < EPSILON)
    })
  })

  describe('log2', function () {
    it('should calculate log2(1) = 0', function () {
      assert.strictEqual(log2(1), 0)
    })

    it('should calculate log2(2) = 1', function () {
      assert(Math.abs(log2(2) - 1) < EPSILON)
    })

    it('should calculate log2(8) = 3', function () {
      assert(Math.abs(log2(8) - 3) < EPSILON)
    })
  })

  describe('log1p', function () {
    it('should calculate log1p(0) = 0', function () {
      assert.strictEqual(log1p(0), 0)
    })

    it('should be accurate for small x', function () {
      const small = 1e-10
      assert(Math.abs(log1p(small) - small) < 1e-15)
    })

    it('should calculate log1p(e-1) = 1', function () {
      assert(Math.abs(log1p(Math.E - 1) - 1) < EPSILON)
    })
  })

  describe('logBase', function () {
    it('should calculate log_10(100) = 2', function () {
      assert(Math.abs(logBase(100, 10) - 2) < EPSILON)
    })

    it('should calculate log_2(8) = 3', function () {
      assert(Math.abs(logBase(8, 2) - 3) < EPSILON)
    })

    it('should calculate log_e(e) = 1', function () {
      assert(Math.abs(logBase(Math.E, Math.E) - 1) < EPSILON)
    })
  })

  describe('nthRoot', function () {
    it('should calculate square root of 4', function () {
      assert(Math.abs(nthRoot(4, 2) - 2) < EPSILON)
    })

    it('should calculate cube root of 8', function () {
      assert(Math.abs(nthRoot(8, 3) - 2) < EPSILON)
    })

    it('should handle negative numbers for odd roots', function () {
      assert(Math.abs(nthRoot(-8, 3) - (-2)) < EPSILON)
    })

    it('should calculate 4th root of 16', function () {
      assert(Math.abs(nthRoot(16, 4) - 2) < EPSILON)
    })
  })

  describe('sqrt', function () {
    it('should calculate sqrt(0) = 0', function () {
      assert.strictEqual(sqrt(0), 0)
    })

    it('should calculate sqrt(1) = 1', function () {
      assert.strictEqual(sqrt(1), 1)
    })

    it('should calculate sqrt(4) = 2', function () {
      assert.strictEqual(sqrt(4), 2)
    })

    it('should calculate sqrt(2)', function () {
      assert(Math.abs(sqrt(2) - Math.SQRT2) < EPSILON)
    })

    it('should return NaN for negative values', function () {
      assert(isNaN(sqrt(-1)))
    })
  })

  describe('pow', function () {
    it('should calculate 2^0 = 1', function () {
      assert.strictEqual(pow(2, 0), 1)
    })

    it('should calculate 2^3 = 8', function () {
      assert.strictEqual(pow(2, 3), 8)
    })

    it('should calculate 2^-1 = 0.5', function () {
      assert.strictEqual(pow(2, -1), 0.5)
    })

    it('should calculate 4^0.5 = 2', function () {
      assert.strictEqual(pow(4, 0.5), 2)
    })
  })

  // Note: Array functions (expArray, logArray, log10Array, log2Array, sqrtArray, powConstantArray)
  // use AssemblyScript's `unchecked` built-in and must be tested via compiled WASM modules,
  // not directly in TypeScript/JavaScript.
})
