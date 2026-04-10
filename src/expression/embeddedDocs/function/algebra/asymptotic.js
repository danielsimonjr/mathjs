export const asymptoticDocs = {
  name: 'asymptotic',
  category: 'Algebra',
  syntax: [
    'asymptotic(expr, variable, point)'
  ],
  description: 'Find the asymptotic (leading) behavior of an expression as a variable approaches a point. For rational functions, returns the leading term ratio. For polynomials, returns the leading monomial. For other expressions, falls back to computing the limit.',
  examples: [
    'asymptotic("3*x^4 + 2*x^2 + 1", "x", Infinity)',
    'asymptotic("x + 1", "x", Infinity)'
  ],
  seealso: [
    'limit', 'simplify', 'derivative'
  ]
}
