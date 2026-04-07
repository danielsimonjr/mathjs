export const polyaddDocs = {
  name: 'polyadd',
  category: 'Algebra',
  syntax: [
    'polyadd(a, b)'
  ],
  description:
    'Add two polynomials element-wise. The shorter array is padded with zeros. ' +
    'Coefficients are in ascending degree order: [c0, c1, c2, ...].',
  examples: [
    'polyadd([1, 2], [3, 4, 5])',
    'polyadd([1, 2, 3], [4, 5])',
    'polyadd([1], [])'
  ],
  seealso: ['polyval', 'polyder', 'polymul']
}
