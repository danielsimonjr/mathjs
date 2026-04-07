export const fDistDocs = {
  name: 'fDist',
  category: 'Statistics',
  syntax: ['fDist(df1, df2)'],
  description:
    'Create an F-distribution with numerator df1 and denominator df2 degrees of freedom. Returns an object with pdf(x), cdf(x), mean, and variance.',
  examples: [
    'd = fDist(5, 10)',
    'd.pdf(1)',
    'd.cdf(1)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['tDist', 'chiSquaredDist', 'betaDist', 'mean', 'std']
}
