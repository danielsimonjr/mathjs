export const polyfitDocs = {
  name: 'polyfit',
  category: 'Numeric',
  syntax: [
    'polyfit(x, y, degree)'
  ],
  description: 'Fit a polynomial of given degree to data points using least-squares regression. Returns coefficients [c0, c1, ...] where p(x) = c0 + c1*x + c2*x^2 + ...',
  examples: [
    'polyfit([0, 1, 2, 3], [0, 1, 4, 9], 2)',
    'polyfit([0, 1, 2], [1, 2, 3], 1)'
  ],
  seealso: ['interpolate', 'curvefit', 'expfit', 'powerfit', 'logfit']
}
