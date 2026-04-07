export const gammaincpDocs = {
  name: 'gammaincp',
  category: 'Special',
  syntax: ['gammaincp(a, x)'],
  description: 'Compute the regularized upper incomplete gamma function Q(a, x) = 1 - P(a, x) = Gamma(a, x) / Gamma(a). a must be positive, x must be non-negative.',
  examples: ['gammaincp(1, 0)', 'gammaincp(1, 1)', 'gammaincp(2, 1)', 'gammaincp(1, Infinity)'],
  seealso: ['gammainc', 'gamma', 'betainc', 'beta']
}
