export const gammaDistDocs = {
  name: 'gammaDist',
  category: 'Statistics',
  syntax: ['gammaDist(k, beta)'],
  description:
    'Create a Gamma distribution with shape k and rate beta. Returns an object with pdf(x), cdf(x), mean, and variance.',
  examples: [
    'd = gammaDist(2, 1)',
    'd.pdf(1)',
    'd.cdf(1)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['exponentialDist', 'betaDist', 'chiSquaredDist', 'mean', 'std']
}
