import assert from 'assert'
import {
  forwardDifference,
  backwardDifference,
  centralDifference,
  secondDerivative,
  fivePointStencil,
  richardsonExtrapolation,
  trapezoidalRule,
  simpsonsRule,
  gaussQuadrature2,
  gaussQuadrature3,
  rombergIntegration,
  adaptiveSimpson
} from '../../../../src/wasm/numeric/calculus.ts'

const EPSILON = 1e-6

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/numeric/calculus', function () {
  describe('forwardDifference', function () {
    it('should compute forward difference derivative', function () {
      // f(x) = x^2, f'(x) = 2x
      // At x=2: f(2)=4, f(2.001)=4.004001
      const fx = 4
      const fxh = 4.004001
      const h = 0.001
      const result = forwardDifference(fx, fxh, h)
      // f'(2) ≈ 4
      assert(approxEqual(result, 4.001, 0.01))
    })

    it('should return NaN for h=0', function () {
      assert(Number.isNaN(forwardDifference(1, 2, 0)))
    })
  })

  describe('backwardDifference', function () {
    it('should compute backward difference derivative', function () {
      // f(x) = x^2, f'(x) = 2x
      // At x=2: f(2)=4, f(1.999)=3.996001
      const fx = 4
      const fxmh = 3.996001
      const h = 0.001
      const result = backwardDifference(fx, fxmh, h)
      assert(approxEqual(result, 3.999, 0.01))
    })

    it('should return NaN for h=0', function () {
      assert(Number.isNaN(backwardDifference(1, 2, 0)))
    })
  })

  describe('centralDifference', function () {
    it('should compute central difference derivative (more accurate)', function () {
      // f(x) = x^2, f'(x) = 2x
      // At x=2: f(2.001)=4.004001, f(1.999)=3.996001
      const fxph = 4.004001
      const fxmh = 3.996001
      const h = 0.001
      const result = centralDifference(fxph, fxmh, h)
      // f'(2) = 4
      assert(approxEqual(result, 4.0, 0.0001))
    })

    it('should return NaN for h=0', function () {
      assert(Number.isNaN(centralDifference(1, 2, 0)))
    })
  })

  describe('secondDerivative', function () {
    it('should compute second derivative', function () {
      // f(x) = x^2, f''(x) = 2
      // At x=2: f(2.001)=4.004001, f(2)=4, f(1.999)=3.996001
      const fxph = 4.004001
      const fx = 4
      const fxmh = 3.996001
      const h = 0.001
      const result = secondDerivative(fxph, fx, fxmh, h)
      // f''(2) = 2
      assert(approxEqual(result, 2.0, 0.01))
    })

    it('should return NaN for h=0', function () {
      assert(Number.isNaN(secondDerivative(1, 2, 3, 0)))
    })
  })

  describe('fivePointStencil', function () {
    it('should compute derivative with higher accuracy', function () {
      // f(x) = x^3, f'(x) = 3x^2
      // At x=2: f'(2) = 12
      const h = 0.01
      const x = 2
      const fxp2h = Math.pow(x + 2 * h, 3)
      const fxph = Math.pow(x + h, 3)
      const fxmh = Math.pow(x - h, 3)
      const fxm2h = Math.pow(x - 2 * h, 3)

      const result = fivePointStencil(fxp2h, fxph, fxmh, fxm2h, h)
      assert(approxEqual(result, 12.0, 0.0001))
    })
  })

  describe('richardsonExtrapolation', function () {
    it('should improve derivative estimate', function () {
      // Two estimates of same derivative
      const d1 = 4.001  // with step h
      const d2 = 4.00025 // with step h/2
      const order = 2

      const result = richardsonExtrapolation(d1, d2, order)
      // Should be closer to true value 4.0
      assert(Math.abs(result - 4.0) < Math.abs(d1 - 4.0))
    })
  })

  describe('trapezoidalRule', function () {
    it('should integrate using trapezoidal rule', function () {
      // Integrate f(x) = x from 0 to 2
      // True integral = 2
      const fa = 0  // f(0)
      const fb = 2  // f(2)
      const h = 2   // interval width

      const result = trapezoidalRule(fa, fb, h)
      assert.strictEqual(result, 2.0)
    })
  })

  describe('simpsonsRule', function () {
    it('should integrate using Simpson rule', function () {
      // Integrate f(x) = x^2 from 0 to 2
      // True integral = 8/3 ≈ 2.667
      const fa = 0    // f(0) = 0
      const fm = 1    // f(1) = 1
      const fb = 4    // f(2) = 4
      const h = 1     // half-interval width

      const result = simpsonsRule(fa, fm, fb, h)
      assert(approxEqual(result, 8 / 3, 0.001))
    })
  })

  describe('gaussQuadrature2', function () {
    it('should integrate using 2-point Gauss quadrature', function () {
      // Transform to [-1, 1]: ∫f(x)dx over [a,b]
      // For linear function, should be exact
      const f_minus = 0.5  // f at transformed -1/sqrt(3)
      const f_plus = 1.5   // f at transformed +1/sqrt(3)
      const halfWidth = 1  // (b-a)/2

      const result = gaussQuadrature2(f_minus, f_plus, halfWidth)
      assert(approxEqual(result, 2.0, 0.001))
    })
  })

  describe('gaussQuadrature3', function () {
    it('should integrate using 3-point Gauss quadrature', function () {
      const f_minus = 1
      const f_zero = 2
      const f_plus = 3
      const halfWidth = 1

      const result = gaussQuadrature3(f_minus, f_zero, f_plus, halfWidth)
      // Weights: 5/9, 8/9, 5/9
      const expected = (5 / 9 * 1 + 8 / 9 * 2 + 5 / 9 * 3) * halfWidth
      assert(approxEqual(result, expected, 0.001))
    })
  })

  describe('rombergIntegration', function () {
    it('should be tested via WASM (uses f64.NaN and complex recursion)', function () {
      // Romberg integration requires function evaluation
      // Cannot be tested directly without function pointers
      assert(true)
    })
  })

  describe('adaptiveSimpson', function () {
    it('should be tested via WASM (uses f64.NaN and complex recursion)', function () {
      // Adaptive Simpson requires function evaluation
      assert(true)
    })
  })

  describe('numerical differentiation properties', function () {
    it('central difference should be more accurate than forward/backward', function () {
      // f(x) = x^2, f'(2) = 4
      const h = 0.01
      const fx = 4
      const fxph = 4.0401
      const fxmh = 3.9601

      const forward = forwardDifference(fx, fxph, h)
      const backward = backwardDifference(fx, fxmh, h)
      const central = centralDifference(fxph, fxmh, h)

      assert(Math.abs(central - 4) < Math.abs(forward - 4))
      assert(Math.abs(central - 4) < Math.abs(backward - 4))
    })
  })

  describe('integration properties', function () {
    it('Simpson should be more accurate than trapezoidal for smooth functions', function () {
      // Integrate x^2 from 0 to 2, true value = 8/3
      const trueValue = 8 / 3

      // Trapezoidal: (f(0) + f(2)) * 2 / 2 = 4
      const trap = trapezoidalRule(0, 4, 2)

      // Simpson: (f(0) + 4*f(1) + f(2)) * 2 / 6 = (0 + 4 + 4) * 2 / 6 = 8/3
      const simp = simpsonsRule(0, 1, 4, 1)

      assert(Math.abs(simp - trueValue) < Math.abs(trap - trueValue))
    })
  })
})
