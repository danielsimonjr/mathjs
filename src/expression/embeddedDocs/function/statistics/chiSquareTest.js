export const chiSquareTestDocs = {
  name: 'chiSquareTest',
  category: 'Statistics',
  syntax: [
    'chiSquareTest(observed, expected)',
    'chiSquareTest(observed)'
  ],
  description:
    'Perform a chi-squared test. For 1D arrays (observed, expected), performs a goodness-of-fit test. ' +
    'For a single 2D array (contingency table), performs an independence test. ' +
    'Returns an object with chiSquared (statistic), pValue, and df (degrees of freedom).',
  examples: [
    'chiSquareTest([10, 20, 30], [20, 20, 20])',
    'chiSquareTest([[10, 20], [30, 40]])'
  ],
  seealso: ['anova', 'studentTTest']
}
