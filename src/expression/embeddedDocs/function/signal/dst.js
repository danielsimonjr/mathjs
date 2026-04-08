export const dstDocs = {
  name: 'dst',
  category: 'Signal',
  syntax: [
    'dst(signal)'
  ],
  description: 'Compute the Discrete Sine Transform (DST-I) of a real-valued signal. X[k] = sum_{n=0}^{N-1} x[n] * sin(pi * (n+1) * (k+1) / (N+1)). Computed directly in O(N^2). Useful for PDEs with Dirichlet boundary conditions. The DST-I is its own inverse up to the scaling factor 2/(N+1), so idst(dst(x)) == x.',
  examples: [
    'dst([1, 0, -1])',
    'dst([1, 2, 3, 4])'
  ],
  seealso: ['idst', 'dct', 'fourier', 'fft']
}
