import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const highpassFilter = math.highpassFilter

describe('highpassFilter', function () {
  it('should return an array of same length as input', function () {
    const result = highpassFilter([1, -1, 1, -1, 1, -1, 1, -1], 0.1, 1)
    assert.strictEqual(result.length, 8)
  })

  it('should attenuate DC signal (converge to zero)', function () {
    // A long DC signal through highpass should converge to zero
    const dc = new Array(100).fill(1)
    const result = highpassFilter(dc, 0.1, 1)
    // After settling, the output should be close to 0
    approxDeepEqual(result[99], 0)
  })

  it('should pass high-frequency signal', function () {
    // Alternating signal at Nyquist should pass through highpass with low cutoff
    const highFreq = []
    for (let i = 0; i < 100; i++) {
      highFreq.push(i % 2 === 0 ? 1 : -1)
    }
    const result = highpassFilter(highFreq, 0.1, 1)
    // After transient, output amplitude should be significant
    const lastVal = Math.abs(result[99])
    assert.ok(lastVal > 0.5, 'High frequency should pass, got amplitude: ' + lastVal)
  })

  it('should accept Matrix input', function () {
    const signal = math.matrix([1, -1, 1, -1, 1, -1, 1, -1])
    const result = highpassFilter(signal, 0.1, 1)
    assert.strictEqual(result.length, 8)
  })

  it('should handle single-sample input', function () {
    const result = highpassFilter([1], 0.1, 1)
    assert.strictEqual(result.length, 1)
    assert.ok(isFinite(result[0]))
  })

  it('should return finite values for typical parameters', function () {
    const signal = [0, 1, 0, -1, 0, 1, 0, -1]
    const result = highpassFilter(signal, 0.3, 1)
    for (const v of result) {
      assert.ok(isFinite(v), 'Expected finite value, got: ' + v)
    }
  })
})
