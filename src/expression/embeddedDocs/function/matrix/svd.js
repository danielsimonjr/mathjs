export const svdDocs = {
  name: 'svd',
  category: 'Matrix',
  syntax: [
    'svd(A)'
  ],
  description: 'Compute the Singular Value Decomposition A = U * diag(S) * V^T, returning an object { U, S, V } where U and V are orthogonal matrices and S is a vector of non-negative singular values in descending order.',
  examples: [
    'svd([[1, 2], [3, 4]])',
    'svd([[1, 2, 3], [4, 5, 6], [7, 8, 9]])'
  ],
  seealso: [
    'eigs', 'det', 'inv', 'qr', 'lup', 'matrixRank', 'nullSpace'
  ]
}
