export const zTransformDocs = {
  name: 'zTransform',
  category: 'Algebra',
  syntax: [
    'zTransform(expr, nVar, zVar)'
  ],
  description: 'Compute the Z-transform of a discrete sequence using a lookup table of known transform pairs. Supported: 1 → z/(z-1), n → z/(z-1)^2, n^2 → z*(z+1)/(z-1)^3, a^n → z/(z-a), n*a^n → a*z/(z-a)^2, cos(w*n) and sin(w*n) patterns.',
  examples: [
    'zTransform("1", "n", "z")',
    'zTransform("n", "n", "z")',
    'zTransform("0.5^n", "n", "z")',
    'zTransform("n^2", "n", "z")'
  ],
  seealso: [
    'inverseLaplaceTransform', 'laplace'
  ]
}
