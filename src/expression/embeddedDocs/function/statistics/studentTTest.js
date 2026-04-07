export const studentTTestDocs = {
  name: 'studentTTest',
  category: 'Statistics',
  syntax: ['studentTTest(sample1, sample2)'],
  description:
    'Perform a two-sample Welch t-test (unequal variances). Tests whether the means of two independent samples differ significantly. Uses the Welch-Satterthwaite approximation for degrees of freedom. Returns an object with t (statistic), df (degrees of freedom), and pValue (two-tailed).',
  examples: [
    'studentTTest([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])',
    'studentTTest([1, 2, 3], [10, 11, 12])'
  ],
  seealso: ['mean', 'variance', 'std']
}
