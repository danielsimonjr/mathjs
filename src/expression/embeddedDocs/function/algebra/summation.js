export const summationDocs = {
  name: 'summation',
  category: 'Algebra',
  syntax: [
    'summation(expr, variable, start, end)'
  ],
  description: 'Compute the summation of an expression over a variable from start to end. Attempts closed-form evaluation for common patterns (arithmetic, quadratic, geometric series), then falls back to numeric summation.',
  examples: [
    'summation("k", "k", 1, 100)',
    'summation("k^2", "k", 1, 10)',
    'summation("1/k", "k", 1, 5)',
    'summation("2^k", "k", 0, 9)'
  ],
  seealso: [
    'symbolicProduct', 'evaluate'
  ]
}
