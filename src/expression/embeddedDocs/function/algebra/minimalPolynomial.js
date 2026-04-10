export const minimalPolynomialDocs = {
  name: 'minimalPolynomial',
  category: 'Algebra',
  syntax: [
    'minimalPolynomial(expr, variable)'
  ],
  description: 'Find the minimal polynomial of a simple algebraic expression. The minimal polynomial is the monic polynomial with rational coefficients of lowest degree for which the expression is a root. Supports: sqrt(n), cbrt(n), nthRoot(n, k), sqrt(a) + sqrt(b), and rational constants.',
  examples: [
    'minimalPolynomial("sqrt(2)", "x")',
    'minimalPolynomial("cbrt(3)", "x")',
    'minimalPolynomial("sqrt(2) + sqrt(3)", "x")'
  ],
  seealso: [
    'simplify', 'parse', 'toRadicals'
  ]
}
