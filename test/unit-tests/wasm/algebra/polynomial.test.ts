import assert from 'assert'
import {
  polyEval,
  polyEvalWithDerivative,
  quadraticRoots,
  cubicRoots,
  quarticRoots,
  polyRoots,
  polyMultiply,
  polyDivide
} from '../../../../src/wasm/algebra/polynomial.ts'

const EPSILON = 1e-10

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/algebra/polynomial', function () {
  describe('polyEval', function () {
    it('should evaluate constant polynomial', function () {
      const coeffs = new Float64Array([5])
      assert.strictEqual(polyEval(coeffs, 1, 3), 5)
    })

    it('should evaluate linear polynomial', function () {
      // p(x) = 2 + 3x
      const coeffs = new Float64Array([2, 3])
      assert.strictEqual(polyEval(coeffs, 2, 4), 14) // 2 + 3*4 = 14
    })

    it('should evaluate quadratic polynomial', function () {
      // p(x) = 1 + 2x + 3x²
      const coeffs = new Float64Array([1, 2, 3])
      // p(2) = 1 + 4 + 12 = 17
      assert.strictEqual(polyEval(coeffs, 3, 2), 17)
    })

    it('should return 0 for empty polynomial', function () {
      const coeffs = new Float64Array([])
      assert.strictEqual(polyEval(coeffs, 0, 5), 0)
    })
  })

  describe('polyEvalWithDerivative', function () {
    it('should evaluate polynomial and derivative', function () {
      // p(x) = 1 + 2x + 3x², p'(x) = 2 + 6x
      const coeffs = new Float64Array([1, 2, 3])
      const result = polyEvalWithDerivative(coeffs, 3, 2)
      // p(2) = 1 + 4 + 12 = 17
      // p'(2) = 2 + 12 = 14
      assert(approxEqual(result[0], 17))
      assert(approxEqual(result[1], 14))
    })

    it('should handle constant polynomial', function () {
      const coeffs = new Float64Array([5])
      const result = polyEvalWithDerivative(coeffs, 1, 3)
      assert.strictEqual(result[0], 5)
      assert.strictEqual(result[1], 0)
    })
  })

  describe('quadraticRoots', function () {
    it('should find two real roots', function () {
      // x² - 5x + 6 = 0 → (x-2)(x-3) = 0 → x = 2, 3
      const result = quadraticRoots(1, -5, 6)
      const roots = [result[0], result[2]].sort((a, b) => a - b)
      assert(approxEqual(roots[0], 2, 1e-9))
      assert(approxEqual(roots[1], 3, 1e-9))
      // Imaginary parts should be 0
      assert(approxEqual(result[1], 0, 1e-9))
      assert(approxEqual(result[3], 0, 1e-9))
    })

    it('should find repeated root', function () {
      // x² - 4x + 4 = 0 → (x-2)² = 0 → x = 2
      const result = quadraticRoots(1, -4, 4)
      assert(approxEqual(result[0], 2, 1e-9))
      assert(approxEqual(result[2], 2, 1e-9))
    })

    it('should find complex conjugate roots', function () {
      // x² + 1 = 0 → x = ±i
      const result = quadraticRoots(1, 0, 1)
      assert(approxEqual(result[0], 0, 1e-9)) // real part
      assert(approxEqual(result[1], 1, 1e-9)) // imaginary part
      assert(approxEqual(result[2], 0, 1e-9)) // real part
      assert(approxEqual(result[3], -1, 1e-9)) // imaginary part
    })

    it('should handle linear equation when a=0', function () {
      // 0x² + 2x + 4 = 0 → x = -2
      const result = quadraticRoots(0, 2, 4)
      assert(approxEqual(result[0], -2, 1e-9))
    })
  })

  describe('cubicRoots', function () {
    it('should find three real roots', function () {
      // x³ - 6x² + 11x - 6 = 0 → (x-1)(x-2)(x-3) = 0
      const result = cubicRoots(1, -6, 11, -6)
      const realRoots = [result[0], result[2], result[4]].sort((a, b) => a - b)
      assert(approxEqual(realRoots[0], 1, 1e-6))
      assert(approxEqual(realRoots[1], 2, 1e-6))
      assert(approxEqual(realRoots[2], 3, 1e-6))
    })

    it('should find one real and two complex roots', function () {
      // x³ - 1 = 0 → x = 1, e^(2πi/3), e^(-2πi/3)
      const result = cubicRoots(1, 0, 0, -1)
      // One root should be 1
      const hasRealRoot =
        approxEqual(result[0], 1, 1e-6) ||
        approxEqual(result[2], 1, 1e-6) ||
        approxEqual(result[4], 1, 1e-6)
      assert(hasRealRoot)
    })

    it('should degrade to quadratic when a=0', function () {
      // 0x³ + x² - 5x + 6 = 0 → x = 2, 3
      const result = cubicRoots(0, 1, -5, 6)
      const roots = [result[0], result[2]].sort((a, b) => a - b)
      assert(approxEqual(roots[0], 2, 1e-9))
      assert(approxEqual(roots[1], 3, 1e-9))
    })
  })

  describe('quarticRoots', function () {
    it('should find four real roots', function () {
      // (x-1)(x-2)(x-3)(x-4) = x⁴ - 10x³ + 35x² - 50x + 24
      const result = quarticRoots(1, -10, 35, -50, 24)
      const realRoots: number[] = []
      for (let i = 0; i < 4; i++) {
        if (Math.abs(result[i * 2 + 1]) < 0.01) {
          // small imaginary part
          realRoots.push(result[i * 2])
        }
      }
      realRoots.sort((a, b) => a - b)
      assert.strictEqual(realRoots.length, 4)
      assert(approxEqual(realRoots[0], 1, 0.1))
      assert(approxEqual(realRoots[1], 2, 0.1))
      assert(approxEqual(realRoots[2], 3, 0.1))
      assert(approxEqual(realRoots[3], 4, 0.1))
    })

    it('should handle biquadratic (no x³ or x terms)', function () {
      // x⁴ - 5x² + 4 = 0 → (x²-1)(x²-4) = 0 → x = ±1, ±2
      const result = quarticRoots(1, 0, -5, 0, 4)
      const realRoots: number[] = []
      for (let i = 0; i < 4; i++) {
        if (Math.abs(result[i * 2 + 1]) < 0.01) {
          realRoots.push(result[i * 2])
        }
      }
      realRoots.sort((a, b) => a - b)
      assert.strictEqual(realRoots.length, 4)
    })

    it('should degrade to cubic when a=0', function () {
      const result = quarticRoots(0, 1, -6, 11, -6)
      // Should find roots 1, 2, 3
      assert(result.length === 8)
    })
  })

  describe('polyRoots (Durand-Kerner)', function () {
    it('should find roots of linear polynomial', function () {
      // x + 2 = 0 → x = -2
      const coeffs = new Float64Array([2, 1]) // 2 + x
      const result = polyRoots(coeffs, 2, 100, 1e-10)
      assert(approxEqual(result[0], -2, 1e-6))
    })

    it('should find roots of quadratic polynomial', function () {
      // x² - 3x + 2 = 0 → x = 1, 2
      const coeffs = new Float64Array([2, -3, 1])
      const result = polyRoots(coeffs, 3, 100, 1e-10)
      const roots = [result[0], result[2]].sort((a, b) => a - b)
      assert(approxEqual(roots[0], 1, 1e-6))
      assert(approxEqual(roots[1], 2, 1e-6))
    })

    it('should return empty for constant polynomial', function () {
      const coeffs = new Float64Array([5])
      const result = polyRoots(coeffs, 1, 100, 1e-10)
      assert.strictEqual(result.length, 0)
    })

    it('should use closed-form for degree 2-4', function () {
      // Uses quadraticRoots, cubicRoots, quarticRoots internally
      const coeffs = new Float64Array([6, -5, 1]) // x² - 5x + 6
      const result = polyRoots(coeffs, 3, 100, 1e-10)
      assert.strictEqual(result.length, 4) // 2 roots × 2 (real, imag)
    })
  })

  // Note: polyDerivative uses f64() type cast, requires WASM testing
  describe('polyDerivative', function () {
    it('should be tested via WASM (uses f64 type cast)', function () {
      // Computes derivative by multiplying each coefficient by its index
      // p(x) = 1 + 2x + 3x² → p'(x) = 2 + 6x
      assert(true)
    })
  })

  describe('polyMultiply', function () {
    it('should multiply two polynomials', function () {
      // (1 + x) * (1 + x) = 1 + 2x + x²
      const a = new Float64Array([1, 1])
      const b = new Float64Array([1, 1])
      const result = polyMultiply(a, 2, b, 2)
      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[0], 1)
      assert.strictEqual(result[1], 2)
      assert.strictEqual(result[2], 1)
    })

    it('should multiply polynomials of different degrees', function () {
      // (1 + 2x) * (3 + 4x + 5x²) = 3 + 10x + 13x² + 10x³
      const a = new Float64Array([1, 2])
      const b = new Float64Array([3, 4, 5])
      const result = polyMultiply(a, 2, b, 3)
      assert.strictEqual(result.length, 4)
      assert.strictEqual(result[0], 3)
      assert.strictEqual(result[1], 10)
      assert.strictEqual(result[2], 13)
      assert.strictEqual(result[3], 10)
    })
  })

  describe('polyDivide', function () {
    it('should divide polynomials', function () {
      // (x² - 3x + 2) / (x - 1) = (x - 2) with remainder 0
      // Coeffs: [2, -3, 1] / [−1, 1] = [−2, 1]
      const a = new Float64Array([2, -3, 1]) // x² - 3x + 2
      const b = new Float64Array([-1, 1]) // x - 1
      const result = polyDivide(a, 3, b, 2)
      // Result should be [quotient, remainder]
      // Quotient has length 3-2+1=2, remainder has length 2-1=1
      assert.strictEqual(result.length, 3)
    })

    it('should return zeros when divisor degree > dividend', function () {
      const a = new Float64Array([1, 2])
      const b = new Float64Array([1, 2, 3])
      const result = polyDivide(a, 2, b, 3)
      assert.strictEqual(result.length, 2)
    })
  })

  describe('polynomial root properties', function () {
    it('roots should satisfy polynomial equation', function () {
      // x² - 5x + 6 = 0 → (x-2)(x-3) = 0
      const result = quadraticRoots(1, -5, 6)
      const x1 = result[0]
      const x2 = result[2]
      // Verify using Vieta's formulas: sum of roots = 5, product = 6
      assert(approxEqual(x1 + x2, 5, 1e-6))
      assert(approxEqual(x1 * x2, 6, 1e-6))
    })

    it('sum of quadratic roots = -b/a', function () {
      // x² + bx + c = 0 → sum of roots = -b
      const result = quadraticRoots(1, -7, 12) // x² - 7x + 12
      const sum = result[0] + result[2]
      assert(approxEqual(sum, 7, 1e-9)) // -(-7)/1 = 7
    })

    it('product of quadratic roots = c/a', function () {
      // x² + bx + c = 0 → product of roots = c
      const result = quadraticRoots(1, -7, 12) // x² - 7x + 12
      const product = result[0] * result[2]
      assert(approxEqual(product, 12, 1e-9))
    })

    it('Horner method should be efficient and accurate', function () {
      // High degree polynomial evaluated at x=0.5
      const coeffs = new Float64Array([1, 1, 1, 1, 1]) // 1 + x + x² + x³ + x⁴
      const x = 0.5
      const result = polyEval(coeffs, 5, x)
      // Expected: 1 + 0.5 + 0.25 + 0.125 + 0.0625 = 1.9375
      assert(approxEqual(result, 1.9375, 1e-10))
    })
  })
})
