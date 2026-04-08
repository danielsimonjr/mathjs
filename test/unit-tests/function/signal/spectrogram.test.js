import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createSpectrogram } from '../../../../src/function/signal/spectrogram.js'

const math = create({ ...all, createSpectrogram })
const spectrogram = math.spectrogram

describe('spectrogram', function () {
  it('should return object with times, frequencies, and magnitude', function () {
    const result = spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4)
    assert.ok(Array.isArray(result.times))
    assert.ok(Array.isArray(result.frequencies))
    assert.ok(Array.isArray(result.magnitude))
  })

  it('should produce correct number of time frames', function () {
    // signal length 8, windowSize 4, hopSize default = 2
    // frames at pos 0, 2, 4 -> 3 frames
    const result = spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4)
    assert.strictEqual(result.times.length, 3)
    assert.strictEqual(result.magnitude.length, 3)
  })

  it('should produce correct number of frequency bins', function () {
    // windowSize 4 -> numBins = floor(4/2)+1 = 3
    const result = spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4)
    assert.strictEqual(result.frequencies.length, 3)
    for (const frame of result.magnitude) {
      assert.strictEqual(frame.length, 3)
    }
  })

  it('should respect custom hopSize', function () {
    // signal length 8, windowSize 4, hopSize 1
    // frames: pos 0,1,2,3,4 -> 5 frames
    const result = spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4, { hopSize: 1 })
    assert.strictEqual(result.times.length, 5)
  })

  it('should produce non-negative magnitudes', function () {
    const result = spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4)
    for (const frame of result.magnitude) {
      for (const val of frame) {
        assert.ok(val >= 0, 'magnitude should be non-negative')
      }
    }
  })

  it('should show energy at correct frequency bin for sinusoidal signal', function () {
    // Signal: one cycle over windowSize=8 samples (frequency bin 1)
    const N = 8
    const signal = []
    for (let i = 0; i < N; i++) {
      signal.push(Math.cos(2 * Math.PI * i / N))
    }
    // Use rectangular window for exact results
    const result = spectrogram(signal, N, { window: 'rectangular', hopSize: N })
    // Bin 1 should have higher magnitude than bins 0, 2, 3, 4
    const mag = result.magnitude[0]
    assert.ok(mag[1] > mag[0], 'bin 1 should dominate over DC')
    assert.ok(mag[1] > mag[2], 'bin 1 should dominate over bin 2')
  })

  it('should throw on invalid windowSize', function () {
    assert.throws(() => spectrogram([1, 2, 3], 0), /windowSize must be a positive integer/)
    assert.throws(() => spectrogram([1, 2, 3], -4), /windowSize must be a positive integer/)
  })

  it('should handle default hamming window without throwing', function () {
    assert.doesNotThrow(() => spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4))
  })

  it('should handle rectangular window', function () {
    const result = spectrogram([1, 0, -1, 0, 1, 0, -1, 0], 4, { window: 'rectangular' })
    assert.ok(result.magnitude.length > 0)
  })
})
