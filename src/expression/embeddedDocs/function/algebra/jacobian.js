export const jacobianDocs = {
  name: 'jacobian',
  category: 'Algebra',
  syntax: [
    'jacobian(exprs, variables)'
  ],
  description: 'Compute the symbolic Jacobian matrix of a vector of expressions with respect to a list of variables. J[i][j] = d(exprs[i]) / d(variables[j]). Returns a 2D array of strings.',
  examples: [],
  seealso: [
    'gradientSymbolic', 'divergence', 'derivative', 'partialDerivative'
  ]
}
