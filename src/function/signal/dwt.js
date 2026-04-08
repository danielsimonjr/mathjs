import { factory } from '../../utils/factory.js'

const name = 'dwt'
const dependencies = ['typed']

export const createDwt = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Discrete Wavelet Transform (DWT) of a signal.
   *
   * Performs one level of wavelet decomposition, splitting the signal into
   * approximation (lowpass) and detail (highpass) coefficients.
   *
   * Supported wavelets:
   *   - 'haar': Haar wavelet (default)
   *       approx[i] = (signal[2i] + signal[2i+1]) / sqrt(2)
   *       detail[i] = (signal[2i] - signal[2i+1]) / sqrt(2)
   *   - 'db2': Daubechies-2 wavelet (4-tap filter)
   *
   * Syntax:
   *
   *    math.dwt(signal, wavelet)
   *
   * Examples:
   *
   *    math.dwt([1, 1, 1, 1], "haar")
   *    math.dwt([1, 2, 3, 4], "haar")
   *    math.dwt([1, 2, 3, 4], "db2")
   *
   * See also:
   *
   *    fourier, dct
   *
   * @param {Array}  signal   Real-valued input signal (length must be even for haar)
   * @param {string} wavelet  Wavelet type: 'haar' or 'db2'
   * @return {Object} { approximation: number[], detail: number[] }
   */
  return typed(name, {
    'Array, string': function (signal, wavelet) {
      return _dwt(signal, wavelet)
    }
  })

  function _dwt (signal, wavelet) {
    const N = signal.length
    if (N === 0) return { approximation: [], detail: [] }

    switch (wavelet) {
      case 'haar':
        return _haarDwt(signal)
      case 'db2':
        return _db2Dwt(signal)
      default:
        throw new Error('dwt: unknown wavelet "' + wavelet + '". Expected one of: haar, db2')
    }
  }

  function _haarDwt (signal) {
    const N = signal.length
    const halfN = Math.floor(N / 2)
    const sqrt2 = Math.sqrt(2)
    const approximation = new Array(halfN)
    const detail = new Array(halfN)

    for (let i = 0; i < halfN; i++) {
      approximation[i] = (signal[2 * i] + signal[2 * i + 1]) / sqrt2
      detail[i] = (signal[2 * i] - signal[2 * i + 1]) / sqrt2
    }

    return { approximation, detail }
  }

  function _db2Dwt (signal) {
    // Daubechies-2 (db2) filter coefficients
    // Lowpass (scaling) filter h0
    const sqrt3 = Math.sqrt(3)
    const h0 = [
      (1 + sqrt3) / (4 * Math.sqrt(2)),
      (3 + sqrt3) / (4 * Math.sqrt(2)),
      (3 - sqrt3) / (4 * Math.sqrt(2)),
      (1 - sqrt3) / (4 * Math.sqrt(2))
    ]
    // Highpass (wavelet) filter h1 (from QMF relation: h1[k] = (-1)^k * h0[L-1-k])
    const h1 = [
      h0[3],
      -h0[2],
      h0[1],
      -h0[0]
    ]

    const N = signal.length
    const halfN = Math.floor(N / 2)
    const approximation = new Array(halfN)
    const detail = new Array(halfN)
    const filterLen = h0.length

    for (let i = 0; i < halfN; i++) {
      let a = 0
      let d = 0
      for (let k = 0; k < filterLen; k++) {
        // Periodic boundary conditions
        const idx = ((2 * i + k) % N + N) % N
        a += h0[k] * signal[idx]
        d += h1[k] * signal[idx]
      }
      approximation[i] = a
      detail[i] = d
    }

    return { approximation, detail }
  }
})
