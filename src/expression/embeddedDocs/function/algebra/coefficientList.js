export const coefficientListDocs = {
  name: 'coefficientList',
  category: 'Algebra',
  syntax: [
    'coefficientList(expr, variable)',
    'coefficientList(expr, variable)'
  ],
  description:
    'Extract polynomial coefficients of an expression with respect to a variable. Returns an array [c0, c1, c2, ...] where expr = c0 + c1*x + c2*x^2 + ...',
  examples: [
    'coefficientList("3*x^2 + 2*x + 1", "x")',
    'coefficientList("x^3 - x", "x")'
  ],
  seealso: ['simplify', 'rationalize', 'derivative']
}
