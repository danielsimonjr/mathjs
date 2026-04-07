export const tDistDocs = {
  name: 'tDist',
  category: 'Statistics',
  syntax: ['tDist(df)'],
  description:
    "Create a Student's t-distribution with df degrees of freedom. The t-distribution is used in statistical hypothesis testing. Returns an object with pdf(x), cdf(x), mean, and variance.",
  examples: [
    'd = tDist(10)',
    'd.pdf(0)',
    'd.cdf(2.228)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['normalDist', 'chiSquaredDist']
}
