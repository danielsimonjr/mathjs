import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLaguerreL } from '../../../../src/function/special/laguerreL.js'

const math = create({ ...allFactories, createLaguerreL })

describe('laguerreL', function () {
  it('should return L_0(x) = 1 for any x', function () {
    assert.strictEqual(math.laguerreL(0, 0), 1)
    assert.strictEqual(math.laguerreL(0, 1), 1)
    assert.strictEqual(math.laguerreL(0, -5), 1)
  })

  it('should return L_1(x) = 1 - x', function () {
    assert.strictEqual(math.laguerreL(1, 0), 1)
    assert.strictEqual(math.laguerreL(1, 1), 0)
    assert(Math.abs(math.laguerreL(1, 0.5) - 0.5) < 1e-15)
  })

  it('should compute L_2(1) = -0.5', function () {
    // L_2(x) = (x^2 - 4x + 2) / 2; L_2(1) = (1 - 4 + 2) / 2 = -1/2
    assert(Math.abs(math.laguerreL(2, 1) - (-0.5)) < 1e-14)
  })

  it('should compute L_3(1) = -1/6', function () {
    // L_3(x) = (-x^3 + 9x^2 - 18x + 6) / 6; L_3(1) = (-1 + 9 - 18 + 6) / 6 = -4/6 = -2/3
    // Wait - let me recalculate: L_3(1) via recurrence
    // L_0=1, L_1=0, L_2: 2*L_2 = (2*1+1-1)*L_1 - 1*L_0 = 2*0 - 1 = -1 => L_2 = -0.5 ✓
    // L_3: 3*L_3 = (2*2+1-1)*L_2 - 2*L_1 = 4*(-0.5) - 0 = -2 => L_3 = -2/3
    // But the spec says L_3(1) = -1/6... Let me recalculate with x=1:
    // n=1: lPrev=1, lCurr=0
    // k=1: lNext = ((2*1+1-1)*0 - 1*1)/(1+1) = (0-1)/2 = -0.5; lPrev=0, lCurr=-0.5
    // k=2: lNext = ((2*2+1-1)*(-0.5) - 2*0)/3 = (4*(-0.5))/3 = -2/3; lPrev=-0.5, lCurr=-2/3
    // So L_3(1) = -2/3, not -1/6. The spec appears incorrect. Using -2/3.
    assert(Math.abs(math.laguerreL(3, 1) - (-2 / 3)) < 1e-14)
  })

  it('should compute L_2(0) = 1', function () {
    // L_2(0) = (0 - 0 + 2)/2 = 1
    assert(Math.abs(math.laguerreL(2, 0) - 1) < 1e-14)
  })

  it('should satisfy the recurrence relation explicitly', function () {
    const x = 0.5
    for (let n = 1; n < 6; n++) {
      const lNext = math.laguerreL(n + 1, x)
      const expected = ((2 * n + 1 - x) * math.laguerreL(n, x) - n * math.laguerreL(n - 1, x)) / (n + 1)
      assert(Math.abs(lNext - expected) < 1e-12,
        `Recurrence failed at n=${n}`)
    }
  })

  it('should satisfy L_n(0) = 1 for all n', function () {
    for (let n = 0; n <= 8; n++) {
      assert(Math.abs(math.laguerreL(n, 0) - 1) < 1e-13,
        `L_${n}(0) should be 1`)
    }
  })

  it('should compute L_4(1) correctly', function () {
    // Via recurrence with x=1:
    // L_0=1, L_1=0, L_2=-0.5, L_3=-2/3
    // k=3: lNext = ((2*3+1-1)*(-2/3) - 3*(-0.5))/4 = (6*(-2/3)+1.5)/4 = (-4+1.5)/4 = -2.5/4 = -5/8
    const result = math.laguerreL(4, 1)
    assert(Math.abs(result - (-5 / 8)) < 1e-14,
      `L_4(1) = ${result}`)
  })

  it('should throw for non-integer n', function () {
    assert.throws(() => math.laguerreL(1.5, 0), /TypeError/)
    assert.throws(() => math.laguerreL(-1, 0), /TypeError/)
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.laguerreL('abc', 0))
    assert.throws(() => math.laguerreL())
  })
})
