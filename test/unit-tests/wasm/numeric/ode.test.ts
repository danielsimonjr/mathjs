import assert from 'assert'
import {
  computeStepAdjustment,
  wouldOvershoot,
  trimStep
  // Functions using `unchecked` must be tested via compiled WASM:
  // rk45Step, rk23Step, getRKYNext, getRKYError, maxError,
  // interpolate, vectorCopy, vectorScale, vectorAdd
} from '../../../../src/wasm/numeric/ode.ts'

const EPSILON = 1e-10

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/numeric/ode', function () {
  describe('computeStepAdjustment', function () {
    it('should return safety factor when error equals tolerance', function () {
      // delta = safety * (tol/error)^(1/order) = 0.84 * 1 = 0.84
      const delta = computeStepAdjustment(1.0, 1.0, 5, 0.1, 10.0)
      assert(approxEqual(delta, 0.84))
    })

    it('should increase step when error is below tolerance', function () {
      // error = 0.1, tol = 1.0, order = 5
      // delta = 0.84 * (1.0/0.1)^(1/5) = 0.84 * 10^0.2 ≈ 1.33
      const delta = computeStepAdjustment(0.1, 1.0, 5, 0.1, 10.0)
      assert(delta > 1.0)
    })

    it('should decrease step when error is above tolerance', function () {
      // error = 10, tol = 1.0, order = 5
      // delta = 0.84 * (1.0/10)^(1/5) = 0.84 * 0.1^0.2 ≈ 0.53
      const delta = computeStepAdjustment(10.0, 1.0, 5, 0.1, 10.0)
      assert(delta < 1.0)
    })

    it('should clamp to minimum', function () {
      // Large error should clamp to minDelta
      const delta = computeStepAdjustment(1e10, 1.0, 5, 0.2, 10.0)
      assert.strictEqual(delta, 0.2)
    })

    it('should clamp to maximum', function () {
      // Small error should clamp to maxDelta
      const delta = computeStepAdjustment(1e-10, 1.0, 5, 0.1, 5.0)
      assert.strictEqual(delta, 5.0)
    })

    it('should work with order 3 (RK23)', function () {
      // delta = 0.84 * (1.0/0.5)^(1/3) = 0.84 * 2^(1/3) ≈ 1.06
      const delta = computeStepAdjustment(0.5, 1.0, 3, 0.1, 10.0)
      assert(approxEqual(delta, 0.84 * Math.pow(2, 1 / 3), 1e-6))
    })

    it('should work with order 5 (RK45)', function () {
      // delta = 0.84 * (1.0/0.5)^(1/5) = 0.84 * 2^0.2 ≈ 0.97
      const delta = computeStepAdjustment(0.5, 1.0, 5, 0.1, 10.0)
      assert(approxEqual(delta, 0.84 * Math.pow(2, 0.2), 1e-6))
    })
  })

  describe('wouldOvershoot', function () {
    describe('forward integration', function () {
      it('should return 1 when step would overshoot', function () {
        assert.strictEqual(wouldOvershoot(0.9, 1.0, 0.2, 1), 1)
      })

      it('should return 0 when step would not overshoot', function () {
        assert.strictEqual(wouldOvershoot(0.5, 1.0, 0.2, 1), 0)
      })

      it('should return 0 when step exactly reaches final', function () {
        assert.strictEqual(wouldOvershoot(0.8, 1.0, 0.2, 1), 0)
      })
    })

    describe('backward integration', function () {
      it('should return 1 when step would overshoot (backward)', function () {
        assert.strictEqual(wouldOvershoot(0.1, 0.0, -0.2, 0), 1)
      })

      it('should return 0 when step would not overshoot (backward)', function () {
        assert.strictEqual(wouldOvershoot(0.5, 0.0, -0.2, 0), 0)
      })
    })
  })

  describe('trimStep', function () {
    describe('forward integration', function () {
      it('should trim step when it would overshoot', function () {
        // t=0.9, tf=1.0, h=0.2 -> should return 0.1
        const trimmed = trimStep(0.9, 1.0, 0.2, 1)
        assert(approxEqual(trimmed, 0.1))
      })

      it('should not trim when step does not overshoot', function () {
        // t=0.5, tf=1.0, h=0.2 -> should return 0.2
        const trimmed = trimStep(0.5, 1.0, 0.2, 1)
        assert.strictEqual(trimmed, 0.2)
      })

      it('should return zero when already at final', function () {
        const trimmed = trimStep(1.0, 1.0, 0.2, 1)
        assert(approxEqual(trimmed, 0))
      })
    })

    describe('backward integration', function () {
      it('should trim step when it would overshoot (backward)', function () {
        // t=0.1, tf=0.0, h=-0.2 -> should return -0.1
        const trimmed = trimStep(0.1, 0.0, -0.2, 0)
        assert(approxEqual(trimmed, -0.1))
      })

      it('should not trim when step does not overshoot (backward)', function () {
        // t=0.5, tf=0.0, h=-0.2 -> should return -0.2
        const trimmed = trimStep(0.5, 0.0, -0.2, 0)
        assert.strictEqual(trimmed, -0.2)
      })
    })
  })

  describe('ODE method properties', function () {
    it('RK45 order 5 should have tighter step control than RK23 order 3', function () {
      // For same error/tolerance ratio, higher order should give larger adjustment
      const error = 0.5
      const tol = 1.0
      const deltaRK23 = computeStepAdjustment(error, tol, 3, 0.1, 10.0)
      const deltaRK45 = computeStepAdjustment(error, tol, 5, 0.1, 10.0)

      // Higher order method: delta = safety * (tol/error)^(1/order)
      // For tol/error = 2:
      //   order 3: 2^(1/3) ≈ 1.26
      //   order 5: 2^(1/5) ≈ 1.15
      // So RK23 adjustment is larger (more aggressive step increases)
      assert(deltaRK23 > deltaRK45)
    })

    it('step adjustment should be symmetric around tolerance', function () {
      // error/tol = 0.5 vs error/tol = 2.0 should give reciprocal adjustments
      const delta1 = computeStepAdjustment(0.5, 1.0, 5, 0.01, 100.0)
      const delta2 = computeStepAdjustment(2.0, 1.0, 5, 0.01, 100.0)

      // delta1 ≈ 0.84 * 2^0.2, delta2 ≈ 0.84 * 0.5^0.2
      // delta1 * delta2 ≈ 0.84^2 * (2 * 0.5)^0.2 = 0.84^2
      assert(approxEqual(delta1 * delta2, 0.84 * 0.84, 0.01))
    })
  })

  // Note: rk45Step, rk23Step, maxError, interpolate, vectorCopy, vectorScale, vectorAdd
  // use AssemblyScript's `unchecked` built-in and must be tested via compiled WASM modules.
  // These tests would require setting up proper derivative functions and integration loops.
})
