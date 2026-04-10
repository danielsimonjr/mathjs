export const collectDocs = {
  name: 'collect',
  category: 'Algebra',
  syntax: ['collect(expr, variable)'],
  description:
    'Collect terms of a polynomial expression by powers of a variable. Groups like powers and combines their coefficients.',
  examples: [
    'collect("3*x + 2*x^2 + x + 5", "x")',
    'collect("x^2 + x^2", "x")',
    'collect("2*x + x", "x")'
  ],
  seealso: ['simplify', 'expand']
}
