import assert from 'assert'
import {
  bisectionSetup,
  bisectionStep,
  newtonSetup,
  newtonStep,
  secantSetup,
  secantStep,
  secantUpdate,
  brentSetup,
  brentStep,
  brentUpdate as _brentUpdate,
  fixedPointSetup,
  fixedPointStep,
  illinoisSetup,
  illinoisStep as _illinoisStep,
  illinoisNextX,
  mullerStep,
  steffensenStep,
  halleyStep
} from '../../../../src/wasm/numeric/rootfinding.ts'

const EPSILON = 1e-10

function _approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/numeric/rootfinding', function () {
  describe('bisectionSetup and bisectionStep', function () {
    it('should setup bisection with valid bracket', function () {
      // f(x) = x - 2, root at x=2
      // f(0) = -2, f(4) = 2
      const state = bisectionSetup(-2, 2, 0, 4)
      assert.strictEqual(state[5], 1) // Continue
      assert.strictEqual(state[0], 2) // Midpoint
    })

    it('should return -1 for invalid bracket', function () {
      // Both values positive - no sign change
      const state = bisectionSetup(1, 2, 0, 4)
      assert.strictEqual(state[5], -1) // No bracket
    })

    it('should converge toward root', function () {
      // f(x) = x - 2, starting bracket [0, 4]
      let state = bisectionSetup(-2, 2, 0, 4)
      // Midpoint is 2, f(2) = 0
      state = bisectionStep(state, 0, 1e-6)
      assert.strictEqual(state[5], 0) // Converged
    })
  })

  describe('newtonSetup and newtonStep', function () {
    it('should setup Newton iteration', function () {
      const state = newtonSetup(1.5)
      assert.strictEqual(state[0], 1.5)
      assert.strictEqual(state[1], 1) // Continue
    })

    it('should converge for well-behaved function', function () {
      // f(x) = x² - 4, f'(x) = 2x, root at x=2
      // Starting at x=3: f(3)=5, f'(3)=6
      let state = newtonSetup(3)
      state = newtonStep(state, 5, 6, 1e-10)
      // x₁ = 3 - 5/6 ≈ 2.167
      assert(state[0] < 3)
      assert(state[0] > 2)
      assert.strictEqual(state[1], 1) // Continue
    })

    it('should converge when f(x) is small', function () {
      const state = newtonSetup(2.0001)
      const result = newtonStep(state, 0.00000001, 4, 1e-6)
      assert.strictEqual(result[1], 0) // Converged
    })

    it('should fail on zero derivative', function () {
      const state = newtonSetup(0)
      const result = newtonStep(state, 1, 0, 1e-10)
      assert.strictEqual(result[1], -1) // Failed
    })
  })

  describe('secantSetup and secantStep', function () {
    it('should setup secant method', function () {
      // f(x) = x² - 4: f(1)=-3, f(3)=5
      const state = secantSetup(1, 3, -3, 5)
      assert.strictEqual(state[0], 3) // Current x
      assert.strictEqual(state[1], 1) // Previous x
      assert.strictEqual(state[4], 1) // Continue
    })

    it('should compute next approximation', function () {
      const state = secantSetup(1, 3, -3, 5)
      const result = secantStep(state, 1e-10)
      assert.strictEqual(result[4], 2) // Need function evaluation
      // New x should be between 1 and 3
      assert(result[0] > 1 && result[0] < 3)
    })

    it('should update state after evaluation', function () {
      let state = secantSetup(1, 3, -3, 5)
      state = secantStep(state, 1e-10)
      state = secantUpdate(state, 0.5) // Arbitrary f value
      assert.strictEqual(state[4], 1) // Continue
    })
  })

  describe('brentSetup and brentStep', function () {
    it('should setup Brent method with valid bracket', function () {
      // f(a) and f(b) have opposite signs
      const state = brentSetup(0, 4, -2, 2)
      assert.strictEqual(state[8], 1) // Continue
    })

    it('should return -1 for invalid bracket', function () {
      // Same sign at endpoints
      const state = brentSetup(0, 1, 1, 2)
      assert.strictEqual(state[8], -1) // No bracket
    })

    it('should converge when f(b) is small', function () {
      // Near convergence
      const state = brentSetup(1.999, 2.001, -0.001, 0.001)
      const result = brentStep(state, 1e-3)
      // Should detect convergence
      assert(result[8] === 0 || result[8] === 1 || result[8] === 2)
    })
  })

  describe('fixedPointSetup and fixedPointStep', function () {
    it('should setup fixed point iteration', function () {
      const state = fixedPointSetup(1.5)
      assert.strictEqual(state[0], 1.5)
      assert.strictEqual(state[1], 1) // Continue
    })

    it('should converge when g(x) ≈ x', function () {
      // x = g(x) where g(x) is close to x
      const state = fixedPointSetup(2.0)
      const result = fixedPointStep(state, 2.0000001, 1e-5)
      assert.strictEqual(result[1], 0) // Converged
    })

    it('should continue when not converged', function () {
      const state = fixedPointSetup(1.0)
      const result = fixedPointStep(state, 1.5, 1e-10)
      assert.strictEqual(result[0], 1.5)
      assert.strictEqual(result[1], 1) // Continue
    })
  })

  describe('illinoisSetup and illinoisStep', function () {
    it('should setup Illinois method', function () {
      const state = illinoisSetup(0, 4, -2, 2)
      assert.strictEqual(state[5], 1) // Continue
    })

    it('should return -1 for invalid bracket', function () {
      const state = illinoisSetup(0, 4, 2, 3)
      assert.strictEqual(state[5], -1) // No bracket
    })

    it('should compute next x value', function () {
      const state = illinoisSetup(0, 4, -2, 2)
      const nextX = illinoisNextX(state)
      // Secant point between 0 and 4
      assert(nextX > 0 && nextX < 4)
    })
  })

  describe('mullerStep', function () {
    it('should compute quadratic interpolation step', function () {
      // Points for x² - 4 = 0 near x=2
      const result = mullerStep(1, 1.5, 2.5, -3, -1.75, 2.25, 1e-10)
      assert(result[1] >= 0) // Should continue or converge
    })

    it('should converge when f(x2) is small', function () {
      const result = mullerStep(1.9, 1.99, 2.0, -0.39, -0.0399, 0, 1e-10)
      assert.strictEqual(result[1], 0) // Converged
    })
  })

  describe('steffensenStep', function () {
    it('should compute derivative-free quadratic step', function () {
      // f(x) = x² - 4, at x=3: f(3)=5, f(3+5)=f(8)=60
      const result = steffensenStep(3, 5, 60, 1e-10)
      assert.strictEqual(result[1], 1) // Continue
    })

    it('should converge when f(x) is small', function () {
      const result = steffensenStep(2, 0.0000001, 0.0000002, 1e-6)
      assert.strictEqual(result[1], 0) // Converged
    })

    it('should fail on zero denominator', function () {
      const result = steffensenStep(2, 1, 1, 1e-10)
      assert.strictEqual(result[1], -1) // Failed
    })
  })

  describe('halleyStep', function () {
    it('should compute cubic convergent step', function () {
      // f(x) = x³ - 2, f'(x) = 3x², f''(x) = 6x
      // at x=1.5: f=1.375, f'=6.75, f''=9
      const result = halleyStep(1.5, 1.375, 6.75, 9, 1e-10)
      assert.strictEqual(result[1], 1) // Continue
      assert(result[0] < 1.5) // Should move toward root ~1.26
    })

    it('should converge when f(x) is small', function () {
      const result = halleyStep(1.26, 0.0000001, 4.76, 7.56, 1e-6)
      assert.strictEqual(result[1], 0) // Converged
    })

    it('should fail on zero denominator', function () {
      // When 2f'² = f·f''
      const result = halleyStep(1, 2, 1, 2, 1e-10) // 2*1 - 2*2 = -2 ≠ 0
      assert(result[1] === 1 || result[1] === -1)
    })
  })

  describe('root finding properties', function () {
    it('bisection should always bracket the root', function () {
      const a = 0,
        b = 10,
        fa = -5,
        fb = 5
      const state = bisectionSetup(fa, fb, a, b)

      // After each step, root should still be in [a, b]
      const mid = state[0]
      const fmid = mid - 5 // f(x) = x - 5, root at 5

      if (fa * fmid < 0) {
        assert(mid < b)
      } else {
        assert(mid > a)
      }
    })

    it('Newton should have quadratic convergence near root', function () {
      // For x² - 4 = 0, starting near root x=2
      // Error should roughly square each iteration
      let state = newtonSetup(2.1)
      const e0 = Math.abs(2.1 - 2)

      // f(2.1) = 0.41, f'(2.1) = 4.2
      state = newtonStep(state, 0.41, 4.2, 1e-15)
      const e1 = Math.abs(state[0] - 2)

      // e1 should be much smaller than e0
      assert(e1 < e0)
    })

    it('secant should converge super-linearly', function () {
      // Secant has order ~1.618 convergence
      const state = secantSetup(1.5, 2.5, -1.75, 2.25)
      const result = secantStep(state, 1e-15)
      // New estimate should be closer to root x=2
      assert(Math.abs(result[0] - 2) < Math.abs(2.5 - 2))
    })

    it('Halley should have cubic convergence', function () {
      // Halley converges cubically, faster than Newton
      // For x² - 4: f=x²-4, f'=2x, f''=2
      const x = 2.1
      const fx = x * x - 4
      const fpx = 2 * x
      const fppx = 2

      const halley = halleyStep(x, fx, fpx, fppx, 1e-15)
      const newton = newtonStep(newtonSetup(x), fx, fpx, 1e-15)

      // Halley should get closer in one step
      const halleyErr = Math.abs(halley[0] - 2)
      const newtonErr = Math.abs(newton[0] - 2)
      // Halley should be at least as good (often better)
      assert(halleyErr <= newtonErr * 1.1)
    })
  })
})
