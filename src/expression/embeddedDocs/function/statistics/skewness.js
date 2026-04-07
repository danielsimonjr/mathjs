export const skewnessDocs = {
  name: 'skewness',
  category: 'Statistics',
  syntax: ['skewness(array)'],
  description:
    'Compute the sample skewness of a dataset. Skewness measures the asymmetry of the probability distribution. Uses the adjusted Fisher-Pearson standardized moment coefficient.',
  examples: [
    'skewness([2, 4, 6, 8, 10])',
    'skewness([1, 2, 3, 4, 100])'
  ],
  seealso: ['mean', 'std', 'variance', 'kurtosis']
}
