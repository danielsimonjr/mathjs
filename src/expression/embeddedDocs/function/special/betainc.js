export const betaincDocs = {
  name: 'betainc',
  category: 'Special',
  syntax: ['betainc(x, a, b)'],
  description: 'Compute the regularized incomplete beta function I_x(a, b). x must be in [0, 1], a and b must be positive. Returns values in [0, 1].',
  examples: ['betainc(0, 2, 3)', 'betainc(1, 2, 3)', 'betainc(0.5, 2, 3)'],
  seealso: ['beta', 'gammainc', 'gamma']
}
