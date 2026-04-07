import { factory } from '../../utils/factory.js'

const name = 'windowFunction'

const dependencies = ['typed']

export const createWindowFunction = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute a window function of length n.
   * Supported types: 'rectangular', 'hamming', 'hanning', 'blackman', 'kaiser'.
   * The default type is 'hamming'.
   *
   * Syntax:
   *    math.windowFunction(n)
   *    math.windowFunction(n, type)
   *    math.windowFunction(n, 'kaiser', alpha)
   *
   * Examples:
   *    math.windowFunction(5)
   *    math.windowFunction(5, "hamming")
   *    math.windowFunction(5, "hanning")
   *    math.windowFunction(5, "blackman")
   *    math.windowFunction(5, "rectangular")
   *    math.windowFunction(5, "kaiser", 2.5)
   *
   * See also:
   *    fft, ifft, convolve
   *
   * @param {number} n      Length of the window
   * @param {string} [type] Window type: 'rectangular', 'hamming', 'hanning', 'blackman', 'kaiser' (default: 'hamming')
   * @param {number} [alpha] Shape parameter for kaiser window (default: 2)
   * @return {Array} Array of length n with window values
   */
  return typed(name, {
    number: function (n) {
      return _window(n, 'hamming', 2)
    },
    'number, string': function (n, type) {
      return _window(n, type, 2)
    },
    'number, string, number': function (n, type, alpha) {
      return _window(n, type, alpha)
    }
  })

  function _window (n, type, alpha) {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error('windowFunction: n must be a positive integer')
    }
    // A single-sample window is always 1 regardless of window type
    if (n === 1) return [1]
    const w = new Array(n)
    const TWO_PI = 2 * Math.PI
    switch (type) {
      case 'rectangular':
        for (let k = 0; k < n; k++) {
          w[k] = 1
        }
        break
      case 'hamming':
        for (let k = 0; k < n; k++) {
          w[k] = 0.54 - 0.46 * Math.cos(TWO_PI * k / (n - 1))
        }
        break
      case 'hanning':
        for (let k = 0; k < n; k++) {
          w[k] = 0.5 * (1 - Math.cos(TWO_PI * k / (n - 1)))
        }
        break
      case 'blackman':
        for (let k = 0; k < n; k++) {
          w[k] = 0.42 - 0.5 * Math.cos(TWO_PI * k / (n - 1)) + 0.08 * Math.cos(2 * TWO_PI * k / (n - 1))
        }
        break
      case 'kaiser':
        {
          const i0Alpha = _besselI0(alpha)
          for (let k = 0; k < n; k++) {
            const x = 2 * k / (n - 1) - 1
            w[k] = _besselI0(alpha * Math.sqrt(1 - x * x)) / i0Alpha
          }
        }
        break
      default:
        throw new Error('windowFunction: unknown window type "' + type + '". Expected one of: rectangular, hamming, hanning, blackman, kaiser')
    }
    return w
  }

  /**
   * Modified Bessel function of the first kind, order 0.
   * Used internally for the Kaiser window.
   */
  function _besselI0 (x) {
    let sum = 1
    let term = 1
    const halfX = x / 2
    for (let k = 1; k <= 30; k++) {
      term *= (halfX / k) * (halfX / k)
      sum += term
      if (term < 1e-15 * sum) break
    }
    return sum
  }
})
