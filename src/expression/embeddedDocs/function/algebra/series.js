export const seriesDocs = {
  name: 'series',
  category: 'Algebra',
  syntax: [
    'series(expr, variable)',
    'series(expr, variable, point)',
    'series(expr, variable, point, order)'
  ],
  description: 'Compute the Taylor series expansion of an expression around a point. Uses the formula f(a) + f\'(a)(x-a) + f\'\'(a)(x-a)^2/2! + ... The default expansion point is 0 (Maclaurin series) and the default order is 6.',
  examples: [
    'series("exp(x)", "x", 0, 4)',
    'series("sin(x)", "x", 0, 5)',
    'series("cos(x)", "x", 0, 4)',
    'series("1/(1-x)", "x", 0, 4)'
  ],
  seealso: [
    'derivative', 'evaluate', 'simplify'
  ]
}
