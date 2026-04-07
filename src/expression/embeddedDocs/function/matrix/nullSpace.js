export const nullSpaceDocs = {
  name: 'nullSpace',
  category: 'Matrix',
  syntax: [
    'nullSpace(A)',
    'nullSpace(A, tol)'
  ],
  description: 'Compute an orthonormal basis for the null space (kernel) of a matrix A using Singular Value Decomposition. Returns an array of basis vectors corresponding to near-zero singular values.',
  examples: [
    'nullSpace([[1, 2, 3], [2, 4, 6]])',
    'nullSpace([[1, 0], [0, 1]])'
  ],
  seealso: [
    'svd', 'matrixRank', 'inv', 'eigs'
  ]
}
