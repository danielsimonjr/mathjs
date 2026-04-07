import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const bandpassFilter = math.bandpassFilter

describe('bandpassFilter', function () {
  it('should return an array of same length as input', function () {
    const result = bandpassFilter([1, 0, -1, 0, 1, 0, -1, 0], 0.05, 0.45, 1)
    assert.strictEqual(result.length, 8)
  })

  it('should attenuate DC signal', function () {
    // DC should be blocked by the highpass stage
    const dc = new Array(100).fill(1)
    const result = bandpassFilter(dc, 0.1, 0.4, 1)
    // After settling, the output should be near zero
    approxDeepEqual(result[99], 0)
  })

  it('should attenuate Nyquist-rate signal', function () {
    // High-frequency alternating signal should be blocked by lowpass stage
    const highFreq = []
    for (let i = 0; i < 100; i++) {
      highFreq.push(i % 2 === 0 ? 1 : -1)
    }
    const result = bandpassFilter(highFreq, 0.1, 0.4, 1)
    const lastVal = Math.abs(result[99])
    assert.ok(lastVal < 0.5, 'Nyquist signal should be attenuated, got: ' + lastVal)
  })

  it('should accept Matrix input', function () {
    const signal = math.matrix([1, 0, -1, 0, 1, 0, -1, 0])
    const result = bandpassFilter(signal, 0.05, 0.45, 1)
    assert.strictEqual(result.length, 8)
  })

  it('should throw when lowCutoff >= highCutoff', function () {
    assert.throws(function () {
      bandpassFilter([1, 2, 3], 0.4, 0.1, 1)
    }, /lowCutoff must be less than highCutoff/)

    assert.throws(function () {
      bandpassFilter([1, 2, 3], 0.3, 0.3, 1)
    }, /lowCutoff must be less than highCutoff/)
  })

  it('should handle single-sample input', function () {
    const result = bandpassFilter([1], 0.1, 0.4, 1)
    assert.strictEqual(result.length, 1)
    assert.ok(isFinite(result[0]))
  })

  it('should return finite values for typical parameters', function () {
    const signal = [0, 1, 0, -1, 0, 1, 0, -1]
    const result = bandpassFilter(signal, 0.1, 0.4, 1)
    for (const v of result) {
      assert.ok(isFinite(v), 'Expected finite value, got: ' + v)
    }
  })
})
