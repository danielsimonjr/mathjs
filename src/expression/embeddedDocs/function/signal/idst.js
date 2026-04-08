export const idstDocs = {
  name: 'idst',
  category: 'Signal',
  syntax: [
    'idst(spectrum)'
  ],
  description: 'Compute the Inverse Discrete Sine Transform (IDST-I). x[n] = (2/(N+1)) * sum_{k=0}^{N-1} X[k] * sin(pi * (n+1) * (k+1) / (N+1)). The IDST-I is self-inverse: applying it to the output of dst with scaling 2/(N+1) recovers the original signal. idst(dst(x)) == x within floating-point tolerance.',
  examples: [
    'idst(dst([1, 2, 3, 4]))',
    'idst([1, 0, -1])'
  ],
  seealso: ['dst', 'dct', 'fourier', 'fft']
}
