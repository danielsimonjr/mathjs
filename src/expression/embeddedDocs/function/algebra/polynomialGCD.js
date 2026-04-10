export const polynomialGCDDocs = {
  name: 'polynomialGCD',
  category: 'Algebra',
  syntax: ['polynomialGCD(p, q, variable)'],
  description:
    'Compute the Greatest Common Divisor (GCD) of two polynomials using the Euclidean algorithm. The result is normalized to be monic.',
  examples: [
    'polynomialGCD("x^2 - 1", "x^2 - 2*x + 1", "x")',
    'polynomialGCD("x^2 - 1", "x + 1", "x")',
    'polynomialGCD("x^3 - x", "x^2 - 1", "x")'
  ],
  seealso: ['polynomialQuotient', 'polynomialRemainder', 'simplify']
}
