export const taylorDocs = {
  name: 'taylor',
  category: 'Algebra',
  syntax: [
    'taylor(expr, variable)',
    'taylor(expr, variable, point)',
    'taylor(expr, variable, point, order)'
  ],
  description: 'Compute the Taylor polynomial expansion of an expression around a point. Returns only the polynomial string. Uses the formula f(a) + f\'(a)(x-a) + f\'\'(a)(x-a)^2/2! + ... The default expansion point is 0 and the default order is 6.',
  examples: [
    'taylor("sin(x)", "x", 0, 5)',
    'taylor("exp(x)", "x", 0, 4)',
    'taylor("cos(x)", "x", 0, 6)',
    'taylor("1/(1-x)", "x", 0, 4)'
  ],
  seealso: [
    'series', 'derivative', 'simplify'
  ]
}
