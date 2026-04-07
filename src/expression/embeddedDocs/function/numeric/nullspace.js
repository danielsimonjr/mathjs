export const nullspaceDocs = {
  name: 'nullspace',
  category: 'Numeric',
  syntax: [
    'nullspace(A)'
  ],
  description: 'Compute the null space (kernel) of a matrix. Returns an array of basis vectors for the null space.',
  examples: [
    'nullspace([[1, 2], [2, 4]])',
    'nullspace([[1, 0], [0, 1]])',
    'nullspace([[1,2,3],[4,5,6],[7,8,9]])'
  ],
  seealso: ['rank', 'cond', 'linsolve']
}
