export const betaDocs = {
  name: 'beta',
  category: 'Special',
  syntax: ['beta(a, b)'],
  description: 'Compute the Beta function B(a, b) = Gamma(a) * Gamma(b) / Gamma(a + b). Both parameters must be positive.',
  examples: ['beta(1, 1)', 'beta(2, 3)', 'beta(0.5, 0.5)'],
  seealso: ['gamma', 'betainc', 'gammainc']
}
