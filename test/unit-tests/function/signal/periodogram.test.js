import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createPeriodogram } from '../../../../src/function/signal/periodogram.js'

const math = create({ ...all, createPeriodogram })
const periodogram = math.periodogram

describe('periodogram', function () {
  it('should return empty arrays for empty signal', function () {
    const result = periodogram([])
    assert.deepStrictEqual(result.frequencies, [])
    assert.deepStrictEqual(result.power, [])
  })

  it('should return object with frequencies and power arrays', function () {
    const result = periodogram([1, 0, -1, 0, 1, 0, -1, 0])
    assert.ok(Array.isArray(result.frequencies))
    assert.ok(Array.isArray(result.power))
  })

  it('should return one-sided spectrum with matching lengths', function () {
    const result = periodogram([1, 0, -1, 0, 1, 0, -1, 0])
    assert.strictEqual(result.frequencies.length, result.power.length)
  })

  it('should produce non-negative power values', function () {
    const result = periodogram([1, 2, 3, 4, 5, 6, 7, 8])
    for (const p of result.power) {
      assert.ok(p >= 0, 'power should be non-negative')
    }
  })

  it('should show peak at correct bin for sinusoidal signal', function () {
    // Signal with 2 cycles in 8 samples -> frequency bin 2
    const N = 8
    const signal = []
    for (let i = 0; i < N; i++) {
      signal.push(Math.cos(2 * Math.PI * 2 * i / N))
    }
    const result = periodogram(signal, { window: 'rectangular' })
    // Find the peak bin
    let peakBin = 0
    let peakPow = 0
    for (let i = 0; i < result.power.length; i++) {
      if (result.power[i] > peakPow) {
        peakPow = result.power[i]
        peakBin = i
      }
    }
    assert.strictEqual(peakBin, 2, 'peak should be at frequency bin 2')
  })

  it('should start frequencies at 0 (DC)', function () {
    const result = periodogram([1, 0, -1, 0])
    assert.strictEqual(result.frequencies[0], 0)
  })

  it('should use sample rate to compute frequencies', function () {
    const result = periodogram([1, 0, -1, 0], { sampleRate: 1000 })
    assert.strictEqual(result.frequencies[0], 0)
    assert.ok(result.frequencies[result.frequencies.length - 1] > 0)
  })

  it('should have DC component dominate for constant signal', function () {
    const result = periodogram([2, 2, 2, 2])
    const dcPower = result.power[0]
    const totalOther = result.power.slice(1).reduce((a, b) => a + b, 0)
    assert.ok(dcPower > totalOther, 'DC component should dominate for constant signal')
  })

  it('should accept hamming window without throwing', function () {
    assert.doesNotThrow(() => periodogram([1, 2, 3, 4, 5, 6, 7, 8], { window: 'hamming' }))
  })

  it('should accept hanning window without throwing', function () {
    assert.doesNotThrow(() => periodogram([1, 2, 3, 4, 5, 6, 7, 8], { window: 'hanning' }))
  })

  it('should accept blackman window without throwing', function () {
    assert.doesNotThrow(() => periodogram([1, 2, 3, 4, 5, 6, 7, 8], { window: 'blackman' }))
  })

  it('should accept custom nfft option producing correct bin count', function () {
    const result = periodogram([1, 0, -1, 0], { nfft: 16 })
    // numBins = floor(16/2)+1 = 9
    assert.strictEqual(result.frequencies.length, 9)
    assert.strictEqual(result.power.length, 9)
  })
})
