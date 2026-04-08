import { factory } from '../../utils/factory.js'

const name = 'hilbertTransform'
const dependencies = ['typed']

export const createHilbertTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Compute the Hilbert transform of a real-valued signal.
   *
   * The Hilbert transform produces a 90-degree phase shift of the input signal.
   * It is computed via the FFT approach:
   *   1. Compute FFT of the input signal
   *   2. Multiply frequency-domain coefficients by -i*sign(k)
   *      (zero DC and Nyquist, multiply positive frequencies by -2i, zero negative)
   *   3. Compute IFFT and return the imaginary part
   *
   * This gives the imaginary part of the analytic signal. For a cosine input,
   * the result approximates a sine wave of the same frequency.
   *
   * Syntax:
   *
   *    math.hilbertTransform(signal)
   *
   * Examples:
   *
   *    math.hilbertTransform([1, 0, -1, 0])
   *    math.hilbertTransform([1, 1, -1, -1])
   *
   * See also:
   *
   *    fft, ifft, dst
   *
   * @param {Array} signal  Real-valued input array (length should be a power of 2 for best accuracy)
   * @return {Array}        Hilbert transform (imaginary part of the analytic signal)
   */
  return typed(name, {
    Array: function (signal) {
      return _hilbertTransform(signal)
    }
  })

  function _hilbertTransform (signal) {
    const N = signal.length
    if (N === 0) return []
    if (N === 1) return [0]

    // Compute DFT directly
    const re = new Array(N).fill(0)
    const im = new Array(N).fill(0)

    for (let k = 0; k < N; k++) {
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N
        re[k] += signal[n] * Math.cos(angle)
        im[k] -= signal[n] * Math.sin(angle)
      }
    }

    // Apply Hilbert transform in frequency domain:
    // H[k] = -i * sign(k) * X[k]
    // Equivalent: multiply by h where h[0]=0, h[1..N/2-1]=2, h[N/2]=0, h[N/2+1..N-1]=0
    // Then IFFT and take imaginary part
    // Direct approach: multiply X[k] by -i for k>0 and k<N/2, +i for k>N/2
    const hRe = new Array(N).fill(0)
    const hIm = new Array(N).fill(0)

    // DC component (k=0): set to 0
    hRe[0] = 0
    hIm[0] = 0

    const half = Math.floor(N / 2)

    // Positive frequencies: multiply X[k] by -i
    // -i * (a + ib) = b - ia
    for (let k = 1; k < half; k++) {
      hRe[k] = im[k]
      hIm[k] = -re[k]
    }

    // Nyquist (k = N/2 when N is even): set to 0
    if (N % 2 === 0) {
      hRe[half] = 0
      hIm[half] = 0
    } else {
      // Odd N: treat k=half as positive frequency
      hRe[half] = im[half]
      hIm[half] = -re[half]
    }

    // Negative frequencies: multiply X[k] by +i
    // +i * (a + ib) = -b + ia
    for (let k = half + 1; k < N; k++) {
      hRe[k] = -im[k]
      hIm[k] = re[k]
    }

    // Compute IFFT: IFFT(H)[n] = (1/N) * sum_k H[k] * e^{i*2*pi*k*n/N}
    const result = new Array(N)
    for (let n = 0; n < N; n++) {
      let sumRe = 0
      let sumIm = 0
      for (let k = 0; k < N; k++) {
        const angle = (2 * Math.PI * k * n) / N
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        sumRe += hRe[k] * cosA - hIm[k] * sinA
        sumIm += hRe[k] * sinA + hIm[k] * cosA
      }
      // Return real part of IFFT(H) — this is the Hilbert transform
      result[n] = sumRe / N
    }

    return result
  }
})
