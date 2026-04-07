export const movingAverageDocs = {
  name: 'movingAverage',
  category: 'Statistics',
  syntax: ['movingAverage(array, window)'],
  description:
    'Compute the simple moving average of a dataset with a given window size. Returns an array of length (n - window + 1).',
  examples: [
    'movingAverage([1, 2, 3, 4, 5], 3)',
    'movingAverage([10, 20, 30, 40], 2)'
  ],
  seealso: ['mean', 'sum']
}
