export const hessenbergFormDocs = {
  name: 'hessenbergForm',
  category: 'Matrix',
  syntax: [
    'hessenbergForm(A)'
  ],
  description: 'Reduce a square matrix A to upper Hessenberg form using Householder reflections. Returns an object { H, Q } where H is upper Hessenberg (zeros below the first subdiagonal) and Q is orthogonal, satisfying A = Q * H * Q^T.',
  examples: [
    'hessenbergForm([[4, 1, 2], [3, 4, 1], [2, 1, 4]])',
    'hessenbergForm([[1, 2, 3], [4, 5, 6], [7, 8, 9]])'
  ],
  seealso: [
    'qr', 'schur', 'eigs', 'svd'
  ]
}
