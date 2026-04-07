export const betaDistDocs = {
  name: 'betaDist',
  category: 'Statistics',
  syntax: ['betaDist(alpha, beta)'],
  description:
    'Create a Beta distribution with shape parameters alpha and beta. Returns an object with pdf(x), cdf(x), mean, and variance.',
  examples: [
    'd = betaDist(2, 5)',
    'd.pdf(0.3)',
    'd.cdf(0.3)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['gammaDist', 'fDist', 'normalDist', 'mean', 'std']
}
