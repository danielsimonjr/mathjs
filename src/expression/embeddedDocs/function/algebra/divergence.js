export const divergenceDocs = {
  name: 'divergence',
  category: 'Algebra',
  syntax: [
    'divergence(field, variables)'
  ],
  description: 'Compute the symbolic divergence of a vector field. The divergence is the sum of partial derivatives: div F = dF1/dx1 + dF2/dx2 + ... The field and variables arrays must have the same length.',
  examples: [],
  seealso: [
    'curl', 'gradientSymbolic', 'derivative', 'jacobian'
  ]
}
