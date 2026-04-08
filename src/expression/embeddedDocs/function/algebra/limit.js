export const limitDocs = {
  name: 'limit',
  category: 'Algebra',
  syntax: [
    'limit(expr, variable, value)'
  ],
  description: 'Compute the limit of an expression as a variable approaches a value. Uses direct substitution first; for indeterminate 0/0 forms, applies L\'Hopital\'s rule using the derivative function. Handles polynomial limits, rational function limits, and basic indeterminate forms.',
  examples: [
    'limit("sin(x) / x", "x", 0)',
    'limit("(x^2 - 1) / (x - 1)", "x", 1)',
    'limit("x^2 + 3*x", "x", 2)',
    'limit("(x^3 - 8) / (x - 2)", "x", 2)'
  ],
  seealso: [
    'derivative', 'evaluate', 'simplify'
  ]
}
