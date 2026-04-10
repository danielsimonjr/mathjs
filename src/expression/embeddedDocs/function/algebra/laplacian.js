export const laplacianDocs = {
  name: 'laplacian',
  category: 'Algebra',
  syntax: [
    'laplacian(expr, variables)'
  ],
  description: 'Compute the scalar Laplacian of an expression with respect to a list of variables. The Laplacian is the sum of second partial derivatives: Δf = ∂²f/∂x² + ∂²f/∂y² + ...',
  examples: [
    'laplacian("x^2 + y^2", ["x", "y"])',
    'laplacian("x^3 + y^3", ["x", "y"])',
    'laplacian("sin(x) + cos(y)", ["x", "y"])'
  ],
  seealso: [
    'derivative', 'gradientSymbolic', 'divergence', 'curl'
  ]
}
