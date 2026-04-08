export const anovaDocs = {
  name: 'anova',
  category: 'Statistics',
  syntax: ['anova(groups)'],
  description:
    'Perform a one-way ANOVA (Analysis of Variance) F-test comparing means across multiple groups. ' +
    'F = MSB/MSW where MSB is between-group mean square and MSW is within-group mean square. ' +
    'Returns an object with F (statistic), pValue, dfBetween, and dfWithin.',
  examples: [
    'anova([[1, 2, 3], [4, 5, 6], [7, 8, 9]])',
    'anova([[2, 3, 4], [2, 3, 4]])'
  ],
  seealso: ['mean', 'variance', 'std', 'studentTTest']
}
