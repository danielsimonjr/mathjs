export const moebiusMuDocs = {
  name: 'moebiusMu',
  category: 'Combinatorics',
  syntax: [
    'moebiusMu(n)'
  ],
  description:
    'Compute the Mobius function mu(n). ' +
    'mu(1) = 1, mu(n) = 0 if n has a squared prime factor, ' +
    'mu(n) = (-1)^k if n is a product of k distinct primes.',
  examples: [
    'moebiusMu(1)',
    'moebiusMu(2)',
    'moebiusMu(6)',
    'moebiusMu(4)',
    'moebiusMu(30)'
  ],
  seealso: ['primeFactors', 'eulerPhi', 'divisors']
}
