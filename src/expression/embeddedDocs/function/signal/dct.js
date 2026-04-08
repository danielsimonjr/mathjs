export const dctDocs = {
  name: 'dct',
  category: 'Signal',
  syntax: [
    'dct(signal)'
  ],
  description: 'Compute the Discrete Cosine Transform (DCT-II) of a real-valued signal. DCT-II is defined as X[k] = sum_{n=0}^{N-1} x[n] * cos(pi*(2n+1)*k/(2N)). Computed directly in O(N^2). The DC component X[0] equals the sum of all input samples.',
  examples: [
    'dct([1, 1, 1, 1])',
    'dct([1, 0, -1, 0])'
  ],
  seealso: ['fourier', 'fft', 'spectrogram']
}
