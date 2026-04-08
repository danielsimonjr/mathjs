import { factory } from '../../utils/factory.js'

const name = 'medfilt'
const dependencies = ['typed']

export const createMedfilt = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Apply a median filter to a 1D signal.
   *
   * For each sample position, computes the median of a sliding window of
   * the given size. Edge samples are handled by reflecting the signal
   * (mirror padding).
   *
   * Syntax:
   *
   *    math.medfilt(signal, windowSize)
   *
   * Examples:
   *
   *    math.medfilt([1, 2, 100, 2, 1], 3)
   *    math.medfilt([5, 1, 4, 2, 3], 3)
   *
   * See also:
   *
   *    convolve, resample
   *
   * @param {Array}  signal      Input signal
   * @param {number} windowSize  Must be a positive odd integer
   * @return {Array}  Filtered signal, same length as input
   */
  return typed(name, {
    'Array, number': function (signal, windowSize) {
      return _medfilt(signal, windowSize)
    }
  })

  function _median (arr) {
    const sorted = arr.slice().sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
  }

  function _medfilt (signal, windowSize) {
    if (!Number.isInteger(windowSize) || windowSize <= 0) {
      throw new Error('medfilt: windowSize must be a positive integer')
    }
    if (windowSize % 2 === 0) {
      throw new Error('medfilt: windowSize must be odd')
    }

    const N = signal.length
    if (N === 0) return []

    const half = Math.floor(windowSize / 2)
    const result = new Array(N)

    for (let i = 0; i < N; i++) {
      const window = []
      for (let j = -half; j <= half; j++) {
        let idx = i + j
        // Mirror (reflect) padding at boundaries
        if (idx < 0) {
          idx = -idx - 1
        } else if (idx >= N) {
          idx = 2 * N - idx - 1
        }
        // Clamp in case mirror goes out of range for very small signals
        if (idx < 0) idx = 0
        if (idx >= N) idx = N - 1
        window.push(signal[idx])
      }
      result[i] = _median(window)
    }

    return result
  }
})
