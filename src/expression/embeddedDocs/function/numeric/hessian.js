export const hessianDocs = {
  name: 'hessian',
  category: 'Numeric',
  syntax: [
    'hessian(f, x)',
    'hessian(f, x, h)'
  ],
  description: 'Compute the numerical Hessian matrix of a scalar function at a given point using second-order central differences. H[i][j] = (f(x+h*e_i+h*e_j) - f(x+h*e_i-h*e_j) - f(x-h*e_i+h*e_j) + f(x-h*e_i-h*e_j)) / (4*h^2).',
  examples: [],
  seealso: ['gradient', 'derivative', 'nintegrate']
}
