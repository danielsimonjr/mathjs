export const jacobiSymbolDocs = {
  name: 'jacobiSymbol',
  category: 'Combinatorics',
  syntax: [
    'jacobiSymbol(a, n)'
  ],
  description: 'Compute the Jacobi symbol (a/n), a generalization of the Legendre symbol. Returns 0, 1, or -1. n must be an odd positive integer.',
  examples: [
    'jacobiSymbol(1, 1)',
    'jacobiSymbol(2, 7)',
    'jacobiSymbol(3, 5)',
    'jacobiSymbol(5, 21)'
  ],
  seealso: ['eulerPhi', 'moebiusMu', 'primeFactors']
}
