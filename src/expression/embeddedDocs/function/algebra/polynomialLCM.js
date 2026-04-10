export const polynomialLCMDocs = {
  name: 'polynomialLCM',
  category: 'Algebra',
  syntax: ['polynomialLCM(p, q, variable)'],
  description:
    'Compute the Least Common Multiple (LCM) of two polynomials. Computed as p*q/GCD(p,q). The result is normalized to be monic (leading coefficient 1).',
  examples: [
    'polynomialLCM("x^2 - 1", "x^2 - 2*x + 1", "x")',
    'polynomialLCM("x^2 - 1", "x + 1", "x")',
    'polynomialLCM("x^2 - 4", "x - 2", "x")'
  ],
  seealso: ['polynomialGCD', 'polynomialQuotient', 'polynomialRemainder']
}
