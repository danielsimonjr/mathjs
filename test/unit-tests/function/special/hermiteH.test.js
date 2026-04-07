import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createHermiteH } from '../../../../src/function/special/hermiteH.js'

const math = create({ ...allFactories, createHermiteH })

describe('hermiteH', function () {
  it('should return H_0(x) = 1 for any x', function () {
    assert.strictEqual(math.hermiteH(0, 0), 1)
    assert.strictEqual(math.hermiteH(0, 1), 1)
    assert.strictEqual(math.hermiteH(0, -5), 1)
  })

  it('should return H_1(x) = 2x', function () {
    assert.strictEqual(math.hermiteH(1, 0), 0)
    assert.strictEqual(math.hermiteH(1, 1), 2)
    assert.strictEqual(math.hermiteH(1, 0.5), 1)
  })

  it('should compute H_2(1) = 2', function () {
    // H_2(x) = 4x^2 - 2; H_2(1) = 4 - 2 = 2
    assert(Math.abs(math.hermiteH(2, 1) - 2) < 1e-14)
  })

  it('should compute H_3(1) = -4', function () {
    // H_3(x) = 8x^3 - 12x; H_3(1) = 8 - 12 = -4
    assert(Math.abs(math.hermiteH(3, 1) - (-4)) < 1e-13)
  })

  it('should compute H_2(0) = -2', function () {
    // H_2(x) = 4x^2 - 2; H_2(0) = -2
    assert(Math.abs(math.hermiteH(2, 0) - (-2)) < 1e-15)
  })

  it('should satisfy H_0 = 1 and H_1 = 2x', function () {
    const x = 0.3
    assert.strictEqual(math.hermiteH(0, x), 1)
    assert(Math.abs(math.hermiteH(1, x) - 2 * x) < 1e-15)
  })

  it('should satisfy the recurrence relation explicitly', function () {
    const x = 0.7
    for (let n = 1; n < 6; n++) {
      const hNext = math.hermiteH(n + 1, x)
      const expected = 2 * x * math.hermiteH(n, x) - 2 * n * math.hermiteH(n - 1, x)
      assert(Math.abs(hNext - expected) < 1e-10,
        `Recurrence failed at n=${n}`)
    }
  })

  it('should have correct parity: H_n(-x) = (-1)^n * H_n(x)', function () {
    const x = 0.6
    for (let n = 0; n <= 5; n++) {
      const expected = Math.pow(-1, n) * math.hermiteH(n, x)
      const result = math.hermiteH(n, -x)
      assert(Math.abs(result - expected) < 1e-12,
        `Parity failed at n=${n}`)
    }
  })

  it('should compute H_4(0.5) correctly', function () {
    // H_4(x) = 16x^4 - 48x^2 + 12; H_4(0.5) = 16*0.0625 - 48*0.25 + 12 = 1 - 12 + 12 = 1
    assert(Math.abs(math.hermiteH(4, 0.5) - 1) < 1e-13)
  })

  it('should throw for non-integer n', function () {
    assert.throws(() => math.hermiteH(1.5, 0), /TypeError/)
    assert.throws(() => math.hermiteH(-1, 0), /TypeError/)
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.hermiteH('abc', 0))
    assert.throws(() => math.hermiteH())
  })
})
