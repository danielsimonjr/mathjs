import assert from 'assert'
import {
  sin,
  cos,
  tan,
  asin,
  acos,
  atan,
  atan2,
  sinh,
  cosh,
  tanh,
  asinh,
  acosh,
  atanh,
  sec,
  csc,
  cot,
  sech,
  csch,
  coth,
  asec,
  acsc,
  acot,
  asech,
  acsch,
  acoth,
  degToRad,
  radToDeg
  // Array functions using `unchecked` must be tested via compiled WASM:
  // sinArray, cosArray, tanArray, sinhArray, coshArray, tanhArray
} from '../../../../src/wasm/trigonometry/basic.ts'

const EPSILON = 1e-10
const PI = Math.PI

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/trigonometry/basic', function () {
  describe('sin', function () {
    it('should compute sin(0) = 0', function () {
      assert(approxEqual(sin(0), 0))
    })

    it('should compute sin(PI/2) = 1', function () {
      assert(approxEqual(sin(PI / 2), 1))
    })

    it('should compute sin(PI) = 0', function () {
      assert(approxEqual(sin(PI), 0))
    })

    it('should compute sin(PI/6) = 0.5', function () {
      assert(approxEqual(sin(PI / 6), 0.5))
    })
  })

  describe('cos', function () {
    it('should compute cos(0) = 1', function () {
      assert(approxEqual(cos(0), 1))
    })

    it('should compute cos(PI/2) = 0', function () {
      assert(approxEqual(cos(PI / 2), 0))
    })

    it('should compute cos(PI) = -1', function () {
      assert(approxEqual(cos(PI), -1))
    })

    it('should compute cos(PI/3) = 0.5', function () {
      assert(approxEqual(cos(PI / 3), 0.5))
    })
  })

  describe('tan', function () {
    it('should compute tan(0) = 0', function () {
      assert(approxEqual(tan(0), 0))
    })

    it('should compute tan(PI/4) = 1', function () {
      assert(approxEqual(tan(PI / 4), 1))
    })

    it('should compute tan(PI) = 0', function () {
      assert(approxEqual(tan(PI), 0))
    })
  })

  describe('asin', function () {
    it('should compute asin(0) = 0', function () {
      assert(approxEqual(asin(0), 0))
    })

    it('should compute asin(1) = PI/2', function () {
      assert(approxEqual(asin(1), PI / 2))
    })

    it('should compute asin(-1) = -PI/2', function () {
      assert(approxEqual(asin(-1), -PI / 2))
    })

    it('should compute asin(0.5) = PI/6', function () {
      assert(approxEqual(asin(0.5), PI / 6))
    })
  })

  describe('acos', function () {
    it('should compute acos(1) = 0', function () {
      assert(approxEqual(acos(1), 0))
    })

    it('should compute acos(0) = PI/2', function () {
      assert(approxEqual(acos(0), PI / 2))
    })

    it('should compute acos(-1) = PI', function () {
      assert(approxEqual(acos(-1), PI))
    })

    it('should compute acos(0.5) = PI/3', function () {
      assert(approxEqual(acos(0.5), PI / 3))
    })
  })

  describe('atan', function () {
    it('should compute atan(0) = 0', function () {
      assert(approxEqual(atan(0), 0))
    })

    it('should compute atan(1) = PI/4', function () {
      assert(approxEqual(atan(1), PI / 4))
    })

    it('should compute atan(-1) = -PI/4', function () {
      assert(approxEqual(atan(-1), -PI / 4))
    })
  })

  describe('atan2', function () {
    it('should compute atan2(0, 1) = 0', function () {
      assert(approxEqual(atan2(0, 1), 0))
    })

    it('should compute atan2(1, 0) = PI/2', function () {
      assert(approxEqual(atan2(1, 0), PI / 2))
    })

    it('should compute atan2(0, -1) = PI', function () {
      assert(approxEqual(atan2(0, -1), PI))
    })

    it('should compute atan2(1, 1) = PI/4', function () {
      assert(approxEqual(atan2(1, 1), PI / 4))
    })

    it('should compute atan2(-1, -1) = -3*PI/4', function () {
      assert(approxEqual(atan2(-1, -1), -3 * PI / 4))
    })
  })

  describe('sinh', function () {
    it('should compute sinh(0) = 0', function () {
      assert(approxEqual(sinh(0), 0))
    })

    it('should compute sinh(1)', function () {
      assert(approxEqual(sinh(1), Math.sinh(1)))
    })
  })

  describe('cosh', function () {
    it('should compute cosh(0) = 1', function () {
      assert(approxEqual(cosh(0), 1))
    })

    it('should compute cosh(1)', function () {
      assert(approxEqual(cosh(1), Math.cosh(1)))
    })
  })

  describe('tanh', function () {
    it('should compute tanh(0) = 0', function () {
      assert(approxEqual(tanh(0), 0))
    })

    it('should compute tanh(1)', function () {
      assert(approxEqual(tanh(1), Math.tanh(1)))
    })

    it('should approach 1 for large x', function () {
      assert(approxEqual(tanh(10), 1, 1e-8))
    })
  })

  describe('asinh', function () {
    it('should compute asinh(0) = 0', function () {
      assert(approxEqual(asinh(0), 0))
    })

    it('should be inverse of sinh', function () {
      assert(approxEqual(asinh(sinh(1)), 1))
    })
  })

  describe('acosh', function () {
    it('should compute acosh(1) = 0', function () {
      assert(approxEqual(acosh(1), 0))
    })

    it('should be inverse of cosh for x >= 1', function () {
      assert(approxEqual(acosh(cosh(2)), 2))
    })
  })

  describe('atanh', function () {
    it('should compute atanh(0) = 0', function () {
      assert(approxEqual(atanh(0), 0))
    })

    it('should be inverse of tanh', function () {
      assert(approxEqual(atanh(tanh(0.5)), 0.5))
    })
  })

  describe('sec', function () {
    it('should compute sec(0) = 1', function () {
      assert(approxEqual(sec(0), 1))
    })

    it('should compute sec(PI) = -1', function () {
      assert(approxEqual(sec(PI), -1))
    })

    it('should compute sec(PI/3) = 2', function () {
      assert(approxEqual(sec(PI / 3), 2))
    })
  })

  describe('csc', function () {
    it('should compute csc(PI/2) = 1', function () {
      assert(approxEqual(csc(PI / 2), 1))
    })

    it('should compute csc(PI/6) = 2', function () {
      assert(approxEqual(csc(PI / 6), 2))
    })
  })

  describe('cot', function () {
    it('should compute cot(PI/4) = 1', function () {
      assert(approxEqual(cot(PI / 4), 1))
    })

    it('should compute cot(PI/2) = 0', function () {
      assert(approxEqual(cot(PI / 2), 0))
    })
  })

  describe('sech', function () {
    it('should compute sech(0) = 1', function () {
      assert(approxEqual(sech(0), 1))
    })

    it('should be 1/cosh', function () {
      assert(approxEqual(sech(1), 1 / Math.cosh(1)))
    })
  })

  describe('csch', function () {
    it('should be 1/sinh', function () {
      assert(approxEqual(csch(1), 1 / Math.sinh(1)))
    })
  })

  describe('coth', function () {
    it('should be 1/tanh', function () {
      assert(approxEqual(coth(1), 1 / Math.tanh(1)))
    })
  })

  describe('asec', function () {
    it('should compute asec(1) = 0', function () {
      assert(approxEqual(asec(1), 0))
    })

    it('should compute asec(-1) = PI', function () {
      assert(approxEqual(asec(-1), PI))
    })

    it('should compute asec(2) = PI/3', function () {
      assert(approxEqual(asec(2), PI / 3))
    })
  })

  describe('acsc', function () {
    it('should compute acsc(1) = PI/2', function () {
      assert(approxEqual(acsc(1), PI / 2))
    })

    it('should compute acsc(2) = PI/6', function () {
      assert(approxEqual(acsc(2), PI / 6))
    })
  })

  describe('acot', function () {
    it('should compute acot(1) = PI/4', function () {
      assert(approxEqual(acot(1), PI / 4))
    })
  })

  describe('asech', function () {
    it('should compute asech(1) = 0', function () {
      assert(approxEqual(asech(1), 0))
    })

    it('should be inverse of sech', function () {
      const x = 0.5
      assert(approxEqual(asech(sech(x)), x))
    })
  })

  describe('acsch', function () {
    it('should be inverse of csch', function () {
      const x = 1
      assert(approxEqual(acsch(csch(x)), x))
    })
  })

  describe('acoth', function () {
    it('should be inverse of coth for |x| > 1', function () {
      const x = 2
      assert(approxEqual(acoth(coth(x)), x))
    })
  })

  describe('degToRad', function () {
    it('should convert 0 degrees to 0 radians', function () {
      assert.strictEqual(degToRad(0), 0)
    })

    it('should convert 180 degrees to PI radians', function () {
      assert(approxEqual(degToRad(180), PI))
    })

    it('should convert 90 degrees to PI/2 radians', function () {
      assert(approxEqual(degToRad(90), PI / 2))
    })

    it('should convert 360 degrees to 2*PI radians', function () {
      assert(approxEqual(degToRad(360), 2 * PI))
    })

    it('should convert 45 degrees to PI/4 radians', function () {
      assert(approxEqual(degToRad(45), PI / 4))
    })
  })

  describe('radToDeg', function () {
    it('should convert 0 radians to 0 degrees', function () {
      assert.strictEqual(radToDeg(0), 0)
    })

    it('should convert PI radians to 180 degrees', function () {
      assert(approxEqual(radToDeg(PI), 180))
    })

    it('should convert PI/2 radians to 90 degrees', function () {
      assert(approxEqual(radToDeg(PI / 2), 90))
    })

    it('should convert 2*PI radians to 360 degrees', function () {
      assert(approxEqual(radToDeg(2 * PI), 360))
    })
  })

  describe('inverse function relationships', function () {
    it('asin(sin(x)) = x for x in [-PI/2, PI/2]', function () {
      const x = 0.5
      assert(approxEqual(asin(sin(x)), x))
    })

    it('acos(cos(x)) = x for x in [0, PI]', function () {
      const x = 1
      assert(approxEqual(acos(cos(x)), x))
    })

    it('atan(tan(x)) = x for x in (-PI/2, PI/2)', function () {
      const x = 0.5
      assert(approxEqual(atan(tan(x)), x))
    })
  })
})
