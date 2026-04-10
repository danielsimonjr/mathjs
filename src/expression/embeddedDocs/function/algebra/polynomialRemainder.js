export const polynomialRemainderDocs = {
  name: 'polynomialRemainder',
  category: 'Algebra',
  syntax: ['polynomialRemainder(p, q, variable)'],
  description:
    'Compute the remainder of polynomial long division p / q. Returns the remainder polynomial.',
  examples: [
    'polynomialRemainder("x^3 + 2*x + 1", "x^2 + 1", "x")',
    'polynomialRemainder("x^3 - 1", "x - 1", "x")',
    'polynomialRemainder("x^2 + 3*x + 2", "x + 2", "x")'
  ],
  seealso: ['polynomialQuotient', 'polynomialGCD', 'simplify']
}
