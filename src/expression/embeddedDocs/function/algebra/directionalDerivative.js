export const directionalDerivativeDocs = {
  name: 'directionalDerivative',
  category: 'Algebra',
  syntax: [
    'directionalDerivative(expr, variables, direction)'
  ],
  description: 'Compute the directional derivative of a scalar expression in the given direction. D_v f = gradient(f) · (v / |v|). The direction vector is normalized before computing the dot product with the gradient.',
  examples: [
    'directionalDerivative("x * y", ["x", "y"], [1, 0])',
    'directionalDerivative("x*y*z", ["x", "y", "z"], [1, 0, 0])'
  ],
  seealso: [
    'derivative', 'gradientSymbolic', 'divergence'
  ]
}
