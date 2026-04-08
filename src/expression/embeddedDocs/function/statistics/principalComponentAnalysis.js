export const principalComponentAnalysisDocs = {
  name: 'principalComponentAnalysis',
  category: 'Statistics',
  syntax: ['principalComponentAnalysis(data)'],
  description:
    'Perform Principal Component Analysis (PCA). Centers the data, computes the covariance matrix, ' +
    'and performs eigendecomposition. Returns components sorted by descending eigenvalue. ' +
    'Returns an object with components (eigenvectors as rows), eigenvalues, scores (projected data), ' +
    'and explainedVariance (fraction of variance per component).',
  examples: [
    'principalComponentAnalysis([[1, 2], [3, 4], [5, 6]])',
    'principalComponentAnalysis([[2, 0, 0], [0, 3, 4], [0, 4, 3]])'
  ],
  seealso: ['variance', 'corr']
}
