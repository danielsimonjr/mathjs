export const chiSquaredDistDocs = {
  name: 'chiSquaredDist',
  category: 'Statistics',
  syntax: ['chiSquaredDist(k)'],
  description:
    'Create a chi-squared distribution with k degrees of freedom. Commonly used in hypothesis testing and confidence interval estimation for variance. Returns an object with pdf(x), cdf(x), mean, and variance.',
  examples: [
    'd = chiSquaredDist(3)',
    'd.pdf(1)',
    'd.cdf(7.815)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['tDist', 'normalDist']
}
