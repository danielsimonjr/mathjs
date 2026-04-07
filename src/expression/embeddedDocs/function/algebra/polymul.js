export const polymulDocs = {
  name: 'polymul',
  category: 'Algebra',
  syntax: [
    'polymul(a, b)'
  ],
  description:
    'Multiply two polynomials by convolving their coefficient arrays. ' +
    'Coefficients are in ascending degree order: [c0, c1, c2, ...]. ' +
    'The result has degree equal to the sum of the degrees of a and b.',
  examples: [
    'polymul([1, 1], [1, 1])',
    'polymul([1, 2], [3, 4])',
    'polymul([1], [1, 2, 3])'
  ],
  seealso: ['polyval', 'polyder', 'polyadd']
}
