import { factory } from '../../utils/factory.js'

const name = 'lowpassFilter'

const dependencies = ['typed']

export const createLowpassFilter = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Apply a 2nd order Butterworth lowpass IIR filter to a signal.
   *
   * Syntax:
   *    math.lowpassFilter(signal, cutoff, sampleRate)
   *
   * Examples:
   *    math.lowpassFilter([1, 1, 1, 1, 1, 1, 1, 1], 0.4, 1)
   *
   * See also:
   *    highpassFilter, bandpassFilter, fft
   *
   * @param {Array | Matrix} signal     Input signal array
   * @param {number}         cutoff     Cutoff frequency in Hz
   * @param {number}         sampleRate Sample rate in Hz
   * @return {Array} Filtered signal
   */
  return typed(name, {
    'Array, number, number': function (signal, cutoff, sampleRate) {
      return _lowpass(signal, cutoff, sampleRate)
    },
    'Matrix, number, number': function (signal, cutoff, sampleRate) {
      return _lowpass(signal.valueOf(), cutoff, sampleRate)
    }
  })

  function _lowpass (signal, cutoff, sampleRate) {
    if (sampleRate <= 0) throw new Error('lowpassFilter: sampleRate must be positive')
    if (cutoff <= 0 || cutoff >= sampleRate / 2) {
      throw new Error('lowpassFilter: cutoff must be between 0 and sampleRate/2 (Nyquist)')
    }
    const wc = Math.tan(Math.PI * cutoff / sampleRate)
    const wc2 = wc * wc
    const a0 = 1 + Math.SQRT2 * wc + wc2
    const b = [wc2 / a0, 2 * wc2 / a0, wc2 / a0]
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
