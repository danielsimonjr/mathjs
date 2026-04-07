import { factory } from '../../utils/factory.js'

const name = 'bandpassFilter'

const dependencies = ['typed']

export const createBandpassFilter = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Apply a 2nd order Butterworth bandpass filter to a signal by cascading
   * a highpass filter at lowCutoff and a lowpass filter at highCutoff.
   *
   * Syntax:
   *    math.bandpassFilter(signal, lowCutoff, highCutoff, sampleRate)
   *
   * Examples:
   *    math.bandpassFilter([1, 0, -1, 0, 1, 0, -1, 0], 0.05, 0.45, 1)
   *
   * See also:
   *    lowpassFilter, highpassFilter, fft
   *
   * @param {Array | Matrix} signal      Input signal array
   * @param {number}         lowCutoff   Lower cutoff frequency in Hz
   * @param {number}         highCutoff  Upper cutoff frequency in Hz
   * @param {number}         sampleRate  Sample rate in Hz
   * @return {Array} Filtered signal
   */
  return typed(name, {
    'Array, number, number, number': function (signal, lowCutoff, highCutoff, sampleRate) {
      return _bandpass(signal, lowCutoff, highCutoff, sampleRate)
    },
    'Matrix, number, number, number': function (signal, lowCutoff, highCutoff, sampleRate) {
      return _bandpass(signal.valueOf(), lowCutoff, highCutoff, sampleRate)
    }
  })

  function _bandpass (signal, lowCutoff, highCutoff, sampleRate) {
    if (lowCutoff >= highCutoff) {
      throw new Error('bandpassFilter: lowCutoff must be less than highCutoff')
    }
    // First apply highpass at lowCutoff to remove low frequencies
    const hpFiltered = _applyHighpass(signal, lowCutoff, sampleRate)
    // Then apply lowpass at highCutoff to remove high frequencies
    return _applyLowpass(hpFiltered, highCutoff, sampleRate)
  }

  function _applyLowpass (signal, cutoff, sampleRate) {
    const wc = Math.tan(Math.PI * cutoff / sampleRate)
    const wc2 = wc * wc
    const a0 = 1 + Math.SQRT2 * wc + wc2
    const b = [wc2 / a0, 2 * wc2 / a0, wc2 / a0]
    const a = [1, 2 * (wc2 - 1) / a0, (1 - Math.SQRT2 * wc + wc2) / a0]
    return _applyBiquad(signal, b, a)
  }

  function _applyHighpass (signal, cutoff, sampleRate) {
    const wc = Math.tan(Math.PI * cutoff / sampleRate)
    const wc2 = wc * wc
    const a0 = 1 + Math.SQRT2 * wc + wc2
    const b = [1 / a0, -2 / a0, 1 / a0]
    const a = [1, 2 * (wc2 - 1) / a0, (1 - Math.SQRT2 * wc + wc2) / a0]
    return _applyBiquad(signal, b, a)
  }

  function _applyBiquad (signal, b, a) {
    const out = new Array(signal.length)
    let x1 = 0; let x2 = 0; let y1 = 0; let y2 = 0
    for (let i = 0; i < signal.length; i++) {
      out[i] = b[0] * signal[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
      x2 = x1; x1 = signal[i]
      y2 = y1; y1 = out[i]
    }
    return out
  }
})
