export const gradientDocs = {
  name: 'gradient',
  category: 'Numeric',
  syntax: [
    'gradient(f, x)',
    'gradient(f, x, h)'
  ],
  description: 'Compute the numerical gradient of a scalar function at a given point using central differences. grad[i] = (f(x+h*e_i) - f(x-h*e_i)) / (2*h).',
  examples: [],
  seealso: ['hessian', 'derivative', 'nintegrate']
}
