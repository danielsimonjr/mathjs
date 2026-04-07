export const normalDistDocs = {
  name: 'normalDist',
  category: 'Statistics',
  syntax: ['normalDist(mu, sigma)'],
  description:
    'Create a normal (Gaussian) distribution with mean mu and standard deviation sigma. Returns an object with pdf(x), cdf(x), icdf(p), mean, and variance.',
  examples: [
    'd = normalDist(0, 1)',
    'd.pdf(0)',
    'd.cdf(1.96)',
    'd.icdf(0.975)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['tDist', 'chiSquaredDist', 'poissonDist', 'binomialDist', 'mean', 'std']
}
