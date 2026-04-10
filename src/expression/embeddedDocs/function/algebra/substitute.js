export const substituteDocs = {
  name: 'substitute',
  category: 'Algebra',
  syntax: [
    'substitute(expr, variable, value)',
    'substitute(expr, variable, valueExpr)'
  ],
  description:
    'Substitute a variable with a value or expression. Replaces all occurrences of the specified variable in an expression with the given value.',
  examples: [
    'substitute("x^2 + 2*x", "x", 3)',
    'substitute("x^2 + 2*x + 1", "x", "a+b")',
    'substitute("sin(x) + x", "x", 0)'
  ],
  seealso: ['simplify', 'evaluate']
}
