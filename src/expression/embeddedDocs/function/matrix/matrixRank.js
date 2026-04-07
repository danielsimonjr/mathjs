export const matrixRankDocs = {
  name: 'matrixRank',
  category: 'Matrix',
  syntax: [
    'matrixRank(A)',
    'matrixRank(A, tol)'
  ],
  description: 'Compute the numerical rank of a matrix using Singular Value Decomposition. The rank is the number of singular values exceeding a threshold tolerance.',
  examples: [
    'matrixRank([[1, 2], [3, 4]])',
    'matrixRank([[1, 2, 3], [2, 4, 6]])',
    'matrixRank([[1, 2], [2, 4]], 1e-10)'
  ],
  seealso: [
    'svd', 'det', 'nullSpace', 'eigs'
  ]
}
