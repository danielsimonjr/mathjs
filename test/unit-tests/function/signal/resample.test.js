import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createResample } from '../../../../src/function/signal/resample.js'

const math = create({ ...all, createResample })
const resample = math.resample

describe('resample', function () {
  it('should return empty array for empty input', function () {
    assert.deepStrictEqual(resample([], 2), [])
  })

  it('should upsample by factor 2 with linear interpolation', function () {
    // [1, 2, 3] with factor 2:
    // newLength = round((3-1)*2) + 1 = 5
    // result = [1, 1.5, 2, 2.5, 3]
    const result = resample([1, 2, 3], 2)
    assert.strictEqual(result.length, 5)
    approxDeepEqual(result[0], 1)
    approxDeepEqual(result[1], 1.5)
    approxDeepEqual(result[2], 2)
    approxDeepEqual(result[3], 2.5)
    approxDeepEqual(result[4], 3)
  })

  it('should preserve first and last sample', function () {
    const signal = [10, 20, 30, 40, 50]
    const result = resample(signal, 2)
    approxDeepEqual(result[0], signal[0])
    approxDeepEqual(result[result.length - 1], signal[signal.length - 1])
  })

  it('should downsample with factor 0.5', function () {
    // [1, 2, 3, 4, 5] with factor 0.5:
    // newLength = round((5-1)*0.5) + 1 = 3
    // result: [1, 3, 5]
    const result = resample([1, 2, 3, 4, 5], 0.5)
    assert.strictEqual(result.length, 3)
    approxDeepEqual(result[0], 1)
    approxDeepEqual(result[1], 3)
    approxDeepEqual(result[2], 5)
  })

  it('should return same signal for factor 1', function () {
    const signal = [1, 2, 3, 4]
    const result = resample(signal, 1)
    assert.strictEqual(result.length, signal.length)
    for (let i = 0; i < signal.length; i++) {
      approxDeepEqual(result[i], signal[i])
    }
  })

  it('should handle single element signal', function () {
    const result = resample([42], 3)
    assert.strictEqual(result.length, 1)
    approxDeepEqual(result[0], 42)
  })

  it('should support non-integer factor producing longer output', function () {
    const result = resample([0, 1, 2, 3], 1.5)
    assert.ok(result.length > 4, 'upsampled result should be longer')
    approxDeepEqual(result[0], 0)
    approxDeepEqual(result[result.length - 1], 3)
  })

  it('should throw on non-positive factor', function () {
    assert.throws(() => resample([1, 2, 3], 0), /factor must be positive/)
    assert.throws(() => resample([1, 2, 3], -1), /factor must be positive/)
  })

  it('should interpolate linearly between samples for linear input', function () {
    // Linear signal: resampling should give exact values at endpoints
    const signal = [0, 10, 20, 30]
    const result = resample(signal, 3)
    approxDeepEqual(result[0], 0)
    approxDeepEqual(result[result.length - 1], 30)
  })

  it('should handle two-element signal upsampling', function () {
    // [0, 10] factor 3 -> newLength = round(1*3)+1 = 4 -> [0, 3.33, 6.67, 10]
    const result = resample([0, 10], 3)
    assert.strictEqual(result.length, 4)
    approxDeepEqual(result[0], 0)
    approxDeepEqual(result[3], 10)
  })
})
