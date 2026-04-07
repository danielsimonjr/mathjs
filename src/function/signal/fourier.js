import { factory } from '../../utils/factory.js'

const name = 'fourier'
const dependencies = ['typed', 'fft', 'abs', 'arg', 'complex']

export const createFourier = /* #__PURE__ */ factory(name, dependencies, ({ typed, fft, abs, arg, complex }) => {
  /**
   * Compute the Fourier transform of a real-valued signal with user-friendly output.
   *
   * Wraps math.fft with proper amplitude scaling (1/N) and provides
   * frequency bins, amplitudes, and phases.
   *
   * Syntax:
   *
   *    math.fourier(signal)
   *    math.fourier(signal, { sampleRate: fs })
   *    math.fourier(signal, { output: 'complex' })
   *
   * Examples:
   *
   *    math.fourier([1, 0, 1, 0])
   *    math.fourier([1, 1, 1, 1], { sampleRate: 44100 })
   *
   * See also:
   *
   *    invFourier, fft, ifft
   *
   * @param {Array} signal     Real-valued input signal array
   * @param {Object} [options] Options:
   *   - sampleRate {number}: sample rate in Hz (default: 1)
   *   - output {string}: 'spectrum' (default) or 'complex'
   * @return {Object|Array}
   *   When output='spectrum': { frequencies, amplitudes, phases }
   *   When output='complex': array of complex DFT coefficients (scaled by 1/N)
   */
  return typed(name, {
    Array: function (signal) {
      return _fourier(signal, {})
    },
    'Array, Object': function (signal, options) {
      return _fourier(signal, options)
    }
  })

  function _fourier (signal, options) {
    if (signal.length === 0) {
      return { frequencies: [], amplitudes: [], phases: [] }
    }
    const n = signal.length
    const sampleRate = (options && options.sampleRate) ? options.sampleRate : 1
    const outputType = (options && options.output) ? options.output : 'spectrum'

    // Compute raw DFT
    const raw = fft(signal)

    // Scale by 1/N
    const scaled = raw.map(c => {
      const re = (typeof c === 'number') ? c / n : c.re / n
      const im = (typeof c === 'object' && c !== null) ? c.im / n : 0
      return complex(re, im)
    })

    if (outputType === 'complex') {
      return scaled
    }

    // Build frequency bins: f_k = k * sampleRate / N  for k = 0..N-1
    const frequencies = new Array(n)
    const amplitudes = new Array(n)
    const phases = new Array(n)

    for (let k = 0; k < n; k++) {
      frequencies[k] = k * sampleRate / n
      amplitudes[k] = abs(scaled[k])
      phases[k] = arg(scaled[k])
    }

    return { frequencies, amplitudes, phases }
  }
})
