export const seriesCoefficientDocs = {
  name: 'seriesCoefficient',
  category: 'Algebra',
  syntax: [
    'seriesCoefficient(expr, variable, point, n)'
  ],
  description: 'Extract the nth coefficient from the Taylor series expansion of an expression around a point. Uses the formula c_n = f^(n)(a) / n! where f^(n) is the nth derivative.',
  examples: [
    'seriesCoefficient("exp(x)", "x", 0, 3)',
    'seriesCoefficient("sin(x)", "x", 0, 1)',
    'seriesCoefficient("cos(x)", "x", 0, 2)',
    'seriesCoefficient("x^2 + x", "x", 0, 2)'
  ],
  seealso: [
    'taylor', 'series', 'derivative', 'factorial'
  ]
}
