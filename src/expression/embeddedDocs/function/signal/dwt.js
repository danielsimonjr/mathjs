export const dwtDocs = {
  name: 'dwt',
  category: 'Signal',
  syntax: [
    'dwt(signal, wavelet)'
  ],
  description: 'Compute one level of the Discrete Wavelet Transform (DWT). Decomposes the signal into approximation (lowpass) and detail (highpass) coefficients. Supported wavelets: "haar" (Haar wavelet) and "db2" (Daubechies-2). For "haar": approx[i] = (x[2i] + x[2i+1]) / sqrt(2), detail[i] = (x[2i] - x[2i+1]) / sqrt(2). Returns an object with approximation and detail arrays, each of length floor(N/2).',
  examples: [
    'dwt([1, 1, 1, 1], "haar")',
    'dwt([1, 2, 3, 4], "haar")',
    'dwt([1, 2, 3, 4], "db2")'
  ],
  seealso: ['fourier', 'dct', 'fft']
}
