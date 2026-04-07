export const correlateDocs = {
  name: 'correlate',
  category: 'Signal',
  syntax: [
    'correlate(a)',
    'correlate(a, b)'
  ],
  description: 'Compute the cross-correlation of two arrays. When called with one argument, computes the autocorrelation. Equivalent to convolve(a, reverse(b)).',
  examples: [
    'correlate([1, 2, 3])',
    'correlate([1, 2, 3], [1, 2, 3])',
    'correlate([1, 0, 0, 1], [0, 0, 1, 0])'
  ],
  seealso: ['convolve', 'fft', 'ifft']
}
