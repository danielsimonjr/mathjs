export const polyvalDocs = {
  name: 'polyval',
  category: 'Algebra',
  syntax: [
    'polyval(coeffs, x)'
  ],
  description:
    'Evaluate a polynomial at a value x using Horner\'s method. ' +
    'Coefficients are in ascending degree order: [c0, c1, c2, ...] ' +
    'represents c0 + c1*x + c2*x^2 + ...',
  examples: [
    'polyval([1, 2, 3], 2)',
    'polyval([1, 0, -1], 3)',
    'polyval([5], 100)'
  ],
  seealso: ['polyder', 'polymul', 'polyadd', 'polyfit']
}
