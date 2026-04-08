import { factory } from '../../utils/factory.js'

const name = 'periodogram'
const dependencies = ['typed']

export const createPeriodogram = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Estimate the power spectral density (PSD) of a signal via the periodogram method.
   *
   * PSD is computed as |FFT(x)|^2 / N, with optional windowing.
   * Only the non-redundant (one-sided) spectrum is returned for real signals.
   *
   * Syntax:
   *
   *    math.periodogram(signal)
   *    math.periodogram(signal, options)
   *
   * Examples:
   *
   *    math.periodogram([1, 0, -1, 0, 1, 0, -1, 0])
   *    math.periodogram([1, 0, -1, 0], {sampleRate: 44100, window: "hamming"})
   *
   * See also:
   *
   *    fourier, spectrogram, fft
   *
   * @param {Array}  signal    Real-valued input signal
   * @param {Object} [options] Options:
   *   - sampleRate {number}: sample rate in Hz (default: 1)
   *   - window {string}: window function type: 'rectangular', 'hamming', 'hanning', 'blackman' (default: 'rectangular')
   *   - nfft {number}: FFT size (default: next power of 2 >= signal length)
   * @return {Object}  { frequencies: number[], power: number[] }
   */
  return typed(name, {
    Array: function (signal) {
      return _periodogram(signal, {})
    },
    'Array, Object': function (signal, options) {
      return _periodogram(signal, options)
    }
  })

  function _nextPow2 (n) {
    let p = 1
    while (p < n) p <<= 1
    return p
  }

  function _applyWindow (signal, windowType) {
    const N = signal.length
    const TWO_PI = 2 * Math.PI
    return signal.map((val, k) => {
      let w
      switch (windowType) {
        case 'hamming':
          w = 0.54 - 0.46 * Math.cos(TWO_PI * k / (N - 1))
          break
        case 'hanning':
          w = 0.5 * (1 - Math.cos(TWO_PI * k / (N - 1)))
          break
        case 'blackman':
          w = 0.42 - 0.5 * Math.cos(TWO_PI * k / (N - 1)) + 0.08 * Math.cos(2 * TWO_PI * k / (N - 1))
          break
        case 'rectangular':
        default:
          w = 1
          break
      }
      return val * w
    })
  }

  function _periodogram (signal, options) {
    const N = signal.length
    if (N === 0) return { frequencies: [], power: [] }

    const sampleRate = (options && options.sampleRate != null) ? options.sampleRate : 1
    const windowType = (options && options.window) ? options.window : 'rectangular'
    const nfft = (options && options.nfft != null) ? options.nfft : _nextPow2(N)

    // Apply window and zero-pad to nfft
    const windowed = _applyWindow(signal, windowType)
    const padded = new Array(nfft).fill(0)
    for (let i = 0; i < Math.min(N, nfft); i++) {
      padded[i] = windowed[i]
    }

    // Compute window normalization factor (sum of squares of window coefficients)
    let windowNorm = 0
    const TWO_PI = 2 * Math.PI
    for (let k = 0; k < N; k++) {
      let w
      switch (windowType) {
        case 'hamming':
          w = 0.54 - 0.46 * Math.cos(TWO_PI * k / (N - 1))
          break
        case 'hanning':
          w = 0.5 * (1 - Math.cos(TWO_PI * k / (N - 1)))
          break
        case 'blackman':
          w = 0.42 - 0.5 * Math.cos(TWO_PI * k / (N - 1)) + 0.08 * Math.cos(2 * TWO_PI * k / (N - 1))
          break
        default:
          w = 1
          break
      }
      windowNorm += w * w
    }

    // Compute DFT magnitudes squared
    const numBins = Math.floor(nfft / 2) + 1
    const power = new Array(numBins)
    const frequencies = new Array(numBins)

    for (let k = 0; k < numBins; k++) {
      let re = 0
      let im = 0
      for (let n = 0; n < nfft; n++) {
        const angle = (2 * Math.PI * k * n) / nfft
        re += padded[n] * Math.cos(angle)
        im -= padded[n] * Math.sin(angle)
      }
      const mag2 = re * re + im * im
      // PSD: scale by 1/(N * windowNorm)
      // Double bins except DC and Nyquist (one-sided spectrum)
      if (k === 0 || k === numBins - 1) {
        power[k] = mag2 / windowNorm
      } else {
        power[k] = 2 * mag2 / windowNorm
      }
      frequencies[k] = k * sampleRate / nfft
    }

    return { frequencies, power }
  }
})
