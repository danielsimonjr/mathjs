export const shapiroWilkTestDocs = {
  name: 'shapiroWilkTest',
  category: 'Statistics',
  syntax: ['shapiroWilkTest(sample)'],
  description:
    'Perform the Shapiro-Wilk test for normality. Sorts the sample and computes W using ' +
    'Shapiro-Wilk coefficients (Royston\'s approximation). A W close to 1 indicates normality. ' +
    'Returns an object with W (statistic) and pValue. Small pValue indicates non-normality.',
  examples: [
    'shapiroWilkTest([2.1, 2.3, 1.9, 2.0, 2.2])',
    'shapiroWilkTest([1, 4, 9, 16, 25, 36])'
  ],
  seealso: ['kolmogorovSmirnovTest', 'mannWhitneyTest']
}
