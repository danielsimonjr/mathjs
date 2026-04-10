export const rowReduceDocs = {
  name: 'rowReduce',
  category: 'Matrix',
  syntax: [
    'rowReduce(matrix)'
  ],
  description: 'Compute the Reduced Row Echelon Form (RREF) of a matrix using Gauss-Jordan elimination with partial pivoting. Each pivot element is scaled to 1, and all other entries in the pivot column are eliminated.',
  examples: [
    'rowReduce([[1, 2, 3], [4, 5, 6]])',
    'rowReduce([[2, 4], [1, 2]])',
    'rowReduce([[1, 0], [0, 1]])'
  ],
  seealso: [
    'det', 'inv', 'lup', 'lusolve', 'transpose'
  ]
}
