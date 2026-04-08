export const factorDocs = {
  name: 'factor',
  category: 'Algebra',
  syntax: [
    'factor(expr)',
    'factor(expr, variable)'
  ],
  description: 'Factor a polynomial expression into its irreducible factors. Uses the rational roots theorem to find rational roots, then performs synthetic division. Handles linear, quadratic, cubic, and higher-degree polynomials with rational roots.',
  examples: [
    'factor("x^2 - 4")',
    'factor("x^2 + 2*x + 1")',
    'factor("x^3 - x")',
    'factor("x^2 - 5*x + 6")'
  ],
  seealso: [
    'simplify', 'solve', 'rationalize'
  ]
}
