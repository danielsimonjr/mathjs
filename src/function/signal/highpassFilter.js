import { factory } from '../../utils/factory.js'

const name = 'highpassFilter'

const dependencies = ['typed']

export const createHighpassFilter = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Apply a 2nd order Butterworth highpass IIR filter to a signal.
   *
   * Syntax:
   *    math.highpassFilter(signal, cutoff, sampleRate)
   *
   * Examples:
   *    math.highpassFilter([1, -1, 1, -1, 1, -1, 1, -1], 0.1, 1)
   *
   * See also:
   *    lowpassFilter, bandpassFilter, fft
   *
   * @param {Array | Matrix} signal     Input signal array
   * @param {number}         cutoff     Cutoff frequency in Hz
   * @param {number}         sampleRate Sample rate in Hz
   * @return {Array} Filtered signal
   */
  return typed(name, {
    'Array, number, number': function (signal, cutoff, sampleRate) {
      return _highpass(signal, cutoff, sampleRate)
    },
    'Matrix, number, number': function (signal, cutoff, sampleRate) {
      return _highpass(signal.valueOf(), cutoff, sampleRate)
    }
  })

  function _highpass (signal, cutoff, sampleRate) {
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
