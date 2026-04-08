import { factory } from '../../utils/factory.js'

const name = 'spectrogram'
const dependencies = ['typed']

export const createSpectrogram = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the spectrogram of a signal using the Short-Time Fourier Transform (STFT).
   *
   * The signal is divided into overlapping windows and an FFT is computed on each.
   * Returns a time-frequency representation with magnitude values.
   *
   * Syntax:
   *
   *    math.spectrogram(signal, windowSize)
   *    math.spectrogram(signal, windowSize, options)
   *
   * Examples:
   *
   *    math.spectrogram([1,0,-1,0,1,0,-1,0], 4)
   *    math.spectrogram([1,0,-1,0,1,0,-1,0], 4, {hopSize: 2, window: "hamming"})
   *
   * See also:
   *
   *    fourier, fft, periodogram
   *
   * @param {Array}  signal      Input signal
   * @param {number} windowSize  Length of each analysis window
   * @param {Object} [options]   Options:
   *   - hopSize {number}: step size between windows (default: windowSize/2)
   *   - window  {string}: window function type: 'rectangular', 'hamming', 'hanning', 'blackman' (default: 'hamming')
   * @return {Object}  { times: number[], frequencies: number[], magnitude: number[][] }
   *   magnitude[t][f] is the magnitude at time index t, frequency index f
   */
  return typed(name, {
    'Array, number': function (signal, windowSize) {
      return _spectrogram(signal, windowSize, {})
    },
    'Array, number, Object': function (signal, windowSize, options) {
      return _spectrogram(signal, windowSize, options)
    }
  })

  function _applyWindow (frame, windowType) {
    const n = frame.length
    const TWO_PI = 2 * Math.PI
    return frame.map((val, k) => {
      let w
      switch (windowType) {
        case 'rectangular':
          w = 1
          break
        case 'hanning':
          w = 0.5 * (1 - Math.cos(TWO_PI * k / (n - 1)))
          break
        case 'blackman':
          w = 0.42 - 0.5 * Math.cos(TWO_PI * k / (n - 1)) + 0.08 * Math.cos(2 * TWO_PI * k / (n - 1))
          break
        case 'hamming':
        default:
          w = 0.54 - 0.46 * Math.cos(TWO_PI * k / (n - 1))
          break
      }
      return val * w
    })
  }

  function _fftMagnitude (frame) {
    const N = frame.length
    const mag = new Array(N)
    for (let k = 0; k < N; k++) {
      let re = 0
      let im = 0
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N
        re += frame[n] * Math.cos(angle)
        im -= frame[n] * Math.sin(angle)
      }
      mag[k] = Math.sqrt(re * re + im * im)
    }
    return mag
  }

  function _spectrogram (signal, windowSize, options) {
    if (!Number.isInteger(windowSize) || windowSize <= 0) {
      throw new Error('spectrogram: windowSize must be a positive integer')
    }

    const hopSize = (options && options.hopSize != null) ? options.hopSize : Math.floor(windowSize / 2)
    const windowType = (options && options.window) ? options.window : 'hamming'

    const N = signal.length
    const times = []
    const magnitude = []

    // Number of frequency bins (positive frequencies + DC)
    const numFreqBins = Math.floor(windowSize / 2) + 1

    let pos = 0
    while (pos + windowSize <= N) {
      const frame = signal.slice(pos, pos + windowSize)
      const windowed = _applyWindow(frame, windowType)
      const mag = _fftMagnitude(windowed)
      // Keep only non-redundant bins (DC to Nyquist)
      magnitude.push(mag.slice(0, numFreqBins))
      times.push(pos + windowSize / 2)
      pos += hopSize
    }

    const frequencies = []
    for (let k = 0; k < numFreqBins; k++) {
      frequencies.push(k / windowSize)
    }

    return { times, frequencies, magnitude }
  }
})
