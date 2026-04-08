export const polarDecompositionDocs = {
  name: 'polarDecomposition',
  category: 'Matrix',
  syntax: [
    'polarDecomposition(A)'
  ],
  description: 'Compute the polar decomposition A = U * P of a square matrix A, where U is an orthogonal (unitary) matrix and P is a symmetric positive semidefinite matrix. Computed via SVD: A = U_svd * diag(S) * V^T, then U = U_svd * V^T and P = V * diag(S) * V^T.',
  examples: [
    'polarDecomposition([[3, 2], [1, 4]])',
    'polarDecomposition([[1, 0], [0, 1]])'
  ],
  seealso: [
    'svd', 'qr', 'eigs'
  ]
}
