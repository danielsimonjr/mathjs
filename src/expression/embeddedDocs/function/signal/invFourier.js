export const invFourierDocs = {
  name: 'invFourier',
  category: 'Signal',
  syntax: [
    'invFourier(spectrum)'
  ],
  description: 'Reconstruct a real-valued signal from its Fourier spectrum. Accepts either a complex coefficient array (as returned by fourier with output:"complex") or a spectrum object { frequencies, amplitudes, phases } (as returned by the default fourier() call). Applies the inverse FFT with proper N-scaling.',
  examples: [
    'invFourier(fourier([1, 0, 1, 0], {output: "complex"}))',
    'invFourier(fourier([3, 1, 4, 1, 5, 9], {output: "complex"}))'
  ],
  seealso: ['fourier', 'fft', 'ifft', 'convolve']
}
