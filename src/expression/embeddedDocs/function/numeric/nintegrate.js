export const nintegrateDocs = {
  name: 'nintegrate',
  category: 'Numeric',
  syntax: [
    'nintegrate(f, a, b)',
    'nintegrate(f, a, b, options)'
  ],
  description: 'Numerically integrate a function over an interval using adaptive Gauss-Kronrod quadrature.',
  examples: [
    'f(x) = x^2',
    'nintegrate(f, 0, 1)',
    'nintegrate(sin, 0, pi)',
    'nintegrate(exp, 0, 1)'
  ],
  seealso: ['derivative', 'solveODE', 'simpsons', 'trapz']
}
