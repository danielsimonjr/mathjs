export const solveDocs = {
  name: 'solve',
  category: 'Algebra',
  syntax: [
    'solve(expr, variable)'
  ],
  description: 'Solve an equation or expression equal to zero for a given variable. Handles linear equations, quadratic equations (via quadratic formula), and simple polynomials (rational roots theorem). The input can be an equation like "x^2 - 4 = 0" or just an expression like "x^2 - 4" (treated as equal to zero). Returns an array of real solutions.',
  examples: [
    'solve("x^2 - 4", "x")',
    'solve("2*x + 6", "x")',
    'solve("x^2 - 5*x + 6", "x")',
    'solve("x^3 - x", "x")'
  ],
  seealso: [
    'simplify', 'parse', 'evaluate'
  ]
}
