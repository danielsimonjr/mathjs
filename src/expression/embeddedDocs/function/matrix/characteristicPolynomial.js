export const characteristicPolynomialDocs = {
  name: 'characteristicPolynomial',
  category: 'Matrix',
  syntax: [
    'characteristicPolynomial(A)'
  ],
  description: 'Compute the characteristic polynomial det(lambda*I - A) of a square matrix using the Faddeev-LeVerrier algorithm. Returns an array of coefficients in ascending order [c_0, c_1, ..., c_n] where c_0 + c_1*lambda + ... + c_n*lambda^n.',
  examples: [
    'characteristicPolynomial([[2, 0], [0, 3]])',
    'characteristicPolynomial([[2, 1], [0, 3]])'
  ],
  seealso: [
    'eigs', 'det', 'trace'
  ]
}
