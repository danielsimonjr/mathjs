export const fft2dDocs = {
  name: 'fft2d',
  category: 'Signal',
  syntax: [
    'fft2d(matrix)'
  ],
  description: 'Compute the 2D Discrete Fourier Transform of a real-valued matrix. The 2D DFT is applied by computing a 1D DFT along each row, then along each column of the result. Returns a 2D array of complex numbers with properties re and im. The DC component (zero frequency) is at position [0][0].',
  examples: [
    'fft2d([[1, 1], [1, 1]])',
    'fft2d([[1, 0], [0, 0]])'
  ],
  seealso: ['fft', 'ifft', 'fourier']
}
