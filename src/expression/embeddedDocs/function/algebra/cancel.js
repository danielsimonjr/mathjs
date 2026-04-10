export const cancelDocs = {
  name: 'cancel',
  category: 'Algebra',
  syntax: ['cancel(expr)'],
  description:
    'Cancel common factors in a rational expression. Simplifies a fraction by cancelling common factors between the numerator and denominator.',
  examples: [
    'cancel("(x^2 - 1) / (x - 1)")',
    'cancel("(2*x^2 + 2*x) / (2*x)")',
    'cancel("(x^3 - x) / x")'
  ],
  seealso: ['simplify', 'rationalize']
}
