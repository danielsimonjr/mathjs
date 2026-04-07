export const kurtosisDocs = {
  name: 'kurtosis',
  category: 'Statistics',
  syntax: ['kurtosis(array)'],
  description:
    'Compute the sample excess kurtosis of a dataset. Kurtosis measures the "tailedness" of the probability distribution. A normal distribution has excess kurtosis of 0.',
  examples: [
    'kurtosis([2, 4, 4, 4, 5, 5, 7, 9])',
    'kurtosis([1, 2, 3, 4, 5])'
  ],
  seealso: ['mean', 'std', 'variance', 'skewness']
}
