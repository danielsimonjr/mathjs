export const integrateDocs = {
  name: 'integrate',
  category: 'Algebra',
  syntax: [
    'integrate(expr, variable)'
  ],
  description: 'Compute the symbolic indefinite integral of an expression with respect to a variable. Handles polynomials (power rule), basic trigonometric functions (sin, cos), exponentials (exp), and 1/x. Uses linearity of integration for sums and constant multiples. Returns the integral without the constant of integration (+C).',
  examples: [
    'integrate("x^2", "x")',
    'integrate("sin(x)", "x")',
    'integrate("exp(x)", "x")',
    'integrate("3*x^2 + 2*x + 1", "x")',
    'integrate("cos(x)", "x")'
  ],
  seealso: [
    'derivative', 'simplify'
  ]
}
