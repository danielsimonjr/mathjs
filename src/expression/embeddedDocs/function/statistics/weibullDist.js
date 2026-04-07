export const weibullDistDocs = {
  name: 'weibullDist',
  category: 'Statistics',
  syntax: ['weibullDist(k, lambda)'],
  description:
    'Create a Weibull distribution with shape parameter k and scale parameter lambda. Generalizes the exponential distribution (k=1 reduces to exponential with rate 1/lambda). Returns an object with pdf(x), cdf(x), mean, and variance.',
  examples: [
    'd = weibullDist(2, 1)',
    'd.pdf(1)',
    'd.cdf(1)',
    'd.mean',
    'd.variance'
  ],
  seealso: ['exponentialDist', 'normalDist']
}
