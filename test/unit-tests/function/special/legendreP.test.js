import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLegendreP } from '../../../../src/function/special/legendreP.js'

const math = create({ ...allFactories, createLegendreP })

describe('legendreP', function () {
  it('should return P_0(x) = 1 for any x', function () {
    assert.strictEqual(math.legendreP(0, 0), 1)
    assert.strictEqual(math.legendreP(0, 0.5), 1)
    assert.strictEqual(math.legendreP(0, -1), 1)
  })

  it('should return P_1(x) = x', function () {
    assert.strictEqual(math.legendreP(1, 0), 0)
    assert.strictEqual(math.legendreP(1, 0.5), 0.5)
    assert.strictEqual(math.legendreP(1, -1), -1)
  })

  it('should return P_2(0.5) = -0.125', function () {
    assert(Math.abs(math.legendreP(2, 0.5) - (-0.125)) < 1e-15)
  })

  it('should return P_3(0.5) = -0.4375', function () {
    assert(Math.abs(math.legendreP(3, 0.5) - (-0.4375)) < 1e-15)
  })

  it('should return P_2(1) = 1 and P_3(1) = 1 (P_n(1) = 1 for all n)', function () {
    for (let n = 0; n <= 5; n++) {
      assert(Math.abs(math.legendreP(n, 1) - 1) < 1e-14, 'Failed for n=' + n)
    }
  })

  it('should return P_n(-1) = (-1)^n', function () {
    for (let n = 0; n <= 5; n++) {
      const expected = Math.pow(-1, n)
      assert(Math.abs(math.legendreP(n, -1) - expected) < 1e-14, 'Failed for n=' + n)
    }
  })

  it('should return P_n(0) with correct parity', function () {
    // P_1(0) = 0, P_2(0) = -0.5, P_3(0) = 0, P_4(0) = 3/8
    assert(Math.abs(math.legendreP(1, 0)) < 1e-15)
    assert(Math.abs(math.legendreP(2, 0) - (-0.5)) < 1e-14)
    assert(Math.abs(math.legendreP(3, 0)) < 1e-15)
    assert(Math.abs(math.legendreP(4, 0) - 0.375) < 1e-14)
  })

  it('should compute P_5 correctly via recurrence', function () {
    // P_5(0.5) = 63/8 * (0.5)^5 - 70/8 * (0.5)^3 + 15/8 * 0.5
    //          = 63/256 - 70/64 + 15/16 = (63 - 280 + 240) / 256 = 23/256
    const expected = 23 / 256
    assert(Math.abs(math.legendreP(5, 0.5) - expected) < 1e-14)
  })

  it('should handle high degree polynomials', function () {
    // P_n(1) = 1, P_n(-1) = (-1)^n for any n
    assert(Math.abs(math.legendreP(20, 1) - 1) < 1e-12)
    assert(Math.abs(math.legendreP(20, -1) - 1) < 1e-12)  // even degree
  })

  it('should throw TypeError for non-integer n', function () {
    assert.throws(() => math.legendreP(1.5, 0.5), /TypeError/)
    assert.throws(() => math.legendreP(-1, 0.5), /TypeError/)
  })

  it('should throw for invalid types', function () {
    assert.throws(() => math.legendreP('abc', 0))
    assert.throws(() => math.legendreP())
  })
})
