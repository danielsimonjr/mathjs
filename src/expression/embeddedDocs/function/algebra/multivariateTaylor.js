export const multivariateTaylorDocs = {
  name: 'multivariateTaylor',
  category: 'Algebra',
  syntax: [
    'multivariateTaylor(expr, variables, points, order)'
  ],
  description: 'Compute the multivariate Taylor series expansion of a scalar expression around a point. Uses mixed partial derivatives to build the polynomial: f + sum_alpha (partial^|alpha| f / alpha!) * prod (xi - ai)^ki, where the sum is over all multi-indices of total degree <= order.',
  examples: [
    'multivariateTaylor("x * y", ["x", "y"], [0, 0], 2)',
    'multivariateTaylor("x^2 + y^2", ["x", "y"], [0, 0], 2)'
  ],
  seealso: [
    'taylor', 'series', 'derivative', 'factorial'
  ]
}
