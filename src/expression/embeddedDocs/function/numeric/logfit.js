export const logfitDocs = {
  name: 'logfit',
  category: 'Numeric',
  syntax: [
    'logfit(x, y)'
  ],
  description: 'Fit a logarithmic model y = a + b * ln(x) to data using linear regression with the substitution u = ln(x). All x values must be strictly positive. Returns an object with a, b, and predict(x).',
  examples: [
    'logfit([1, 2, 4, 8], [0, 1, 2, 3])'
  ],
  seealso: ['expfit', 'powerfit', 'polyfit', 'curvefit']
}
