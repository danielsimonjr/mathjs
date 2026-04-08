export const divisorSigmaDocs = {
  name: 'divisorSigma',
  category: 'Combinatorics',
  syntax: [
    'divisorSigma(k, n)'
  ],
  description: 'Compute the divisor function sigma_k(n): the sum of the k-th powers of all positive divisors of n. k=0 gives the number of divisors; k=1 gives the sum of divisors.',
  examples: [
    'divisorSigma(0, 12)',
    'divisorSigma(1, 12)',
    'divisorSigma(1, 6)',
    'divisorSigma(2, 6)'
  ],
  seealso: ['divisors', 'eulerPhi', 'moebiusMu']
}
