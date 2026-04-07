import { factory } from '../../utils/factory.js'

const name = 'invFourier'
const dependencies = ['typed', 'ifft', 'complex']

export const createInvFourier = /* #__PURE__ */ factory(name, dependencies, ({ typed, ifft, complex }) => {
  /**
   * Reconstruct a real-valued signal from its Fourier spectrum.
   *
   * This is the inverse of fourier(). Accepts either:
   *  - The complex spectrum array returned by fourier(signal, {output:'complex'})
   *  - A spectrum object { frequencies, amplitudes, phases } (reconstructs
   *    complex spectrum internally, then applies ifft)
   *
   * Syntax:
   *
   *    math.invFourier(spectrum)
   *
   * Examples:
   *
   *    s = math.fourier([1, 0, 1, 0], { output: "complex" })
   *    math.invFourier(s)
   *
   * See also:
   *
   *    fourier, fft, ifft
   *
   * @param {Array|Object} spectrum
   *   Either an array of complex DFT coefficients (scaled by 1/N, as
   *   returned by fourier with output:'complex'), or a spectrum object
   *   { frequencies, amplitudes, phases } as returned by fourier().
   * @return {Array}  Reconstructed signal (real parts of ifft output, scaled by N)
   */
  return typed(name, {
    Array: function (spectrum) {
      return _invFourierFromComplex(spectrum)
    },
    Object: function (spectrum) {
      return _invFourierFromObject(spectrum)
    }
  })

  /**
   * Reconstruct from complex coefficient array (each scaled by 1/N).
   * ifft expects un-scaled DFT, so we multiply back by N first.
   */
  function _invFourierFromComplex (spectrum) {
    if (spectrum.length === 0) return []
    const n = spectrum.length
    // Scale back up by N (undo the 1/N scaling from fourier())
    const unscaled = spectrum.map(c => {
      const re = (typeof c === 'object' && c !== null) ? c.re * n : c * n
      const im = (typeof c === 'object' && c !== null) ? c.im * n : 0
      return complex(re, im)
    })
    const result = ifft(unscaled)
    // Return real parts
    return result.map(c => (typeof c === 'object' && c !== null) ? c.re : c)
  }

  /**
   * Reconstruct from { frequencies, amplitudes, phases } spectrum object.
   */
  function _invFourierFromObject (spectrum) {
    const { amplitudes, phases } = spectrum
    const n = amplitudes.length
    // Rebuild complex scaled coefficients: c_k = A_k * e^(i*phi_k)
    const complexSpectrum = amplitudes.map((A, k) => {
      return complex(A * Math.cos(phases[k]), A * Math.sin(phases[k]))
    })
    return _invFourierFromComplex(complexSpectrum)
  }
})
