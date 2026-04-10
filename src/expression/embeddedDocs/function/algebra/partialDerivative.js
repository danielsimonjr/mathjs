export const partialDerivativeDocs = {
  name: 'partialDerivative',
  category: 'Algebra',
  syntax: [
    'partialDerivative(expr, variable)',
    'partialDerivative(expr, variables)'
  ],
  description: 'Compute higher-order and mixed partial derivatives of an expression. The variables argument specifies the differentiation order: a single string for first-order, or an array of strings for higher-order mixed partials.',
  examples: [],
  seealso: [
    'derivative', 'gradientSymbolic', 'jacobian', 'implicitDiff'
  ]
}
