export const odeGeneralDocs = {
  name: 'odeGeneral',
  category: 'Algebra',
  syntax: [
    'odeGeneral(expr, y, x)'
  ],
  description: 'Solve first-order ordinary differential equations (ODEs) symbolically. The expression is the right-hand side of dy/dx = expr. Handles separable ODEs (dy/dx = g(x)*h(y)) and linear first-order ODEs (dy/dx + P*y = Q(x)) using integrating factors. Returns the general solution with constant C.',
  examples: [
    'odeGeneral("y", "y", "x")',
    'odeGeneral("-y", "y", "x")',
    'odeGeneral("x", "y", "x")'
  ],
  seealso: [
    'integrate', 'derivative', 'simplify'
  ]
}
