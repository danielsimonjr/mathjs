export const powerfitDocs = {
  name: 'powerfit',
  category: 'Numeric',
  syntax: [
    'powerfit(x, y)'
  ],
  description: 'Fit a power-law model y = a * x^b to data using linear regression on doubly log-transformed data: ln(y) = ln(a) + b*ln(x). All x and y values must be strictly positive. Returns an object with a, b, and predict(x).',
  examples: [
    'powerfit([1, 2, 3, 4], [1, 4, 9, 16])'
  ],
  seealso: ['expfit', 'logfit', 'polyfit', 'curvefit']
}
