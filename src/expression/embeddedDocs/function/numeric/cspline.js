export const csplineDocs = {
  name: 'cspline',
  category: 'Numeric',
  syntax: [
    'cspline(x, y)'
  ],
  description: 'Compute a natural cubic spline through a set of data points. Returns an object with an evaluate(t) method for smooth interpolation. Natural boundary conditions: second derivative is zero at both endpoints.',
  examples: [
    'cspline([0, 1, 2], [0, 1, 0])'
  ],
  seealso: ['interpolate', 'polyfit']
}
