export const hilbertTransformDocs = {
  name: 'hilbertTransform',
  category: 'Signal',
  syntax: [
    'hilbertTransform(signal)'
  ],
  description: 'Compute the Hilbert transform of a real-valued signal. The Hilbert transform produces a 90-degree phase shift of the input. It is computed via DFT: multiply positive-frequency components by -i, zero out the DC and Nyquist, zero out negative frequencies, then take the imaginary part of the IDFT result. For a cosine input, the result approximates a sine wave of the same frequency.',
  examples: [
    'hilbertTransform([1, 0, -1, 0])',
    'hilbertTransform([1, 1, -1, -1])'
  ],
  seealso: ['fft', 'ifft', 'dst', 'fourier']
}
