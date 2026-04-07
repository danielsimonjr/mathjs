export const matrixLogDocs = {
  name: 'matrixLog',
  category: 'Matrix',
  syntax: [
    'matrixLog(A)'
  ],
  description: 'Compute the principal matrix logarithm of a square matrix A using eigendecomposition. Returns L such that expm(L) ≈ A. Requires that A has strictly positive real eigenvalues.',
  examples: [
    'matrixLog([[1, 0], [0, 1]])',
    'matrixLog([[2.718281828, 0], [0, 7.389056099]])'
  ],
  seealso: [
    'eigs', 'inv', 'det', 'matrixRank'
  ]
}
