export const groebnerBasisDocs = {
  name: 'groebnerBasis',
  category: 'Algebra',
  syntax: ['groebnerBasis(polynomials, variables)'],
  description:
    'Compute a Gröbner basis for a polynomial ideal. Supports 1-variable systems (via GCD) and 2-variable systems (via resultant-based reduction) with lexicographic ordering.',
  examples: [
    'groebnerBasis(["x^2 + y^2 - 1", "x - y"], ["x", "y"])',
    'groebnerBasis(["x^2 - 1"], ["x"])',
    'groebnerBasis(["x^2 - 3*x + 2", "x - 1"], ["x"])'
  ],
  seealso: ['eliminate', 'resultant', 'polynomialGCD']
}
