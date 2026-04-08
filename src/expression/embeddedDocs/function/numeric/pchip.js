export const pchipDocs = {
  name: 'pchip',
  category: 'Numeric',
  syntax: [
    'pchip(x, y)'
  ],
  description: 'Compute a Piecewise Cubic Hermite Interpolating Polynomial (PCHIP). Unlike cubic splines, PCHIP preserves monotonicity: the interpolant will not oscillate between data points. Uses the Fritsch-Carlson method to compute shape-preserving slopes. Returns an object with an evaluate(t) method.',
  examples: [
    'pchip([0, 1, 2, 3], [0, 1, 0, 1])'
  ],
  seealso: ['cspline', 'interpolate']
}
