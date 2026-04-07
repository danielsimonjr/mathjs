export const rankDocs = {
  name: 'rank',
  category: 'Numeric',
  syntax: [
    'rank(A)',
    'rank(A, tol)'
  ],
  description: 'Compute the rank of a matrix (number of linearly independent rows or columns) using Gaussian elimination.',
  examples: [
    'rank([[1, 0], [0, 1]])',
    'rank([[1, 2], [2, 4]])',
    'rank([[1,2,3],[4,5,6],[7,8,9]])'
  ],
  seealso: ['nullspace', 'cond', 'det', 'linsolve']
}
