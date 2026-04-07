export const convolveDocs = {
  name: 'convolve',
  category: 'Signal',
  syntax: [
    'convolve(a, b)'
  ],
  description: 'Compute the discrete linear convolution of two arrays. The output length is len(a) + len(b) - 1.',
  examples: [
    'convolve([1, 2, 3], [1, 1])',
    'convolve([1, 0, 0], [1, 2, 3])',
    'convolve([1, 2], [1, 2])'
  ],
  seealso: ['correlate', 'fft', 'ifft']
}
