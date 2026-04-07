export const logNormalDistDocs = {
  name: 'logNormalDist',
  category: 'Statistics',
  syntax: ['logNormalDist(mu, sigma)'],
  description:
    'Create a log-normal distribution with log-scale parameters mu and sigma. Returns an object with pdf(x), cdf(x), icdf(p), mean, and variance.',
  examples: [
    'd = logNormalDist(0, 1)',
    'd.pdf(1)',
    'd.cdf(1)',
    'd.icdf(0.5)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['normalDist', 'gammaDist', 'exponentialDist', 'mean', 'std']
}
