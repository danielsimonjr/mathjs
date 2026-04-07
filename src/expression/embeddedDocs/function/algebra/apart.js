export const apartDocs = {
  name: 'apart',
  category: 'Algebra',
  syntax: [
    'apart(expr, variable)',
    'apart(expr, variable)'
  ],
  description:
    'Perform partial fraction decomposition on a rational expression. Decomposes p(x)/q(x) into a sum of simpler fractions when the denominator factors into distinct linear terms.',
  examples: [
    'apart("1 / (x^2 - 1)", "x")',
    'apart("(x + 1) / (x^2 - 1)", "x")'
  ],
  seealso: ['simplify', 'rationalize']
}
