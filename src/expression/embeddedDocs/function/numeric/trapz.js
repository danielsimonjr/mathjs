export const trapzDocs = {
  name: 'trapz',
  category: 'Numeric',
  syntax: [
    'trapz(y, x)',
    'trapz(y, dx)'
  ],
  description: 'Numerically integrate discrete data using the trapezoidal rule. y and x are arrays of the same length, or y is an array and dx is a scalar step size.',
  examples: [
    'trapz([0, 1, 4, 9], [0, 1, 2, 3])',
    'trapz([0, 1, 4, 9], 1)'
  ],
  seealso: ['nintegrate', 'simpsons']
}
