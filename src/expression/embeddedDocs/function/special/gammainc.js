export const gammaincDocs = {
  name: 'gammainc',
  category: 'Special',
  syntax: ['gammainc(a, x)'],
  description: 'Compute the regularized lower incomplete gamma function P(a, x) = gamma(a, x) / Gamma(a). a must be positive, x must be non-negative.',
  examples: ['gammainc(1, 0)', 'gammainc(1, 1)', 'gammainc(2, 1)', 'gammainc(1, Infinity)'],
  seealso: ['gammaincp', 'gamma', 'betainc', 'beta']
}
