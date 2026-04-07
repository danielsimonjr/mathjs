export const linsolveDocs = {
  name: 'linsolve',
  category: 'Numeric',
  syntax: [
    'linsolve(A, b)'
  ],
  description: 'Solve a linear system Ax = b using Gaussian elimination with partial pivoting. A is a 2D array, b is a 1D array.',
  examples: [
    'linsolve([[2, 1], [1, 3]], [5, 10])',
    'linsolve([[1, 0], [0, 1]], [4, 7])'
  ],
  seealso: ['lsolve', 'lusolve', 'rank', 'nullspace']
}
