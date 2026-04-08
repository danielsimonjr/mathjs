export const choleskyDocs = {
  name: 'cholesky',
  category: 'Matrix',
  syntax: [
    'cholesky(A)'
  ],
  description: 'Compute the Cholesky decomposition of a symmetric positive definite matrix A. Returns a lower triangular matrix L such that A = L * L^T.',
  examples: [
    'cholesky([[4, 2], [2, 3]])',
    'cholesky([[9, 3, 1], [3, 5, 2], [1, 2, 6]])'
  ],
  seealso: [
    'qr', 'lup', 'svd', 'eigs'
  ]
}
