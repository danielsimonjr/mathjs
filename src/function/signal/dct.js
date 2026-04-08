import { factory } from '../../utils/factory.js'

const name = 'dct'
const dependencies = ['typed']

export const createDct = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Discrete Cosine Transform (DCT-II) of a real-valued signal.
   *
   * The DCT-II is defined as:
   *   X[k] = sum_{n=0}^{N-1} x[n] * cos(pi * (2n+1) * k / (2N))
   *
   * This is the most commonly used form (often just called "the DCT").
   * It is computed directly in O(N^2).
   *
   * Syntax:
   *
   *    math.dct(signal)
   *
   * Examples:
   *
   *    math.dct([1, 1, 1, 1])    // [4, 0, 0, 0]
   *    math.dct([1, 0, -1, 0])
   *
   * See also:
   *
   *    fourier, fft
   *
   * @param {Array} signal  Real-valued input array
   * @return {Array}        DCT-II coefficients
   */
  return typed(name, {
    Array: function (signal) {
      const N = signal.length
      if (N === 0) return []

      const result = new Array(N)
      const piOver2N = Math.PI / (2 * N)

      for (let k = 0; k < N; k++) {
        let sum = 0
        for (let n = 0; n < N; n++) {
          sum += signal[n] * Math.cos(piOver2N * (2 * n + 1) * k)
        }
        result[k] = sum
      }

      return result
    }
  })
})
