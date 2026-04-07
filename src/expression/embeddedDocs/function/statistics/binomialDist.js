export const binomialDistDocs = {
  name: 'binomialDist',
  category: 'Statistics',
  syntax: ['binomialDist(n, p)'],
  description:
    'Create a binomial distribution with n trials and success probability p. The binomial distribution models the number of successes in n independent trials. Returns an object with pmf(k), cdf(k), mean, and variance.',
  examples: [
    'd = binomialDist(10, 0.5)',
    'd.pmf(5)',
    'd.cdf(5)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['poissonDist', 'normalDist']
}
