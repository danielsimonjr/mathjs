export const condDocs = {
  name: 'cond',
  category: 'Numeric',
  syntax: [
    'cond(A)',
    'cond(A, p)'
  ],
  description: 'Compute the condition number of a matrix. p=2 (default) uses the ratio of largest to smallest singular value; p=1 and p=Infinity use the respective matrix norms.',
  examples: [
    'cond([[1, 0], [0, 1]])',
    'cond([[1, 2], [3, 4]])',
    'cond([[1, 0], [0, 1]], 1)'
  ],
  seealso: ['rank', 'nullspace', 'det', 'inv']
}
