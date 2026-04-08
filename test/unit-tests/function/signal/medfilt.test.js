import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createMedfilt } from '../../../../src/function/signal/medfilt.js'

const math = create({ ...all, createMedfilt })
const medfilt = math.medfilt

describe('medfilt', function () {
  it('should return empty array for empty input', function () {
    assert.deepStrictEqual(medfilt([], 3), [])
  })

  it('should return same length as input', function () {
    const result = medfilt([1, 2, 3, 4, 5], 3)
    assert.strictEqual(result.length, 5)
  })

  it('should remove a spike (impulse noise)', function () {
    // [1, 2, 100, 2, 1] with window 3, median at each position:
    // pos 1: [1, 2, 100] -> median 2
    // pos 2: [2, 100, 2] -> median 2
    // pos 3: [100, 2, 1] -> median 2
    const result = medfilt([1, 2, 100, 2, 1], 3)
    assert.strictEqual(result.length, 5)
    // The spike at index 2 should be removed
    approxDeepEqual(result[2], 2)
    // Inner values should be close to original non-spike values
    approxDeepEqual(result[1], 2)
    approxDeepEqual(result[3], 2)
  })

  it('should handle window size 1 (identity)', function () {
    const signal = [5, 3, 8, 1, 6]
    const result = medfilt(signal, 1)
    for (let i = 0; i < signal.length; i++) {
      approxDeepEqual(result[i], signal[i])
    }
  })

  it('should handle constant signal', function () {
    const result = medfilt([3, 3, 3, 3, 3], 3)
    for (const v of result) {
      approxDeepEqual(v, 3)
    }
  })

  it('should compute known values for interior of sorted signal', function () {
    // [1, 2, 3, 4, 5] with window 3
    // pos 1: [1, 2, 3] -> 2
    // pos 2: [2, 3, 4] -> 3
    // pos 3: [3, 4, 5] -> 4
    const result = medfilt([1, 2, 3, 4, 5], 3)
    approxDeepEqual(result[1], 2)
    approxDeepEqual(result[2], 3)
    approxDeepEqual(result[3], 4)
  })

  it('should throw on even window size', function () {
    assert.throws(() => medfilt([1, 2, 3], 2), /windowSize must be odd/)
  })

  it('should throw on invalid window size', function () {
    assert.throws(() => medfilt([1, 2, 3], 0), /windowSize must be a positive integer/)
    assert.throws(() => medfilt([1, 2, 3], -3), /windowSize must be a positive integer/)
  })

  it('should handle single element signal', function () {
    const result = medfilt([7], 1)
    approxDeepEqual(result[0], 7)
  })

  it('should preserve median of window for all-same-value signal', function () {
    const result = medfilt([4, 4, 4, 4, 4], 5)
    for (const v of result) {
      approxDeepEqual(v, 4)
    }
  })
})
