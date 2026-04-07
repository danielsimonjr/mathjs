import { factory } from '../../utils/factory.js'

const name = 'convolve'

const dependencies = ['typed']

export const createConvolve = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the discrete linear convolution of two arrays or matrices.
   * The output length is len(a) + len(b) - 1.
   *
   * Syntax:
   *    math.convolve(a, b)
   *
   * Examples:
   *    math.convolve([1, 2, 3], [1, 1])   // returns [1, 3, 5, 3]
   *    math.convolve([1, 0, 0], [1, 2, 3]) // returns [1, 2, 3]
   *
   * See also:
   *    correlate, fft, ifft
   *
   * @param {Array | Matrix} a  First input array or matrix
   * @param {Array | Matrix} b  Second input array or matrix
   * @return {Array} The convolution of a and b
   */
  return typed(name, {
    'Array, Array': function (a, b) {
      return _convolve(a, b)
    },
    'Matrix, Matrix': function (a, b) {
      return _convolve(a.valueOf(), b.valueOf())
    },
    'Array, Matrix': function (a, b) {
      return _convolve(a, b.valueOf())
    },
    'Matrix, Array': function (a, b) {
      return _convolve(a.valueOf(), b)
    }
  })

  function _convolve (a, b) {
    const lenA = a.length
    const lenB = b.length
    if (lenA === 0 || lenB === 0) {
      return []
    }
    const outLen = lenA + lenB - 1
    const out = new Array(outLen).fill(0)
    for (let n = 0; n < outLen; n++) {
      const kMin = Math.max(0, n - lenB + 1)
      const kMax = Math.min(lenA - 1, n)
      for (let k = kMin; k <= kMax; k++) {
        out[n] += a[k] * b[n - k]
      }
    }
    return out
  }
})
