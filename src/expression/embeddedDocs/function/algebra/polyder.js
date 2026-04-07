export const polyderDocs = {
  name: 'polyder',
  category: 'Algebra',
  syntax: [
    'polyder(coeffs)'
  ],
  description:
    'Compute the derivative of a polynomial given its coefficient array. ' +
    'Coefficients are in ascending degree order: [c0, c1, c2, ...]. ' +
    'Returns the derivative coefficients [c1, 2*c2, 3*c3, ...].',
  examples: [
    'polyder([1, 2, 3])',
    'polyder([5])',
    'polyder([0, 0, 1])'
  ],
  seealso: ['polyval', 'polymul', 'polyadd']
}
