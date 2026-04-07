import { factory } from '../../utils/factory.js'

const name = 'correlate'

const dependencies = ['typed']

export const createCorrelate = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the cross-correlation of two arrays or matrices.
   * correlate(a, b) is equivalent to convolve(a, reverse(b)).
   * When called with a single argument, computes the autocorrelation.
   *
   * Syntax:
   *    math.correlate(a, b)
   *    math.correlate(a)
   *
   * Examples:
   *    math.correlate([1, 2, 3], [1, 2, 3])  // autocorrelation-like cross-correlation
   *    math.correlate([1, 0, 0, 1], [1, 0, 0, 1])
   *
   * See also:
   *    convolve, fft, ifft
   *
   * @param {Array | Matrix} a  First input array or matrix
   * @param {Array | Matrix} [b]  Second input array or matrix (defaults to a for autocorrelation)
   * @return {Array} The cross-correlation of a and b
   */
  return typed(name, {
    Array: function (a) {
      return _correlate(a, a)
    },
    Matrix: function (a) {
      return _correlate(a.valueOf(), a.valueOf())
    },
    'Array, Array': function (a, b) {
      return _correlate(a, b)
    },
    'Matrix, Matrix': function (a, b) {
      return _correlate(a.valueOf(), b.valueOf())
    },
    'Array, Matrix': function (a, b) {
      return _correlate(a, b.valueOf())
    },
    'Matrix, Array': function (a, b) {
      return _correlate(a.valueOf(), b)
    }
  })

  function _correlate (a, b) {
    const bReversed = b.slice().reverse()
    return _convolve(a, bReversed)
  }

  function _convolve (a, b) {
    const lenA = a.length
    const lenB = b.length
    const outLen = lenA + lenB - 1
    const out = new Array(outLen).fill(0)
    for (let n = 0; n < outLen; n++) {
      for (let k = 0; k < lenA; k++) {
        const j = n - k
        if (j >= 0 && j < lenB) {
          out[n] += a[k] * b[j]
        }
      }
    }
    return out
  }
})
