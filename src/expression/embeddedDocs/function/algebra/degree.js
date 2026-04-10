export const degreeDocs = {
  name: 'degree',
  category: 'Algebra',
  syntax: [
    'degree(polynomial, variable)'
  ],
  description: 'Find the degree of a polynomial expression in a specified variable. Walks the expression tree to find the highest power of the given variable. Returns 0 for constant expressions and -Infinity for non-polynomial expressions.',
  examples: [
    'degree("3*x^5 + 2*x^3 + 1", "x")',
    'degree("x^2 + x + 1", "x")',
    'degree("7", "x")',
    'degree("x", "x")'
  ],
  seealso: [
    'simplify', 'parse', 'derivative'
  ]
}
