export const fourierDocs = {
  name: 'fourier',
  category: 'Signal',
  syntax: [
    'fourier(signal)',
    'fourier(signal, options)'
  ],
  description: 'Compute the Fourier transform of a real-valued signal with user-friendly output. Returns an object with frequencies, amplitudes, and phases arrays. Amplitudes are scaled by 1/N. Optionally accepts options.sampleRate (default: 1) for physical frequency bins, and options.output = "complex" to return the raw complex coefficient array instead.',
  examples: [
    'fourier([1, 0, 1, 0])',
    'fourier([1, 1, 1, 1])'
  ],
  seealso: ['invFourier', 'fft', 'ifft', 'convolve']
}
