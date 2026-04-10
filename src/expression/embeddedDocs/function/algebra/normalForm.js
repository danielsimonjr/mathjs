export const normalFormDocs = {
  name: 'normalForm',
  category: 'Algebra',
  syntax: ['normalForm(expr)'],
  description:
    'Convert an expression to canonical polynomial or rational normal form by expanding, combining fractions, cancelling common factors, and simplifying.',
  examples: [
    'normalForm("(x + 1)^2 / (x + 1)")',
    'normalForm("1/2 + 1/3")',
    'normalForm("(x^2 - 1) / (x - 1)")'
  ],
  seealso: ['simplify', 'rationalize', 'together', 'cancel']
}
