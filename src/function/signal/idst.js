import { factory } from '../../utils/factory.js'

const name = 'idst'
const dependencies = ['typed']

export const createIdst = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Inverse Discrete Sine Transform (IDST-I) of a DST-I spectrum.
   *
   * The IDST-I exploits the self-inverse property of the DST-I:
   *   x[n] = (2 / (N+1)) * sum_{k=0}^{N-1} X[k] * sin(pi * (n+1) * (k+1) / (N+1))
   *
   * This is identical to the forward DST-I formula multiplied by the scaling factor
   * 2/(N+1), confirming that idst(dst(x)) == x (within floating-point tolerance).
   *
   * Syntax:
   *
   *    math.idst(spectrum)
   *
   * Examples:
   *
   *    math.idst(math.dst([1, 2, 3, 4]))
   *    math.idst([1, 0, -1])
   *
   * See also:
   *
   *    dst, dct, fourier
   *
   * @param {Array} spectrum  DST-I coefficients (output of dst)
   * @return {Array}          Reconstructed time-domain signal
   */
  return typed(name, {
    Array: function (spectrum) {
      const N = spectrum.length
      if (N === 0) return []

      const result = new Array(N)
      const factor = Math.PI / (N + 1)
      const scale = 2 / (N + 1)

      for (let n = 0; n < N; n++) {
        let sum = 0
        for (let k = 0; k < N; k++) {
          sum += spectrum[k] * Math.sin(factor * (n + 1) * (k + 1))
        }
        result[n] = scale * sum
      }

      return result
    }
  })
})
