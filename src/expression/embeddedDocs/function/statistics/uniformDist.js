export const uniformDistDocs = {
  name: 'uniformDist',
  category: 'Statistics',
  syntax: ['uniformDist(a, b)'],
  description:
    'Create a continuous uniform distribution on [a, b]. Returns an object with pdf(x), cdf(x), icdf(p), mean, and variance.',
  examples: [
    'd = uniformDist(0, 1)',
    'd.pdf(0.5)',
    'd.cdf(0.5)',
    'd.icdf(0.5)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['normalDist', 'exponentialDist', 'gammaDist', 'mean', 'std']
}
