export const windowFunctionDocs = {
  name: 'windowFunction',
  category: 'Signal',
  syntax: [
    'windowFunction(n)',
    'windowFunction(n, type)',
    'windowFunction(n, "kaiser", alpha)'
  ],
  description: 'Compute a window function of length n. Supported types: rectangular, hamming, hanning, blackman, kaiser. Default type is hamming.',
  examples: [
    'windowFunction(5)',
    'windowFunction(5, "hamming")',
    'windowFunction(5, "hanning")',
    'windowFunction(5, "blackman")',
    'windowFunction(5, "rectangular")',
    'windowFunction(5, "kaiser", 2.5)'
  ],
  seealso: ['fft', 'ifft', 'convolve']
}
