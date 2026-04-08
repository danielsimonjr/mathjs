export const jordanFormDocs = {
  name: 'jordanForm',
  category: 'Matrix',
  syntax: [
    'jordanForm(A)'
  ],
  description: 'Compute the Jordan normal form J of a square matrix A and a transition matrix P such that A = P * J * inv(P). For simple eigenvalues the result is diagonal; for repeated eigenvalues Jordan blocks with 1s on the superdiagonal are constructed.',
  examples: [
    'jordanForm([[2, 0], [0, 3]])',
    'jordanForm([[2, 1], [0, 2]])'
  ],
  seealso: [
    'eigs', 'schur', 'svd'
  ]
}
