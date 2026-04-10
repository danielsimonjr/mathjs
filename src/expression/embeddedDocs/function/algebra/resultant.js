export const resultantDocs = {
  name: 'resultant',
  category: 'Algebra',
  syntax: ['resultant(p, q, variable)'],
  description:
    'Compute the resultant of two univariate polynomials as the determinant of their Sylvester matrix. The resultant is zero if and only if the polynomials share a common root. Used for polynomial elimination.',
  examples: [
    'resultant("x^2 - 1", "x^2 - 4", "x")',
    'resultant("x^2 - 1", "x - 1", "x")',
    'resultant("x^2 - 3*x + 2", "x - 1", "x")'
  ],
  seealso: ['discriminant', 'polynomialGCD', 'eliminate']
}
