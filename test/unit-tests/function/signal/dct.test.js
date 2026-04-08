import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDct } from '../../../../src/function/signal/dct.js'

const math = create({ ...all, createDct })
const dct = math.dct

describe('dct', function () {
  it('should return empty array for empty input', function () {
    assert.deepStrictEqual(dct([]), [])
  })

  it('should compute DC-only result for constant signal', function () {
    // dct([1,1,1,1]): X[0] = sum = 4, X[k>0] = 0
    const result = dct([1, 1, 1, 1])
    assert.strictEqual(result.length, 4)
    approxDeepEqual(result[0], 4)
    approxDeepEqual(result[1], 0)
    approxDeepEqual(result[2], 0)
    approxDeepEqual(result[3], 0)
  })

  it('should compute known values for [1, 0, -1, 0]', function () {
    const result = dct([1, 0, -1, 0])
    assert.strictEqual(result.length, 4)
    const pi = Math.PI
    const expected = [0, 1, 2, 3].map(k =>
      [1, 0, -1, 0].reduce((sum, x, n) => sum + x * Math.cos(pi * (2 * n + 1) * k / 8), 0)
    )
    for (let k = 0; k < 4; k++) {
      approxDeepEqual(result[k], expected[k])
    }
  })

  it('should compute known values for single element', function () {
    approxDeepEqual(dct([5])[0], 5)
  })

  it('should return N values for N inputs', function () {
    assert.strictEqual(dct([1, 2, 3, 4, 5]).length, 5)
    assert.strictEqual(dct([1, 2]).length, 2)
  })

  it('should satisfy: X[0] equals sum of all input samples', function () {
    const signal = [3, 1, 4, 1, 5, 9, 2, 6]
    const result = dct(signal)
    const expectedX0 = signal.reduce((a, b) => a + b, 0)
    approxDeepEqual(result[0], expectedX0)
  })

  it('should be linear: dct(a*x + b*y) = a*dct(x) + b*dct(y)', function () {
    const x = [1, 2, 3, 4]
    const y = [4, 3, 2, 1]
    const a = 2
    const b = 3
    const combined = x.map((xi, i) => a * xi + b * y[i])
    const resultCombined = dct(combined)
    const resultX = dct(x)
    const resultY = dct(y)
    const resultLinear = resultX.map((xi, i) => a * xi + b * resultY[i])
    for (let k = 0; k < 4; k++) {
      // Use absolute tolerance for values near zero (floating point residuals)
      assert.ok(Math.abs(resultCombined[k] - resultLinear[k]) < 1e-10,
        `linearity violated at k=${k}: ${resultCombined[k]} vs ${resultLinear[k]}`)
    }
  })

  it('should handle two-element input', function () {
    // dct([1, 0]): X[k] = sum_{n=0}^{1} x[n] * cos(pi*(2n+1)*k/4)
    // X[0] = 1*cos(0) + 0*cos(pi/2) = 1
    // X[1] = 1*cos(pi/4) + 0*cos(3pi/4) = cos(pi/4)
    const result = dct([1, 0])
    const pi = Math.PI
    approxDeepEqual(result[0], 1)
    approxDeepEqual(result[1], Math.cos(pi / 4))
  })
})
