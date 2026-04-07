export const expfitDocs = {
  name: 'expfit',
  category: 'Numeric',
  syntax: [
    'expfit(x, y)'
  ],
  description: 'Fit an exponential model y = a * exp(b * x) to data using linear regression on log-transformed data. All y values must be strictly positive. Returns an object with a, b, and predict(x).',
  examples: [
    'expfit([0, 1, 2], [1, 2.718, 7.389])'
  ],
  seealso: ['powerfit', 'logfit', 'polyfit', 'curvefit']
}
