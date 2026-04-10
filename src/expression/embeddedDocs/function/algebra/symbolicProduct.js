export const symbolicProductDocs = {
  name: 'symbolicProduct',
  category: 'Algebra',
  syntax: [
    'symbolicProduct(expr, variable, start, end)'
  ],
  description: 'Compute the product of an expression over a variable from start to end. Attempts closed-form evaluation for common patterns (factorial, partial factorial, constant product), then falls back to numeric evaluation.',
  examples: [
    'symbolicProduct("k", "k", 1, 5)',
    'symbolicProduct("k", "k", 3, 7)',
    'symbolicProduct("2", "k", 1, 10)',
    'symbolicProduct("k^2", "k", 1, 4)'
  ],
  seealso: [
    'summation', 'evaluate'
  ]
}
