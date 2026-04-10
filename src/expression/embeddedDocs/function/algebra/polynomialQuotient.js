export const polynomialQuotientDocs = {
  name: 'polynomialQuotient',
  category: 'Algebra',
  syntax: ['polynomialQuotient(p, q, variable)'],
  description:
    'Compute the quotient of polynomial long division p / q. Returns the quotient polynomial.',
  examples: [
    'polynomialQuotient("x^3 - 1", "x - 1", "x")',
    'polynomialQuotient("x^2 + 3*x + 2", "x + 1", "x")',
    'polynomialQuotient("x^3 + x^2 - x - 1", "x^2 - 1", "x")'
  ],
  seealso: ['polynomialRemainder', 'polynomialGCD', 'simplify']
}
