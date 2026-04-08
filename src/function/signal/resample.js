import { factory } from '../../utils/factory.js'

const name = 'resample'
const dependencies = ['typed']

export const createResample = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Resample a signal to a new length or by a given factor using linear interpolation.
   *
   * For an integer factor > 1: upsample — inserts interpolated samples.
   * For an integer factor < 1: downsample — takes every 1/factor-th sample.
   * For a rational factor p/q (given as a decimal): resample to round(N * factor) samples.
   *
   * Syntax:
   *
   *    math.resample(signal, factor)
   *    math.resample(signal, newLength)
   *
   * When called with a number >= 1 that is an integer, it is treated as an
   * upsampling factor. When called with a number < 1, it is a downsampling factor.
   * Non-integer factors are supported via linear interpolation.
   *
   * Examples:
   *
   *    math.resample([1, 2, 3], 2)
   *    math.resample([1, 2, 3, 4, 5], 0.5)
   *
   * See also:
   *
   *    convolve, medfilt
   *
   * @param {Array}  signal  Input signal
   * @param {number} factor  Resampling factor (> 0). Factor > 1 upsamples, < 1 downsamples.
   * @return {Array}  Resampled signal
   */
  return typed(name, {
    'Array, number': function (signal, factor) {
      return _resample(signal, factor)
    }
  })

  function _resample (signal, factor) {
    const N = signal.length
    if (N === 0) return []
    if (factor <= 0) {
      throw new Error('resample: factor must be positive')
    }

    // Compute the new length
    const newLength = Math.round((N - 1) * factor) + 1

    if (newLength === N) return signal.slice()
    if (newLength === 1) return [signal[0]]

    const result = new Array(newLength)

    for (let i = 0; i < newLength; i++) {
      // Map output index to input index (continuous)
      const t = i * (N - 1) / (newLength - 1)
      const lo = Math.floor(t)
      const hi = Math.min(lo + 1, N - 1)
      const frac = t - lo
      result[i] = signal[lo] * (1 - frac) + signal[hi] * frac
    }

    return result
  }
})
