export const poissonDistDocs = {
  name: 'poissonDist',
  category: 'Statistics',
  syntax: ['poissonDist(lambda)'],
  description:
    'Create a Poisson distribution with rate parameter lambda. The Poisson distribution models the number of events in a fixed interval. Returns an object with pmf(k), cdf(k), mean, and variance.',
  examples: [
    'd = poissonDist(3)',
    'd.pmf(3)',
    'd.cdf(4)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['binomialDist', 'normalDist']
}
