import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const lowpassFilter = math.lowpassFilter

describe('lowpassFilter', function () {
  it('should return an array of same length as input', function () {
    const result = lowpassFilter([1, 1, 1, 1, 1, 1, 1, 1], 0.4, 1)
    assert.strictEqual(result.length, 8)
  })

  it('should pass DC signal (converge to DC value)', function () {
    // A long DC signal through lowpass should converge to the DC value
    const dc = new Array(100).fill(1)
    const result = lowpassFilter(dc, 0.4, 1)
    // After settling, the output should be close to 1
    approxDeepEqual(result[99], 1)
  })

  it('should attenuate high-frequency signal', function () {
    // High-frequency alternating signal should be heavily attenuated by lowpass
    const highFreq = []
    for (let i = 0; i < 100; i++) {
      highFreq.push(i % 2 === 0 ? 1 : -1)
    }
    const result = lowpassFilter(highFreq, 0.1, 1)
    // After transient, output amplitude should be small
    const lastVal = Math.abs(result[99])
    assert.ok(lastVal < 0.2, 'High frequency should be attenuated, got: ' + lastVal)
  })

  it('should accept Matrix input', function () {
    const signal = math.matrix([1, 1, 1, 1, 1, 1, 1, 1])
    const result = lowpassFilter(signal, 0.4, 1)
    assert.strictEqual(result.length, 8)
  })

  it('should handle single-sample input', function () {
    const result = lowpassFilter([1], 0.4, 1)
    assert.strictEqual(result.length, 1)
    assert.ok(isFinite(result[0]))
  })

  it('should return finite values for typical parameters', function () {
    const signal = [0, 1, 0, -1, 0, 1, 0, -1]
    const result = lowpassFilter(signal, 0.3, 1)
    for (const v of result) {
      assert.ok(isFinite(v), 'Expected finite value, got: ' + v)
    }
  })
})
