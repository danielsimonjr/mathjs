import { factory } from '../../utils/factory.js'

const name = 'dst'
const dependencies = ['typed']

export const createDst = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Discrete Sine Transform (DST-I) of a real-valued signal.
   *
   * The DST-I is defined as:
   *   X[k] = sum_{n=0}^{N-1} x[n] * sin(pi * (n+1) * (k+1) / (N+1))
   *
   * This transform is computed directly in O(N^2). It is useful for solving
   * partial differential equations with Dirichlet boundary conditions and
   * for signal processing applications where odd symmetry is assumed.
   *
   * The DST-I is its own inverse up to a scaling factor:
   *   idst(dst(x)) = x  (with scaling 2/(N+1))
   *
   * Syntax:
   *
   *    math.dst(signal)
   *
   * Examples:
   *
   *    math.dst([1, 0, -1])
   *    math.dst([1, 2, 3, 4])
   *
   * See also:
   *
   *    idst, dct, fourier
   *
   * @param {Array} signal  Real-valued input array
   * @return {Array}        DST-I coefficients
   */
  return typed(name, {
    Array: function (signal) {
      const N = signal.length
      if (N === 0) return []

      const result = new Array(N)
      const factor = Math.PI / (N + 1)

      for (let k = 0; k < N; k++) {
        let sum = 0
        for (let n = 0; n < N; n++) {
          sum += signal[n] * Math.sin(factor * (n + 1) * (k + 1))
        }
        result[k] = sum
      }

      return result
    }
  })
})
