export const exponentialDistDocs = {
  name: 'exponentialDist',
  category: 'Statistics',
  syntax: ['exponentialDist(lambda)'],
  description:
    'Create an exponential distribution with rate parameter lambda. Models the time between events in a Poisson process. Returns an object with pdf(x), cdf(x), icdf(p), mean, and variance.',
  examples: [
    'd = exponentialDist(2)',
    'd.pdf(1)',
    'd.cdf(1)',
    'd.icdf(0.5)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['weibullDist', 'poissonDist', 'normalDist']
}
