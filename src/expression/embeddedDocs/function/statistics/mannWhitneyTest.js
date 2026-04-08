export const mannWhitneyTestDocs = {
  name: 'mannWhitneyTest',
  category: 'Statistics',
  syntax: ['mannWhitneyTest(sample1, sample2)'],
  description:
    'Perform a Mann-Whitney U test (Wilcoxon rank-sum test), a non-parametric test for whether ' +
    'two samples come from the same distribution. All values are ranked together; ties receive average ranks. ' +
    'Uses normal approximation for p-value. ' +
    'Returns an object with U (statistic, minimum of U1 and U2) and pValue (two-tailed).',
  examples: [
    'mannWhitneyTest([1, 2, 3, 4], [5, 6, 7, 8])',
    'mannWhitneyTest([1, 2, 3], [2, 3, 4])'
  ],
  seealso: ['studentTTest', 'anova', 'shapiroWilkTest']
}
