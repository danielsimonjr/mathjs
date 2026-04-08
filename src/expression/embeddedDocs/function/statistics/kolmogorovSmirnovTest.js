export const kolmogorovSmirnovTestDocs = {
  name: 'kolmogorovSmirnovTest',
  category: 'Statistics',
  syntax: [
    'kolmogorovSmirnovTest(sample, cdfFn)',
    'kolmogorovSmirnovTest(sample1, sample2)'
  ],
  description:
    'Perform a Kolmogorov-Smirnov test. One-sample: compare a sample ECDF to a theoretical CDF function. ' +
    'Two-sample: compare two sample ECDFs. ' +
    'D = max|F_n(x) - F(x)|. p-value computed from the KS distribution. ' +
    'Returns an object with D (KS statistic) and pValue.',
  examples: [
    'kolmogorovSmirnovTest([1, 2, 3], [1, 2, 4])'
  ],
  seealso: ['anova', 'chiSquareTest', 'shapiroWilkTest']
}
